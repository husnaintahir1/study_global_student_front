import { api } from './api';
import { StudentProfile } from '@/types';

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
    return api.put<StudentProfile>(`/student/profile/`, data);
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
}

export const profileService = new ProfileService();
