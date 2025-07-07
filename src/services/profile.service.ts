import { api } from './api';
import { StudentProfile } from '@/types';

interface ChecklistItem {
  id: string;
  title: string;
  required: boolean;
  completed: boolean;
  createdAt: string;
  description?: string;
  updatedAt?: string;
}

interface Consultant {
  id: string;
  name: string;
  email: string;
}

interface Checklist {
  id: string;
  studentId: string;
  consultantId: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  items: ChecklistItem[];
  progress: number;
  additionalData: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  consultant: Consultant;
}

interface ChecklistItemUpdate {
  title: string;
  completed: boolean;
}

class ProfileService {
  async getProfile(): Promise<StudentProfile> {
    return api.get<StudentProfile>('/student/profile');
  }

  async createProfile(data: Partial<StudentProfile>): Promise<StudentProfile> {
    return api.post<StudentProfile>('/student/profile', data);
  }

  async updateProfile(data: Partial<StudentProfile>): Promise<StudentProfile> {
    return api.put<StudentProfile>('/student/profile', data);
  }

  async updateStepData(data: any): Promise<StudentProfile> {
    return api.put<StudentProfile>('/student/profile/', data);
  }

  async updatePersonalInfo(
    data: StudentProfile['personalInfo']
  ): Promise<StudentProfile> {
    return api.patch<StudentProfile>('/student/profile/personal-info', data);
  }

  async updateEducationalBackground(
    data: StudentProfile['educationalBackground']
  ): Promise<StudentProfile> {
    return api.patch<StudentProfile>(
      '/student/profile/educational-background',
      data
    );
  }

  async updateTestScores(
    data: StudentProfile['testScores']
  ): Promise<StudentProfile> {
    return api.patch<StudentProfile>('/student/profile/test-scores', data);
  }

  async updateStudyPreferences(
    data: StudentProfile['studyPreferences']
  ): Promise<StudentProfile> {
    return api.patch<StudentProfile>(
      '/student/profile/study-preferences',
      data
    );
  }

  async updateWorkExperience(
    data: StudentProfile['workExperience']
  ): Promise<StudentProfile> {
    return api.patch<StudentProfile>('/student/profile/work-experience', data);
  }

  async updateFinancialInfo(
    data: StudentProfile['financialInfo']
  ): Promise<StudentProfile> {
    return api.patch<StudentProfile>('/student/profile/financial-info', data);
  }

  async submitForReview(): Promise<{ message: string }> {
    return api.post('/student/reviews/profile');
  }

  async getReviewStatus(): Promise<{
    status: 'pending' | 'approved' | 'rejected';
    comments?: string;
    updatedAt: string;
  }> {
    return api.get('/student/reviews');
  }

  // Fetch checklists for a student
  async getStudentChecklists(
    studentId: string
  ): Promise<{ success: boolean; data: Checklist[] }> {
    return api.get<{ success: boolean; data: Checklist[] }>(
      `/checklists/student/${studentId}`
    );
  }

  // Update checklist items
  async updateChecklistItems(
    checklistId: string,
    items: ChecklistItemUpdate[]
  ): Promise<void> {
    return api.patch(`/checklists/${checklistId}/items`, items);
  }
}

export const profileService = new ProfileService();
