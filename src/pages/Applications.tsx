import React, { useState, useEffect } from 'react';
import {
  FiDownload,
  FiExternalLink,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiFileText,
} from 'react-icons/fi';
import { applicationService } from '@/services/application.service';
import {
  ApplicationStatus,
  ApplicationChecklist,
} from '@/services/application.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatDate } from '@/utils/helpers';
import { cn } from '@/utils/helpers';
import toast from 'react-hot-toast';

export const Applications: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationStatus[]>([]);
  const [checklist, setChecklist] = useState<ApplicationChecklist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist'>(
    'overview'
  );

  useEffect(() => {
    fetchApplicationData();
  }, []);

  const fetchApplicationData = async () => {
    try {
      const [appsData, checklistData] = await Promise.all([
        applicationService.getApplications(),
        applicationService.getChecklist(),
      ]);
      setApplications(appsData);
      setChecklist(checklistData);
    } catch (error) {
      console.error('Failed to fetch application data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChecklistToggle = async (itemId: string, completed: boolean) => {
    try {
      const updatedChecklist = await applicationService.updateChecklistItem(
        itemId,
        completed
      );
      setChecklist(updatedChecklist);
      toast.success(
        completed ? 'Item marked as complete' : 'Item marked as incomplete'
      );
    } catch (error) {
      toast.error('Failed to update checklist item');
    }
  };

  const handleDownloadSummary = async () => {
    try {
      const summary = await applicationService.downloadSummary();
      window.open(summary.fileUrl, '_blank');
      toast.success('Summary downloaded successfully');
    } catch (error) {
      toast.error('Failed to download summary');
    }
  };

  const getStatusBadge = (status: ApplicationStatus['status']) => {
    const statusConfig = {
      draft: {
        icon: FiFileText,
        color: 'bg-gray-100 text-gray-800',
        text: 'Draft',
      },
      submitted: {
        icon: FiClock,
        color: 'bg-blue-100 text-blue-800',
        text: 'Submitted',
      },
      under_review: {
        icon: FiClock,
        color: 'bg-yellow-100 text-yellow-800',
        text: 'Under Review',
      },
      accepted: {
        icon: FiCheckCircle,
        color: 'bg-green-100 text-green-800',
        text: 'Accepted',
      },
      rejected: {
        icon: FiXCircle,
        color: 'bg-red-100 text-red-800',
        text: 'Rejected',
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          config.color
        )}
      >
        <Icon className='h-3 w-3 mr-1' />
        {config.text}
      </span>
    );
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
      <div className='flex justify-between items-start'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Applications</h1>
          <p className='text-gray-600 mt-1'>
            Track your university applications and requirements
          </p>
        </div>
        <button
          onClick={handleDownloadSummary}
          className='btn btn-outline flex items-center gap-2'
        >
          <FiDownload className='h-4 w-4' />
          Download Summary
        </button>
      </div>

      {/* Tabs */}
      <div className='border-b border-gray-200'>
        <nav className='-mb-px flex space-x-8'>
          <button
            onClick={() => setActiveTab('overview')}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'overview'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={cn(
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'checklist'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            Checklist
          </button>
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className='space-y-4'>
          {applications.length > 0 ? (
            applications.map((app) => (
              <div
                key={app.id}
                className='card hover:shadow-lg transition-shadow'
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-3 mb-2'>
                      <h3 className='text-lg font-semibold text-gray-900'>
                        {app.universityName}
                      </h3>
                      {getStatusBadge(app.status)}
                    </div>
                    <p className='text-gray-600 mb-4'>{app.courseName}</p>

                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm'>
                      <div>
                        <span className='text-gray-500'>Progress:</span>
                        <div className='mt-1 w-full bg-gray-200 rounded-full h-2'>
                          <div
                            className='bg-primary-600 h-2 rounded-full transition-all duration-300'
                            style={{ width: `${app.progress}%` }}
                          />
                        </div>
                        <span className='text-xs text-gray-600'>
                          {app.progress}% Complete
                        </span>
                      </div>
                      {app.submittedAt && (
                        <div>
                          <span className='text-gray-500'>Submitted:</span>
                          <p className='text-gray-900'>
                            {formatDate(app.submittedAt)}
                          </p>
                        </div>
                      )}
                      {app.deadline && (
                        <div>
                          <span className='text-gray-500'>Deadline:</span>
                          <p className='text-gray-900'>
                            {formatDate(app.deadline)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button className='ml-4 p-2 text-gray-400 hover:text-gray-600'>
                    <FiExternalLink className='h-5 w-5' />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className='card text-center py-12'>
              <p className='text-gray-500'>
                No applications yet. Start by consulting with your advisor.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'checklist' && checklist && (
        <div className='card'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>
            Application Checklist
          </h2>
          <div className='space-y-3'>
            {checklist.items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'flex items-start p-4 rounded-lg border',
                  item.completed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-200'
                )}
              >
                <input
                  type='checkbox'
                  checked={item.completed}
                  onChange={(e) =>
                    handleChecklistToggle(item.id, e.target.checked)
                  }
                  className='mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded'
                />
                <div className='ml-3 flex-1'>
                  <div className='flex items-center justify-between'>
                    <h4
                      className={cn(
                        'font-medium',
                        item.completed ? 'text-green-900' : 'text-gray-900'
                      )}
                    >
                      {item.title}
                      {item.required && (
                        <span className='text-red-500 ml-1'>*</span>
                      )}
                    </h4>
                    {item.dueDate && (
                      <span className='text-sm text-gray-500'>
                        Due: {formatDate(item.dueDate)}
                      </span>
                    )}
                  </div>
                  <p
                    className={cn(
                      'text-sm mt-1',
                      item.completed ? 'text-green-700' : 'text-gray-600'
                    )}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className='mt-6 pt-6 border-t'>
            <div className='flex items-center justify-between'>
              <p className='text-sm text-gray-600'>
                <span className='text-red-500'>*</span> Required items
              </p>
              <p className='text-sm font-medium text-gray-900'>
                {checklist.items.filter((item) => item.completed).length} of{' '}
                {checklist.items.length} completed
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
