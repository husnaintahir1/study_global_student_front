import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiInfo, FiCalendar, FiUser } from 'react-icons/fi';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { profileService } from '@/services/profile.service';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { cn } from '@/utils/helpers';

interface ChecklistItem {
  id: string;
  title: string;
  required: boolean;
  completed: boolean;
  createdAt: string;
  description?: string;
}

interface Checklist {
  id: string;
  studentId: string;
  consultantId: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  items: ChecklistItem[];
  progress: number;
  additionalData: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  consultant: {
    id: string;
    name: string;
    email: string;
  };
}

export const ChecklistPage: React.FC = () => {
  const { user } = useAuth();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [modifiedChecklists, setModifiedChecklists] = useState<{
    [key: string]: ChecklistItem[];
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchChecklists = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        const response = await profileService.getStudentChecklists(user.id);
        setChecklists(response.data);
      } catch (error) {
        toast.error('Failed to fetch checklists. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchChecklists();
  }, [user?.id]);

  const handleItemToggle = (
    checklistId: string,
    itemId: string,
    completed: boolean
  ) => {
    setModifiedChecklists((prev) => {
      const checklistItems =
        prev[checklistId] ||
        checklists.find((c) => c.id === checklistId)?.items ||
        [];
      const updatedItems = checklistItems.map((item) =>
        item.id === itemId ? { ...item, completed } : item
      );
      return { ...prev, [checklistId]: updatedItems };
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      for (const [checklistId, items] of Object.entries(modifiedChecklists)) {
        const payload = {
          items: items.map((item) => ({
            title: item.title,
            completed: item.completed,
          })),
        };
        await profileService.updateChecklistItems(checklistId, payload);
      }
      toast.success('Checklist updates saved successfully');
      // Refresh checklists after saving
      const response = await profileService.getStudentChecklists(
        user?.id || ''
      );
      setChecklists(response.data);
      setModifiedChecklists({});
    } catch (error) {
      toast.error('Failed to save checklist updates. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setModifiedChecklists({});
  };

  const hasChanges = Object.keys(modifiedChecklists).length > 0;

  const getProgress = (items: ChecklistItem[]) => {
    if (!items.length) return 0;
    const completed = items.filter((item) => item.completed).length;
    return Math.round((completed / items.length) * 100);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-700 border-red-500/30';
      case 'medium':
        return 'bg-amber-500/20 text-amber-700 border-amber-500/30';
      default:
        return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
    }
  };

  return (
    <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>Your Checklists</h1>
        <p className='text-sm text-gray-600 mt-2'>
          Complete the tasks assigned by your consultant to prepare for your
          application process.
        </p>
      </div>

      {isLoading ? (
        <div className='flex justify-center items-center h-64'>
          <LoadingSpinner size='lg' />
        </div>
      ) : checklists.length === 0 ? (
        <div className='bg-gradient-to-r from-white to-gray-50/50 border border-gray-200 rounded-2xl p-6 text-center'>
          <p className='text-gray-600 text-sm'>No checklists assigned yet.</p>
        </div>
      ) : (
        <div className='space-y-8'>
          {checklists.map((checklist) => (
            <div
              key={checklist.id}
              className='bg-gradient-to-r from-white to-gray-50/50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300'
            >
              {/* Checklist Header */}
              <div className='flex justify-between items-start mb-4'>
                <div>
                  <h2 className='text-xl font-semibold text-gray-900'>
                    {checklist.title}
                  </h2>
                  {checklist.description && (
                    <p className='text-sm text-gray-600 mt-1'>
                      {checklist.description}
                    </p>
                  )}
                </div>
                <span
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium',
                    getPriorityColor(checklist.priority)
                  )}
                >
                  {checklist.priority.charAt(0).toUpperCase() +
                    checklist.priority.slice(1)}
                </span>
              </div>

              {/* Checklist Info */}
              <div className='bg-amber-50/80 backdrop-blur-md border border-amber-200/50 rounded-xl p-4 mb-4'>
                <div className='flex items-start gap-3'>
                  <FiInfo className='h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0' />
                  <div className='space-y-1'>
                    <p className='text-sm text-amber-700'>
                      Assigned by: {checklist.consultant.name} (
                      {checklist.consultant.email})
                    </p>
                    <p className='text-sm text-amber-700 flex items-center gap-2'>
                      <FiCalendar className='h-4 w-4' />
                      Due: {format(new Date(checklist.dueDate), 'MMM dd, yyyy')}
                    </p>
                    <p className='text-sm text-amber-700'>
                      Progress:{' '}
                      {getProgress(
                        modifiedChecklists[checklist.id] || checklist.items
                      )}
                      %
                    </p>
                  </div>
                </div>
              </div>

              {/* Checklist Items */}
              <div className='space-y-4'>
                {(modifiedChecklists[checklist.id] || checklist.items).map(
                  (item) => (
                    <div
                      key={item.id}
                      className='flex items-start gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50/50 transition-all duration-200'
                    >
                      <input
                        type='checkbox'
                        checked={item.completed}
                        onChange={(e) =>
                          handleItemToggle(
                            checklist.id,
                            item.id,
                            e.target.checked
                          )
                        }
                        className='h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500/20'
                        disabled={isSubmitting}
                      />
                      <div className='flex-1'>
                        <p className='text-sm font-medium text-gray-900'>
                          {item.title}
                          {item.required && (
                            <span className='text-red-600 ml-1'>*</span>
                          )}
                        </p>
                        {item.description && (
                          <p className='text-xs text-gray-600 mt-1'>
                            {item.description}
                          </p>
                        )}
                        <p className='text-xs text-gray-500 mt-1'>
                          Created:{' '}
                          {format(new Date(item.createdAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      {item.completed && (
                        <FiCheck className='h-5 w-5 text-green-600 flex-shrink-0' />
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {checklists.length > 0 && (
        <div className='flex justify-end gap-4 mt-8'>
          <button
            type='button'
            onClick={handleCancel}
            className='px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors'
            disabled={!hasChanges || isSubmitting}
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={handleSubmit}
            className='bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:from-blue-600 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center'
            disabled={!hasChanges || isSubmitting}
          >
            {isSubmitting ? <LoadingSpinner size='sm' /> : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
};
