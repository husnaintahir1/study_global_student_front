import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiFileText,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiVideo,
  FiMapPin,
  FiArrowRight,
} from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { profileService } from '@/services/profile.service';
import { appointmentService } from '@/services/appointment.service';
import { documentService } from '@/services/document.service';
import { ROUTES, DOCUMENT_TYPES, APPOINTMENT_STATUS } from '@/utils/constants';
import { formatDate, formatDateTime, getRelativeTime } from '@/utils/helpers';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [profileProgress, setProfileProgress] = useState(0);
  const [recentDocuments, setRecentDocuments] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profile, documents, appointments] = await Promise.all([
        profileService.getProfile(),
        documentService.getDocuments(),
        appointmentService.getAppointments(),
      ]);

      // Set profile progress
      setProfileProgress(
        profile?.profileCompletionStatus?.overallPercentage || 0
      );

      // Get recent 3 documents
      const sortedDocs = documents
        .sort(
          (a: any, b: any) =>
            new Date(b?.uploadedAt)?.getTime() -
            new Date(a?.uploadedAt)?.getTime()
        )
        .slice(0, 3);
      setRecentDocuments(sortedDocs);

      // Get upcoming appointments
      const upcoming = appointments
        .filter(
          (apt: any) =>
            apt.status === 'scheduled' && new Date(apt.dateTime) > new Date()
        )
        .sort(
          (a: any, b: any) =>
            new Date(a?.dateTime)?.getTime() - new Date(b?.dateTime)?.getTime()
        )
        .slice(0, 3);
      setUpcomingAppointments(upcoming);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDocumentStatusIcon = (status: string) => {
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

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  const nextAppointment = getNextAppointment();

  return (
    <div className='max-w-6xl mx-auto space-y-6'>
      {/* Welcome Section */}
      <div className='bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white'>
        <h1 className='text-2xl font-bold mb-2'>
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className='text-primary-100'>
          Your study abroad journey is {profileProgress}% complete
        </p>
      </div>

      {/* Main Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Profile Progress - Takes 1 column */}
        <div className='lg:col-span-1'>
          <div className='card h-full'>
            <h2 className='text-lg font-semibold text-gray-900 mb-4'>
              Profile Progress
            </h2>

            {/* Circular Progress */}
            <div className='flex flex-col items-center mb-6'>
              <div className='relative w-32 h-32'>
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
                    stroke='#0ea5e9'
                    strokeWidth='12'
                    fill='none'
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${
                      2 * Math.PI * 56 * (1 - profileProgress / 100)
                    }`}
                    className='transition-all duration-1000'
                  />
                </svg>
                <div className='absolute inset-0 flex items-center justify-center'>
                  <span className='text-3xl font-bold text-gray-900'>
                    {profileProgress}%
                  </span>
                </div>
              </div>
              <p className='text-sm text-gray-600 mt-2'>Profile Completed</p>
            </div>

            <Link
              to={ROUTES.PROFILE}
              className='btn btn-outline w-full flex items-center justify-center gap-2'
            >
              Complete Profile
              <FiArrowRight className='h-4 w-4' />
            </Link>
          </div>
        </div>

        {/* Recent Documents - Takes 2 columns */}
        <div className='lg:col-span-2'>
          <div className='card h-full'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-lg font-semibold text-gray-900'>
                Recent Documents
              </h2>
              <Link
                to={ROUTES.DOCUMENTS}
                className='text-sm link flex items-center gap-1'
              >
                View all
                <FiArrowRight className='h-3 w-3' />
              </Link>
            </div>

            {recentDocuments.length > 0 ? (
              <div className='space-y-3'>
                {recentDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className='flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
                  >
                    <div className='flex items-center gap-3'>
                      <FiFileText className='h-5 w-5 text-gray-400' />
                      <div>
                        <p className='font-medium text-gray-900'>
                          {
                            DOCUMENT_TYPES[
                              doc.type as keyof typeof DOCUMENT_TYPES
                            ]
                          }
                        </p>
                        <p className='text-sm text-gray-600'>
                          Uploaded {getRelativeTime(doc.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      {getDocumentStatusIcon(doc.status)}
                      <span className='text-sm text-gray-600'>
                        {doc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-8'>
                <FiFileText className='h-12 w-12 text-gray-300 mx-auto mb-3' />
                <p className='text-gray-500 mb-3'>No documents uploaded yet</p>
                <Link to={ROUTES.DOCUMENTS} className='btn btn-primary btn-sm'>
                  Upload Documents
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Appointments Section - Full Width */}
      <div className='card'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-semibold text-gray-900'>Appointments</h2>
          <Link
            to={ROUTES.APPOINTMENTS}
            className='text-sm link flex items-center gap-1'
          >
            View all
            <FiArrowRight className='h-3 w-3' />
          </Link>
        </div>

        {nextAppointment ? (
          <div className='space-y-4'>
            {/* Next Appointment Highlight */}
            <div className='bg-primary-50 border border-primary-200 rounded-lg p-4'>
              <div className='flex items-start justify-between'>
                <div className='flex items-start gap-3'>
                  <div className='p-2 bg-primary-100 rounded-lg'>
                    <FiCalendar className='h-6 w-6 text-primary-600' />
                  </div>
                  <div>
                    <p className='font-semibold text-gray-900'>
                      Next Appointment
                    </p>
                    <p className='text-lg font-medium text-gray-900 mt-1'>
                      {nextAppointment.consultantName}
                    </p>
                    <div className='flex items-center gap-4 mt-2 text-sm text-gray-600'>
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
                {nextAppointment.type === 'virtual' &&
                  new Date(nextAppointment.dateTime) <= new Date() && (
                    <button className='btn btn-primary btn-sm'>
                      Join Meeting
                    </button>
                  )}
              </div>
            </div>

            {/* Other Upcoming Appointments */}
            {upcomingAppointments.length > 1 && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                {upcomingAppointments.slice(1).map((appointment) => (
                  <div
                    key={appointment.id}
                    className='flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors'
                  >
                    <FiCalendar className='h-5 w-5 text-gray-400' />
                    <div className='flex-1'>
                      <p className='font-medium text-gray-900'>
                        {appointment.consultantName}
                      </p>
                      <p className='text-sm text-gray-600'>
                        {formatDate(appointment.dateTime)}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        APPOINTMENT_STATUS[
                          appointment.status as keyof typeof APPOINTMENT_STATUS
                        ].color
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
          <div className='text-center py-8'>
            <FiCalendar className='h-12 w-12 text-gray-300 mx-auto mb-3' />
            <p className='text-gray-500 mb-3'>No upcoming appointments</p>
            <Link to={ROUTES.APPOINTMENTS} className='btn btn-primary btn-sm'>
              Book Appointment
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {/* <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        <Link to={ROUTES.PROFILE} className='btn btn-outline text-center'>
          <FiFileText className='h-4 w-4 inline mr-2' />
          Profile
        </Link>
        <Link to={ROUTES.DOCUMENTS} className='btn btn-outline text-center'>
          <FiFileText className='h-4 w-4 inline mr-2' />
          Documents
        </Link>
        <Link to={ROUTES.APPOINTMENTS} className='btn btn-outline text-center'>
          <FiCalendar className='h-4 w-4 inline mr-2' />
          Appointments
        </Link>
        <Link to={ROUTES.MESSAGES} className='btn btn-outline text-center'>
          <FiFileText className='h-4 w-4 inline mr-2' />
          Messages
        </Link>
      </div> */}
    </div>
  );
};
