import { api } from './api';
import { Notification } from '@/types';

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  inApp: boolean;
  types: {
    appointments: boolean;
    documents: boolean;
    messages: boolean;
    tasks: boolean;
    applications: boolean;
  };
}

class NotificationService {
  async getNotifications(): Promise<Notification[]> {
    return api.get<Notification[]>('/notifications');
  }

  async getUnreadNotifications(): Promise<Notification[]> {
    return api.get<Notification[]>('/notifications?read=false');
  }

  async markAsRead(id: string): Promise<Notification> {
    return api.patch<Notification>(`/notifications/${id}/read`);
  }

  async markAllAsRead(): Promise<{ message: string }> {
    return api.patch('/notifications/read/all');
  }

  async deleteNotification(id: string): Promise<{ message: string }> {
    return api.delete(`/notifications/${id}`);
  }

  async getPreferences(): Promise<NotificationPreferences> {
    return api.get<NotificationPreferences>('/notifications/preferences');
  }

  async updatePreferences(
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    return api.put<NotificationPreferences>(
      '/notifications/preferences',
      preferences
    );
  }

  async getNotificationHistory(
    page: number = 1,
    limit: number = 20
  ): Promise<{
    notifications: Notification[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return api.get(`/notifications/history?page=${page}&limit=${limit}`);
  }
}

export const notificationService = new NotificationService();
