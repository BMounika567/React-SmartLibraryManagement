import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  categoryId: string;
  categoryName?: string;
  totalCopies: number;
  availableCopies: number;
}

interface BooksState {
  books: Book[];
  categories: any[];
  loading: boolean;
  error: string | null;
}

const initialState: BooksState = {
  books: [],
  categories: [],
  loading: false,
  error: null,
};

export const fetchBooks = createAsyncThunk('books/fetchBooks', async () => {
  const response = await axiosClient.get('/api/Book');
  return response.data.data;
});

export const fetchCategories = createAsyncThunk('books/fetchCategories', async () => {
  const response = await axiosClient.get('/api/BookCategory');
  return response.data.data;
});

export const addBook = createAsyncThunk('books/addBook', async (bookData: any) => {
  const response = await axiosClient.post('/api/Book', bookData);
  return response.data.data;
});

export const updateBook = createAsyncThunk('books/updateBook', async (bookData: any) => {
  const response = await axiosClient.put(`/api/Book/${bookData.id}`, bookData);
  return response.data.data;
});

export const deleteBook = createAsyncThunk('books/deleteBook', async (bookId: string) => {
  await axiosClient.delete(`/api/Book/${bookId}`);
  return bookId;
});

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearBooks: (state) => {
      state.books = [];
      state.categories = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch books';
      })
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      })
      .addCase(addBook.fulfilled, (state, action) => {
        state.books.push(action.payload);
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        const index = state.books.findIndex(book => book.id === action.payload.id);
        if (index !== -1) {
          state.books[index] = action.payload;
        }
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.books = state.books.filter(book => book.id !== action.payload);
      });
  },
});

export const { clearError, clearBooks } = booksSlice.actions;
export default booksSlice.reducer;