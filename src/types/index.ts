export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'student';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isProfileCreated: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface StudentProfile {
  id: string;
  userId: string;
  personalInfo: {
    fullName: { firstName: string; lastName: string };
    fatherName: string;
    dateOfBirth: string;
    gender: string;
    cnicNumber: string;
    phone: string;
    email: string;
    permanentAddress: {
      street: string;
      city: string;
      provinceOfDomicile: string;
      postalCode: string;
    };
    emergencyContact: {
      name: string;
      relation: string;
      phone: string;
    };
    residenceCountry: string;
    passportDetails: {
      passportCountry: string;
      passportNumber: string;
      passportExpiry: string;
    };
  };
  educationalBackground: {
    studyLevel: 'bachelor' | 'master' | 'phd' | 'diploma';
    admissionYear: number;
    matriculation?: {
      year: number;
      board: string;
      scorePercentage: number;
    };
    intermediate?: {
      year: number;
      board: string;
      scorePercentage: number;
      preEngineeringOrPreMedical: 'pre-engineering' | 'pre-medical' | 'other';
    };
    additionalCertification: boolean;
    diploma?: {
      program: string;
      specialization: string;
      institution: string;
      country: string;
      startDate: string;
      endDate: string;
      cgpaPercentage: number;
    };
    bachelorDegree?: {
      programName: string;
      specialization: string;
      institution: string;
      country: string;
      startDate: string;
      endDate: string;
      cgpaPercentage: string;
    };
    hecEquivalenceStatus?: {
      applied: boolean;
      obtainedDate?: string;
    };
    educationalGap?: string;
  };
  testScores: {
    ieltsScores?: {
      listening: number;
      reading: number;
      writing: number;
      speaking: number;
      total: number;
    };
    toeflScore?: string;
    satScore?: number;
    greScore?: number;
    gmatScore?: number;
    neetScore?: number;
    backlogs?: string;
    workExperience?: string;
    partTimeWork: boolean;
  };
  studyPreferences: {
    preferredCourse: string;
    specialization: string;
    preferredCountry: string;
    preferredUniversities: string[];
    intendedIntake: {
      season: 'spring' | 'summer' | 'fall' | 'winter';
      year: number;
    };
    studyReason: string;
    careerGoals: string;
    scholarshipInterest: boolean;
    coOpInterest: boolean;
    familyAbroad: boolean;
    accommodationSupport: boolean;
  };
  financialInfo: {
    fundingSource: string;
    sponsorDetails?: {
      sponsorName: string;
      sponsorRelation: string;
      sponsorCnic: string;
      sponsorAnnualIncome: string;
    };
    budgetConstraints: string;
    bankStatementsSubmitted: boolean;
    financialAffidavit: boolean;
    visaRejections: boolean;
    travelHistory: string;
    policeClearanceCertificate: boolean;
    medicalClearance: boolean;
    medicalConditions?: string;
    domicileCertificateSubmitted: boolean;
    nocRequired: boolean;
    additionalInfo?: string;
  };
  profileCompletionStatus: {
    personalInfo: boolean;
    educationalBackground: boolean;
    testScores: boolean;
    studyPreferences: boolean;
    financialInfo: boolean;
    overallPercentage: number;
  };
}

export interface Lead {
  id: string;
  studentId: string;
  assignedConsultant: string;
  status: 'new' | 'in_progress' | 'converted' | 'lost';
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  studentId: string;
  consultantId?: string;
  consultantName?: string;
  dateTime: string;
  status: 'scheduled' | 'completed' | 'canceled' | 'no_show';
  type: 'in_person' | 'virtual';
  notes?: string;
  meetingLink?: string;
}

export interface Document {
  id: string;
  userId: string;
  type:
    | 'passport'
    | 'cnic'
    | 'transcript'
    | 'test_score'
    | 'degree'
    | 'experience_letter'
    | 'bank_statement'
    | 'photo'
    | 'other';
  fileName: string;
  filePath: string;
  fileSize: number;
  status: 'pending' | 'approved' | 'rejected';
  expiryDate?: string;
  notes?: string;
  uploadedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ApplicationChecklist {
  id: string;
  studentId: string;
  items: Array<{
    id: string;
    title: string;
    description: string;
    required: boolean;
    completed: boolean;
    dueDate?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
