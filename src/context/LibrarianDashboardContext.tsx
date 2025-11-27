import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useLibrarianDashboard } from '../hooks/useLibrarianDashboard';

interface LibrarianDashboardContextType {
  statistics: any;
  books: any[];
  categories: any[];
  members: any[];
  bookRequests: any[];
  activeBookIssues: any[];
  overdueBookIssues: any[];
  bookReservations: any[];
  finePayments: any[];
  fines: any[];
  librarySettings: any;
  currentUser: any;
  loading: boolean;
  refreshData: () => Promise<void>;
  forceRefreshBooks: () => Promise<void>;
  getBooksInCategory: (categoryId: string) => Promise<any[]>;
  addCategory: (categoryData: { name: string; description: string }) => Promise<{ success: boolean; message?: string; data?: any }>;
  updateCategory: (categoryId: string, categoryData: { name: string; description: string }) => Promise<{ success: boolean; message: string }>;
  deleteCategory: (categoryId: string) => Promise<{ success: boolean; message: string }>;
  addBook: (bookData: any) => Promise<{ success: boolean; message?: string; data?: any }>;
  deleteMember: (memberId: string) => { success: boolean; message: string };
  getMemberProfile: (memberId: string) => { success: boolean; message?: string; data?: any };
  getBookCopyByBarcode: (barcode: string) => Promise<{ success: boolean; data?: any; message?: string }>;
  getBookCopyByQRCode: (qrCode: string) => Promise<{ success: boolean; data?: any; message?: string }>;
  issueBook: (issueData: { userId: string; bookCopyId: string; dueDate: string }) => Promise<{ success: boolean; message: string; data?: any }>;
  completePickup: (requestId: string) => Promise<{ success: boolean; message: string }>;
  getBookCopies: (bookId: string) => Promise<any[]>;
  returnBook: (bookIssueId: string) => { success: boolean; message: string };
  approveBookRequest: (requestId: string) => Promise<{ success: boolean; message: string }>;
  rejectBookRequest: (requestId: string, notes?: string) => Promise<{ success: boolean; message: string }>;
  getReturnRequests: () => Promise<any[]>;
  processReturnRequest: (requestId: string, approve: boolean) => { success: boolean; message: string };
  notifyReservationAvailable: (reservationId: string, notes?: string) => { success: boolean; message: string };
  completeReservationPickup: (reservationId: string) => { success: boolean; message: string };
  cancelReservation: (reservationId: string, notes?: string) => { success: boolean; message: string };
  processPayment: (fineId: string, amount: number, paymentMethod: string, notes?: string) => { success: boolean; message: string; data?: any };
  waiveFine: (fineId: string, waiverReason: string, notes?: string) => Promise<{ success: boolean; message: string }>;
  calculateAllFines: () => { success: boolean; message: string };
  updateLibrarySettings: (settingsData: any) => { success: boolean; message: string };
  updateUserProfile: (profileData: any) => Promise<{ success: boolean; message: string }>;
  uploadBookCover: (file: File) => Promise<{ success: boolean; message: string; data?: string }>;
  updateBook: (bookId: string, bookData: any) => Promise<{ success: boolean; message: string }>;
  addBookCopies: (bookId: string, numberOfCopies: number) => Promise<{ success: boolean; message?: string }>;
  deleteBook: (bookId: string) => Promise<{ success: boolean; message: string }>;
}

const LibrarianDashboardContext = createContext<LibrarianDashboardContextType | undefined>(undefined);

export const LibrarianDashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dashboardData = useLibrarianDashboard();

  return (
    <LibrarianDashboardContext.Provider value={dashboardData}>
      {children}
    </LibrarianDashboardContext.Provider>
  );
};

export const useLibrarianDashboardContext = () => {
  const context = useContext(LibrarianDashboardContext);
  if (context === undefined) {
    throw new Error('useLibrarianDashboardContext must be used within a LibrarianDashboardProvider');
  }
  return context;
};