import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { User, AuthResponse } from '@/types';
import {
  authService,
  LoginCredentials,
  SignupData,
} from '@/services/auth.service';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  refreshAuth: () => Promise<void>; // Add this for manual refresh
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();

    // Listen for storage changes (when OAuth stores token)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        console.log('Storage changed, rechecking auth');
        checkAuth();
      }
    };

    // Listen for custom storage events (from OAuth component)
    const handleCustomStorageEvent = () => {
      console.log('Custom storage event, rechecking auth');
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage', handleCustomStorageEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage', handleCustomStorageEvent);
    };
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);

      // First try to get user from authService (for normal login)
      let currentUser = await authService.getCurrentUser();
      console.log('Auth check result from service:', currentUser);

      // If authService returns null, check localStorage directly (for OAuth)
      if (!currentUser) {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          try {
            // For OAuth, we already have the user data stored
            currentUser = JSON.parse(storedUser);
            console.log(
              'Auth check result from localStorage (OAuth):',
              currentUser
            );

            // Optional: Validate token expiration
            const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
            const isTokenExpired =
              tokenPayload.exp && Date.now() >= tokenPayload.exp * 1000;

            if (isTokenExpired) {
              console.log('Token is expired, clearing localStorage');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              currentUser = null;
            }
          } catch (e) {
            console.error('Error parsing stored user or token:', e);
            // Clear invalid data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      }

      setUser(currentUser);
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAuth = async () => {
    await checkAuth();
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      toast.success('Welcome back!');
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
      throw error;
    }
  };

  const signup = async (data: SignupData) => {
    try {
      const response = await authService.signup(data);
      setUser(response.user);
      toast.success('Account created successfully!');
      navigate(ROUTES.PROFILE);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Signup failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      navigate(ROUTES.LOGIN);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      navigate(ROUTES.LOGIN);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateUser,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
