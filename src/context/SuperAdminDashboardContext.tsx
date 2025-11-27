import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useSuperAdminDashboard } from '../hooks/useSuperAdminDashboard';

interface SuperAdminDashboardContextType {
  statistics: any;
  allUsers: any[];
  allBooks: any[];
  systemFines: any[];
  supportTickets: any[];
  pendingRequests: any[];
  allRequests: any[];
  loading: boolean;
  refreshData: () => Promise<void>;
  approveLibrary: (requestId: string) => { success: boolean; message: string };
  rejectLibrary: (requestId: string, reason: string) => { success: boolean; message: string };
}

const SuperAdminDashboardContext = createContext<SuperAdminDashboardContextType | undefined>(undefined);

export const SuperAdminDashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dashboardData = useSuperAdminDashboard();

  return (
    <SuperAdminDashboardContext.Provider value={dashboardData}>
      {children}
    </SuperAdminDashboardContext.Provider>
  );
};

export const useSuperAdminDashboardContext = () => {
  const context = useContext(SuperAdminDashboardContext);
  if (context === undefined) {
    throw new Error('useSuperAdminDashboardContext must be used within a SuperAdminDashboardProvider');
  }
  return context;
};