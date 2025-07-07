import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  User,
  Search,
  Send,
  Reply,
  Paperclip,
  Loader,
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';

// Add type declaration for import.meta.env
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_API_URL: string;
    };
  }
}

// Types
interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'consultant' | 'manager' | 'super_admin' | 'receptionist';
}

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: string;
  readAt?: string;
  replyToId?: string;
  conversationHash: string;
  sender?: User;
}

interface Conversation {
  id: string;
  conversationHash: string;
  displayName: string;
  lastMessage?: Message;
  type: 'conversation';
}

interface Recipient {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'consultant' | 'manager' | 'super_admin' | 'receptionist';
}

interface RecipientConversation {
  id: string;
  displayName: string;
  type: 'recipient';
  recipient: Recipient;
}

type ConversationItem = Conversation | RecipientConversation;

interface ChatProps {}

// API Service Class
class ChatApiService {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    const mytoken = localStorage.getItem('student_auth_token');
    this.baseUrl = baseUrl;
    this.token = mytoken || token || '';
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    console.log(this.baseUrl, this.token, "ascasncjasncasascsc");
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async getMessages(recipientId: string) {
    return this.request(`/messages?recipientId=${recipientId}`);
  }

  async sendMessage(messageData: any) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async getConversations() {
    return this.request('/messages');
  }

  async getAllowedRecipients() {
    return this.request('/messages/users/allowed-recipients');
  }

  async getUnreadMessageCount() {
    return this.request('/messages/unread-count');
  }

