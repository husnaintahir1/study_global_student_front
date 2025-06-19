import { api } from './api';
import { Message } from '@/types';

export interface MessageThread {
  consultantId: string;
  consultantName: string;
  lastMessage: Message;
  unreadCount: number;
  messages: Message[];
}

export interface SendMessageData {
  receiverId: string;
  content: string;
}

class MessageService {
  async getMessageThreads(): Promise<MessageThread[]> {
    return api.get<MessageThread[]>('/student/communication');
  }

  async getMessagesWithConsultant(consultantId: string): Promise<Message[]> {
    return api.get<Message[]>(`/student/messages/${consultantId}`);
  }

  async sendMessage(data: SendMessageData): Promise<Message> {
    return api.post<Message>('/student/messages', data);
  }

  async markMessagesAsRead(consultantId: string): Promise<{ message: string }> {
    return api.patch(`/student/messages/${consultantId}/read`);
  }

  async getUnreadCount(): Promise<{ count: number }> {
    return api.get('/student/messages/unread-count');
  }

  async searchMessages(query: string): Promise<Message[]> {
    return api.get<Message[]>(
      `/student/messages/search?q=${encodeURIComponent(query)}`
    );
  }

  async deleteMessage(id: string): Promise<{ message: string }> {
    return api.delete(`/student/messages/${id}`);
  }
}

export const messageService = new MessageService();
