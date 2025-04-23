import { supabase } from '../config/database';

export const chatService = {
  async getConversations() {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select(`
        *,
        participants:chat_conversation_participants(
          id,
          user:users(
            id,
            email,
            raw_app_meta_data
          )
        )
      `)
      .order('last_message_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  },

  async getConversationMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        sender:sender_id(
          id,
          email,
          raw_app_meta_data
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  },

  async createConversation({ type, participants, name }: { type: string; participants: string[]; name: string }) {
    const { data: conversation, error: conversationError } = await supabase
      .from('chat_conversations')
      .insert([
        {
          type,
          name,
          created_by: participants[0]
        }
      ])
      .select()
      .single();

    if (conversationError) {
      throw conversationError;
    }

    // Add participants to the conversation
    const participantPromises = participants.map(userId =>
      supabase
        .from('chat_conversation_participants')
        .insert([
          {
            conversation_id: conversation.id,
            user_id: userId
          }
        ])
    );

    await Promise.all(participantPromises);

    return conversation;
  },

  async sendMessage({ conversationId, senderId, content, messageType = 'text', attachments = [] }) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([
        {
          conversation_id: conversationId,
          sender_id: senderId,
          content,
          message_type: messageType,
          attachments
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update conversation's last_message_at
    await supabase
      .from('chat_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    return data;
  },

  async uploadAttachment(file: File, conversationId: string) {
    const fileName = `${conversationId}/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('chat-attachments')
      .upload(fileName, file);

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('chat-attachments')
      .getPublicUrl(fileName);

    return {
      name: file.name,
      url: publicUrl,
      size: file.size,
      type: file.type
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
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          onMessage(payload.new);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
};