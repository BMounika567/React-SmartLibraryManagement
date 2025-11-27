import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import booksSlice from './slices/booksSlice';
import usersSlice from './slices/usersSlice';
import bookIssuesSlice from './slices/bookIssuesSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    books: booksSlice,
    users: usersSlice,
    bookIssues: bookIssuesSlice,
  },
  devTools: import.meta.env.MODE !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;