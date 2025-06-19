import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiFileText,
  FiFolder,
  FiCalendar,
  FiCheckSquare,
  FiTrendingUp,
  FiClock,
} from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { applicationService } from '@/services/application.service';
import { taskService } from '@/services/task.service';
import { appointmentService } from '@/services/appointment.service';
import { documentService } from '@/services/document.service';
import { ROUTES } from '@/utils/constants';
import { formatDate, formatDateTime } from '@/utils/helpers';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface DashboardStats {
  applications: number;
  documents: number;
  tasks: number;
  appointments: number;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    applications: 0,
    documents: 0,
    tasks: 0,
    appointments: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        applications,
        documentStatus,
        taskStats,
        appointments,
        upcomingAppts,
        tasks,
      ] = await Promise.all([
        applicationService.getApplications(),
        documentService.getDocumentStatus(),
        taskService.getTaskStats(),
        appointmentService.getUpcomingAppointments(),
        appointmentService.getUpcomingAppointments(),
        taskService.getPendingTasks(),
      ]);

      setStats({
        applications: applications.length,
        documents: documentStatus.total,
        tasks: taskStats.pending,
        appointments: appointments.length,
      });

      setUpcomingAppointments(upcomingAppts.slice(0, 3));
      setPendingTasks(tasks.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className='text-gray-600 mt-1'>
          Here's an overview of your application progress
        </p>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Link
          to={ROUTES.APPLICATIONS}
          className='card hover:shadow-lg transition-shadow'
        >
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Applications</p>
              <p className='text-2xl font-bold text-gray-900'>
                {stats.applications}
              </p>
            </div>
            <FiFileText className='h-8 w-8 text-primary-600' />
          </div>
        </Link>

        <Link
          to={ROUTES.DOCUMENTS}
          className='card hover:shadow-lg transition-shadow'
        >
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Documents</p>
              <p className='text-2xl font-bold text-gray-900'>
                {stats.documents}
              </p>
            </div>
            <FiFolder className='h-8 w-8 text-green-600' />
          </div>
        </Link>

        <Link
          to={ROUTES.TASKS}
          className='card hover:shadow-lg transition-shadow'
        >
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Pending Tasks</p>
              <p className='text-2xl font-bold text-gray-900'>{stats.tasks}</p>
            </div>
            <FiCheckSquare className='h-8 w-8 text-yellow-600' />
          </div>
        </Link>

        <Link
          to={ROUTES.APPOINTMENTS}
          className='card hover:shadow-lg transition-shadow'
        >
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Appointments</p>
              <p className='text-2xl font-bold text-gray-900'>
                {stats.appointments}
              </p>
            </div>
            <FiCalendar className='h-8 w-8 text-purple-600' />
          </div>
        </Link>
      </div>

      {/* Application Progress */}
      <div className='card'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-semibold text-gray-900'>
            Application Progress
          </h2>
          <FiTrendingUp className='h-5 w-5 text-gray-400' />
        </div>
        <div className='w-full bg-gray-200 rounded-full h-3'>
          <div
            className='bg-primary-600 h-3 rounded-full transition-all duration-500'
            style={{ width: '65%' }}
          />
        </div>
        <p className='text-sm text-gray-600 mt-2'>65% Complete</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Upcoming Appointments */}
        <div className='card'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-gray-900'>
              Upcoming Appointments
            </h2>
            <Link to={ROUTES.APPOINTMENTS} className='text-sm link'>
              View all
            </Link>
          </div>
          {upcomingAppointments.length > 0 ? (
            <div className='space-y-3'>
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className='flex items-start space-x-3 p-3 bg-gray-50 rounded-lg'
                >
                  <FiClock className='h-5 w-5 text-gray-400 mt-0.5' />
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-gray-900'>
                      {appointment.consultantName}
                    </p>
                    <p className='text-sm text-gray-600'>
                      {formatDateTime(appointment.dateTime)}
                    </p>
                    <p className='text-xs text-gray-500 capitalize'>
                      {appointment.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-sm text-gray-500'>No upcoming appointments</p>
          )}
        </div>

        {/* Pending Tasks */}
        <div className='card'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-gray-900'>
              Pending Tasks
            </h2>
            <Link to={ROUTES.TASKS} className='text-sm link'>
              View all
            </Link>
          </div>
          {pendingTasks.length > 0 ? (
            <div className='space-y-3'>
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className='flex items-start space-x-3 p-3 bg-gray-50 rounded-lg'
                >
                  <input
                    type='checkbox'
                    className='mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
                    disabled
                  />
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-gray-900'>
                      {task.title}
                    </p>
                    <p className='text-xs text-gray-500'>
                      Due: {formatDate(task.dueDate)}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      task.priority === 'high'
                        ? 'bg-red-100 text-red-800'
                        : task.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-sm text-gray-500'>No pending tasks</p>
          )}
        </div>
      </div>
    </div>
  );
};
