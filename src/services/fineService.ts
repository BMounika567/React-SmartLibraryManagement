import axiosClient from '../api/axiosClient';

export interface FinePayment {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
}

export interface BookIssueWithFine {
  id: string;
  userId: string;
  fineAmount: number;
  dueDate: string;
  issueDate: string;
  returnDate?: string;
  isReturned: boolean;
  user: {
    id: string;
    name: string;
    email: string;
  };
  bookCopy: {
    book: {
      id: string;
      title: string;
      author: string;
    };
  };
  finePayments: FinePayment[];
}

export interface ProcessedFine {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  bookTitle: string;
  bookAuthor: string;
  fineAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: 'pending' | 'paid' | 'partial';
  dueDate: string;
  issueDate: string;
  returnDate?: string;
  isReturned: boolean;
  payments: FinePayment[];
}

class FineService {
  async getAllFines(): Promise<ProcessedFine[]> {
    try {
      const response = await axiosClient.post('/api/LibrarianData/get-dashboard-data', {
        action: 'get-all-fines'
      });
      return this.processFineData(response.data.data);
    } catch (error) {
      throw error;
    }
  }

  async getOverdueFines(): Promise<ProcessedFine[]> {
    try {
      const response = await axiosClient.post('/api/LibrarianData/get-dashboard-data', {
        action: 'get-overdue-fines'
      });
      return this.processFineData(response.data.data);
    } catch (error) {
      throw error;
    }
  }

  async getUserFines(userId: string): Promise<ProcessedFine[]> {
    try {
      const response = await axiosClient.post('/api/LibrarianData/get-dashboard-data', {
        action: 'get-user-fines',
        userId: userId
      });
      return this.processFineData(response.data.data);
    } catch (error) {
      throw error;
    }
  }

  private processFineData(fines: any[]): ProcessedFine[] {
    return fines.map(fine => ({
      id: fine.id,
      userId: fine.userId,
      userName: fine.userName,
      userEmail: fine.userEmail,
      bookTitle: fine.bookTitle,
      bookAuthor: fine.bookAuthor,
      fineAmount: fine.fineAmount,
      paidAmount: fine.paidAmount,
      pendingAmount: fine.pendingAmount,
      status: fine.status as 'pending' | 'paid' | 'partial',
      dueDate: fine.dueDate,
      issueDate: fine.issueDate,
      returnDate: fine.returnDate,
      isReturned: fine.isReturned,
      payments: fine.payments || []
    }));
  }

  getPendingFines(fines: ProcessedFine[]): ProcessedFine[] {
    return fines.filter(fine => fine.status === 'pending' || fine.status === 'partial');
  }

  getPaidFines(fines: ProcessedFine[]): ProcessedFine[] {
    return fines.filter(fine => fine.status === 'paid');
  }

  getTotalPendingAmount(fines: ProcessedFine[]): number {
    return fines.reduce((sum, fine) => sum + fine.pendingAmount, 0);
  }

  getTotalPaidAmount(fines: ProcessedFine[]): number {
    return fines.reduce((sum, fine) => sum + fine.paidAmount, 0);
  }
}

export const fineService = new FineService();