  async markConversationMessagesAsRead(conversationHash: string) {
    return this.request(`/messages/conversation/${conversationHash}/read`, {
      method: 'PUT',
    });
  }

  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload Error: ${response.statusText}`);
    }

    return response.json();
  }
}

// Socket Service Class
class ChatSocketService {
  private socket: Socket | null = null;
  private newMessageCallbacks: ((message: Message) => void)[] = [];
  private messageReadCallbacks: ((data: any) => void)[] = [];

  constructor(private socketUrl: string) {}

  connect(userId: string) {
    if (this.socket?.connected) return this.socket;

    this.socket = io(this.socketUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      this.socket?.emit('join', userId);
    });

    this.socket.on('newMessage', (message: Message) => {
      this.newMessageCallbacks.forEach((callback) => callback(message));
    });

    this.socket.on('messageRead', (data: any) => {
      this.messageReadCallbacks.forEach((callback) => callback(data));
    });

    return this.socket;
  }

  onNewMessage(callback: (message: Message) => void) {
    this.newMessageCallbacks.push(callback);
  }

  onMessageRead(callback: (data: any) => void) {
    this.messageReadCallbacks.push(callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.newMessageCallbacks = [];
      this.messageReadCallbacks = [];
    }
  }

  cleanup() {
    this.newMessageCallbacks = [];
    this.messageReadCallbacks = [];
  }
}

// Main Chat Component
const StandaloneChat: React.FC<ChatProps> = (
  {
    //   user,
    //   apiBaseUrl,
    //   socketUrl,
    //   authToken,
  }
) => {
  const { user } = useAuth();

  const apiBaseUrl = import.meta.env.VITE_API_URL;
  const socketUrl = import.meta.env.VITE_API_URL.replace('/api/v1', '');
  const authToken = localStorage.getItem('student_auth_token') || '';

  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [allowedRecipients, setAllowedRecipients] = useState<Recipient[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>(
    {}
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(false);


  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Services
  const apiService = useRef(new ChatApiService(apiBaseUrl, authToken));
  const socketService = useRef(new ChatSocketService(socketUrl));

  // Initialize socket connection
  useEffect(() => {
    if (user?.id) {
      socketService.current.connect(user.id);
    }

    return () => {
      socketService.current.disconnect();
    };
  }, [user?.id]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load conversations if super_admin
        // if (true) {
        //   const conversationsRes = await apiService.current.getConversations();
        //   setConversations(conversationsRes.data || []);
        // }

        // Load allowed recipients
        const recipientsRes = await apiService.current.getAllowedRecipients();
        setAllowedRecipients(recipientsRes.data || []);

        // Load unread counts
        const unreadRes = await apiService.current.getUnreadMessageCount();
        const counts = (unreadRes.data || []).reduce(
          (acc: any, { conversationHash, unreadCount }: any) => ({
            ...acc,
            [conversationHash]: unreadCount,
          }),
          {}
        );
        setUnreadCounts(counts);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    if (user?.id) {
      loadInitialData();
    }
  }, [user]);

  // Socket event listeners
  useEffect(() => {
    if (!user?.id) return;

    const handleNewMessage = (newMessage: Message) => {
      if (
        newMessage.senderId === user.id ||
        newMessage.recipientId === user.id
      ) {
        if (
          newMessage.recipientId === user.id &&
          selectedConversation?.id !== newMessage.conversationHash
        ) {
          setUnreadCounts((prev) => ({
            ...prev,
            [newMessage.conversationHash]:
              (prev[newMessage.conversationHash] || 0) + 1,
          }));
        }

        // Add message to current conversation
        if (selectedConversation) {
          const currentRecipientId =
            selectedConversation.type === 'conversation'
              ? selectedConversation.id.split('_').find((id) => id !== user.id)
              : selectedConversation.id;

          if (
            (newMessage.senderId === user.id &&
              newMessage.recipientId === currentRecipientId) ||
            (newMessage.recipientId === user.id &&
              newMessage.senderId === currentRecipientId)
          ) {
            setMessages((prev) => {
              // Check if message already exists by ID to prevent duplicates
              if (prev.some((msg) => msg.id === newMessage.id)) return prev;
              return [...prev, newMessage];
            });
          }
        }
      }
    };

    socketService.current.onNewMessage(handleNewMessage);

    return () => {
      socketService.current.cleanup();
    };
  }, [user?.id, selectedConversation]);

  // Load messages when conversation changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedConversation || !user?.id) return;

      setIsLoading(true);
      try {
        let recipientId: string;
        if (selectedConversation.type === 'conversation') {
          recipientId =
            selectedConversation.id.split('_').find((id) => id !== user.id) ||
            '';
        } else {
          recipientId = selectedConversation.id;
        }

        if (recipientId) {
          const response = await apiService.current.getMessages(recipientId);
          setMessages(response.data || []);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [selectedConversation, user?.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark conversation as read
  useEffect(() => {
    if (selectedConversation?.type !== 'recipient' || !user?.id) return;

    const conversationHash = [selectedConversation.id, user.id]
      .sort()
      .join('_');

    const markAsRead = async () => {
      try {
        await apiService.current.markConversationMessagesAsRead(
          conversationHash
        );
        setUnreadCounts((prev) => ({ ...prev, [conversationHash]: 0 }));
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    };

    markAsRead();
    const interval = setInterval(markAsRead, 30000);
    return () => clearInterval(interval);
  }, [selectedConversation, user?.id]);

  // Handlers
  const handleSelectConversation = async (item: ConversationItem) => {
    if (!user?.id) return;

    setSelectedConversation(item);
    setMessages([]);

    const conversationHash =
      item.type === 'conversation'
        ? item.id
        : [item.id, user.id].sort().join('_');

    try {
      await apiService.current.markConversationMessagesAsRead(conversationHash);
      setUnreadCounts((prev) => ({ ...prev, [conversationHash]: 0 }));
    } catch (error) {
      console.error('Failed to mark conversation as read:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedConversation || (!messageInput.trim() && !file) || !user?.id) return;

    const recipientId =
      selectedConversation.type === 'conversation'
        ? selectedConversation.id.split('_').find((id) => id !== user.id)
        : selectedConversation.id;

    if (!recipientId) return;

    try {
      let fileData: any = {};
      if (file) {
        fileData = await apiService.current.uploadFile(file);
      }

      const messageData = {
        recipientId,
        content: messageInput,
        type: file ? fileData.mimeType?.split('/')[0] || 'file' : 'text',
        fileUrl: file ? fileData.fileUrl : undefined,
        fileName: file ? fileData.fileName : undefined,
        fileSize: file ? fileData.fileSize : undefined,
        mimeType: file ? fileData.mimeType : undefined,
        replyToId: replyToMessage?.id || undefined,
      };

      const response = await apiService.current.sendMessage(messageData);
      // Add message optimistically for immediate UI feedback
      // The socket will emit the same message, but our duplicate check will prevent it from being added twice
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === response.data.id)) return prev;
        return [...prev, response.data];
      });
      setMessageInput('');
      setFile(null);
      setReplyToMessage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Prepare conversation list
  const allItems: ConversationItem[] = [
    ...conversations.map((conv) => ({
      ...conv,
      type: 'conversation' as const,
      id: conv.conversationHash,
    })),
    ...allowedRecipients
      .filter(
        (recipient) =>
          recipient.id !== user?.id &&
          !conversations.some(
            (conv) =>
              conv.conversationHash.includes(recipient.id) &&
              conv.conversationHash.includes(user?.id || '')
          )
      )
      .map((recipient) => ({
        id: recipient.id,
        displayName: recipient.name,
        type: 'recipient' as const,
        recipient,
      })),
  ];

  const filteredItems = allItems.filter((item) =>
    item.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLastMessagePreview = (item: ConversationItem): string => {
    if (item.type === 'recipient') return item.recipient.role;
    if (!item.lastMessage) return 'No messages yet';
    const content = item.lastMessage.content;
    return content.length > 40 ? content.substring(0, 40) + '...' : content;
  };

  const formatTime = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const isLeftAligned = (msg: Message): boolean => {
    if (!user?.id) return false;
    
    if (selectedConversation?.type === 'conversation') {
      if (user.role === 'super_admin') {
        return msg.sender?.role === 'student';
      }
      return msg.senderId !== user.id;
    }
    return msg.senderId !== user.id;
  };

  const formatDateTime = (date: string): string => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStaticFileUrl = (filePath: string): string => {
    const mainUrl = apiBaseUrl.replace("/api/v1", "");
    return `${mainUrl}${filePath}`;
  };

  const renderMessageContent = (msg: Message): JSX.Element => {
    return (
      <div className='flex flex-col gap-2'>
        {msg.type === 'image' && msg.fileUrl && (
          <>
            <img
              src={getStaticFileUrl(msg.fileUrl)}
              alt={msg.fileName}
              className='max-w-full h-auto rounded-xl shadow-sm'
              style={{ maxHeight: '200px' }}
            />
            <a
              href={getStaticFileUrl(msg.fileUrl)}
              download={msg.fileName}
              className='text-gray-500 hover:text-gray-300 underline flex items-center gap-1 text-sm transition-colors'
            >
              <Paperclip className='w-4 h-4' />
              Download {msg.fileName} ({((msg.fileSize || 0) / 1024).toFixed(2)}{' '}
              KB)
            </a>
          </>
        )}
        {msg.type === 'file' && msg.fileUrl && (
          <a
            href={getStaticFileUrl(msg.fileUrl)}
            download={msg.fileName}
            className='text-blue-600 hover:text-blue-700 underline flex items-center gap-1 transition-colors'
          >
            <Paperclip className='w-4 h-4' />
            {msg.fileName} ({((msg.fileSize || 0) / 1024).toFixed(2)} KB)
          </a>
        )}
        {msg.type === 'text' && (
          <p className='leading-relaxed'>{msg.content}</p>
        )}
      </div>
    );
  };

  const canSendMessage = (): boolean => {
    if (!user?.role) return false;
    return ['manager', 'consultant', 'super_admin'].includes(user.role);
  };

  // Early return if user is not available
  if (!user) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <Loader className='w-8 h-8 animate-spin mx-auto mb-4' />
          <p className='text-gray-600'>Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Background decorations */}
      <div className='fixed inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full opacity-5 blur-3xl' />
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400 to-cyan-600 rounded-full opacity-5 blur-3xl' />
      </div>

      <div className='relative max-w-7xl mx-auto px-6 py-8'>
        <div className='bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden'>
          <div className='flex h-[calc(100vh-12rem)]'>
            {/* Conversation List */}
            <div className='w-80 bg-white shadow-2xl rounded-l-2xl border border-gray-200/50 flex flex-col'>
              {/* Header */}
              <div className='px-6 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white rounded-tl-2xl'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm'>
                    <MessageSquare className='w-5 h-5' />
                  </div>
                  <div>
                    <h2 className='text-lg font-semibold'>Messages</h2>
                    <p className='text-sm text-white/80'>
                      {filteredItems.length} conversations
                    </p>
                  </div>
                </div>

                {/* Search Bar */}
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60' />
                  <input
                    type='text'
                    placeholder='Search conversations...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='w-full pl-10 pr-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200'
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className='flex-1 overflow-y-auto'>
                {filteredItems.length === 0 ? (
                  <div className='p-6 text-center text-gray-500'>
                    <MessageSquare className='w-12 h-12 mx-auto mb-3 text-gray-300' />
                    <p className='text-sm'>
                      {searchQuery
                        ? 'No conversations found'
                        : 'No conversations yet'}
                    </p>
                  </div>
                ) : (
                  filteredItems.map((item) => {
                    const conversationHash =
                      item.type === 'conversation'
                        ? item.id
                        : [item.id, user.id].sort().join('_');
                    const unreadCount = unreadCounts[conversationHash] || 0;

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectConversation(item)}
                        className={`p-4 cursor-pointer border-b border-gray-100/50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
                          selectedConversation?.id === item.id
                            ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-l-4 border-l-blue-500'
                            : ''
                        }`}
                      >
                        <div className='flex items-center gap-3'>
                          {/* Avatar */}
                          <div
                            className={`relative flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                              item.type === 'recipient'
                                ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                                : 'bg-gradient-to-br from-purple-500 to-pink-600'
                            }`}
                          >
                            {item.type === 'recipient' && (
                              <User className='w-5 h-5' />
                            )}
                            {item.type === 'conversation' &&
                              item.displayName.charAt(0).toUpperCase()}
                          </div>

                          {/* Conversation Info */}
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center justify-between mb-1'>
                              <h3 className='font-semibold text-gray-800 truncate text-sm'>
                                {item.displayName}
                              </h3>
                              <div className='flex items-center gap-2'>
                                {item.type === 'conversation' &&
                                  item.lastMessage && (
                                    <span className='text-xs text-gray-500'>
                                      {formatTime(item.lastMessage.createdAt)}
                                    </span>
                                  )}
                                {unreadCount > 0 && (
                                  <span className='bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm'>
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className='text-sm text-gray-500 truncate'>
                              {getLastMessagePreview(item)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Message Area */}
            <div className='flex-1 flex flex-col bg-gradient-to-br from-slate-50 to-gray-100 shadow-2xl rounded-r-2xl border border-gray-200/50'>
              {/* Header */}
              <div className='px-6 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white flex items-center gap-3 rounded-tr-2xl'>
                <div className='w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm'>
                  <User className='w-5 h-5' />
                </div>
                <div>
                  <h2 className='text-lg font-semibold'>
                    {selectedConversation
                      ? selectedConversation.displayName
                      : 'Select a conversation'}
                  </h2>
                  <p className='text-sm text-white/80'>
                    {selectedConversation
                      ? selectedConversation.type === 'recipient'
                        ? selectedConversation.recipient.role
                        : 'Conversation'
                      : 'Choose someone to chat with'}
                  </p>
                </div>
              </div>

              {/* Messages Area */}
              {isLoading ? (
                <div className='flex-1 flex items-center justify-center'>
                  <div className='flex flex-col items-center gap-3 text-gray-500'>
                    <Loader className='w-8 h-8 animate-spin' />
                    <p className='text-sm'>Loading messages...</p>
                  </div>
                </div>
              ) : (
                <div className='flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent to-white/50'>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      ref={(el) => (messageRefs.current[msg.id] = el)}
                      className={`flex ${
                        isLeftAligned(msg) ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      <div
                        className={`group relative max-w-[70%] ${
                          isLeftAligned(msg)
                            ? 'bg-white shadow-md border border-gray-200/50'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                        } rounded-2xl p-4 transition-all duration-200 hover:shadow-lg`}
                      >
                        <div className='flex items-start gap-3'>
                          <div className='flex-1'>
                            {selectedConversation?.type === 'conversation' && (
                              <p
                                className={`font-medium text-sm mb-1 ${
                                  isLeftAligned(msg)
                                    ? 'text-gray-600'
                                    : 'text-white/90'
                                }`}
                              >
                                {msg.sender?.name}
                              </p>
                            )}
                            <div
                              className={`${
                                isLeftAligned(msg)
                                  ? 'text-gray-800'
                                  : 'text-white'
                              }`}
                            >
                              {renderMessageContent(msg)}
                            </div>
                            <p
                              className={`text-xs mt-2 flex items-center gap-1 ${
                                isLeftAligned(msg)
                                  ? 'text-gray-500'
                                  : 'text-white/70'
                              }`}
                            >
                              {formatDateTime(msg.createdAt)}
                            </p>
                          </div>

                          {['student', 'consultant'].includes(user.role) && (
                            <div className='absolute -right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                              <button
                                onClick={() => {
                                  setReplyToMessage(msg);
                                  setMessageInput('');
                                }}
                                className='p-2 bg-white shadow-lg rounded-full hover:shadow-xl transition-all duration-200 text-gray-600 hover:text-blue-600'
                                title='Reply'
                              >
                                <Reply className='w-4 h-4' />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* Message Input */}
              {selectedConversation && (
                <div className='p-6 border-t border-gray-200/50 bg-white/80 backdrop-blur-sm rounded-br-2xl'>
                  <form
                    onSubmit={handleSendMessage}
                    className='flex flex-col gap-4'
                  >
                    {replyToMessage && (
                      <div className='bg-blue-50 border border-blue-200 p-3 rounded-xl flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <div className='w-1 h-8 bg-blue-500 rounded-full'></div>
                          <div>
                            <p className='text-sm font-medium text-blue-800'>
                              Replying to {replyToMessage.sender?.name}
                            </p>
                            <p className='text-sm text-blue-600 truncate max-w-md'>
                              {replyToMessage.content}
                            </p>
                          </div>
                        </div>
                        <button
                          type='button'
                          onClick={() => setReplyToMessage(null)}
                          className='text-blue-500 hover:text-blue-700 font-medium text-sm px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors'
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    <div className='flex gap-3'>
                      <input
                        type='text'
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder='Type your message...'
                        className='flex-1 px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm'
                      />
                      <input
                        type='file'
                        ref={fileInputRef}
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        accept='image/*,.pdf,.doc,.docx'
                        className='hidden'
                      />
                      <button
                        type='button'
                        onClick={() => fileInputRef.current?.click()}
                        className='p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md'
                      >
                        <Paperclip className='w-5 h-5' />
                      </button>
                      <button
                        type='submit'
                        className='px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
                        disabled={!messageInput.trim() && !file}
                      >
                        <Send className='w-5 h-5' />
                      </button>
                    </div>

                    {file && (
                      <div className='bg-amber-50 border border-amber-200 p-3 rounded-xl'>
                        <p className='text-sm text-amber-800'>
                          <strong>Selected file:</strong> {file.name} (
                          {(file.size / 1024).toFixed(2)} KB)
                        </p>
                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandaloneChat;
