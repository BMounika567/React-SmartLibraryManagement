import { useState, useEffect } from 'react';
import { fineService } from '../services/fineService';
import type { ProcessedFine } from '../services/fineService';

export const useFines = () => {
  const [allFines, setAllFines] = useState<ProcessedFine[]>([]);
  const [overdueFines, setOverdueFines] = useState<ProcessedFine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllFines = async () => {
    setLoading(true);
    setError(null);
    try {
      const fines = await fineService.getAllFines();
      setAllFines(fines);
    } catch (err) {
      setError('Failed to fetch fines');
    } finally {
      setLoading(false);
    }
  };

  const fetchOverdueFines = async () => {
    setLoading(true);
    setError(null);
    try {
      const fines = await fineService.getOverdueFines();
      setOverdueFines(fines);
    } catch (err) {
      setError('Failed to fetch overdue fines');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserFines = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const fines = await fineService.getUserFines(userId);
      return fines;
    } catch (err) {
      setError('Failed to fetch user fines');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getPendingFines = (fines: ProcessedFine[] = allFines) => {
    return fineService.getPendingFines(fines);
  };

  const getPaidFines = (fines: ProcessedFine[] = allFines) => {
    return fineService.getPaidFines(fines);
  };

  const getTotalPendingAmount = (fines: ProcessedFine[] = allFines) => {
    return fineService.getTotalPendingAmount(fines);
  };

  const getTotalPaidAmount = (fines: ProcessedFine[] = allFines) => {
    return fineService.getTotalPaidAmount(fines);
  };

  useEffect(() => {
    fetchAllFines();
  }, []);

  return {
    allFines,
    overdueFines,
    loading,
    error,
    fetchAllFines,
    fetchOverdueFines,
    fetchUserFines,
    getPendingFines,
    getPaidFines,
    getTotalPendingAmount,
    getTotalPaidAmount,
    refetch: fetchAllFines
  };
};