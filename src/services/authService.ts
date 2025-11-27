import axiosClient from '../api/axiosClient';
import { API_ENDPOINTS } from '../api/endpoints';

interface LoginCredentials {
  email: string;
  password: string;
  libraryCode: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  studentId: string;
  libraryCode: string;
}

interface User {
  userId: string;
  name: string;
  email: string;
  role: string;
  tenantId?: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await axiosClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    
    if (response.data.success && response.data.data.token) {
      // Add library code from login form to user data
      const userData = {
        ...response.data.data,
        libraryCode: credentials.libraryCode,
        libraryName: 'Smart Library'
      };
      
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      return { user: userData, token: response.data.data.token };
    }
    return { user: response.data.data, token: response.data.data.token };
  },

  register: async (userData: RegisterData): Promise<any> => {
    const response = await axiosClient.post(API_ENDPOINTS.USER_REGISTRATION.REGISTER, userData);
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },
};