import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';

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

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const getInitialAuthState = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    localStorage.removeItem('user');
  }
  
  const isAuthenticated = !!(token && user);
  
  return {
    user,
    token,
    isAuthenticated,
    loading: false,
    error: null,
  };
};

const initialState: AuthState = getInitialAuthState();

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { email: string; password: string; libraryCode: string }) => {
    const response = await authService.login(credentials);
    return response;
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData: { name: string; email: string; password: string; studentId: string; libraryCode: string }) => {
    const response = await authService.register(userData);
    return response;
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: { name: string; phoneNumber?: string }) => {
    const { profileService } = await import('../../services/profileService');
    const response = await profileService.updateProfile(profileData);
    return response.data;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUserProfile: (state, action: PayloadAction<{ name: string }>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        const user = action.payload.user;
        state.user = {
          ...user,
          id: (user as any).userId || (user as any).id || ''
        };
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
      })
      // Update profile cases
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user && action.payload) {
          state.user = { ...state.user, name: action.payload.name };
          localStorage.setItem('user', JSON.stringify(state.user));
        }
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Profile update failed';
      });
  },
});

export const { loginSuccess, logout, clearError, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;