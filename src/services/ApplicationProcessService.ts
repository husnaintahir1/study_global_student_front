import { api } from './api';

// Eligibility Check Types
export interface EligibilityResponse {
  eligible: boolean;
  completionPercentage: number;
  missingFields: string[];
  missingDocuments: string[];
  profile: boolean;
  documents: boolean;
}

// Application Creation Types
export interface CreateApplicationRequest {
  title?: string;
  targetIntake?: string;
  targetCountry?: string;
}

// University Types
export interface University {
  id: number;
  universityName: string;
  country: string;
  programs: Program[];
}

export interface Program {
  id: number;
  name: string;
  fees: string;
  duration: string;
  intakes: string[];
}

// University Selection Types
export interface UniversitySelection {
  universityId: number;
  universityName: string;
  programId: number;
  programName: string;
  country: string;
  fees: string;
  duration: string;
  intakes: string[];
  selectedIntake: string;
  priority: number;
}

export interface UniversitySelectionRequest {
  universitySelections: UniversitySelection[];
}

// Offer Types
export interface OfferLetter {
  id: number;
  universityId: number;
  universityName: string;
  programName: string;
  offerDate: string;
  status: 'pending' | 'accepted' | 'rejected';
  conditions: string[];
  responseDate?: string;
}

export interface OfferActionRequest {
  action: 'add' | 'accept' | 'reject';
  universityId?: number;
  universityName?: string;
  programName?: string;
  conditions?: string[];
  offerId?: number;
}

// Visa Info Types
export interface VisaInfo {
  status: 'not_started' | 'documents_required' | 'submitted' | 'approved' | 'rejected';
  submissionDate?: string;
  approvalDate?: string;
  visaNumber?: string;
  expiryDate?: string;
}

// Consultant Types
export interface Consultant {
  id: string;
  name: string;
  email: string;
}

// Main Application Types
export type ApplicationStatus = 
  | 'draft' 
  | 'in_review' 
  | 'submitted' 
  | 'offers_received' 
  | 'accepted' 
  | 'rejected' 
  | 'visa_applied' 
  | 'completed';

export type ApplicationStage = 
  | 'profile_review' 
  | 'university_selection' 
  | 'document_preparation' 
  | 'submission' 
  | 'offer_management' 
  | 'visa_application' 
  | 'completed';

export interface Application {
  id: string;
  studentId: string;
  consultantId?: string;
  status: ApplicationStatus;
  stage: ApplicationStage;
  universitySelections: UniversitySelection[];
  offerLetters: OfferLetter[];
  visaInfo: VisaInfo;
  submissionDate?: string;
  completionDate?: string;
  rejectionReason?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  consultant?: Consultant;
}

// API Response Types
export interface CreateApplicationResponse {
  message: string;
  application: Application;
}

export interface UniversitiesResponse {
  message: string;
  universities: University[];
}

export interface ApplicationsResponse {
  message: string;
  applications: Application[];
}

export interface UpdateApplicationResponse {
  message: string;
  application: Application;
}

export interface SubmitApplicationResponse {
  message: string;
  application: Application;
}

class ApplicationService {
  // Check if student is eligible to create applications
  async checkEligibility(): Promise<EligibilityResponse> {
    return api.get<EligibilityResponse>('/applications/student/eligibility');
  }

  // Create a new application
  async createApplication(data: CreateApplicationRequest): Promise<CreateApplicationResponse> {
    return api.post<CreateApplicationResponse>('/applications/student/create', data);
  }

  // Get all universities with optional filters
  async getUniversities(filters?: { country?: string; program?: string }): Promise<UniversitiesResponse> {
    const params = new URLSearchParams();
    if (filters?.country) params.append('country', filters.country);
    if (filters?.program) params.append('program', filters.program);
    
    const queryString = params.toString();
    const url = `/applications/student/universities${queryString ? `?${queryString}` : ''}`;
    
    return api.get<UniversitiesResponse>(url);
  }

  // Select universities for a specific application
  async selectUniversities(
    applicationId: string, 
    data: UniversitySelectionRequest
  ): Promise<UpdateApplicationResponse> {
    return api.put<UpdateApplicationResponse>(
      `/applications/student/${applicationId}/universities`, 
      data
    );
  }

  // Submit application to universities
  async submitApplication(applicationId: string): Promise<SubmitApplicationResponse> {
    return api.post<SubmitApplicationResponse>(`/applications/student/${applicationId}/submit`);
  }

  // Get all student applications
  async getMyApplications(): Promise<ApplicationsResponse> {
    return api.get<ApplicationsResponse>('/applications/student/my-applications');
  }

  // Get specific application by ID
  async getApplicationById(applicationId: string): Promise<Application> {
    return api.get<Application>(`/applications/student/${applicationId}`);
  }

  // Manage offers for a specific application
  async manageOffers(
    applicationId: string, 
    data: OfferActionRequest
  ): Promise<UpdateApplicationResponse> {
    return api.put<UpdateApplicationResponse>(
      `/applications/student/${applicationId}/offers`, 
      data
    );
  }

  // Helper method to get all offers across all applications
  async getAllOffers(): Promise<OfferLetter[]> {
    const response = await this.getMyApplications();
    const allOffers: OfferLetter[] = [];
    
    response.applications.forEach(app => {
      allOffers.push(...app.offerLetters);
    });
    
    return allOffers;
  }

  // Helper method to get applications by status
  async getApplicationsByStatus(status: ApplicationStatus): Promise<Application[]> {
    const response = await this.getMyApplications();
    return response.applications.filter(app => app.status === status);
  }

  // Helper method to get applications by stage
  async getApplicationsByStage(stage: ApplicationStage): Promise<Application[]> {
    const response = await this.getMyApplications();
    return response.applications.filter(app => app.stage === stage);
  }
}

export const applicationService = new ApplicationService();