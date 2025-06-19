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
import { Login } from '@/pages/LoginForm';
import { Signup } from '@/pages/Signup';
import { Dashboard } from '@/pages/Dashboard';
import { Profile } from '@/pages/Profile';
import { Applications } from '@/pages/Applications';
import { Documents } from '@/pages/Documents';
import { Appointments } from '@/pages/Appointments';
import { Messages } from '@/pages/Messages';
import { Tasks } from '@/pages/Tasks';
import { ForgotPassword } from '@/pages/ForgotPassword';
import OAuthSuccess from './pages/OAuthSuccess';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <AppProvider>
              <Routes>
                {/* Public Routes */}
                <Route path={ROUTES.LOGIN} element={<Login />} />
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
                  <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
                  <Route path={ROUTES.PROFILE} element={<Profile />} />
                  <Route
                    path={ROUTES.APPLICATIONS}
                    element={<Applications />}
                  />
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
