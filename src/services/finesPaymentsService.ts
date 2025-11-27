import axiosClient from '../api/axiosClient';
import { API_ENDPOINTS } from '../api/endpoints';

interface Fine {
  id: string;
  userId: string;
  bookIssueId: string;
  memberName?: string;
  userName?: string;
  memberEmail?: string;
  userEmail?: string;
  bookTitle: string;
  bookId: string;
  daysOverdue: number;
  fineAmount: number;
  status: 'Active' | 'Pending' | 'Paid' | 'Waived' | 'Cancelled';
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  createdDate: string;
  updatedDate?: string;
  waiverReason?: string;
  notes?: string;
}

interface Payment {
  id: string;
  fineId: string;
  userId: string;
  memberName?: string;
  userName?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'Cash' | 'Card' | 'Online' | 'BankTransfer';
  status: 'Completed' | 'Pending' | 'Failed' | 'Refunded';
  transactionId?: string;
  receiptNumber?: string;
  notes?: string;
  processedBy?: string;
}

interface PaymentRequest {
  fineId: string;
  amount: number;
  paymentMethod: 'Cash' | 'Card' | 'Online' | 'BankTransfer';
  notes?: string;
}

interface WaiverRequest {
  fineId: string;
  waiverReason: string;
  notes?: string;
}

class FinesPaymentsService {
  // Fines
  async getAllFines(): Promise<Fine[]> {
    try {
      const response = await axiosClient.post(API_ENDPOINTS.FINES.GET_ALL);

      const fines = response.data.data || response.data || [];
      return await this.processFinesData(fines);
    } catch (error) {
      return this.getOverdueFines();
    }
  }

  async getOverdueFines(): Promise<Fine[]> {
    try {
      const response = await axiosClient.post(API_ENDPOINTS.FINES.GET_OVERDUE);
      const fines = response.data.data || response.data || [];
      return await this.processFinesData(fines);
    } catch (error) {
      return [];
    }
  }

  private async processFinesData(fines: any[]): Promise<Fine[]> {
    const processedFines = await Promise.all(fines.map(async (fine) => {

      
      let bookTitle = fine.bookTitle || fine.BookTitle || fine.book?.title || fine.Book?.Title || 
                     fine.bookIssue?.book?.title || fine.BookIssue?.Book?.Title || 
                     fine.bookName || fine.BookName || fine.title || fine.Title || 
                     fine.bookCopy?.book?.title || fine.BookCopy?.Book?.Title;
      
      if (!bookTitle && (fine.bookIssueId || fine.BookIssueId)) {
        try {
          const issueResponse = await axiosClient.get(`/api/BookIssue/${fine.bookIssueId || fine.BookIssueId}`);
          const issue = issueResponse.data.data || issueResponse.data;
          bookTitle = issue?.book?.title || issue?.Book?.Title || issue?.bookTitle || issue?.BookTitle;
        } catch (error) {
        }
      }
      
      return {
        id: fine.id,
        userId: fine.userId || fine.memberId,
        bookIssueId: fine.bookIssueId || fine.issueId,
        memberName: fine.memberName || fine.userName || fine.user?.name || fine.member?.name,
        userName: fine.userName || fine.memberName || fine.user?.name || fine.member?.name,
        memberEmail: fine.memberEmail || fine.userEmail || fine.user?.email || fine.member?.email,
        userEmail: fine.userEmail || fine.memberEmail || fine.user?.email || fine.member?.email,
        bookTitle: bookTitle || 'Unknown Book',
        bookId: fine.bookId || fine.BookId || fine.book?.id || fine.Book?.Id || fine.bookIssue?.bookId || fine.BookIssue?.BookId,
        daysOverdue: fine.daysOverdue || fine.DaysOverdue || this.calculateOverdueDays(fine.dueDate || fine.DueDate, fine.returnDate || fine.ReturnDate),
        fineAmount: fine.fineAmount || fine.FineAmount || fine.amount || fine.Amount || 0,
        status: fine.status || fine.Status || 'Active',
        issueDate: fine.issueDate || fine.IssueDate || fine.createdDate,
        dueDate: fine.dueDate || fine.DueDate || fine.issueDate,
        returnDate: fine.returnDate || fine.ReturnDate,
        createdDate: fine.createdDate || fine.CreatedDate || new Date().toISOString(),
        updatedDate: fine.updatedDate || fine.UpdatedDate,
        waiverReason: fine.waiverReason || fine.WaiverReason,
        notes: fine.notes || fine.Notes
      };
    }));
    
    return processedFines;
  }

  async getFinesByUser(userId: string): Promise<Fine[]> {
    try {
      const response = await axiosClient.get(API_ENDPOINTS.FINES.GET_BY_USER(userId));
      return response.data.data || response.data || [];
    } catch (error) {
      return [];
    }
  }

  async waiveFine(request: WaiverRequest): Promise<void> {
    try {
      const payload = {
        BookIssueId: request.fineId,
        WaiverReason: request.waiverReason,
        Notes: request.notes || ''
      };
      await axiosClient.post('/api/Fine/waive', payload);
    } catch (error) {
      throw error;
    }
  }

