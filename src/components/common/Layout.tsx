import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Toast } from './Toast';
import { useApp } from '@/context/AppContext';
import { cn } from '@/utils/helpers';

export const Layout: React.FC = () => {
  const { sidebarOpen } = useApp();

  return (
    <div className='min-h-screen bg-gray-50'>
      <Toast />
      <Navbar />

      <div className='flex h-screen pt-16'>
        <Sidebar />

        <main
          className={cn(
            'flex-1 overflow-y-auto transition-all duration-300',
            sidebarOpen ? 'lg:ml-0' : 'lg:ml-0'
          )}
        >
          <div className='p-4 sm:p-6 lg:p-8'>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
