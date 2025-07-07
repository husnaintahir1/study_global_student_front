import React from 'react';
import { cn } from '@/utils/helpers';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  const spinner = (
    <div
      className={cn(
        'relative animate-spin rounded-full',
        'bg-gradient-to-r from-blue-500 to-purple-600',
        'border-t-transparent border-l-transparent',
        sizeClasses[size],
        className
      )}
    >
      <div
        className={cn(
          'absolute inset-0 rounded-full opacity-50',
          'bg-gradient-to-r from-blue-500 to-purple-600'
        )}
      />
    </div>
  );

  if (fullScreen) {
    return (
      <div className='fixed inset-0 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm z-50'>
        <div className='p-6 bg-gradient-to-r from-white/10 to-gray-50/10 border border-gray-200/20 rounded-2xl shadow-2xl'>
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
};
