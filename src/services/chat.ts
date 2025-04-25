import { supabase } from '../config/database';

export const chatService = {
  async getConversations() {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select(`
        *,
        participants:chat_conversation_participants(
          id,
          user_id,
          joined_at
        )
      `)
      .order('last_message_at', { ascending: false });

    if (error) throw error;

    // Fetch user details from auth.users instead of public.users
    if (data) {
      const userIds = data.flatMap(conv => 
        conv.participants.map(p => p.user_id)
      );

      // Use auth.users instead of users table
      const { data: users } = await supabase
        .auth.admin.listUsers();

      const filteredUsers = users?.users.filter(user => 
        userIds.includes(user.id)
      ).map(user => ({
        id: user.id,
        email: user.email,
        raw_app_meta_data: user.user_metadata
      }));

      // Merge user details into conversations
      return data.map(conversation => ({
        ...conversation,
        participants: conversation.participants.map(participant => ({
          ...participant,
          user: filteredUsers?.find(u => u.id === participant.user_id)
        }))
      }));
    }

    return [];
  },

  async getConversationMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        sender:sender_id(*)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Fetch sender details from auth.users
    if (data) {
      const senderIds = data.map(message => message.sender_id);
      const { data: users } = await supabase
        .auth.admin.listUsers();

      const filteredUsers = users?.users.filter(user => 
        senderIds.includes(user.id)
      ).map(user => ({
        id: user.id,
        email: user.email,
        raw_app_meta_data: user.user_metadata
      }));

      return data.map(message => ({
        ...message,
        sender: filteredUsers?.find(u => u.id === message.sender_id)
      }));
    }

    return [];
  },

  async sendMessage({ conversationId, senderId, content, messageType = 'text', attachments = [] }) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        message_type: messageType,
        attachments,
      })
      .select()
      .single();

    if (error) throw error;

    // Update last_message_at in conversation
    await supabase
      .from('chat_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    return data;
  },

  async createConversation({ type, participants, name }) {
    const { data: conversation, error: conversationError } = await supabase
      .from('chat_conversations')
      .insert({
        type,
        name,
        created_by: participants[0],
      })
      .select()
      .single();

    if (conversationError) throw conversationError;

    // Add participants
    const participantPromises = participants.map((userId) =>
      supabase
        .from('chat_conversation_participants')
        .insert({
          conversation_id: conversation.id,
          user_id: userId,
        })
    );

    await Promise.all(participantPromises);

    return conversation;
  },

  async uploadAttachment(file: File, conversationId: string) {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `chat-attachments/${conversationId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('attachments')
      .getPublicUrl(filePath);

    return {
      name: fileName,
      url: publicUrl,
      type: file.type,
      size: file.size,
    };
  },

  subscribeToConversation(conversationId: string, onMessage: (message: any) => void) {
    const subscription = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => onMessage(payload.new)
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },
};