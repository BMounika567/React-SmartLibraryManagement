import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

export const useLibraryAdminDashboard = () => {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [librarians, setLibrarians] = useState<any[]>([]);
  const [finePayments, setFinePayments] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const hasFetchedRef = useRef(false);

  const fetchAllDashboardData = async (action?: { type: 'approve' | 'reject', userId: string, reason?: string }) => {
    try {
      const payload = action ? {
        Action: {
          Type: action.type,
          UserId: action.userId,
          Reason: action.reason
        }
      } : undefined;
      
      const response = await axiosClient.post('/api/LibraryAdminDashboard/get-dashboard-data', payload);
      const data = response.data.data;
      
      setStatistics(data.Statistics || data.statistics || {});
      setUsers(data.Users || data.users || []);
      setPendingUsers(data.PendingUsers || data.pendingUsers || []);
      setBooks(data.Books || data.books || []);
      setCategories(data.Categories || data.categories || []);
      setLibrarians(data.Librarians || data.librarians || []);
      setFinePayments(data.FinePayments || data.finePayments || []);
      setCurrentUser(data.CurrentUser || data.currentUser || null);
      
      return data.ActionResult || data.actionResult || { success: true };
    } catch (error: any) {
      setStatistics({});
      setUsers([]);
      setPendingUsers([]);
      setBooks([]);
      setCategories([]);
      setLibrarians([]);
      setFinePayments([]);
      setCurrentUser(null);
      return { success: false, message: 'Error processing request' };
    }
  };

  useEffect(() => {
    if (!user || hasFetchedRef.current) return;

    hasFetchedRef.current = true;
    const loadAllData = async () => {
      setLoading(true);
      try {
        await fetchAllDashboardData();
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [user]);

  const approveUser = async (userId: string) => {
    const result = await fetchAllDashboardData({ type: 'approve', userId, reason: 'Approved by admin' });
    return result.success 
      ? { success: true, message: 'User approved successfully!' }
      : { success: false, message: result.message || 'Error approving user' };
  };

  const rejectUser = async (userId: string, reason: string) => {
    const result = await fetchAllDashboardData({ type: 'reject', userId, reason });
    return result.success 
      ? { success: true, message: 'User rejected successfully!' }
      : { success: false, message: result.message || 'Error rejecting user' };
  };

  const addBook = async (bookData: any) => {
    try {
      const response = await axiosClient.post('/api/LibraryAdminDashboard/create-book', bookData);
      const newBook = response.data.data;
      setBooks(prev => [...prev, newBook]);
      return { success: true, message: 'Book added successfully!' };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Error adding book' };
    }
  };

  const updateBook = async (bookData: any) => {
    try {
      const response = await axiosClient.post('/api/LibraryAdminDashboard/update-book', bookData);
      const updatedBook = response.data.data;
      setBooks(prev => prev.map(book => book.id === updatedBook.id ? updatedBook : book));
      return { success: true, message: 'Book updated successfully!' };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Error updating book' };
    }
  };

  const deleteBook = async (bookId: string) => {
    try {
      await axiosClient.post('/api/Book/delete', { Id: bookId });
      setBooks(prev => prev.filter(book => book.id !== bookId));
      return { success: true, message: 'Book deleted successfully!' };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Error deleting book' };
    }
  };

  const inviteLibrarian = async (inviteData: any) => {
    try {
      await axiosClient.post('/api/LibraryAdminDashboard/invite-librarian', inviteData);
      return { success: true, message: 'Librarian invitation sent successfully!' };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Error sending invitation' };
    }
  };

  const removeLibrarian = (librarianId: string) => {
    setLibrarians(prev => prev.filter(lib => lib.id !== librarianId));
    setUsers(prev => prev.filter(user => user.id !== librarianId));
    return { success: true, message: 'Librarian removed from list!' };
  };

  const deleteUser = async (userId: string) => {
    try {
      await axiosClient.post('/api/LibraryAdminDashboard/delete-user', { Id: userId });
      setUsers(prev => prev.filter(user => user.id !== userId));
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
      return { success: true, message: 'User deleted successfully!' };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Error deleting user' };
    }
  };

  const waiveFine = async (fineId: string, waiverReason: string, notes?: string) => {
    try {
      const { finesPaymentsService } = await import('../services/finesPaymentsService');
      await finesPaymentsService.waiveFine({ fineId, waiverReason, notes });
      await fetchAllDashboardData();
      return { success: true, message: 'Fine waived successfully!' };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to waive fine' 
      };
    }
  };

  return {
    statistics,
    users,
    pendingUsers,
    books,
    categories,
    librarians,
    finePayments,
    currentUser,
    loading,
    fetchAllDashboardData,
    refreshData: fetchAllDashboardData,
    approveUser,
    rejectUser,
    addBook,
    updateBook,
    deleteBook,
    inviteLibrarian,
    removeLibrarian,
    deleteUser,
    waiveFine
  };
};