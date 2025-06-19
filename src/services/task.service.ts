import { api } from './api';
import { Task } from '@/types';

export interface TaskStats {
  total: number;
  pending: number;
  completed: number;
  overdue: number;
}

class TaskService {
  async getTasks(): Promise<Task[]> {
    return api.get<Task[]>('/student/tasks');
  }

  async getPendingTasks(): Promise<Task[]> {
    return api.get<Task[]>('/student/tasks?status=pending');
  }

  async getTaskById(id: string): Promise<Task> {
    return api.get<Task>(`/student/tasks/${id}`);
  }

  async updateTaskStatus(id: string, status: Task['status']): Promise<Task> {
    return api.patch<Task>(`/student/tasks/${id}`, { status });
  }

  async getTaskStats(): Promise<TaskStats> {
    return api.get<TaskStats>('/student/tasks/stats');
  }

  async getOverdueTasks(): Promise<Task[]> {
    return api.get<Task[]>('/student/tasks/overdue');
  }
}

export const taskService = new TaskService();
