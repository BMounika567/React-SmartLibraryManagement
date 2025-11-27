import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  membershipNumber?: string;
}

interface UsersState {
  users: User[];
  userProfile: User | null;
  userStats: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  userProfile: null,
  userStats: null,
  loading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const response = await axiosClient.get('/api/UserManagement');
  return response.data.data;
});

export const fetchUserProfile = createAsyncThunk('users/fetchUserProfile', async () => {
  const response = await axiosClient.get('/api/Profile');
  return response.data.data;
});

export const updateUserProfile = createAsyncThunk('users/updateUserProfile', async (userData: any) => {
  const response = await axiosClient.put('/api/Profile', userData);
  return response.data.data;
});

export const fetchUserStats = createAsyncThunk('users/fetchUserStats', async (userId: string) => {
  const response = await axiosClient.get(`/api/UserDashboard/statistics/${userId}`);
  return response.data.data;
});

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUserData: (state) => {
      state.users = [];
      state.userProfile = null;
      state.userStats = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      // User Profile cases
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userProfile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user profile';
      })
      // Update Profile cases
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.userProfile = action.payload;
      })
      // User Stats cases
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.userStats = action.payload;
      });
  },
});

export const { clearError, clearUserData } = usersSlice.actions;
export default usersSlice.reducer;