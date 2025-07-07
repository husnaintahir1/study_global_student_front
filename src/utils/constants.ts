export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const TOKEN_KEY = 'student_auth_token';
export const USER_KEY = 'student_user_data';

export const ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  APPLICATIONS: '/applications',
  DOCUMENTS: '/documents',
  APPOINTMENTS: '/appointments',
  MESSAGES: '/messages',
  TASKS: '/tasks',
  SETTINGS: '/settings',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  COURSE_FINDER: '/course-finder',
  COURSE_DETAILS: '/courses/:id',
  CHECK_LIST: '/checklist',

  PROPOSAL: '/proposals',
  PROPOSAL_DETAILS: '/proposals/:id',
} as const;

export const DOCUMENT_TYPES = {
  passport: 'Passport',
  cnic: 'CNIC',
  transcript: 'Academic Transcript',
  test_score: 'Test Score Report',
  degree: 'Degree Certificate',
  experience_letter: 'Experience Letter',
  bank_statement: 'Bank Statement',
  photo: 'Photograph',
  other: 'Other',
} as const;

export const APPOINTMENT_STATUS = {
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  canceled: { label: 'Canceled', color: 'bg-red-100 text-red-800' },
  no_show: { label: 'No Show', color: 'bg-gray-100 text-gray-800' },
} as const;

export const LEAD_STATUS = {
  new: { label: 'New', color: 'bg-purple-100 text-purple-800' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  converted: { label: 'Converted', color: 'bg-green-100 text-green-800' },
  lost: { label: 'Lost', color: 'bg-red-100 text-red-800' },
} as const;

export const DEGREE_LEVELS = [
  { value: 'bachelor', label: "Bachelor's Degree" },
  { value: 'master', label: "Master's Degree" },
  { value: 'phd', label: 'PhD' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'certificate', label: 'Certificate' },
] as const;

export const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Netherlands',
  'Sweden',
  'New Zealand',
  'Ireland',
] as const;

export const INTAKE_SEASONS = [
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
  { value: 'fall', label: 'Fall' },
  { value: 'winter', label: 'Winter' },
] as const;

export const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB

export const ACCEPTED_FILE_TYPES = {
  document: '.pdf,.doc,.docx',
  image: '.jpg,.jpeg,.png',
  all: '.pdf,.doc,.docx,.jpg,.jpeg,.png',
} as const;
