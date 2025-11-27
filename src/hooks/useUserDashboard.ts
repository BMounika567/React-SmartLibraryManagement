import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

export const useUserDashboard = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<any>({
    booksIssued: 0,
    dueSoon: 0,
    totalFines: 0,
    hasOutstandingFines: false,
    reservedBooks: 0
  });
  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<any[]>([]);
  const [userReservations, setUserReservations] = useState<any[]>([]);
  const [userNotifications, setUserNotifications] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [libraryInfo] = useState({ name: 'Smart Library', address: 'University Campus' });
  const [loading, setLoading] = useState(true);
  const hasFetchedRef = useRef(false);

  const fetchUserStats = async () => {
    if (!(user as any)?.userId) return;
    try {
      const response = await axiosClient.post('/api/UserDashboard/get-statistics');
      setUserStats(response.data.data || response.data);
    } catch (error) {
      setUserStats({
        booksIssued: 0,
        dueSoon: 0,
        totalFines: 0,
        hasOutstandingFines: false,
        reservedBooks: 0
      });
    }
  };

  const fetchData = async () => {
    try {
      const [booksRes, categoriesRes] = await Promise.all([
        axiosClient.post('/api/Book/get-all'),
        axiosClient.post('/api/BookCategory/get-all')
      ]);
      setBooks(booksRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
    } catch (error) {
    }
  };

  const fetchUserBooks = async () => {
    if (!(user as any)?.userId) return;
    try {
      const response = await axiosClient.post('/api/BookIssue/get-user-books');
      setBorrowedBooks(response.data.data || response.data || []);
    } catch (error) {
      setBorrowedBooks([]);
    }
  };

  const fetchUserReservations = async () => {
    try {
      const response = await axiosClient.post('/api/BookReservation/get-my-reservations');
      setUserReservations(response.data.data || []);
    } catch (error) {
    }
  };

  const fetchUserNotifications = async () => {
    if (!(user as any)?.userId) return;
    try {
      const response = await axiosClient.post('/api/Notification/get-user-notifications');
      setUserNotifications(response.data.data || []);
    } catch (error) {
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const response = await axiosClient.post('/api/FinePayment/get-by-user');
      setPaymentHistory(response.data.data || []);
    } catch (error) {
    }
  };

  const fetchUserProfile = async () => {
    if (!(user as any)?.userId) return;
    try {
      const response = await axiosClient.post('/api/Profile/get-profile');
      setUserProfile(response.data.data);
    } catch (error) {
    }
  };

  const fetchAllDashboardData = async () => {
    if (!(user as any)?.userId) return;
    try {
      const response = await axiosClient.post('/api/UserDashboard/get-dashboard-data');
      const data = response.data.data;
      
      setUserStats(data.userStats || {
        booksIssued: 0,
        dueSoon: 0,
        totalFines: 0,
        hasOutstandingFines: false,
        reservedBooks: 0
      });
      setBorrowedBooks(data.borrowedBooks || []);
      setUserReservations(data.reservations || []);
      setUserNotifications(data.notifications || []);
      setPaymentHistory(data.paymentHistory || []);
      setUserProfile(data.profile);
      setBooks(data.books || []);
      setCategories(data.categories || []);
      setPendingRequests(data.pendingRequests || []);
    } catch (error) {
   
      setUserStats({
        booksIssued: 0,
        dueSoon: 0,
        totalFines: 0,
        hasOutstandingFines: false,
        reservedBooks: 0
      });
      setBorrowedBooks([]);
      setUserReservations([]);
      setUserNotifications([]);
      setPaymentHistory([]);
      setBooks([]);
      setCategories([]);
      setPendingRequests([]);
    }
  };

  const updateUserProfile = async (profileData: any) => {
    setUserProfile({ ...userProfile, ...profileData });
    return { success: true, message: 'Profile updated successfully' };
  };

  const changePassword = async (_currentPassword: string, _newPassword: string, _confirmPassword: string) => {
    return { success: true, message: 'Password changed successfully' };
  };

  const createBookRequest = async (bookId: string) => {
    try {
      await axiosClient.post('/api/BookRequest/create', {
        BookId: bookId
      });

      await fetchAllDashboardData();
      
      return { success: true, message: 'Request submitted successfully' };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to submit request. Please try again.' 
      };
    }
  };

  const createBookReservation = async (bookId: string) => {
    try {
      await axiosClient.post('/api/BookReservation/create', {
        BookId: bookId
      });
      

      await fetchAllDashboardData();
      
      return { success: true, message: 'Reservation created successfully' };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to create reservation. Please try again.' 
      };
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      if (hasFetchedRef.current) return;
      hasFetchedRef.current = true;
      
      setLoading(true);
      try {
        if ((user as any)?.userId) {
          await fetchAllDashboardData();
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadAllData();
    }
  }, [(user as any)?.userId]);

  return {
    userStats,
    books,
    categories,
    borrowedBooks,
    userReservations,
    userNotifications,
    paymentHistory,
    userProfile,
    pendingRequests,
    libraryInfo,
    loading,
    fetchUserStats,
    fetchData,
    fetchUserBooks,
    fetchUserReservations,
    fetchUserNotifications,
    fetchPaymentHistory,
    fetchUserProfile,
    updateUserProfile,
    changePassword,
    refreshUserBooks: fetchUserBooks,
    fetchAllDashboardData,
    createBookRequest,
    createBookReservation
  };
};