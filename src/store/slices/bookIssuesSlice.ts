import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

interface BookIssue {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  bookCopyId: string;
  bookTitle: string;
  bookAuthor: string;
  bookISBN: string;
  copyNumber: number;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fineAmount?: number;
  isOverdue: boolean;
  daysOverdue: number;
  notes?: string;
}

interface BookIssuesState {
  issues: BookIssue[];
  userBooks: BookIssue[];
  reservations: any[];
  notifications: any[];
  paymentHistory: any[];
  userReviews: any[];
  userRequests: any[];
  returnRequests: any[];
  loading: boolean;
  error: string | null;
}

const initialState: BookIssuesState = {
  issues: [],
  userBooks: [],
  reservations: [],
  notifications: [],
  paymentHistory: [],
  userReviews: [],
  userRequests: [],
  returnRequests: [],
  loading: false,
  error: null,
};

export const fetchBookIssues = createAsyncThunk('bookIssues/fetchBookIssues', async () => {
  const response = await axiosClient.get('/api/BookIssue/active');
  return response.data.data;
});

export const issueBook = createAsyncThunk('bookIssues/issueBook', async (issueData: any) => {
  const response = await axiosClient.post('/api/BookIssue', issueData);
  return response.data.data;
});

export const returnBook = createAsyncThunk('bookIssues/returnBook', async (returnData: any) => {
  const response = await axiosClient.post('/api/BookIssue/return', returnData);
  return response.data.data;
});

export const fetchUserBooks = createAsyncThunk('bookIssues/fetchUserBooks', async (userId: string) => {
  const response = await axiosClient.get(`/api/BookIssue/user/${userId}`);
  return response.data.data;
});

export const fetchUserReservations = createAsyncThunk('bookIssues/fetchUserReservations', async () => {
  const response = await axiosClient.get('/api/BookReservation/my-reservations');
  return response.data.data;
});

export const fetchUserNotifications = createAsyncThunk('bookIssues/fetchUserNotifications', async (userId: string) => {
  const response = await axiosClient.get(`/api/Notification/user/${userId}`);
  return response.data.data;
});

export const fetchPaymentHistory = createAsyncThunk('bookIssues/fetchPaymentHistory', async () => {
  const response = await axiosClient.get('/api/FinePayment/history');
  return response.data.data;
});

export const reserveBook = createAsyncThunk('bookIssues/reserveBook', async (bookId: string) => {
  const response = await axiosClient.post('/api/BookReservation', { bookId });
  return response.data.data;
});

export const fetchUserReviews = createAsyncThunk('bookIssues/fetchUserReviews', async (userId: string) => {
  const response = await axiosClient.get(`/api/Review/user/${userId}`);
  return response.data.data;
});

export const fetchUserRequests = createAsyncThunk('bookIssues/fetchUserRequests', async () => {
  const response = await axiosClient.get('/api/BookRequest/my-requests');
  return response.data.data;
});

export const fetchReturnRequests = createAsyncThunk('bookIssues/fetchReturnRequests', async () => {
  const response = await axiosClient.get('/api/BookReturnRequest/my-requests');
  return response.data.data;
});

const bookIssuesSlice = createSlice({
  name: 'bookIssues',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearBookData: (state) => {
      state.issues = [];
      state.userBooks = [];
      state.reservations = [];
      state.notifications = [];
      state.paymentHistory = [];
      state.userReviews = [];
      state.userRequests = [];
      state.returnRequests = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookIssues.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBookIssues.fulfilled, (state, action) => {
        state.loading = false;
        state.issues = action.payload;
      })
      .addCase(fetchBookIssues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch book issues';
      })
      .addCase(issueBook.fulfilled, (state, action) => {
        state.issues.push(action.payload);
      })
      .addCase(returnBook.fulfilled, (state, action) => {
        const index = state.issues.findIndex(issue => issue.id === action.payload.id);
        if (index !== -1) {
          state.issues[index] = action.payload;
        }
      })
      // User Books
      .addCase(fetchUserBooks.fulfilled, (state, action) => {
        state.userBooks = action.payload;
      })
      // Reservations
      .addCase(fetchUserReservations.fulfilled, (state, action) => {
        state.reservations = action.payload;
      })
      .addCase(reserveBook.fulfilled, (state, action) => {
        state.reservations.push(action.payload);
      })
      // Notifications
      .addCase(fetchUserNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
      })
      // Payment History
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.paymentHistory = action.payload;
      })
      // User Reviews
      .addCase(fetchUserReviews.fulfilled, (state, action) => {
        state.userReviews = action.payload;
      })
      // User Requests
      .addCase(fetchUserRequests.fulfilled, (state, action) => {
        state.userRequests = action.payload;
      })
      // Return Requests
      .addCase(fetchReturnRequests.fulfilled, (state, action) => {
        state.returnRequests = action.payload;
      });
  },
});

export const { clearError, clearBookData } = bookIssuesSlice.actions;
export default bookIssuesSlice.reducer;