import { ApplicationStatus, ApplicationStage } from './applicationService';

// Status and Stage Display Names
export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  draft: 'Draft',
  in_review: 'In Review',
  submitted: 'Submitted',
  offers_received: 'Offers Received',
  accepted: 'Accepted',
  rejected: 'Rejected',
  visa_applied: 'Visa Applied',
  completed: 'Completed',
};

export const STAGE_LABELS: Record<ApplicationStage, string> = {
  profile_review: 'Profile Review',
  university_selection: 'University Selection',
  document_preparation: 'Document Preparation',
  submission: 'Application Submission',
  offer_management: 'Offer Management',
  visa_application: 'Visa Application',
  completed: 'Completed',
};

// Status Colors for UI Components
export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  in_review: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  submitted: 'bg-blue-100 text-blue-800 border-blue-200',
  offers_received: 'bg-purple-100 text-purple-800 border-purple-200',
  accepted: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  visa_applied: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

export const STAGE_COLORS: Record<ApplicationStage, string> = {
  profile_review: 'bg-orange-100 text-orange-800 border-orange-200',
  university_selection: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  document_preparation: 'bg-amber-100 text-amber-800 border-amber-200',
  submission: 'bg-blue-100 text-blue-800 border-blue-200',
  offer_management: 'bg-purple-100 text-purple-800 border-purple-200',
  visa_application: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

// Progress Calculation
export const STAGE_ORDER: ApplicationStage[] = [
  'profile_review',
  'university_selection',
  'document_preparation',
  'submission',
  'offer_management',
  'visa_application',
  'completed',
];

/**
 * Calculate progress percentage based on current stage
 */
export const calculateStageProgress = (stage: ApplicationStage): number => {
  const currentIndex = STAGE_ORDER.indexOf(stage);
  if (currentIndex === -1) return 0;

  return Math.round(((currentIndex + 1) / STAGE_ORDER.length) * 100);
};

/**
 * Get next stage in the progression
 */
export const getNextStage = (
  currentStage: ApplicationStage
): ApplicationStage | null => {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  if (currentIndex === -1 || currentIndex === STAGE_ORDER.length - 1) {
    return null;
  }
  return STAGE_ORDER[currentIndex + 1];
};

/**
 * Check if stage is completed
 */
export const isStageCompleted = (
  stage: ApplicationStage,
  currentStage: ApplicationStage
): boolean => {
  const stageIndex = STAGE_ORDER.indexOf(stage);
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  return stageIndex < currentIndex;
};

/**
 * Check if stage is current
 */
export const isCurrentStage = (
  stage: ApplicationStage,
  currentStage: ApplicationStage
): boolean => {
  return stage === currentStage;
};

// Status Validation
/**
 * Check if application can be submitted
 */
export const canSubmitApplication = (
  status: ApplicationStatus,
  universitySelections: any[],
  eligibilityPercentage: number
): { canSubmit: boolean; reason?: string } => {
  if (status !== 'draft') {
    return { canSubmit: false, reason: 'Application already submitted' };
  }

  if (eligibilityPercentage < 85) {
    return { canSubmit: false, reason: 'Profile completion below 85%' };
  }

  if (universitySelections.length === 0) {
    return { canSubmit: false, reason: 'No universities selected' };
  }

  // Check if all selections have required fields
  for (const selection of universitySelections) {
    if (!selection.selectedIntake) {
      return {
        canSubmit: false,
        reason: `Missing intake selection for ${selection.universityName}`,
      };
    }
  }

  return { canSubmit: true };
};

/**
 * Check if application can be edited
 */
export const canEditApplication = (status: ApplicationStatus): boolean => {
  return status === 'draft' || status === 'in_review';
};

/**
 * Check if offers can be managed
 */
export const canManageOffers = (status: ApplicationStatus): boolean => {
  return status === 'offers_received' || status === 'accepted';
};

// Date Formatting
/**
 * Format date for display
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Not set';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Format date with time
 */
export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return 'Not set';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Get relative time (e.g., "2 days ago")
 */
export const getRelativeTime = (dateString?: string): string => {
  if (!dateString) return 'Unknown';

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

    return `${Math.floor(diffDays / 365)} years ago`;
  } catch (error) {
    return 'Unknown';
  }
};

// University Selection Helpers
/**
 * Validate university selection
 */
export const validateUniversitySelection = (
  selections: any[]
): string | null => {
  if (selections.length === 0) {
    return 'Please select at least one university';
  }

  if (selections.length > 5) {
    return 'Maximum 5 universities allowed';
  }

  // Check for missing required fields
  for (const selection of selections) {
    if (!selection.selectedIntake) {
      return `Please select intake for ${selection.universityName}`;
    }
  }

  // Check for duplicate universities
  const universityIds = selections.map((s) => s.universityId);
  const uniqueIds = new Set(universityIds);
  if (uniqueIds.size !== universityIds.length) {
    return 'Duplicate universities selected';
  }

  return null;
};

/**
 * Sort universities by priority
 */
export const sortUniversitiesByPriority = (selections: any[]): any[] => {
  return [...selections].sort((a, b) => a.priority - b.priority);
};

// Application Summary Helpers
/**
 * Get application summary stats
 */
export const getApplicationSummary = (applications: any[]) => {
  const summary = {
    total: applications.length,
    draft: 0,
    inReview: 0,
    submitted: 0,
    offersReceived: 0,
    accepted: 0,
    rejected: 0,
    completed: 0,
    totalOffers: 0,
    pendingOffers: 0,
    acceptedOffers: 0,
  };

  applications.forEach((app) => {
    // Count by status
    switch (app.status) {
      case 'draft':
        summary.draft++;
        break;
      case 'in_review':
        summary.inReview++;
        break;
      case 'submitted':
        summary.submitted++;
        break;
      case 'offers_received':
        summary.offersReceived++;
        break;
      case 'accepted':
        summary.accepted++;
        break;
      case 'rejected':
        summary.rejected++;
        break;
      case 'completed':
        summary.completed++;
        break;
    }

    // Count offers
    if (app.offerLetters) {
      summary.totalOffers += app.offerLetters.length;
      app.offerLetters.forEach((offer: any) => {
        if (offer.status === 'pending') summary.pendingOffers++;
        if (offer.status === 'accepted') summary.acceptedOffers++;
      });
    }
  });

  return summary;
};

// Error Handling
/**
 * Parse API error message
 */
export const parseApiError = (error: any): string => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.message) {
    return error.message;
  }

  return 'An unexpected error occurred';
};
