import React, { useState, useEffect } from 'react';
import {
  FiCheckSquare,
  FiSquare,
  FiClock,
  FiAlertCircle,
} from 'react-icons/fi';
import { taskService, TaskStats } from '@/services/task.service';
import { Task } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatDate, cn } from '@/utils/helpers';
import toast from 'react-hot-toast';

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<
    'all' | 'pending' | 'completed' | 'overdue'
  >('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const [tasksData, statsData] = await Promise.all([
        taskService.getTasks(),
        taskService.getTaskStats(),
      ]);
      setTasks(tasksData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTask = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';

    try {
      await taskService.updateTaskStatus(task.id, newStatus);

      // Update local state
      setTasks(
        tasks.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
      );

      // Update stats
      if (stats) {
        if (newStatus === 'completed') {
          setStats({
            ...stats,
            pending: stats.pending - 1,
            completed: stats.completed + 1,
          });
        } else {
          setStats({
            ...stats,
            pending: stats.pending + 1,
            completed: stats.completed - 1,
          });
        }
      }

      toast.success(
        newStatus === 'completed' ? 'Task completed!' : 'Task marked as pending'
      );
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const isOverdue = (task: Task) => {
    return task.status === 'pending' && new Date(task.dueDate) < new Date();
  };

  const filteredTasks = tasks.filter((task) => {
    switch (filter) {
      case 'pending':
        return task.status === 'pending' && !isOverdue(task);
      case 'completed':
        return task.status === 'completed';
      case 'overdue':
        return isOverdue(task);
      default:
        return true;
    }
  });

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
        <h1 className='text-2xl font-bold text-gray-900'>Tasks</h1>
        <p className='text-gray-600 mt-1'>
          Keep track of your application requirements
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'card text-center transition-all',
              filter === 'all' && 'ring-2 ring-primary-500'
            )}
          >
            <p className='text-3xl font-bold text-gray-900'>{stats.total}</p>
            <p className='text-sm text-gray-600'>Total Tasks</p>
          </button>

          <button
            onClick={() => setFilter('pending')}
            className={cn(
              'card text-center transition-all',
              filter === 'pending' && 'ring-2 ring-primary-500'
            )}
          >
            <p className='text-3xl font-bold text-yellow-600'>
              {stats.pending}
            </p>
            <p className='text-sm text-gray-600'>Pending</p>
          </button>

          <button
            onClick={() => setFilter('completed')}
            className={cn(
              'card text-center transition-all',
              filter === 'completed' && 'ring-2 ring-primary-500'
            )}
          >
            <p className='text-3xl font-bold text-green-600'>
              {stats.completed}
            </p>
            <p className='text-sm text-gray-600'>Completed</p>
          </button>

          <button
            onClick={() => setFilter('overdue')}
            className={cn(
              'card text-center transition-all',
              filter === 'overdue' && 'ring-2 ring-primary-500'
            )}
          >
            <p className='text-3xl font-bold text-red-600'>{stats.overdue}</p>
            <p className='text-sm text-gray-600'>Overdue</p>
          </button>
        </div>
      )}

      {/* Task List */}
      <div className='card'>
        {filteredTasks.length > 0 ? (
          <div className='space-y-3'>
            {filteredTasks.map((task) => {
              const overdue = isOverdue(task);

              return (
                <div
                  key={task.id}
                  className={cn(
                    'flex items-start p-4 rounded-lg border transition-all',
                    task.status === 'completed'
                      ? 'bg-gray-50 border-gray-200'
                      : overdue
                      ? 'bg-red-50 border-red-200'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  )}
                >
                  <button
                    onClick={() => handleToggleTask(task)}
                    className='mt-0.5 mr-3 text-primary-600 hover:text-primary-700'
                  >
                    {task.status === 'completed' ? (
                      <FiCheckSquare className='h-5 w-5' />
                    ) : (
                      <FiSquare className='h-5 w-5' />
                    )}
                  </button>

                  <div className='flex-1'>
                    <div className='flex items-start justify-between'>
                      <div>
                        <h3
                          className={cn(
                            'font-medium',
                            task.status === 'completed'
                              ? 'text-gray-500 line-through'
                              : 'text-gray-900'
                          )}
                        >
                          {task.title}
                        </h3>
                        <p
                          className={cn(
                            'text-sm mt-1',
                            task.status === 'completed'
                              ? 'text-gray-400'
                              : 'text-gray-600'
                          )}
                        >
                          {task.description}
                        </p>
                      </div>

                      <span
                        className={cn(
                          'ml-4 px-2 py-1 rounded-full text-xs font-medium',
                          getPriorityColor(task.priority)
                        )}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <div className='flex items-center gap-4 mt-2'>
                      <div className='flex items-center gap-1 text-sm text-gray-500'>
                        {overdue ? (
                          <>
                            <FiAlertCircle className='h-4 w-4 text-red-500' />
                            <span className='text-red-600'>Overdue</span>
                          </>
                        ) : (
                          <>
                            <FiClock className='h-4 w-4' />
                            <span>Due {formatDate(task.dueDate)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className='text-center py-12'>
            <FiCheckSquare className='h-12 w-12 text-gray-300 mx-auto mb-4' />
            <p className='text-gray-500'>
              {filter === 'all'
                ? 'No tasks found'
                : filter === 'overdue'
                ? 'No overdue tasks'
                : filter === 'completed'
                ? 'No completed tasks'
                : 'No pending tasks'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
