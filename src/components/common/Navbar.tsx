import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBell, FiMenu, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useApp } from '@/context/AppContext';
import { getInitials } from '@/utils/helpers';
import { ROUTES } from '@/utils/constants';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { toggleSidebar } = useApp();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
            >
              <FiMenu className="h-6 w-6" />
            </button>
            <Link to={ROUTES.DASHBOARD} className="flex items-center ml-4 lg:ml-0">
              <h1 className="text-xl font-bold text-primary-600">Study Abroad Portal</h1>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Link
              to={ROUTES.DASHBOARD}
              className="relative p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <FiBell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </Link>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 p-2 rounded-full hover:bg-gray-100"
              >
                <div className="h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-medium">
                  {getInitials(user?.name || '')}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
              </button>

              {showDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                    <Link
                      to={ROUTES.PROFILE}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      <FiUser className="h-4 w-4 mr-3" />
                      Profile
                    </Link>
                    <Link
                      to={ROUTES.SETTINGS}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      <FiSettings className="h-4 w-4 mr-3" />
                      Settings
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        logout();
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiLogOut className="h-4 w-4 mr-3" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};