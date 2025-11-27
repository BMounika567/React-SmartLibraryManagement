import React, { createContext, useContext } from 'react';
import { useLibraryAdminDashboard } from '../hooks/useLibraryAdminDashboard';

interface LibraryAdminDashboardContextType {
  statistics: any;
  users: any[];
  pendingUsers: any[];
  books: any[];
  categories: any[];
  librarians: any[];
  finePayments: any[];
  currentUser: any;
  loading: boolean;
  refreshData: () => Promise<void>;
  approveUser: (userId: string) => Promise<{ success: boolean; message: string }>;
  rejectUser: (userId: string, reason: string) => Promise<{ success: boolean; message: string }>;
  addBook: (bookData: any) => Promise<{ success: boolean; message: string }>;
  updateBook: (bookData: any) => Promise<{ success: boolean; message: string }>;
  deleteBook: (bookId: string) => Promise<{ success: boolean; message: string }>;
  inviteLibrarian: (inviteData: any) => Promise<{ success: boolean; message: string }>;
  removeLibrarian: (librarianId: string) => { success: boolean; message: string };
  deleteUser: (userId: string) => Promise<{ success: boolean; message: string }>;
  waiveFine: (fineId: string, waiverReason: string, notes?: string) => Promise<{ success: boolean; message: string }>;
}

const LibraryAdminDashboardContext = createContext<LibraryAdminDashboardContextType | undefined>(undefined);

export const LibraryAdminDashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dashboardData = useLibraryAdminDashboard();

  return (
    <LibraryAdminDashboardContext.Provider value={dashboardData}>
      {children}
    </LibraryAdminDashboardContext.Provider>
  );
};

export const useLibraryAdminDashboardContext = () => {
  const context = useContext(LibraryAdminDashboardContext);
  if (context === undefined) {
    throw new Error('useLibraryAdminDashboardContext must be used within a LibraryAdminDashboardProvider');
  }
  return context;
};