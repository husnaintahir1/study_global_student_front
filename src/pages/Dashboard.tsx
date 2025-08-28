import React, { useEffect, useState } from 'react';
import {
  FiFileText,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiVideo,
  FiMapPin,
  FiArrowRight,
  FiUser,
  FiGlobe,
  FiTarget,
  FiTrendingUp,
  FiBookOpen,
  FiAward,
  FiDollarSign,
  FiUpload,
  FiEye,
  FiMoreHorizontal,
  FiStar,
  FiMessageSquare,
  FiPhone,
  FiBell,
  FiDownload,
  // FiGraduationCap,
  FiInfo,
  FiChevronRight,
} from 'react-icons/fi';
import { Link } from 'react-router-dom'; // Added import for React Router's Link
import { useAuth } from '@/hooks/useAuth';
import { profileService } from '@/services/profile.service';
import { appointmentService } from '@/services/appointment.service';
import { documentService } from '@/services/document.service';
import { ProfileCompletenessService } from '@/utils/completenessEngine';
import {
  ROUTES,
  DOCUMENT_TYPES,
  APPOINTMENT_STATUS,
  API_BASE_URL,
} from '@/utils/constants';
import { formatDate, formatDateTime, getRelativeTime } from '@/utils/helpers';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const Dashboard = () => {
  const { user } = useAuth();
  const [profileProgress, setProfileProgress] = useState(0);
  const [profileSections, setProfileSections] = useState([]);
  const [completenessDetails, setCompletenessDetails] = useState(null);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    documentsUploaded: 0,
    universitiesApplied: 0,
    appointmentsCompleted: 0,
    testScoreAvg: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileData, documents, appointments] = await Promise.all([
        profileService.getProfile(),
        documentService.getDocuments(),
        appointmentService.getAppointments(),
      ]);

      const profile = profileData?.profile;

      // Calculate completeness using the service
      if (profile) {
        const completeness =
          ProfileCompletenessService.calculateCompleteness(profile);
        const sectionProgress =
          ProfileCompletenessService.getSectionProgress(profile);
        const completionStatus =
          ProfileCompletenessService.getCompletionStatus(profile);
        console.log(
          completionStatus,
          'completionStatus',
          completeness,
          'completeness',
          sectionProgress,
          'sectionProgress'
        );
        setProfileProgress(completeness.overallPercentage);
        setProfileSections(sectionProgress);
        setCompletenessDetails({ completeness, completionStatus });
      } else {
        setProfileProgress(0);
        setProfileSections([]);
        setCompletenessDetails(null);
      }

      // Get recent 3 documents
      const sortedDocs = documents
        .sort(
          (a, b) =>
            new Date(b?.uploadedAt)?.getTime() -
            new Date(a?.uploadedAt)?.getTime()
        )
        .slice(0, 3);
      setRecentDocuments(sortedDocs);

      // Get upcoming appointments
      const upcoming = appointments
        .filter(
          (apt) =>
            apt.status === 'scheduled' && new Date(apt.dateTime) > new Date()
        )
        .sort(
          (a, b) =>
            new Date(a?.dateTime)?.getTime() - new Date(b?.dateTime)?.getTime()
        )
        .slice(0, 3);
      setUpcomingAppointments(upcoming);

      // Calculate stats
      const completedAppointments = appointments?.length;
      const avgTestScore = profile?.testScores?.ieltsScores?.total || 0;

      setStats({
        documentsUploaded: documents.length,
        universitiesApplied:
          profile?.studyPreferences?.preferredUniversities?.length || 0,
        appointmentsCompleted: completedAppointments,
        testScoreAvg: avgTestScore,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }; // Added missing closing brace for fetchDashboardData

  const getDocumentStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <FiCheckCircle className='h-4 w-4 text-green-600' />;
      case 'rejected':
        return <FiAlertCircle className='h-4 w-4 text-red-600' />;
      default:
        return <FiClock className='h-4 w-4 text-yellow-600' />;
    }
  };

  const getNextAppointment = () => {
    return upcomingAppointments[0];
  };

  const getSectionIcon = (section) => {
    const icons = {
      personalInfo: FiUser,
      educationalBackground: FiUser,
      testScores: FiAward,
      studyPreferences: FiTarget,
      financialInfo: FiDollarSign,
    };
    return icons[section] || FiFileText;
  };

  const getSectionColor = (status) => {
    switch (status) {
      case 'complete':
        return 'green';
      case 'partial':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const StatCard = ({ icon: Icon, label, value, change, color = 'blue' }) => (
    <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className={`p-3 rounded-lg bg-${color}-100`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
          <div>
            <p className='text-sm text-gray-600'>{label}</p>
            <p className='text-2xl font-bold text-gray-900'>{value}</p>
          </div>
        </div>
        {change && (
          <div className='text-right'>
            <span
              className={`text-sm font-medium ${
                change > 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {change > 0 ? '+' : ''}
              {change}%
            </span>
            <p className='text-xs text-gray-500'>vs last month</p>
          </div>
        )}
      </div>
    </div>
  );

  const SectionProgressCard = ({
    section,
    title,
    percentage,
    status,
    missingFields,
  }) => {
    const Icon = getSectionIcon(section);
    const color = getSectionColor(status);
    console.log(color, ' color', title, 'title');
    // console.log(status, ' status', section, 'section');
    return (
      <div
        className={`p-4 rounded-lg border-2 ${
          status === 'complete'
            ? 'border-green-200 bg-green-50'
            : status === 'partial'
            ? 'border-yellow-200 bg-yellow-50'
            : 'border-gray-200 bg-gray-50'
        } hover:shadow-md transition-all cursor-pointer group`}
      >
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center gap-3'>
            <div className={`p-2 rounded-lg bg-${color}-100`}>
              <Icon className={`h-5 w-5 text-${color}-600`} />
            </div>
            <div>
              <h4 className='font-medium text-gray-900'>{title}</h4>
              <p className='text-sm text-gray-600'>{percentage}% complete</p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {status === 'complete' && (
              <FiCheckCircle className='h-5 w-5 text-green-600' />
            )}
            <FiChevronRight className='h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors' />
          </div>
        </div>

        {/* Progress Bar */}
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            color === 'green'
              ? 'bg-green-600'
              : color === 'yellow'
              ? 'bg-yellow-600'
              : 'bg-gray-600'
          }`}
          style={{ width: `${percentage}%` }}
        />

        {/* Missing Fields Indicator */}
        {missingFields.length > 0 && status !== 'complete' && (
          <div className='text-xs text-gray-600'>
            Missing: {missingFields.slice(0, 2).join(', ')}
            {missingFields.length > 2 && ` +${missingFields.length - 2} more`}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  const nextAppointment = getNextAppointment();

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Background Decorations */}
      <div className='fixed inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full opacity-10 blur-3xl'></div>
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400 to-cyan-600 rounded-full opacity-10 blur-3xl'></div>
      </div>

      <div className='relative max-w-7xl mx-auto p-6'>
        {/* Header Section */}
        <div className='mb-8'>
          <div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'>
            <div className='bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <div className='h-16 w-16 rounded-full bg-white/20 border-4 border-white/20 flex items-center justify-center text-white text-xl font-bold'>
                    {user?.name
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('') || 'U'}
                  </div>
                  <div>
                    <h1 className='text-3xl font-bold mb-1'>
                      Welcome back, {user?.name?.split(' ')[0] || 'Student'}!
                    </h1>
                    <p className='text-blue-100'>
                      Your study abroad journey is {profileProgress}% complete
                    </p>
                    {completenessDetails?.completionStatus &&
                      !completenessDetails.completionStatus.isComplete && (
                        <p className='text-blue-200 text-sm mt-1'>
                          Next steps:{' '}
                          {completenessDetails.completionStatus.nextSteps
                            .slice(0, 2)
                            .join(', ')}
                        </p>
                      )}
                  </div>
                </div>
                <div className='flex items-center gap-3'></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <StatCard
            icon={FiFileText}
            label='Documents Uploaded'
            value={stats.documentsUploaded}
            color='blue'
          />
          <StatCard
            icon={FiGlobe}
            label='Universities Applied'
            value={stats.universitiesApplied}
            color='green'
          />
          <StatCard
            icon={FiCalendar}
            label='Appointments'
            value={stats.appointmentsCompleted}
            color='purple'
          />
          <StatCard
            icon={FiAward}
            label='Test Score'
            value={stats.testScoreAvg || 'N/A'}
            color='orange'
          />
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Left Column */}
          <div className='lg:col-span-2 space-y-8'>
            {/* Enhanced Profile Progress */}
            <div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-6'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <h2 className='text-xl font-semibold text-gray-900'>
                    Profile Completion
                  </h2>
                  <p className='text-sm text-gray-600 mt-1'>
                    Complete all sections to unlock more features
                  </p>
                </div>
                <button className='p-2 text-gray-400generally hover:text-gray-600 transition-colors'>
                  <FiMoreHorizontal className='h-5 w-5' />
                </button>
              </div>

              <div className='flex items-center gap-8 mb-8'>
                {/* Enhanced Circular Progress */}
                <div className='relative'>
                  <svg className='w-32 h-32 transform -rotate-90'>
                    <circle
                      cx='64'
                      cy='64'
                      r='56'
                      stroke='#e5e7eb'
                      strokeWidth='12'
                      fill='none'
                    />
                    <circle
                      cx='64'
                      cy='64'
                      r='56'
                      stroke='url(#gradient)'
                      strokeWidth='12'
                      fill='none'
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 56 * (1 - profileProgress / 100)
                      }`}
                      className='transition-all duration-1000'
                      strokeLinecap='round'
                    />
                    <defs>
                      <linearGradient
                        id='gradient'
                        x1='0%'
                        y1='0%'
                        x2='100%'
                        y2='0%'
                      >
                        <stop offset='0%' stopColor='#3b82f6' />
                        <stop offset='100%' stopColor='#8b5cf6' />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <div className='text-center'>
                      <span className='text-2xl font-bold text-gray-900'>
                        {profileProgress}%
                      </span>
                      <p className='text-xs text-gray-600'>Complete</p>
                    </div>
                  </div>
                </div>

                {/* Completion Status */}
                <div className='flex-1'>
                  <div className='mb-4'>
                    {completenessDetails?.completionStatus?.isComplete ? (
                      <div className='flex items-center gap-2 p-3 bg-green-100 rounded-lg'>
                        <FiCheckCircle className='h-5 w-5 text-green-600' />
                        <span className='text-green-800 font-medium'>
                          Profile Complete!
                        </span>
                      </div>
                    ) : (
                      <div className='flex items-center gap-2 p-3 bg-blue-100 rounded-lg'>
                        <FiInfo className='h-5 w-5 text-blue-600' />
                        <span className='text-blue-800 font-medium'>
                          {100 - profileProgress}% remaining to complete
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Next Steps */}
                  {completenessDetails?.completionStatus?.nextSteps?.length >
                    0 && (
                    <div>
                      <h4 className='text-sm font-medium text-gray-900 mb-2'>
                        Next Steps:
                      </h4>
                      <ul className='space-y-1'>
                        {completenessDetails.completionStatus.nextSteps.map(
                          (step, index) => (
                            <li
                              key={index}
                              className='text-sm text-gray-600 flex items-center gap-2'
                            >
                              <div className='w-1.5 h-1.5 bg-blue-500 rounded-full'></div>
                              {step}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Section Progress Cards */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                {profileSections.map((sectionData) => (
                  <SectionProgressCard
                    key={sectionData.section}
                    {...sectionData}
                  />
                ))}
              </div>

              <Link
                to='/profile'
                className='w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2'
              >
                {profileProgress < 100 ? 'Complete Profile' : 'View Profile'}
                <FiArrowRight className='h-4 w-4' />
              </Link>
            </div>

            {/* Recent Documents */}
            <div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-xl font-semibold text-gray-900'>
                  Recent Documents
                </h2>
                <Link
                  to={ROUTES.DOCUMENTS}
                  className='text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1'
                >
                  View all
                  <FiArrowRight className='h-4 w-4' />
                </Link>
              </div>

              {recentDocuments.length > 0 ? (
                <div className='space-y-4'>
                  {recentDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className='flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
                    >
                      <div className='flex items-center gap-4'>
                        <div className='p-2 bg-blue-100 rounded-lg'>
                          <FiFileText className='h-5 w-5 text-blue-600' />
                        </div>
                        <div>
                          <p className='font-medium text-gray-900'>
                            {DOCUMENT_TYPES[
                              doc.type as keyof typeof DOCUMENT_TYPES
                            ] || doc.type}
                          </p>
                          <p className='text-sm text-gray-600'>
                            Uploaded {getRelativeTime(doc.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-3'>
                        {getDocumentStatusIcon(doc.status)}
                        <span
                          className={`text-sm px-2 py-1 rounded-full ${
                            doc.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : doc.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {doc.status}
                        </span>
                        <button
                          onClick={() =>
                            window.open(
                              `${API_BASE_URL}${doc.filePath}`,
                              '_blank'
                            )
                          }
                          className='p-1 text-gray-400 hover:text-gray-600'
                        >
                          <FiEye className='h-4 w-4' />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-8'>
                  <FiFileText className='h-12 w-12 text-gray-300 mx-auto mb-3' />
                  <p className='text-gray-500 mb-3'>
                    No documents uploaded yet
                  </p>
                  <Link
                    to='/documents'
                    className='inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors'
                  >
                    Upload Documents
                  </Link>
                </div>
              )}

              <Link
                to='/documents'
                className='w-full mt-4 border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2'
              >
                <FiUpload className='h-5 w-5' />
                Upload New Document
              </Link>
            </div>
          </div>

          {/* Right Column */}
          <div className='space-y-8'>
            {/* Next Appointment */}
            {nextAppointment ? (
              <div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Next Appointment
                </h3>
                <div className='bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4'>
                  <div className='flex items-start gap-3'>
                    <div className='p-2 bg-green-100 rounded-lg'>
                      <FiCalendar className='h-5 w-5 text-green-600' />
                    </div>
                    <div className='flex-1'>
                      <p className='font-semibold text-gray-900'>
                        {nextAppointment.consultantName}
                      </p>
                      <p className='text-sm text-gray-600 mb-2'>
                        {nextAppointment.purpose || 'Consultation'}
                      </p>
                      <div className='flex items-center gap-3 text-sm text-gray-600'>
                        <span className='flex items-center gap-1'>
                          <FiClock className='h-4 w-4' />
                          {formatDateTime(nextAppointment.dateTime)}
                        </span>
                        <span className='flex items-center gap-1'>
                          {nextAppointment.type === 'virtual' ? (
                            <>
                              <FiVideo className='h-4 w-4' />
                              Virtual
                            </>
                          ) : (
                            <>
                              <FiMapPin className='h-4 w-4' />
                              In-Person
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className='w-full mt-3 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors'>
                    {nextAppointment.type === 'virtual'
                      ? 'Join Meeting'
                      : 'View Details'}
                  </button>
                </div>

                {/* Other Upcoming Appointments */}
                {upcomingAppointments.length > 1 && (
                  <div className='mt-4 space-y-2'>
                    <h4 className='text-sm font-medium text-gray-900'>
                      Other Upcoming
                    </h4>
                    {upcomingAppointments.slice(1).map((appointment) => (
                      <div
                        key={appointment.id}
                        className='flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors'
                      >
                        <FiCalendar className='h-4 w-4 text-gray-400' />
                        <div className='flex-1'>
                          <p className='text-sm font-medium text-gray-900'>
                            {appointment.consultantName}
                          </p>
                          <p className='text-xs text-gray-600'>
                            {formatDate(appointment.dateTime)}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            APPOINTMENT_STATUS[
                              appointment.status as keyof typeof APPOINTMENT_STATUS
                            ]?.color || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {appointment.type}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Appointments
                </h3>
                <div className='text-center py-8'>
                  <FiCalendar className='h-12 w-12 text-gray-300 mx-auto mb-3' />
                  <p className='text-gray-500 mb-3'>No upcoming appointments</p>
                  <Link
                    to='/appointments'
                    className='bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105'
                  >
                    <FiCalendar className='h-4 w-4' />
                    Book Appointment
                  </Link>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Quick Actions
              </h3>
              <div className='space-y-3'>
                <Link
                  to='/appointments'
                  className='w-full flex items-center gap-3 p-3 text-left rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors'
                >
                  <FiCalendar className='h-5 w-5 text-blue-600' />
                  <span className='font-medium text-gray-900'>
                    Book Appointment
                  </span>
                </Link>
                <Link
                  to='/documents'
                  className='w-full flex items-center gap-3 p-3 text-left rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors'
                >
                  <FiUpload className='h-5 w-5 text-green-600' />
                  <span className='font-medium text-gray-900'>
                    Upload Documents
                  </span>
                </Link>
                <Link
                  to='/messages'
                  className='w-full flex items-center gap-3 p-3 text-left rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors'
                >
                  <FiMessageSquare className='h-5 w-5 text-purple-600' />
                  <span className='font-medium text-gray-900'>
                    Contact Consultant
                  </span>
                </Link>
                <Link
                  to='/reports'
                  className='w-full flex items-center gap-3 p-3 text-left rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors'
                >
                  <FiDownload className='h-5 w-5 text-orange-600' />
                  <span className='font-medium text-gray-900'>
                    Download Reports
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
