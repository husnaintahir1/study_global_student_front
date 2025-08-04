import React, { useState, useEffect } from 'react';
import {
  Plus,
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  TrendingUp,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import {
  applicationService,
  Application,
  EligibilityResponse,
} from '../services/ApplicationProcessService';
import {
  getApplicationSummary,
  parseApiError,
} from '../utils/applicationUtils';
import ApplicationCard from './ApplicationCard';

interface DashboardStats {
  totalApplications: number;
  activeApplications: number;
  offersReceived: number;
  completedApplications: number;
}

const ApplicationDashboard: React.FC = () => {
  // State Management
  const [applications, setApplications] = useState<Application[]>([]);
  const [eligibility, setEligibility] = useState<EligibilityResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setError(null);
      const [applicationsResponse, eligibilityResponse] = await Promise.all([
        applicationService.getMyApplications(),
        applicationService.checkEligibility(),
      ]);

      setApplications(applicationsResponse.applications);
      setEligibility(eligibilityResponse);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
  };

  // Calculate dashboard stats
  const calculateStats = (): DashboardStats => {
    const summary = getApplicationSummary(applications);
    return {
      totalApplications: summary.total,
      activeApplications: summary.draft + summary.inReview + summary.submitted,
      offersReceived: summary.totalOffers,
      completedApplications: summary.completed,
    };
  };

  const stats = calculateStats();

  // Navigation handlers
  const handleCreateApplication = () => {
    // Navigate to create application page
    window.location.href = '/applications/new';
  };

  const handleViewApplication = (applicationId: string) => {
    // Navigate to application details
    window.location.href = `/applications/${applicationId}`;
  };

  const handleEditApplication = (applicationId: string) => {
    // Navigate to edit universities for this application
    window.location.href = `/applications/${applicationId}/universities`;
  };

  const handleSubmitApplication = async (applicationId: string) => {
    try {
      setError(null);
      await applicationService.submitApplication(applicationId);

      // Refresh applications list
      await loadDashboardData();

      // Show success message (you can implement toast notifications)
      alert('Application submitted successfully!');
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const handleViewAllApplications = () => {
    window.location.href = '/applications';
  };

  const handleViewOffers = () => {
    window.location.href = '/offers';
  };

  const handleViewUniversities = () => {
    window.location.href = '/universities';
  };

  const formatFieldName = (fieldName) => {
    return (
      fieldName
        // Handle camelCase: split on capital letters
        .replace(/([A-Z])/g, ' $1')
        // Handle snake_case: replace underscores with spaces
        .replace(/_/g, ' ')
        // Trim any leading/trailing spaces
        .trim()
        // Capitalize first letter of each word
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
    );
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50'>
        {/* Background decorations */}
        <div className='fixed inset-0 overflow-hidden pointer-events-none'>
          <div className='absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full opacity-5 blur-3xl' />
          <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400 to-cyan-600 rounded-full opacity-5 blur-3xl' />
        </div>

        <div className='relative max-w-7xl mx-auto px-6 py-8 space-y-8'>
          {/* Loading skeleton */}
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

      <div className='relative max-w-7xl mx-auto px-6 py-8 space-y-8'>
        {/* Header */}
        <div className='text-center'>
          <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4'>
            Applications
          </h1>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            Manage your study abroad applications, track progress, and explore
            opportunities
          </p>
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

        {/* Eligibility Status */}
        {eligibility && (
          <div
            className={`rounded-2xl p-6 border ${
              eligibility.eligible
                ? 'bg-green-50 border-green-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}
          >
            <div className='flex items-start gap-4'>
              <div
                className={`p-3 rounded-xl ${
                  eligibility.eligible ? 'bg-green-100' : 'bg-yellow-100'
                }`}
              >
                {eligibility.eligible ? (
                  <CheckCircle className='h-6 w-6 text-green-600' />
                ) : (
                  <AlertCircle className='h-6 w-6 text-yellow-600' />
                )}
              </div>

              <div className='flex-1'>
                <h3
                  className={`text-lg font-semibold mb-2 ${
                    eligibility.eligible ? 'text-green-900' : 'text-yellow-900'
                  }`}
                >
                  {eligibility.eligible
                    ? 'Eligible to Apply'
                    : 'Profile Incomplete'}
                </h3>

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
                      className={`text-sm font-bold ${
                        eligibility.eligible
                          ? 'text-green-800'
                          : 'text-yellow-800'
                      }`}
                    >
                      {eligibility.completionPercentage}%
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        eligibility.eligible
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                          : 'bg-gradient-to-r from-yellow-500 to-orange-600'
                      }`}
                      style={{ width: `${eligibility.completionPercentage}%` }}
                    />
                  </div>
                </div>

                {!eligibility.eligible &&
                  (eligibility.missingFields.length > 0 ||
                    eligibility.missingDocuments.length > 0) && (
                    <div className='space-y-2'>
                      {eligibility.missingFields.length > 0 && (
                        <p className='text-sm text-yellow-800'>
                          <strong>Missing Profile Fields:</strong>{' '}
                          {eligibility.missingFields
                            .map((field) => formatFieldName(field))
                            .join(', ')}
                        </p>
                      )}
                      {eligibility.missingDocuments.length > 0 && (
                        <p className='text-sm text-yellow-800'>
                          <strong>Missing Documents:</strong>{' '}
                          {eligibility.missingDocuments
                            .map((doc) => formatFieldName(doc))
                            .join(', ')}
                        </p>
                      )}
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Stats */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <div className='bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100 hover:shadow-lg transition-all duration-300'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-3xl font-bold text-blue-600'>
                  {stats.totalApplications}
                </p>
                <p className='text-sm text-blue-700 mt-1'>Total Applications</p>
              </div>
              <div className='p-3 bg-blue-100 rounded-xl'>
                <BookOpen className='h-6 w-6 text-blue-600' />
              </div>
            </div>
          </div>

          <div className='bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 hover:shadow-lg transition-all duration-300'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-3xl font-bold text-purple-600'>
                  {stats.activeApplications}
                </p>
                <p className='text-sm text-purple-700 mt-1'>
                  Active Applications
                </p>
              </div>
              <div className='p-3 bg-purple-100 rounded-xl'>
                <Clock className='h-6 w-6 text-purple-600' />
              </div>
            </div>
          </div>

          <div className='bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 hover:shadow-lg transition-all duration-300'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-3xl font-bold text-green-600'>
                  {stats.offersReceived}
                </p>
                <p className='text-sm text-green-700 mt-1'>Offers Received</p>
              </div>
              <div className='p-3 bg-green-100 rounded-xl'>
                <TrendingUp className='h-6 w-6 text-green-600' />
              </div>
            </div>
          </div>

          <div className='bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100 hover:shadow-lg transition-all duration-300'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-3xl font-bold text-indigo-600'>
                  {stats.completedApplications}
                </p>
                <p className='text-sm text-indigo-700 mt-1'>Completed</p>
              </div>
              <div className='p-3 bg-indigo-100 rounded-xl'>
                <CheckCircle className='h-6 w-6 text-indigo-600' />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-semibold text-gray-900'>
              Quick Actions
            </h2>
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

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <button
              onClick={handleCreateApplication}
              className='bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl group'
            >
              <div className='flex items-center gap-3'>
                <Plus className='h-5 w-5 group-hover:scale-110 transition-transform' />
                <span>New Application</span>
              </div>
            </button>

            <button
              onClick={handleViewUniversities}
              className='bg-white border border-gray-300 text-gray-700 p-4 rounded-xl font-medium hover:bg-gray-50 transition-colors group'
            >
              <div className='flex items-center gap-3'>
                <Users className='h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform' />
                <span>Browse Universities</span>
              </div>
            </button>

            <button
              onClick={handleViewOffers}
              className='bg-white border border-gray-300 text-gray-700 p-4 rounded-xl font-medium hover:bg-gray-50 transition-colors group'
            >
              <div className='flex items-center gap-3'>
                <CheckCircle className='h-5 w-5 text-green-600 group-hover:scale-110 transition-transform' />
                <span>Manage Offers</span>
              </div>
            </button>

            <button
              onClick={handleViewAllApplications}
              className='bg-white border border-gray-300 text-gray-700 p-4 rounded-xl font-medium hover:bg-gray-50 transition-colors group'
            >
              <div className='flex items-center gap-3'>
                <Calendar className='h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform' />
                <span>All Applications</span>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Applications */}
        <div className='bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden'>
          <div className='bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200/50'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-2xl font-semibold text-gray-900 mb-2'>
                  Your Applications
                </h2>
                <p className='text-gray-600'>
                  Track progress and manage your study abroad applications
                </p>
              </div>
              {applications.length > 3 && (
                <button
                  onClick={handleViewAllApplications}
                  className='px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium'
                >
                  View All
                </button>
              )}
            </div>
          </div>

          <div className='p-6'>
            {applications.length === 0 ? (
              /* Empty State */
              <div className='text-center py-16'>
                <div className='p-6 bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center'>
                  <BookOpen className='h-12 w-12 text-gray-400' />
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                  No Applications Yet
                </h3>
                <p className='text-gray-500 mb-6 max-w-md mx-auto'>
                  Get started by creating your first study abroad application.
                  We'll guide you through the entire process.
                </p>
                <button
                  onClick={handleCreateApplication}
                  className='bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all'
                >
                  Create Your First Application
                </button>
              </div>
            ) : (
              /* Applications Grid */
              <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
                {applications.slice(0, 6).map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onView={handleViewApplication}
                    onEdit={handleEditApplication}
                    onSubmit={handleSubmitApplication}
                    eligibilityPercentage={
                      eligibility?.completionPercentage || 100
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDashboard;
