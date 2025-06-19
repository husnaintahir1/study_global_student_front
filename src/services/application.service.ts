import { api } from './api';
import { ApplicationChecklist, Lead } from '@/types';

export interface ApplicationStatus {
  id: string;
  universityName: string;
  courseName: string;
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected';
  submittedAt?: string;
  updatedAt: string;
  deadline?: string;
  progress: number;
}

export interface ApplicationSummary {
  id: string;
  fileName: string;
  fileUrl: string;
  generatedAt: string;
}

class ApplicationService {
  async getApplications(): Promise<ApplicationStatus[]> {
    return api.get<ApplicationStatus[]>('/student/applications');
  }

  async getApplicationById(id: string): Promise<ApplicationStatus> {
    return api.get<ApplicationStatus>(`/student/applications/${id}`);
  }

  async getChecklist(): Promise<ApplicationChecklist> {
    return api.get<ApplicationChecklist>('/student/checklist');
  }

  async updateChecklistItem(
    itemId: string,
    completed: boolean
  ): Promise<ApplicationChecklist> {
    return api.patch<ApplicationChecklist>(`/student/checklist/${itemId}`, {
      completed,
    });
  }

  async getLeadStatus(): Promise<Lead> {
    return api.get<Lead>('/student/lead-status');
  }

  async getApplicationProgress(): Promise<{
    totalSteps: number;
    completedSteps: number;
    percentage: number;
    nextStep?: string;
  }> {
    return api.get('/student/applications/progress');
  }

  async downloadSummary(): Promise<ApplicationSummary> {
    return api.get<ApplicationSummary>('/student/summaries');
  }

  async getDeadlines(): Promise<
    Array<{
      id: string;
      title: string;
      dueDate: string;
      type: 'application' | 'document' | 'task';
      status: 'upcoming' | 'overdue';
    }>
  > {
    return api.get('/student/calendar');
  }
}

export const applicationService = new ApplicationService();
