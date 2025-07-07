import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  FiBell,
  FiMenu,
  FiUser,
  FiLogOut,
  FiSettings,
  FiChevronDown,
  FiSearch,
  FiGlobe,
  FiHome,
  FiFileText,
  FiFolder,
  FiCalendar,
  FiMessageSquare,
  FiCheckSquare,
  FiX,
  FiZap,
  FiCpu,
} from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useApp } from '@/context/AppContext';
import { getInitials } from '@/utils/helpers';
import { ROUTES } from '@/utils/constants';
import { cn } from '@/utils/helpers';

// Navigation items
const navigation = [
  { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: FiHome },
  { name: 'Profile', href: ROUTES.PROFILE, icon: FiUser },

  { name: 'Course Finder', href: ROUTES.COURSE_FINDER, icon: FiSearch },
  { name: 'Proposals', href: ROUTES.PROPOSAL, icon: FiFileText },
  { name: 'Checklist', href: ROUTES.CHECK_LIST, icon: FiCheckSquare },

  { name: 'Documents', href: ROUTES.DOCUMENTS, icon: FiFolder },
  { name: 'Appointments', href: ROUTES.APPOINTMENTS, icon: FiCalendar },
  { name: 'Applications', href: ROUTES.APPLICATIONS, icon: FiFileText },
  { name: 'Messages', href: ROUTES.MESSAGES, icon: FiMessageSquare },
];

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useApp();
  const [showDropdown, setShowDropdown] = useState(false);
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  return (
    <nav className='bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 fixed top-0 left-0 right-0 z-50'>
      {/* Background decoration */}
      <div className='absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 pointer-events-none' />

      <div className='relative px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          {/* Left side */}
          <div className='flex items-center'>
            <button
              onClick={toggleSidebar}
              className='p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-white/60 lg:hidden transition-colors backdrop-blur-sm'
            >
              <FiMenu className='h-6 w-6' />
            </button>

            <Link
              to={ROUTES.DASHBOARD}
              className='flex items-center ml-4 lg:ml-0 group'
            >
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow'>
                  <FiGlobe className='h-5 w-5 text-white' />
                </div>
                <div>
                  <h1 className='text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                    Study Abroad Portal
                  </h1>
                  <p className='text-xs text-gray-500 hidden sm:block'>
                    Your gateway to global education
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Right side */}
          <div className='flex items-center space-x-3'>
            {/* Search bar (hidden on mobile) */}
            <div className='hidden md:flex items-center'>
              <div className='relative'>
                <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <input
                  type='text'
                  placeholder='Search...'
                  className='pl-10 pr-4 py-2 bg-gray-100/60 backdrop-blur-sm border border-gray-200/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all w-64'
                />
              </div>
            </div>

            {/* Notifications */}
            <div className='relative'>
              <button
                onClick={toggleNotifications}
                className='relative p-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-white/60 backdrop-blur-sm transition-colors group'
              >
                <FiBell className='h-5 w-5 group-hover:scale-110 transition-transform' />
                {unreadCount > 0 && (
                  <span className='absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-lg'>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div
                    className='fixed inset-0 z-10'
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className='absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 z-20 max-h-96 overflow-hidden'>
                    <div className='px-6 py-4 border-b border-gray-100'>
                      <div className='flex items-center justify-between'>
                        <h3 className='text-lg font-semibold text-gray-900'>
                          Notifications
                        </h3>
                        {unreadCount > 0 && (
                          <span className='px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium'>
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                    </div>

                    <div className='max-h-64 overflow-y-auto'>
                      {notifications.length === 0 ? (
                        <div className='px-6 py-8 text-center'>
                          <FiBell className='h-8 w-8 text-gray-300 mx-auto mb-2' />
                          <p className='text-sm text-gray-500'>
                            No notifications yet
                          </p>
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markAsRead(n.id)}
                            className={`px-6 py-4 hover:bg-gray-50/50 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0 ${
                              !n.read ? 'bg-blue-50/30' : ''
                            }`}
                          >
                            <div className='flex items-start gap-3'>
                              <div
                                className={`p-1.5 rounded-lg ${
                                  !n.read ? 'bg-blue-100' : 'bg-gray-100'
                                }`}
                              >
                                <FiBell
                                  className={`h-3 w-3 ${
                                    !n.read ? 'text-blue-600' : 'text-gray-400'
                                  }`}
                                />
                              </div>
                              <div className='flex-1'>
                                <p
                                  className={`text-sm ${
                                    !n.read
                                      ? 'font-medium text-gray-900'
                                      : 'text-gray-600'
                                  }`}
                                >
                                  {n.message}
                                </p>
                                <p className='text-xs text-gray-500 mt-1'>
                                  {new Date(n.createdAt).toLocaleString()}
                                </p>
                              </div>
                              {!n.read && (
                                <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className='px-6 py-3 border-t border-gray-100'>
                      <Link
                        to={ROUTES.NOTIFICATIONS || '#'}
                        className='block text-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors'
                        onClick={() => setShowNotifications(false)}
                      >
                        View All Notifications
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User menu */}
            <div className='relative'>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className='flex items-center space-x-3 p-2 rounded-xl hover:bg-white/60 backdrop-blur-sm transition-colors group'
              >
                <div className='h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-semibold shadow-lg group-hover:shadow-xl transition-shadow'>
                  {getInitials(user?.name || '')}
                </div>
                <div className='hidden md:block text-left'>
                  <p className='text-sm font-semibold text-gray-900'>
                    {user?.name}
                  </p>
                  <p className='text-xs text-gray-500'>Student</p>
                </div>
                <FiChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform ${
                    showDropdown ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {showDropdown && (
                <>
                  <div
                    className='fixed inset-0 z-10'
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className='absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 py-2 z-20'>
                    <div className='px-4 py-3 border-b border-gray-100'>
                      <p className='text-sm font-semibold text-gray-900'>
                        {user?.name}
                      </p>
                      <p className='text-xs text-gray-500'>{user?.email}</p>
                    </div>

                    <div className='py-2'>
                      <Link
                        to={ROUTES.PROFILE}
                        className='flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50/50 transition-colors'
                        onClick={() => setShowDropdown(false)}
                      >
                        <FiUser className='h-4 w-4 mr-3 text-gray-400' />
                        View Profile
                      </Link>
                      <Link
                        to={ROUTES.SETTINGS}
                        className='flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50/50 transition-colors'
                        onClick={() => setShowDropdown(false)}
                      >
                        <FiSettings className='h-4 w-4 mr-3 text-gray-400' />
                        Settings
                      </Link>
                    </div>

                    <div className='border-t border-gray-100 pt-2'>
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          logout();
                        }}
                        className='flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/50 transition-colors'
                      >
                        <FiLogOut className='h-4 w-4 mr-3' />
                        Logout
                      </button>
                    </div>
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

// Enhanced Sidebar Component with AI Badge
export const Sidebar = () => {
  const { sidebarOpen, setSidebarOpen } = useApp();

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-30 bg-gray-900/50 backdrop-blur-sm lg:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-72 bg-white/80 backdrop-blur-md shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-gray-200/50',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Background decoration */}
        <div className='absolute inset-0 bg-gradient-to-b from-blue-50/30 to-purple-50/30 pointer-events-none' />

        <div className='relative flex flex-col h-full'>
          {/* Mobile header */}
          <div className='flex items-center justify-between h-16 px-6 border-b border-gray-200/50 lg:hidden'>
            <h2 className='text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
              Navigation
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className='p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 transition-colors'
            >
              <FiX className='h-5 w-5' />
            </button>
          </div>

          {/* Navigation */}
          <nav className='flex-1 px-4 py-6 space-y-2 overflow-y-auto'>
            <div className='mb-6'>
              <h3 className='px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3'>
                Main Menu
              </h3>

              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group',
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-white/60 hover:text-gray-900'
                    )
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className={cn(
                          'h-5 w-5 mr-4 transition-transform group-hover:scale-110',
                          isActive ? 'text-white' : 'text-gray-400'
                        )}
                      />
                      <span className='font-medium'>{item.name}</span>
                      {isActive && (
                        <div className='ml-auto w-2 h-2 bg-white rounded-full' />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* AI-Powered Bottom Section */}
          <div className='p-6 border-t border-gray-200/50'>
            <div className='relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-5 shadow-lg overflow-hidden'>
              {/* Animated background elements */}
              <div className='absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10'></div>
              <div className='absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8'></div>

              {/* Content */}
              <div className='relative z-10'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='relative'>
                    <div className='w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30'>
                      <FiZap className='h-5 w-5 text-white' />
                    </div>
                    {/* Pulsing ring */}
                    <div className='absolute inset-0 bg-white/20 rounded-xl animate-ping'></div>
                  </div>
                  <div>
                    <div className='flex items-center gap-2 mb-1'>
                      <h3 className='text-white font-bold text-sm'>
                        AI-POWERED
                      </h3>
                      <div className='w-2 h-2 bg-emerald-400 rounded-full animate-pulse'></div>
                    </div>
                    <p className='text-white/80 text-xs font-medium'>
                      Study Portal
                    </p>
                  </div>
                </div>

                {/* Status indicator */}
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div className='w-2 h-2 bg-emerald-400 rounded-full animate-pulse'></div>
                    <span className='text-white/80 text-xs'>AI Online</span>
                  </div>
                  <div className='px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/30'>
                    <span className='text-white text-xs font-medium'>
                      ACTIVE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes pulse-glow {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};
