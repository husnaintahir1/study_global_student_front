import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  FileText,
  Clock,
  ArrowRight,
  RefreshCw,
  Edit,
  Upload,
} from 'lucide-react';
import { applicationService, EligibilityResponse } from '../services/ApplicationProcessService';
import { parseApiError } from '../utils/applicationUtils';

interface EligibilityCheckerProps {
  onCreateApplication?: () => void;
  showCreateButton?: boolean;
}

const EligibilityChecker: React.FC<EligibilityCheckerProps> = ({
  onCreateApplication,
  showCreateButton = true,
}) => {
  const [eligibility, setEligibility] = useState<EligibilityResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load eligibility data
  const loadEligibility = async () => {
    try {
      setError(null);
      const response = await applicationService.checkEligibility();
      setEligibility(response);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadEligibility();
  }, []);

  // Refresh eligibility
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEligibility();
  };

  // Navigation handlers
  const handleEditProfile = () => {
    window.location.href = '/profile/edit';
  };

  const handleUploadDocuments = () => {
    window.location.href = '/documents/upload';
  };

  const handleCreateApplication = () => {
    if (onCreateApplication) {
      onCreateApplication();
    } else {
      window.location.href = '/applications/new';
    }
  };

  if (loading) {
    return (
      <div className='bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-6'>
        <div className='animate-pulse space-y-4'>
          <div className='h-6 bg-gray-200 rounded w-48'></div>
          <div className='h-20 bg-gray-200 rounded'></div>
          <div className='h-4 bg-gray-200 rounded w-full'></div>
          <div className='h-4 bg-gray-200 rounded w-3/4'></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-6'>
        <div className='text-center'>
          <XCircle className='h-12 w-12 text-red-500 mx-auto mb-4' />
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            Unable to Check Eligibility
          </h3>
          <p className='text-gray-600 mb-4'>{error}</p>
          <button
            onClick={handleRefresh}
            className='bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all'
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!eligibility) {
    return null;
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 85) return 'from-green-500 to-emerald-600';
    if (percentage >= 70) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  const getStatusColor = (eligible: boolean) => {
    return eligible
      ? 'bg-green-50 border-green-200'
      : 'bg-yellow-50 border-yellow-200';
  };

  const getStatusIcon = (eligible: boolean) => {
    return eligible ? (
      <CheckCircle className='h-8 w-8 text-green-600' />
    ) : (
      <AlertCircle className='h-8 w-8 text-yellow-600' />
    );
  };

  return (
    <div className='bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden'>
      {/* Header */}
      <div className='bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200/50'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-semibold text-gray-900 mb-2'>
              Application Eligibility
            </h2>
            <p className='text-gray-600'>
              Complete your profile to start applying
            </p>
          </div>
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
        </div>
      </div>

      <div className='p-6 space-y-6'>
        {/* Overall Status */}
        <div
          className={`rounded-xl p-6 border ${getStatusColor(
            eligibility.eligible
          )}`}
        >
          <div className='flex items-start gap-4'>
            <div
              className={`p-3 rounded-xl ${
                eligibility.eligible ? 'bg-green-100' : 'bg-yellow-100'
              }`}
            >
              {getStatusIcon(eligibility.eligible)}
            </div>

            <div className='flex-1'>
              <h3
                className={`text-xl font-semibold mb-2 ${
                  eligibility.eligible ? 'text-green-900' : 'text-yellow-900'
                }`}
              >
                {eligibility.eligible
                  ? 'Ready to Apply!'
                  : 'Complete Your Profile'}
              </h3>

              <p
                className={`text-sm mb-4 ${
                  eligibility.eligible ? 'text-green-800' : 'text-yellow-800'
                }`}
              >
                {eligibility.eligible
                  ? 'Your profile meets all requirements. You can now create and submit applications.'
                  : 'Complete the missing requirements below to become eligible for applications.'}
              </p>

              {/* Progress Bar */}
              <div className='mb-3'>
                <div className='flex items-center justify-between mb-2'>
                  <span
                    className={`text-sm font-medium ${
                      eligibility.eligible
                        ? 'text-green-800'
                        : 'text-yellow-800'
                    }`}
                  >
                    Profile Completion
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      eligibility.eligible
                        ? 'text-green-800'
                        : 'text-yellow-800'
                    }`}
                  >
                    {eligibility.completionPercentage}%
                  </span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-3'>
                  <div
                    className={`h-3 rounded-full transition-all duration-700 bg-gradient-to-r ${getProgressColor(
                      eligibility.completionPercentage
                    )}`}
                    style={{ width: `${eligibility.completionPercentage}%` }}
                  />
                </div>
                <div className='mt-2 text-xs text-gray-600'>
                  Minimum 85% required to create applications
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements Breakdown */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Profile Status */}
          <div
            className={`rounded-xl p-6 border transition-all ${
              eligibility.profile
                ? 'bg-green-50 border-green-200 hover:shadow-md'
                : 'bg-red-50 border-red-200 hover:shadow-md'
            }`}
          >
            <div className='flex items-start gap-4'>
              <div
                className={`p-3 rounded-xl ${
                  eligibility.profile ? 'bg-green-100' : 'bg-red-100'
                }`}
              >
                <User
                  className={`h-6 w-6 ${
                    eligibility.profile ? 'text-green-600' : 'text-red-600'
                  }`}
                />
              </div>

              <div className='flex-1'>
                <h4
                  className={`font-semibold mb-2 ${
                    eligibility.profile ? 'text-green-900' : 'text-red-900'
                  }`}
                >
                  Profile Information
                </h4>

                {eligibility.profile ? (
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <CheckCircle className='h-4 w-4 text-green-600' />
                      <span className='text-sm text-green-800'>
                        Profile completed
                      </span>
                    </div>
                    <p className='text-xs text-green-700'>
                      All required profile fields are filled
                    </p>
                  </div>
                ) : (
                  <div className='space-y-3'>
                    <div className='flex items-center gap-2'>
                      <XCircle className='h-4 w-4 text-red-600' />
                      <span className='text-sm text-red-800'>
                        Profile incomplete
                      </span>
                    </div>

                    {eligibility.missingFields.length > 0 && (
                      <div>
                        <p className='text-xs text-red-700 mb-2 font-medium'>
                          Missing fields:
                        </p>
                        <div className='space-y-1'>
                          {eligibility.missingFields.map((field, index) => (
                            <div
                              key={index}
                              className='flex items-center gap-2'
                            >
                              <div className='w-1 h-1 bg-red-500 rounded-full'></div>
                              <span className='text-xs text-red-700 capitalize'>
                                {field.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleEditProfile}
                      className='flex items-center gap-2 text-sm text-red-700 hover:text-red-800 font-medium mt-3 group'
                    >
                      <Edit className='h-4 w-4 group-hover:scale-110 transition-transform' />
                      Complete Profile
                      <ArrowRight className='h-3 w-3' />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Documents Status */}
          <div
            className={`rounded-xl p-6 border transition-all ${
              eligibility.documents
                ? 'bg-green-50 border-green-200 hover:shadow-md'
                : 'bg-red-50 border-red-200 hover:shadow-md'
            }`}
          >
            <div className='flex items-start gap-4'>
              <div
                className={`p-3 rounded-xl ${
                  eligibility.documents ? 'bg-green-100' : 'bg-red-100'
                }`}
              >
                <FileText
                  className={`h-6 w-6 ${
                    eligibility.documents ? 'text-green-600' : 'text-red-600'
                  }`}
                />
              </div>

              <div className='flex-1'>
                <h4
                  className={`font-semibold mb-2 ${
                    eligibility.documents ? 'text-green-900' : 'text-red-900'
                  }`}
                >
                  Required Documents
                </h4>

                {eligibility.documents ? (
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <CheckCircle className='h-4 w-4 text-green-600' />
                      <span className='text-sm text-green-800'>
                        All documents uploaded
                      </span>
                    </div>
                    <p className='text-xs text-green-700'>
                      Required documents are uploaded and verified
                    </p>
                  </div>
                ) : (
                  <div className='space-y-3'>
                    <div className='flex items-center gap-2'>
                      <XCircle className='h-4 w-4 text-red-600' />
                      <span className='text-sm text-red-800'>
                        Documents missing
                      </span>
                    </div>

                    {eligibility.missingDocuments.length > 0 && (
                      <div>
                        <p className='text-xs text-red-700 mb-2 font-medium'>
                          Missing documents:
                        </p>
                        <div className='space-y-1'>
                          {eligibility.missingDocuments.map((doc, index) => (
                            <div
                              key={index}
                              className='flex items-center gap-2'
                            >
                              <div className='w-1 h-1 bg-red-500 rounded-full'></div>
                              <span className='text-xs text-red-700 capitalize'>
                                {doc.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleUploadDocuments}
                      className='flex items-center gap-2 text-sm text-red-700 hover:text-red-800 font-medium mt-3 group'
                    >
                      <Upload className='h-4 w-4 group-hover:scale-110 transition-transform' />
                      Upload Documents
                      <ArrowRight className='h-3 w-3' />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        {eligibility.eligible && showCreateButton && (
          <div className='bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-xl p-6 border border-blue-200/50'>
            <div className='text-center'>
              <CheckCircle className='h-12 w-12 text-green-600 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Congratulations! You're Ready to Apply
              </h3>
              <p className='text-gray-600 mb-6 max-w-md mx-auto'>
                Your profile is complete and meets all requirements. Start your
                study abroad journey by creating your first application.
              </p>
              <button
                onClick={handleCreateApplication}
                className='bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105'
              >
                Create Application
              </button>
            </div>
          </div>
        )}

        {!eligibility.eligible && (
          <div className='bg-gradient-to-r from-yellow-50/50 to-orange-50/50 rounded-xl p-6 border border-yellow-200/50'>
            <div className='flex items-start gap-4'>
              <Clock className='h-6 w-6 text-yellow-600 mt-1 flex-shrink-0' />
              <div>
                <h4 className='font-semibold text-yellow-900 mb-2'>
                  Next Steps
                </h4>
                <p className='text-sm text-yellow-800 mb-3'>
                  Complete the missing requirements above to become eligible for
                  creating applications.
                </p>
                <div className='flex items-center gap-3'>
                  {!eligibility.profile && (
                    <button
                      onClick={handleEditProfile}
                      className='px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium hover:bg-yellow-200 transition-colors'
                    >
                      Complete Profile
                    </button>
                  )}
                  {!eligibility.documents && (
                    <button
                      onClick={handleUploadDocuments}
                      className='px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium hover:bg-yellow-200 transition-colors'
                    >
                      Upload Documents
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EligibilityChecker;
