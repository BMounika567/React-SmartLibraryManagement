import axiosClient from './axiosClient';
import { API_ENDPOINTS } from './endpoints';

export interface BookReservation {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  bookId: string;
  bookTitle?: string;
  bookAuthor?: string;
  bookISBN?: string;
  reservedDate: string;
  notifiedDate?: string;
  pickupDeadline?: string;
  pickupDate?: string;
  priority: number;
  status: 'Pending' | 'Available' | 'Completed' | 'Expired' | 'Cancelled';
  librarianNotes?: string;
  isCompleted: boolean;
  isCancelled: boolean;
  createdDate: string;
}

export interface CreateBookReservationDto {
  userId: string;
  bookId: string;
}

export interface NotifyAvailableDto {
  librarianNotes?: string;
}

export interface AutoNotifyDto {
  bookId: string;
}

export const bookReservationApi = {
  getAll: async (): Promise<BookReservation[]> => {
    const response = await axiosClient.get(API_ENDPOINTS.BOOK_RESERVATIONS.GET_ALL_RESERVATIONS);
    return response.data.data;
  },

  getMyReservations: async (): Promise<BookReservation[]> => {
    const response = await axiosClient.get(API_ENDPOINTS.BOOK_RESERVATIONS.MY_RESERVATIONS);
    return response.data.data;
  },

  getUserReservations: async (userId: string): Promise<BookReservation[]> => {
    const response = await axiosClient.get(API_ENDPOINTS.BOOK_RESERVATIONS.GET_USER_RESERVATIONS(userId));
    return response.data.data;
  },

  getById: async (id: string): Promise<BookReservation> => {
    const response = await axiosClient.get(API_ENDPOINTS.BOOK_RESERVATIONS.GET_RESERVATION(id));
    return response.data.data;
  },

  create: async (data: CreateBookReservationDto): Promise<BookReservation> => {
    const response = await axiosClient.post(API_ENDPOINTS.BOOK_RESERVATIONS.RESERVE_BOOK, data);
    return response.data.data;
  },

  notifyAvailable: async (id: string, data: NotifyAvailableDto): Promise<BookReservation> => {
    const response = await axiosClient.post('/api/BookReservation/notify-available', { Id: id, ...data });
    return response.data.data;
  },

  autoNotifyAvailable: async (data: AutoNotifyDto): Promise<BookReservation | null> => {
    const response = await axiosClient.post('/api/BookReservation/auto-notify-available', data);
    return response.data.data;
  },

  completePickup: async (id: string): Promise<BookReservation> => {
    const response = await axiosClient.post('/api/BookReservation/complete-pickup', { Id: id });
    return response.data.data;
  },

  cancel: async (id: string, librarianNotes?: string): Promise<BookReservation> => {
    const response = await axiosClient.post('/api/BookReservation/cancel', { Id: id, librarianNotes });
    return response.data.data;
  },
};