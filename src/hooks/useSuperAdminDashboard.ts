import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

export const useSuperAdminDashboard = () => {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState<any>({});
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allBooks, setAllBooks] = useState<any[]>([]);
  const [systemFines, setSystemFines] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetchedRef = useRef(false);

  const fetchAllDashboardData = async () => {
    try {
      const response = await axiosClient.post('/api/SuperAdminDashboard/get-dashboard-data');
      const data = response.data.data;
      
      setStatistics(data.statistics || {});
      setAllUsers(data.allUsers || []);
      setAllBooks(data.allBooks || []);
      setSystemFines(data.systemFines || []);
      setSupportTickets(data.supportTickets || []);
      setPendingRequests(data.pendingRequests || []);
      setAllRequests(data.allRequests || []);
    } catch (error) {
      setStatistics({});
      setAllUsers([]);
      setAllBooks([]);
      setSystemFines([]);
      setSupportTickets([]);
      setPendingRequests([]);
      setAllRequests([]);
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

  const approveLibrary = (requestId: string) => {
    setPendingRequests(prev => prev.filter(r => r.id !== requestId));
    setAllRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'Approved' } : r));
    return { success: true, message: 'Library approved successfully!' };
  };

  const rejectLibrary = (requestId: string, reason: string) => {
    setPendingRequests(prev => prev.filter(r => r.id !== requestId));
    setAllRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'Rejected' } : r));
    return { success: true, message: 'Library rejected successfully!' };
  };

  return {
    statistics,
    allUsers,
    allBooks,
    systemFines,
    supportTickets,
    pendingRequests,
    allRequests,
    loading,
    fetchAllDashboardData,
    refreshData: fetchAllDashboardData,
    approveLibrary,
    rejectLibrary
  };
};