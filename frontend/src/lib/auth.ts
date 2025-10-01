import { apiClient } from './api';

export interface User {
  id: number;
  email: string;
  name: string;
  age?: number;
  profession?: string;
  interests?: string[];
  country?: string;
  newsletter?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: string;
  profession: string;
  interests: string[];
  country: string;
  newsletter: boolean;
}

export class AuthService {
  private apiClient = apiClient;

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.apiClient.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // Store token in localStorage
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData: RegisterFormData): Promise<AuthResponse> {
    try {
      // Use the existing register method from apiClient, but we need to update it
      const response = await this.apiClient.request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      // Store token in localStorage
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await this.apiClient.request<{ user: User }>('/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.user;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const token = this.getStoredToken();
      if (token) {
        await this.apiClient.request('/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API fails
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  }

  getStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  }

  getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    if (!token) return false;

    try {
      // Basic token validation - check if it's not expired
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }
}

export const authService = new AuthService();
