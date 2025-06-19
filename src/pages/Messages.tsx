import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiSearch, FiMessageSquare } from 'react-icons/fi';
import { messageService, MessageThread } from '@/services/message.service';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { getRelativeTime, cn } from '@/utils/helpers';
import toast from 'react-hot-toast';

export const Messages: React.FC = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(
    null
  );
  const [messageContent, setMessageContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchThreads();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedThread?.messages]);

  const fetchThreads = async () => {
    try {
      const data = await messageService.getMessageThreads();
      setThreads(data);
      if (data.length > 0 && !selectedThread) {
        setSelectedThread(data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch message threads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || !selectedThread) return;

    setIsSending(true);
    try {
      const message = await messageService.sendMessage({
        receiverId: selectedThread.consultantId,
        content: messageContent.trim(),
      });

      // Update local state
      setSelectedThread({
        ...selectedThread,
        messages: [...selectedThread.messages, message],
        lastMessage: message,
      });

      setMessageContent('');
      toast.success('Message sent');
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleThreadSelect = async (thread: MessageThread) => {
    setSelectedThread(thread);

    // Mark messages as read
    if (thread.unreadCount > 0) {
      try {
        await messageService.markMessagesAsRead(thread.consultantId);
        setThreads(
          threads.map((t) =>
            t.consultantId === thread.consultantId
              ? { ...t, unreadCount: 0 }
              : t
          )
        );
      } catch (error) {
        console.error('Failed to mark messages as read:', error);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredThreads = threads.filter(
    (thread) =>
      thread.consultantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.lastMessage.content
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Messages</h1>
        <p className='text-gray-600 mt-1'>Communicate with your consultants</p>
      </div>

      <div className='flex-1 flex gap-6 min-h-0'>
        {/* Thread List */}
        <div className='w-80 flex flex-col bg-white rounded-lg shadow'>
          <div className='p-4 border-b'>
            <div className='relative'>
              <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' />
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search messages...'
                className='input pl-10'
              />
            </div>
          </div>

          <div className='flex-1 overflow-y-auto'>
            {filteredThreads.length > 0 ? (
              filteredThreads.map((thread) => (
                <button
                  key={thread.consultantId}
                  onClick={() => handleThreadSelect(thread)}
                  className={cn(
                    'w-full p-4 text-left hover:bg-gray-50 border-b transition-colors',
                    selectedThread?.consultantId === thread.consultantId &&
                      'bg-primary-50'
                  )}
                >
                  <div className='flex justify-between items-start mb-1'>
                    <h3 className='font-medium text-gray-900'>
                      {thread.consultantName}
                    </h3>
                    {thread.unreadCount > 0 && (
                      <span className='bg-primary-600 text-white text-xs rounded-full px-2 py-0.5'>
                        {thread.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className='text-sm text-gray-600 truncate'>
                    {thread.lastMessage.content}
                  </p>
                  <p className='text-xs text-gray-500 mt-1'>
                    {getRelativeTime(thread.lastMessage.createdAt)}
                  </p>
                </button>
              ))
            ) : (
              <div className='p-8 text-center text-gray-500'>
                <FiMessageSquare className='h-12 w-12 mx-auto mb-2 text-gray-300' />
                <p>No messages yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Message View */}
        {selectedThread ? (
          <div className='flex-1 flex flex-col bg-white rounded-lg shadow'>
            {/* Header */}
            <div className='p-4 border-b'>
              <h2 className='font-semibold text-gray-900'>
                {selectedThread.consultantName}
              </h2>
              <p className='text-sm text-gray-600'>Consultant</p>
            </div>

            {/* Messages */}
            <div className='flex-1 overflow-y-auto p-4 space-y-4'>
              {selectedThread.messages.map((message) => {
                const isOwn = message.senderId === user?.id;
                return (
                  <div
                    key={message.id}
                    className={cn(
                      'flex',
                      isOwn ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                        isOwn
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      )}
                    >
                      <p className='text-sm'>{message.content}</p>
                      <p
                        className={cn(
                          'text-xs mt-1',
                          isOwn ? 'text-primary-100' : 'text-gray-500'
                        )}
                      >
                        {getRelativeTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className='p-4 border-t'>
              <div className='flex gap-2'>
                <input
                  type='text'
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder='Type a message...'
                  className='input flex-1'
                  disabled={isSending}
                />
                <button
                  type='submit'
                  disabled={!messageContent.trim() || isSending}
                  className='btn btn-primary flex items-center gap-2'
                >
                  {isSending ? (
                    <LoadingSpinner size='sm' />
                  ) : (
                    <>
                      <FiSend className='h-4 w-4' />
                      Send
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className='flex-1 flex items-center justify-center bg-white rounded-lg shadow'>
            <div className='text-center text-gray-500'>
              <FiMessageSquare className='h-16 w-16 mx-auto mb-4 text-gray-300' />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
