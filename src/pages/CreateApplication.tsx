import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Calendar,
  Globe,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  applicationService,
  CreateApplicationRequest,
  EligibilityResponse,
} from '../services/ApplicationProcessService';
import { parseApiError } from '../utils/applicationUtils';

const CreateApplication: React.FC = () => {
  const { id: applicationId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(applicationId);
  // Form state
  const [formData, setFormData] = useState<CreateApplicationRequest>({
    title: '',
    targetIntake: '',
    targetCountry: '',
  });

  // Component state
  const [eligibility, setEligibility] = useState<EligibilityResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [eligibilityLoading, setEligibilityLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Load existing application data if in edit mode
  useEffect(() => {
    const loadApplicationData = async () => {
      if (isEditMode && applicationId) {
        try {
          const response = await applicationService.getApplicationById(
            applicationId
          );
          const app = response.application;

          // Pre-fill form with existing data
          setFormData({
            title: app.notes || '',
            targetIntake: '', // You may need to extract this from notes or add field to backend
            targetCountry: '', // You may need to extract this from notes or add field to backend
          });
        } catch (err) {
          setError(parseApiError(err));
        }
      }
    };

    loadApplicationData();
  }, [isEditMode, applicationId]);

  // Predefined options
  const intakeOptions = [
    { value: 'Fall 2025', label: 'Fall 2025' },
    { value: 'Spring 2025', label: 'Spring 2025' },
    { value: 'Summer 2025', label: 'Summer 2025' },
    { value: 'Fall 2026', label: 'Fall 2026' },
    { value: 'Spring 2026', label: 'Spring 2026' },
    { value: 'Summer 2026', label: 'Summer 2026' },
  ];

  const countryOptions = [
    { value: 'Canada', label: 'Canada' },
    { value: 'United States', label: 'United States' },
    { value: 'United Kingdom', label: 'United Kingdom' },
    { value: 'Australia', label: 'Australia' },
    { value: 'Germany', label: 'Germany' },
    { value: 'Netherlands', label: 'Netherlands' },
    { value: 'Ireland', label: 'Ireland' },
    { value: 'New Zealand', label: 'New Zealand' },
  ];

  // Load eligibility on mount
  useEffect(() => {
    const loadEligibility = async () => {
      try {
        const response = await applicationService.checkEligibility();
        setEligibility(response);
      } catch (err) {
        setError(parseApiError(err));
      } finally {
        setEligibilityLoading(false);
      }
    };

    loadEligibility();
  }, []);

  // Handle form input changes
  const handleInputChange = (
    field: keyof CreateApplicationRequest,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Title is optional but should not be empty if provided
    if (formData.title && formData.title.trim().length === 0) {
      errors.title = 'Title cannot be empty';
    }

    // Check if title is too long
    if (formData.title && formData.title.length > 100) {
      errors.title = 'Title cannot exceed 100 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Check eligibility
    if (!eligibility?.eligible) {
      setError('Please complete your profile before creating an application');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare request data (only include non-empty fields)
      const requestData: CreateApplicationRequest = {};

      if (formData.title?.trim()) {
        requestData.title = formData.title.trim();
      }
      if (formData.targetIntake) {
        requestData.targetIntake = formData.targetIntake;
      }
      if (formData.targetCountry) {
        requestData.targetCountry = formData.targetCountry;
      }

      let response;
      if (isEditMode && applicationId) {
        response = await applicationService.updateApplication(
          applicationId,
          requestData
        );
        navigate(`/applications/${applicationId}`);
      } else {
        response = await applicationService.createApplication(requestData);
        navigate(`/applications/${response.application.id}`);
      }
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (isEditMode && applicationId) {
      navigate(`/applications/${applicationId}`);
    } else {
      navigate('/applications');
    }
  };

  if (eligibilityLoading) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='fixed inset-0 overflow-hidden pointer-events-none'>
          <div className='absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full opacity-5 blur-3xl' />
          <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400 to-cyan-600 rounded-full opacity-5 blur-3xl' />
        </div>

        <div className='relative max-w-4xl mx-auto px-6 py-8'>
          <div className='bg-white/80 backdrop-blur-md rounded-2xl p-8 text-center'>
            <div className='animate-pulse space-y-4'>
              <div className='h-8 bg-gray-200 rounded w-64 mx-auto'></div>
              <div className='h-4 bg-gray-200 rounded w-48 mx-auto'></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Background decorations */}
      <div className='fixed inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full opacity-5 blur-3xl' />
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400 to-cyan-600 rounded-full opacity-5 blur-3xl' />
      </div>

      <div className='relative max-w-4xl mx-auto px-6 py-8 space-y-8'>
        {/* Header */}
        <div className='flex items-center gap-4'>
          <button
            onClick={handleCancel}
            className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
            title='Go Back'
          >
            <ArrowLeft className='h-5 w-5' />
          </button>
          <div>
            <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
              {isEditMode ? 'Edit Application' : 'Create New Application'}
            </h1>
            <p className='text-lg text-gray-600 mt-2'>
              {isEditMode
                ? 'Update your application details'
                : 'Start your study abroad journey with a new application'}
            </p>
          </div>
        </div>

        {/* Eligibility Warning */}
        {eligibility && !eligibility.eligible && (
          <div className='bg-red-50 border border-red-200 rounded-xl p-6'>
            <div className='flex items-start gap-4'>
              <AlertCircle className='h-6 w-6 text-red-600 mt-0.5 flex-shrink-0' />
              <div>
                <h3 className='text-lg font-semibold text-red-900 mb-2'>
                  Profile Incomplete
                </h3>
                <p className='text-red-800 mb-4'>
                  You need to complete your profile before creating
                  applications. Your current completion is{' '}
                  {eligibility.completionPercentage}%, but 85% is required.
                </p>
                <div className='flex items-center gap-3'>
                  <Link
                    to='/profile'
                    className='px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors'
                  >
                    Complete Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className='bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden'>
          {/* Form Header */}
          <div className='bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200/50'>
            <h2 className='text-2xl font-semibold text-gray-900 mb-2'>
              {isEditMode ? 'Edit Application Details' : 'Application Details'}
            </h2>
            <p className='text-gray-600'>
              {isEditMode
                ? 'Update the information for your application'
                : 'Provide basic information for your new application (all fields are optional)'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className='p-6 border-b border-gray-200/50'>
              <div className='bg-red-50 border border-red-200 rounded-xl p-4'>
                <div className='flex items-start gap-3'>
                  <AlertCircle className='h-5 w-5 text-red-600 mt-0.5 flex-shrink-0' />
                  <div>
                    <h4 className='text-sm font-medium text-red-900 mb-1'>
                      Error
                    </h4>
                    <p className='text-sm text-red-800'>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={handleSubmit} className='p-6 space-y-6'>
            {/* Application Title */}
            <div>
              <label
                htmlFor='title'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                <div className='flex items-center gap-2'>
                  <FileText className='h-4 w-4 text-blue-600' />
                  Application Title (Optional)
                </div>
              </label>
              <input
                type='text'
                id='title'
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder='e.g., Fall 2025 Canada Application'
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all ${
                  validationErrors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                maxLength={100}
              />
              {validationErrors.title && (
                <p className='mt-1 text-sm text-red-600'>
                  {validationErrors.title}
                </p>
              )}
              <p className='mt-1 text-xs text-gray-500'>
                Give your application a memorable name to help organize multiple
                applications
              </p>
            </div>

            {/* Target Intake */}
            <div>
              <label
                htmlFor='targetIntake'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4 text-purple-600' />
                  Target Intake (Optional)
                </div>
              </label>
              <select
                id='targetIntake'
                value={formData.targetIntake}
                onChange={(e) =>
                  handleInputChange('targetIntake', e.target.value)
                }
                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'
              >
                <option value=''>Select target intake</option>
                {intakeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className='mt-1 text-xs text-gray-500'>
                When do you plan to start your studies? You can change this
                later
              </p>
            </div>

            {/* Target Country */}
            <div>
              <label
                htmlFor='targetCountry'
                className='block text-sm font-medium text-gray-900 mb-2'
              >
                <div className='flex items-center gap-2'>
                  <Globe className='h-4 w-4 text-green-600' />
                  Target Country (Optional)
                </div>
              </label>
              <select
                id='targetCountry'
                value={formData.targetCountry}
                onChange={(e) =>
                  handleInputChange('targetCountry', e.target.value)
                }
                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all'
              >
                <option value=''>Select target country</option>
                {countryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className='mt-1 text-xs text-gray-500'>
                Which country are you primarily interested in? You can apply to
                multiple countries
              </p>
            </div>

            {/* Next Steps Info */}
            <div className='bg-blue-50 border border-blue-200 rounded-xl p-4'>
              <div className='flex items-start gap-3'>
                <CheckCircle className='h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0' />
                <div>
                  <h4 className='text-sm font-medium text-blue-900 mb-1'>
                    What happens next?
                  </h4>
                  <ul className='text-sm text-blue-800 space-y-1'>
                    <li>• Your application will be created in draft status</li>
                    <li>• You can select universities and programs</li>
                    <li>• Review and submit when ready</li>
                    <li>• Track progress through each stage</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className='flex items-center justify-between pt-6 border-t border-gray-200'>
              <button
                type='button'
                onClick={handleCancel}
                className='px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors'
              >
                Cancel
              </button>

              <button
                type='submit'
                disabled={loading || !eligibility?.eligible}
                className='bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
              >
                {loading ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Send className='h-4 w-4' />
                    {isEditMode ? 'Update Application' : 'Create Application'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className='bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Need Help?
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600'>
            <div>
              <h4 className='font-medium text-gray-900 mb-2'>
                Creating Multiple Applications
              </h4>
              <p>
                You can create separate applications for different countries,
                intakes, or programs. This helps organize your applications
                better.
              </p>
            </div>
            <div>
              <h4 className='font-medium text-gray-900 mb-2'>
                Changing Details Later
              </h4>
              <p>
                All the information you provide here can be updated later. You
                can also add universities and programs after creation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateApplication;
