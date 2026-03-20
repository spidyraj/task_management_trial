import api from './api';

export interface LoginData {
  loginIdentifier: string;
  password: string;
}

export interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: number;
      email: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('accessToken');
  },

  getStoredUser(): { id: number; email: string } | null {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.userId,
        email: payload.email,
      };
    } catch (error) {
      return null;
    }
  },
};
