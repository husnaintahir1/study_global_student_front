import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiUser,
  FiFileText,
  FiFolder,
  FiCalendar,
  FiMessageSquare,
  FiCheckSquare,
  FiX,
} from 'react-icons/fi';
import { useApp } from '@/context/AppContext';
import { ROUTES } from '@/utils/constants';
import { cn } from '@/utils/helpers';

const navigation = [
  { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: FiHome },
  { name: 'Profile', href: ROUTES.PROFILE, icon: FiUser },
  { name: 'Documents', href: ROUTES.DOCUMENTS, icon: FiFolder },
  { name: 'Appointments', href: ROUTES.APPOINTMENTS, icon: FiCalendar },
  { name: 'Applications', href: ROUTES.APPLICATIONS, icon: FiFileText },
  { name: 'Messages', href: ROUTES.MESSAGES, icon: FiMessageSquare },
  { name: 'Tasks', href: ROUTES.TASKS, icon: FiCheckSquare },
];

export const Sidebar: React.FC = () => {
  const { sidebarOpen, setSidebarOpen } = useApp();

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 lg:hidden">
            <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )
                }
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="px-3 py-2">
              <p className="text-xs text-gray-500">Student Portal</p>
              <p className="text-xs text-gray-400">Version 1.0.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};