  async adjustFine(fineId: string, newAmount: number, reason: string): Promise<void> {
    try {
      await axiosClient.post(API_ENDPOINTS.FINES.ADJUST_FINE(fineId), {
        newAmount,
        reason
      });
    } catch (error) {
      throw error;
    }
  }

  // Payments
  async getAllPayments(): Promise<Payment[]> {
    try {
      const response = await axiosClient.post(API_ENDPOINTS.PAYMENTS.GET_PAYMENT_HISTORY);
      const payments = response.data.data || response.data || [];
      return this.processPaymentsData(payments);
    } catch (error) {
      try {
        const fallbackResponse = await axiosClient.post(API_ENDPOINTS.PAYMENTS.GET_ALL);
        const payments = fallbackResponse.data.data || fallbackResponse.data || [];
        return this.processPaymentsData(payments);
      } catch (fallbackError) {
        return [];
      }
    }
  }

  private processPaymentsData(payments: any[]): Payment[] {
    return payments.map(payment => ({
      id: payment.id,
      fineId: payment.fineId,
      userId: payment.userId || payment.memberId,
      memberName: payment.memberName || payment.userName || payment.user?.name || payment.member?.name,
      userName: payment.userName || payment.memberName || payment.user?.name || payment.member?.name,
      amount: payment.amount || 0,
      paymentDate: payment.paymentDate || payment.createdDate || new Date().toISOString(),
      paymentMethod: payment.paymentMethod || 'Cash',
      status: payment.status || 'Completed',
      transactionId: payment.transactionId,
      receiptNumber: payment.receiptNumber || payment.id,
      notes: payment.notes,
      processedBy: payment.processedBy
    }));
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    try {
      const response = await axiosClient.get(API_ENDPOINTS.PAYMENTS.GET_BY_USER(userId));
      return response.data.data || response.data || [];
    } catch (error) {
      return [];
    }
  }

  async processPayment(request: PaymentRequest): Promise<Payment> {
    try {

      const waivePayload = {
        WaiverReason: `Payment received via ${request.paymentMethod}`,
        Notes: `Amount: ₹${request.amount} | Method: ${request.paymentMethod} | ${request.notes || ''}`
      };
      
      await axiosClient.post('/api/Fine/waive', {
        BookIssueId: request.fineId,
        WaiverReason: waivePayload.WaiverReason,
        Notes: waivePayload.Notes
      });
    
      const payment = {
        id: Date.now().toString(),
        fineId: request.fineId,
        userId: '',
        amount: request.amount,
        paymentDate: new Date().toISOString(),
        paymentMethod: request.paymentMethod,
        status: 'Completed' as const,
        notes: `Payment processed via waiver: ${request.notes || ''}`
      };
      
      return payment;
    } catch (error: any) {
      throw error;
    }
  }
  
  private getTenantId(): string {
    
    return '2625f0a2-e52f-4294-95a1-3eafb3347372'; 
  }

  async payFine(fineId: string, request: PaymentRequest): Promise<Payment> {
    try {
      const response = await axiosClient.post(API_ENDPOINTS.PAYMENTS.PAY_FINE(fineId), request);
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  }

  async getPaymentReceipt(paymentId: string): Promise<Blob> {
    try {
      const response = await axiosClient.get(API_ENDPOINTS.PAYMENTS.GET_RECEIPT(paymentId), {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getAllFinePayments(): Promise<Payment[]> {
    try {
      const response = await axiosClient.get(API_ENDPOINTS.FINE_PAYMENTS.GET_ALL);
      return response.data.data || response.data || [];
    } catch (error) {
      return [];
    }
  }

  async createFinePayment(payment: Partial<Payment>): Promise<Payment> {
    try {
      const response = await axiosClient.post(API_ENDPOINTS.FINE_PAYMENTS.CREATE, payment);
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  }

  async getFinePaymentsByFine(fineId: string): Promise<Payment[]> {
    try {
      const response = await axiosClient.get(API_ENDPOINTS.FINE_PAYMENTS.GET_BY_FINE(fineId));
      return response.data.data || response.data || [];
    } catch (error) {
      return [];
    }
  }

  calculateOverdueDays(dueDate: string, returnDate?: string): number {
    if (!dueDate) return 0;
    
    const due = new Date(dueDate);
    const returned = returnDate ? new Date(returnDate) : new Date();
    
    const diffTime = returned.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  calculateFineAmount(daysOverdue: number, dailyRate: number = 1): number {
    return Math.max(0, daysOverdue * dailyRate);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
      case 'pending':
        return 'warning';
      case 'paid':
      case 'completed':
        return 'success';
      case 'waived':
      case 'cancelled':
        return 'secondary';
      case 'failed':
        return 'danger';
      default:
        return 'primary';
    }
  }

  getPaymentMethodIcon(method: string): string {
    switch (method.toLowerCase()) {
      case 'cash':
        return 'fa-money-bill';
      case 'card':
        return 'fa-credit-card';
      case 'online':
        return 'fa-globe';
      case 'banktransfer':
        return 'fa-university';
      default:
        return 'fa-dollar-sign';
    }
  }
}

export const finesPaymentsService = new FinesPaymentsService();
export default finesPaymentsService;

export type { Fine, Payment, PaymentRequest, WaiverRequest };