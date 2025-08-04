import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { AppProvider } from '@/context/AppContext';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Layout } from '@/components/common/Layout';
import { ROUTES } from '@/utils/constants';

// Pages
import { LoginForm } from '@/pages/LoginForm';
import { Signup } from '@/pages/Signup';
import { Dashboard } from '@/pages/Dashboard';
import { Profile } from '@/pages/Profile';

import { Documents } from '@/pages/Documents';
import { Appointments } from '@/pages/Appointments';
import { Messages } from '@/pages/Messages';
import { Tasks } from '@/pages/Tasks';
import { ForgotPassword } from '@/pages/ForgotPassword';
import OAuthSuccess from './pages/OAuthSuccess';
import { CourseFinder } from './pages/CourseFinder';
import { CourseDetail } from './pages/CourseDetail';
import { ProposalsPage } from './pages/ProposalsPage';
import { ProposalDetailPage } from './pages/ProposalDetailPage';
import { ChecklistPage } from './pages/CheckList';
import StandaloneChat from './pages/ChatPage';
import ApplicationDashboard from './pages/Applications';

import CreateApplication from '@/pages/CreateApplication';
import ApplicationDetails from '@/pages/ApplicationDetails';
import UniversitySelector from '@/pages/UniversitySelector';
import UniversityBrowser from '@/pages/UniversityBrowser';
import OfferManagement from '@/pages/OfferManagement';
import CalendarDashboard from './pages/CalendarDashboard';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <AppProvider>
              <Routes>
                {/* Public Routes */}
                <Route path={ROUTES.LOGIN} element={<LoginForm />} />
                <Route path={ROUTES.SIGNUP} element={<Signup />} />
                <Route path='/oauth-success' element={<OAuthSuccess />} />
                <Route
                  path={ROUTES.FORGOT_PASSWORD}
                  element={<ForgotPassword />}
                />
                <Route
                  path={ROUTES.RESET_PASSWORD}
                  element={<ForgotPassword />}
                />

                {/* Protected Routes */}
                <Route
                  path='/'
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route
                    index
                    element={<Navigate to={ROUTES.DASHBOARD} replace />}
                  />

                  <Route
                    path={ROUTES.APPLICATIONS}
                    element={<ApplicationDashboard />}
                  />
                  <Route
                    path={ROUTES.APPLICATIONS_NEW}
                    element={<CreateApplication />}
                  />
                  <Route
                    path={ROUTES.APPLICATION_DETAILS}
                    element={<ApplicationDetails />}
                  />
                  <Route
                    path={ROUTES.APPLICATION_UNIVERSITIES}
                    element={<UniversitySelector />}
                  />
                  <Route
                    path={ROUTES.UNIVERSITIES}
                    element={<UniversityBrowser />}
                  />
                  <Route path={ROUTES.CALENDAR} element={<CalendarDashboard />} />
                  <Route path={ROUTES.OFFERS} element={<OfferManagement />} />
                  <Route
                    path={ROUTES.APPLICATION_EDIT}
                    element={<CreateApplication />}
                  />

                  <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
                  <Route
                    path={ROUTES.COURSE_FINDER}
                    element={<CourseFinder />}
                  />
                  <Route
                    path={ROUTES.COURSE_DETAILS}
                    element={<CourseDetail />}
                  />
                  <Route path={ROUTES.PROPOSAL} element={<ProposalsPage />} />
                  <Route path={ROUTES.CHECK_LIST} element={<ChecklistPage />} />
                  <Route path={ROUTES.MESSAGES} element={<StandaloneChat />} />
                  <Route
                    path={ROUTES.PROPOSAL_DETAILS}
                    element={<ProposalDetailPage />}
                  />
                  <Route path={ROUTES.PROFILE} element={<Profile />} />

                  <Route path={ROUTES.DOCUMENTS} element={<Documents />} />
                  <Route
                    path={ROUTES.APPOINTMENTS}
                    element={<Appointments />}
                  />
                  <Route path={ROUTES.MESSAGES} element={<Messages />} />
                  <Route path={ROUTES.TASKS} element={<Tasks />} />
                </Route>

                {/* Catch all */}
                <Route
                  path='*'
                  element={<Navigate to={ROUTES.DASHBOARD} replace />}
                />
              </Routes>
            </AppProvider>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
