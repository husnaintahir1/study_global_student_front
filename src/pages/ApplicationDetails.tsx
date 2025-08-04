import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  Send,
  Users,
  Award,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Plus,
  Trash2,
  RefreshCw,
  FileText,
  User,
} from 'lucide-react';
import {
  applicationService,
  Application,
  UniversitySelection,
  OfferLetter,
} from '../services/ApplicationProcessService';
import {
  STATUS_LABELS,
  STAGE_LABELS,
  STATUS_COLORS,
  STAGE_COLORS,
  calculateStageProgress,
  formatDate,
  formatDateTime,
  getRelativeTime,
  canEditApplication,
  canSubmitApplication,
  canManageOffers,
  parseApiError,
} from '../utils/applicationUtils';

const ApplicationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State Management
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load application details
  const loadApplication = async () => {
    if (!id) return;

    try {
      setError(null);
      const response = await applicationService.getApplicationById(id);
      setApplication(response.application); // Updated to use response.application
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadApplication();
  }, [id]);

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadApplication();
  };

  // Navigation handlers
  const handleBack = () => {
    navigate('/applications');
  };

  const handleEdit = () => {
    navigate(`/applications/${id}/universities`);
  };

  const handleManageOffers = () => {
    navigate('/offers');
  };

  const handleSubmit = async () => {
    if (!application || !id) return;

    setSubmitting(true);
    setError(null);

    try {
      await applicationService.submitApplication(id);
      await loadApplication(); // Refresh to show updated status
      alert('Application submitted successfully!');
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Get progress for stepper
  const getStepperData = () => {
    if (!application) return [];

    const steps = [
      {
        key: 'profile_review',
        label: 'Profile Review',
        icon: User,
        description: 'Profile verification complete',
      },
      {
        key: 'university_selection',
        label: 'University Selection',
        icon: Users,
        description: `${application.universitySelections.length} universities selected`,
      },
      {
        key: 'document_preparation',
        label: 'Document Preparation',
        icon: FileText,
        description: 'Documents uploaded and verified',
      },
      {
        key: 'submission',
        label: 'Submission',
        icon: Send,
        description: application.submissionDate
          ? `Submitted ${formatDate(application.submissionDate)}`
          : 'Ready to submit',
      },
      {
        key: 'offer_management',
        label: 'Offer Management',
        icon: Award,
        description: `${application.offerLetters.length} offers received`,
      },
      {
        key: 'visa_application',
        label: 'Visa Application',
        icon: Calendar,
        description: 'Visa process tracking',
      },
      {
        key: 'completed',
        label: 'Completed',
        icon: CheckCircle,
        description: 'Process completed successfully',
      },
    ];

    const currentStepIndex = steps.findIndex(
      (step) => step.key === application.stage
    );

    return steps.map((step, index) => ({
      ...step,
      status:
        index < currentStepIndex
          ? 'completed'
          : index === currentStepIndex
          ? 'current'
          : 'pending',
    }));
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='fixed inset-0 overflow-hidden pointer-events-none'>
          <div className='absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full opacity-5 blur-3xl' />
          <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400 to-cyan-600 rounded-full opacity-5 blur-3xl' />
        </div>

        <div className='relative max-w-7xl mx-auto px-6 py-8 space-y-8'>
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

  if (error || !application) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='fixed inset-0 overflow-hidden pointer-events-none'>
          <div className='absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full opacity-5 blur-3xl' />
          <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400 to-cyan-600 rounded-full opacity-5 blur-3xl' />
        </div>

        <div className='relative max-w-7xl mx-auto px-6 py-8 space-y-8'>
          <div className='bg-white/80 backdrop-blur-md rounded-2xl p-8 text-center'>
            <AlertCircle className='h-12 w-12 text-red-500 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              {error || 'Application not found'}
            </h3>
            <button
              onClick={handleBack}
              className='bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all'
            >
              Back to Applications
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progress = calculateStageProgress(application.stage);
  const canEdit = canEditApplication(application.status);
  const { canSubmit } = canSubmitApplication(
    application.status,
    application.universitySelections,
    100
  );
  const canManage = canManageOffers(application.status);
  const stepperData = getStepperData();

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Background decorations */}
      <div className='fixed inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full opacity-5 blur-3xl' />
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400 to-cyan-600 rounded-full opacity-5 blur-3xl' />
      </div>

      <div className='relative max-w-7xl mx-auto px-6 py-8 space-y-8'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <button
              onClick={handleBack}
              className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
              title='Back to Applications'
            >
              <ArrowLeft className='h-5 w-5' />
            </button>
            <div>
              <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                {application.notes || 'Application Details'}
              </h1>
              <p className='text-lg text-gray-600 mt-2'>
                Track your application progress and manage next steps
              </p>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className='p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50'
              title='Refresh'
            >
              <RefreshCw
                className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`}
              />
            </button>

            {canEdit && (
              <button
                onClick={handleEdit}
                className='px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center gap-2'
              >
                <Edit3 className='h-4 w-4' />
                Edit Universities
              </button>
            )}

            {canSubmit && (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className='bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-2 disabled:opacity-50'
              >
                <Send className='h-4 w-4' />
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className='bg-red-50 border border-red-200 rounded-xl p-4'>
            <div className='flex items-start gap-3'>
              <AlertCircle className='h-5 w-5 text-red-600 mt-0.5 flex-shrink-0' />
              <div>
                <h4 className='text-sm font-medium text-red-900 mb-1'>Error</h4>
                <p className='text-sm text-red-800'>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Application Overview */}
        <div className='bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden'>
          <div className='bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200/50'>
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <div className='flex items-center gap-4 mb-4'>
                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${
                      STATUS_COLORS[application.status]
                    }`}
                  >
                    {STATUS_LABELS[application.status]}
                  </span>

                  {/* Stage Badge */}
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                      STAGE_COLORS[application.stage]
                    }`}
                  >
                    {STAGE_LABELS[application.stage]}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className='mb-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-medium text-gray-700'>
                      Progress
                    </span>
                    <span className='text-sm font-bold text-blue-600'>
                      {progress}%
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-3'>
                    <div
                      className='bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500'
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className='grid grid-cols-3 gap-4 ml-8'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-blue-600'>
                    {application.universitySelections.length}
                  </div>
                  <div className='text-xs text-gray-600'>Universities</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-purple-600'>
                    {application.offerLetters.length}
                  </div>
                  <div className='text-xs text-gray-600'>Offers</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-green-600'>
                    {
                      application.offerLetters.filter(
                        (o) => o.status === 'accepted'
                      ).length
                    }
                  </div>
                  <div className='text-xs text-gray-600'>Accepted</div>
                </div>
              </div>
            </div>
          </div>

          {/* Application Timeline/Stepper */}
          <div className='p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-6'>
              Application Progress
            </h3>
            <div className='space-y-4'>
              {stepperData.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.key} className='flex items-center gap-4'>
                    {/* Step Icon */}
                    <div
                      className={`p-3 rounded-xl border-2 ${
                        step.status === 'completed'
                          ? 'bg-green-100 border-green-200 text-green-600'
                          : step.status === 'current'
                          ? 'bg-blue-100 border-blue-200 text-blue-600'
                          : 'bg-gray-100 border-gray-200 text-gray-400'
                      }`}
                    >
                      <Icon className='h-5 w-5' />
                    </div>

                    {/* Step Content */}
                    <div className='flex-1'>
                      <h4
                        className={`font-medium ${
                          step.status === 'completed'
                            ? 'text-green-900'
                            : step.status === 'current'
                            ? 'text-blue-900'
                            : 'text-gray-500'
                        }`}
                      >
                        {step.label}
                      </h4>
                      <p className='text-sm text-gray-600'>
                        {step.description}
                      </p>
                    </div>

                    {/* Step Status */}
                    <div>
                      {step.status === 'completed' && (
                        <CheckCircle className='h-5 w-5 text-green-600' />
                      )}
                      {step.status === 'current' && (
                        <Clock className='h-5 w-5 text-blue-600' />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Universities Section */}
        <div className='bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden'>
          <div className='bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200/50'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-2xl font-semibold text-gray-900 mb-2'>
                  Selected Universities
                </h2>
                <p className='text-gray-600'>
                  {application.universitySelections.length} universities
                  selected
                </p>
              </div>
              {canEdit && (
                <button
                  onClick={handleEdit}
                  className='bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all flex items-center gap-2'
                >
                  <Edit3 className='h-4 w-4' />
                  Edit Selection
                </button>
              )}
            </div>
          </div>

          <div className='p-6'>
            {application.universitySelections.length === 0 ? (
              <div className='text-center py-8'>
                <Users className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  No Universities Selected
                </h3>
                <p className='text-gray-500 mb-4'>
                  Start by selecting universities for your application
                </p>
                {canEdit && (
                  <button
                    onClick={handleEdit}
                    className='bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all'
                  >
                    Select Universities
                  </button>
                )}
              </div>
            ) : (
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                {application.universitySelections.map((selection) => (
                  <div
                    key={`${selection.universityId}-${selection.programId}`}
                    className='border border-gray-200 rounded-xl p-4'
                  >
                    <div className='flex items-start justify-between mb-3'>
                      <div className='flex-1'>
                        <h4 className='font-semibold text-gray-900'>
                          {selection.universityName}
                        </h4>
                        <h5 className='text-purple-600 font-medium'>
                          {selection.programName}
                        </h5>
                      </div>
                      <div className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium'>
                        #{selection.priority}
                      </div>
                    </div>

                    <div className='grid grid-cols-2 gap-3 text-sm text-gray-600'>
                      <div className='flex items-center gap-1'>
                        <MapPin className='h-3 w-3' />
                        <span>{selection.country}</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <DollarSign className='h-3 w-3' />
                        <span>{selection.fees}</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <Clock className='h-3 w-3' />
                        <span>{selection.duration}</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <Calendar className='h-3 w-3' />
                        <span>{selection.selectedIntake}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Offers Section */}
        <div className='bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden'>
          <div className='bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-200/50'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-2xl font-semibold text-gray-900 mb-2'>
                  Offers Received
                </h2>
                <p className='text-gray-600'>
                  {application.offerLetters.length} offers received •{' '}
                  {
                    application.offerLetters.filter(
                      (o) => o.status === 'pending'
                    ).length
                  }{' '}
                  pending response
                </p>
              </div>
              {canManage && application.offerLetters.length > 0 && (
                <button
                  onClick={handleManageOffers}
                  className='bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-2'
                >
                  <Award className='h-4 w-4' />
                  Manage All Offers
                </button>
              )}
            </div>
          </div>

          <div className='p-6'>
            {application.offerLetters.length === 0 ? (
              <div className='text-center py-8'>
                <Award className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                  No Offers Yet
                </h3>
                <p className='text-gray-500'>
                  Offers from universities will appear here once they start
                  coming in
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {application.offerLetters.slice(0, 3).map((offer) => (
                  <div
                    key={offer.id}
                    className='border border-gray-200 rounded-xl p-4 flex items-start justify-between'
                  >
                    <div className='flex-1'>
                      <h4 className='font-semibold text-gray-900'>
                        {offer.universityName}
                      </h4>
                      <h5 className='text-purple-600 font-medium mb-2'>
                        {offer.programName}
                      </h5>
                      <div className='flex items-center gap-4 text-sm text-gray-600'>
                        <span>Received: {formatDate(offer.offerDate)}</span>
                        {offer.responseDate && (
                          <span>
                            Responded: {formatDate(offer.responseDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        offer.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : offer.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {offer.status.charAt(0).toUpperCase() +
                        offer.status.slice(1)}
                    </span>
                  </div>
                ))}

                {application.offerLetters.length > 3 && (
                  <div className='text-center'>
                    <button
                      onClick={handleManageOffers}
                      className='text-blue-600 hover:text-blue-700 font-medium text-sm'
                    >
                      View all {application.offerLetters.length} offers →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Application Info */}
        <div className='bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Application Information
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 text-sm'>
            <div>
              <h4 className='font-medium text-gray-900 mb-2'>Timeline</h4>
              <div className='space-y-2 text-gray-600'>
                <div>Created: {formatDateTime(application.createdAt)}</div>
                <div>
                  Last Updated: {getRelativeTime(application.updatedAt)}
                </div>
                {application.submissionDate && (
                  <div>
                    Submitted: {formatDateTime(application.submissionDate)}
                  </div>
                )}
                {application.completionDate && (
                  <div>
                    Completed: {formatDateTime(application.completionDate)}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className='font-medium text-gray-900 mb-2'>Details</h4>
              <div className='space-y-2 text-gray-600'>
                <div>
                  Application ID: {application.id.slice(-8).toUpperCase()}
                </div>
                {application.consultant && (
                  <div>Consultant: {application.consultant.name}</div>
                )}
                {application.rejectionReason && (
                  <div className='text-red-600'>
                    Rejection Reason: {application.rejectionReason}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;
