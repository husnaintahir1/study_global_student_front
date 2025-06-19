import { api } from './api';
import { AuthResponse, User } from '@/types';
import { TOKEN_KEY, USER_KEY } from '@/utils/constants';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    this.setAuthData(response);
    return response;
  }

  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/signup', {
      ...data,
      role: 'student',
    });
    this.setAuthData(response);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      this.clearAuthData();
    }
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return api.post('/auth/reset-password', { email });
  }

  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    return api.post('/auth/reset-password/confirm', data);
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getToken();
      if (!token) return null;

      const userStr = localStorage.getItem(USER_KEY);
      if (userStr) {
        return JSON.parse(userStr);
      }

      // If no cached user, fetch from API
      const user = await api.get<User>('/auth/me');
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    } catch {
      this.clearAuthData();
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private setAuthData(response: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
  }

  private clearAuthData(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

export const authService = new AuthService();