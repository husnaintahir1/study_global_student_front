export const validators = {
  email: (value: string) => {
    if (!value) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Invalid email address';
    return true;
  },
  range: (min: number, max: number, fieldName: string) => (value: number) => {
    if (!value && value !== 0) return true;
    if (value < min) return `${fieldName} must be at least ${min}`;
    if (value > max) return `${fieldName} must not exceed ${max}`;
    return true;
  },

  password: (value: string) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])/.test(value))
      return 'Password must contain a lowercase letter';
    if (!/(?=.*[A-Z])/.test(value))
      return 'Password must contain an uppercase letter';
    if (!/(?=.*\d)/.test(value)) return 'Password must contain a number';
    return true;
  },

  confirmPassword: (password: string) => (value: string) => {
    if (!value) return 'Please confirm your password';
    if (value !== password) return 'Passwords do not match';
    return true;
  },

  required: (fieldName: string) => (value: any) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} is required`;
    }
    return true;
  },

  phone: (value: string) => {
    if (!value) return true; // Optional field
    const phoneRegex = /^[\d\s()+-]+$/;
    if (!phoneRegex.test(value)) return 'Invalid phone number';
    if (value.replace(/\D/g, '').length < 10) return 'Phone number too short';
    return true;
  },

  minLength: (min: number, fieldName: string) => (value: string) => {
    if (!value) return true; // Let required validator handle empty values
    if (value.length < min)
      return `${fieldName} must be at least ${min} characters`;
    return true;
  },

  maxLength: (max: number, fieldName: string) => (value: string) => {
    if (!value) return true;
    if (value.length > max)
      return `${fieldName} must not exceed ${max} characters`;
    return true;
  },

  number: (fieldName: string) => (value: any) => {
    if (!value) return true;
    if (isNaN(Number(value))) return `${fieldName} must be a number`;
    return true;
  },

  min: (min: number, fieldName: string) => (value: number) => {
    if (!value && value !== 0) return true;
    if (value < min) return `${fieldName} must be at least ${min}`;
    return true;
  },

  max: (max: number, fieldName: string) => (value: number) => {
    if (!value && value !== 0) return true;
    if (value > max) return `${fieldName} must not exceed ${max}`;
    return true;
  },

  date: (fieldName: string) => (value: string) => {
    if (!value) return true;
    const date = new Date(value);
    if (isNaN(date.getTime())) return `${fieldName} must be a valid date`;
    return true;
  },

  futureDate: (fieldName: string) => (value: string) => {
    if (!value) return true;
    const date = new Date(value);
    if (isNaN(date.getTime())) return `${fieldName} must be a valid date`;
    if (date <= new Date()) return `${fieldName} must be a future date`;
    return true;
  },

  pastDate: (fieldName: string) => (value: string) => {
    if (!value) return true;
    const date = new Date(value);
    if (isNaN(date.getTime())) return `${fieldName} must be a valid date`;
    if (date >= new Date()) return `${fieldName} must be a past date`;
    return true;
  },

  fileSize: (maxSizeMB: number) => (file: File) => {
    if (!file) return true;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes)
      return `File size must not exceed ${maxSizeMB}MB`;
    return true;
  },

  fileType: (acceptedTypes: string[]) => (file: File) => {
    if (!file) return true;
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(extension)) {
      return `File type must be one of: ${acceptedTypes.join(', ')}`;
    }
    return true;
  },

  url: (value: string) => {
    if (!value) return true;
    try {
      new URL(value);
      return true;
    } catch {
      return 'Invalid URL';
    }
  },

  gpa: (value: number) => {
    if (!value && value !== 0) return true;
    if (value < 0 || value > 4) return 'GPA must be between 0 and 4';
    return true;
  },
};
