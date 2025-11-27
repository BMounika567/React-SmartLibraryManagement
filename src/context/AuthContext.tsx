import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, registerUser, logout as logoutAction, clearError, updateProfile as updateProfileAction } from '../store/slices/authSlice';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId?: string;
  libraryName?: string;
  libraryCode?: string;
  studentId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: any) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => void;
  updateProfile: (profileData: { name: string }) => Promise<any>;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading, error } = useAppSelector((state) => state.auth);

  const login = async (credentials: any): Promise<any> => {
    const result = await dispatch(loginUser(credentials));
    if (loginUser.fulfilled.match(result)) {
      return result.payload;
    } else {
      throw new Error(result.error.message || 'Login failed');
    }
  };

  const register = async (userData: any): Promise<any> => {
    const result = await dispatch(registerUser(userData));
    if (registerUser.fulfilled.match(result)) {
      return result.payload;
    } else {
      throw new Error(result.error.message || 'Registration failed');
    }
  };

  const logout = (): void => {
    dispatch(logoutAction());
  };

  const handleClearError = (): void => {
    dispatch(clearError());
  };

  const updateProfile = async (profileData: { name: string }): Promise<any> => {
    const result = await dispatch(updateProfileAction(profileData));
    if (updateProfileAction.fulfilled.match(result)) {
      return { success: true, message: 'Profile updated successfully' };
    } else {
      throw new Error(result.error.message || 'Profile update failed');
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated,
    loading,
    error,
    clearError: handleClearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};