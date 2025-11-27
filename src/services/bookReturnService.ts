import axiosClient from '../api/axiosClient';
import { API_ENDPOINTS } from '../api/endpoints';

export interface BookIssue {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  bookCopyId: string;
  bookTitle: string;
  bookAuthor: string;
  copyNumber: number;
  issueDate: string;
  dueDate: string;
  status: 'Active' | 'Overdue';
  fineAmount?: number;
}

export interface ReturnResult {
  success: boolean;
  bookTitle: string;
  memberName: string;
  issueDate: string;
  dueDate: string;
  returnDate: string;
  daysOverdue: number;
  fineAmount: number;
  message: string;
}

export class BookReturnService {
  static async findBookCopyByCode(code: string): Promise<string | null> {
    try {
      const barcodeResponse = await axiosClient.get(API_ENDPOINTS.BOOK_COPIES.GET_BY_BARCODE(code));
      if (barcodeResponse.data.data) {
        return barcodeResponse.data.data.id;
      }
    } catch (error) {
      return null;
    }
    return null;
  }

  static async findActiveIssueByBookCopy(bookCopyId: string): Promise<BookIssue | null> {
    try {
      const response = await axiosClient.get(API_ENDPOINTS.BOOK_ISSUES.ACTIVE_ISSUES);
      const activeIssues = response.data.data || [];
      return activeIssues.find((issue: BookIssue) => issue.bookCopyId === bookCopyId) || null;
    } catch (error) {
      throw new Error('Failed to fetch active issues');
    }
  }

  static async processReturn(issueId: string): Promise<ReturnResult> {
    try {
      const response = await axiosClient.post(API_ENDPOINTS.BOOK_ISSUES.RETURN_BOOK, {
        issueId,
        returnDate: new Date().toISOString()
      });
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to process return');
    }
  }

  static calculateFine(dueDate: string): number {
    const due = new Date(dueDate);
    const today = new Date();
    const daysOverdue = Math.ceil((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysOverdue <= 0) return 0;
    
    // $1 per day overdue, max $50
    return Math.min(daysOverdue * 1, 50);
  }

  static getDaysOverdue(dueDate: string): number {
    const due = new Date(dueDate);
    const today = new Date();
    return Math.max(0, Math.ceil((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));
  }

  static generateReceiptContent(returnResult: ReturnResult): string {
    return `
LIBRARY RETURN RECEIPT
=====================

Book: ${returnResult.bookTitle}
Member: ${returnResult.memberName}
Issue Date: ${new Date(returnResult.issueDate).toLocaleDateString()}
Due Date: ${new Date(returnResult.dueDate).toLocaleDateString()}
Return Date: ${new Date(returnResult.returnDate).toLocaleDateString()}

${returnResult.daysOverdue > 0 ? `Days Overdue: ${returnResult.daysOverdue}` : 'Returned On Time'}
${returnResult.fineAmount > 0 ? `Fine Amount: $${returnResult.fineAmount.toFixed(2)}` : 'No Fine'}

Status: ${returnResult.success ? 'RETURNED SUCCESSFULLY' : 'RETURN FAILED'}

Thank you for using our library!
Generated: ${new Date().toLocaleString()}
    `;
  }
}