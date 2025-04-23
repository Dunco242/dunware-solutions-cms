import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import { Search, Send, Paperclip, MoreVertical, Phone, Video, User, Plus, MessageSquare } from 'lucide-react';
import Button from '../../components/ui/Button';
import { chatService } from '../../services/chat';
import { useAuth } from '../../hooks/useAuth';

const ChatPage: React.FC = () => {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setIsLoading(true);
        const data = await chatService.getConversations();
        setConversations(data.map(conversation => ({
          ...conversation,
          participants: conversation.participants.map((p: any) => p.user)
        })));
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, []);

  useEffect(() => {
    if (activeChat) {
      const loadMessages = async () => {
        try {
          setIsLoading(true);
          const data = await chatService.getConversationMessages(activeChat);
          setMessages(data);
          scrollToBottom();
        } catch (error) {
          console.error('Error loading messages:', error);
        } finally {
          setIsLoading(false);
        }
      };

      const unsubscribe = chatService.subscribeToConversation(activeChat, (newMessage) => {
        setMessages(prev => [...prev, newMessage]);
        scrollToBottom();
      });

      loadMessages();
      return unsubscribe;
    }
  }, [activeChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeChat || !user?.id) return;

    try {
      await chatService.sendMessage({
        conversationId: activeChat,
        senderId: user.id,
        content: message,
        messageType: 'text',
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat || !user?.id) return;

    try {
      const attachment = await chatService.uploadAttachment(file, activeChat);
      await chatService.sendMessage({
        conversationId: activeChat,
        senderId: user.id,
        content: '',
        messageType: 'file',
        attachments: [attachment],
      });
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleCreateConversation = async () => {
    if (!user?.id) return;
    
    try {
      const newConversation = await chatService.createConversation({
        type: 'direct',
        participants: [user.id],
        name: 'New Conversation'
      });
      setConversations(prev => [...prev, newConversation]);
      setActiveChat(newConversation.id);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  return (
    <div className="py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Chat</h1>
          <p className="mt-1 text-gray-600">Communicate with your team and customers</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={handleCreateConversation}>
            <Plus size={16} className="mr-2" />
            New Conversation
          </Button>
        </div>
      </div>

      <div className="flex flex-col h-[calc(100vh-200px)] overflow-hidden">
        <Card className="flex-1 flex overflow-hidden">
          <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search conversations..."
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                    activeChat === conversation.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setActiveChat(conversation.id)}
                >
                  <Avatar
                    src={conversation.participants[0]?.avatar}
                    alt={conversation.name || conversation.participants[0]?.email}
                    size="md"
                  />
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {conversation.name || conversation.participants[0]?.email}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage?.content}
                    </p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-600 text-xs font-medium text-white">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:flex flex-1 flex-col overflow-hidden">
            {activeChat ? (
              <>
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <Avatar
                      src={conversations.find(c => c.id === activeChat)?.participants[0]?.avatar}
                      alt={conversations.find(c => c.id === activeChat)?.name}
                      size="md"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {conversations.find(c => c.id === activeChat)?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {conversations.find(c => c.id === activeChat)?.participants.length} participants
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Phone size={18} />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Video size={18} />
                    </Button>
                    <Button variant="outline" size="sm">
                      <User size={18} />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreVertical size={18} />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.sender_id !== user?.id && (
                        <Avatar
                          src={msg.sender?.avatar}
                          alt={msg.sender?.email}
                          size="sm"
                          className="mr-2 self-end mb-2"
                        />
                      )}
                      <div>
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.sender_id === user?.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {msg.message_type === 'file' ? (
                            <a
                              href={msg.attachments[0].url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-sm hover:underline"
                            >
                              <Paperclip size={16} className="mr-2" />
                              {msg.attachments[0].name}
                            </a>
                          ) : (
                            <p>{msg.content}</p>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 rounded-full hover:bg-gray-100 text-gray-600 focus:outline-none"
                    >
                      <Paperclip size={18} />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="flex-1 border-0 focus:ring-0 focus:outline-none p-2 text-sm"
                      placeholder="Type a message..."
                    />
                    <button
                      type="submit"
                      className={`p-2 rounded-full ${
                        message.trim() === ''
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                      disabled={message.trim() === ''}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 text-gray-400">
                    <MessageSquare size={48} />
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No conversation selected</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Select a conversation from the list to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ChatPage;