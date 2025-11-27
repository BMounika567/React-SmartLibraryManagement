import React, { useState } from 'react';
import axiosClient from '../api/axiosClient';
import Dialog from './common/Dialog';
import { useLibrarianDashboardContext } from '../context/LibrarianDashboardContext';

interface BookIssue {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  bookCopyId: string;
  bookTitle: string;
  bookAuthor: string;
  copyNumber: number;
  barcode: string;
  issueDate: string;
  dueDate: string;
  status: 'Active' | 'Overdue';
  fineAmount?: number;
}

interface ReturnResult {
  success: boolean;
  bookTitle: string;
  memberName: string;
  issueDate: string;
  dueDate: string;
  returnDate: string;
  daysOverdue: number;
  fineAmount: number;
  message: string;
  receipt?: any;
}

const BookReturnSystem: React.FC = () => {
  const { activeBookIssues, refreshData } = useLibrarianDashboardContext();
  const [scannedCode, setScannedCode] = useState('');
  const [foundIssue, setFoundIssue] = useState<BookIssue | null>(null);
  const [scanError, setScanError] = useState('');
  const [loading, setLoading] = useState(false);
  const [returnResult, setReturnResult] = useState<ReturnResult | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [showOnlinePayment, setShowOnlinePayment] = useState(false);
  const [showOfflinePayment, setShowOfflinePayment] = useState(false);
  const [qrCode, setQrCode] = useState<any>(null);
  const [dialog, setDialog] = useState<{isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'info', showConfirm?: boolean, onConfirm?: () => void}>({isOpen: false, title: '', message: '', type: 'info'});

  const handleBarcodeScan = async (code: string) => {
    setScanError('');
    setFoundIssue(null);
    setReturnResult(null);
    setScannedCode(code);
    setLoading(true);
    
    try {
      // Find active issue by matching barcode directly
      const issue = activeBookIssues.find((issue: any) => issue.barcode === code);
      
      if (issue) {
        setFoundIssue(issue);
        setShowConfirmation(true);
      } else {
        setScanError('This book is not currently issued to any member.');
      }
    } catch (error: any) {
      setScanError('Error searching for book: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleManualCodeEntry = async () => {
    if (scannedCode.trim()) {
      await handleBarcodeScan(scannedCode.trim());
    }
  };

  const calculateFine = (dueDate: string): number => {
    const due = new Date(dueDate);
    const today = new Date();
    const daysOverdue = Math.ceil((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysOverdue <= 0) return 0;
    

    return Math.min(daysOverdue * 1, 50);
  };

  const getDaysOverdue = (dueDate: string): number => {
    const due = new Date(dueDate);
    const today = new Date();
    return Math.ceil((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleConfirmReturn = async () => {
    if (!foundIssue) return;
    
    setLoading(true);
    try {
      const fineAmount = calculateFine(foundIssue.dueDate);
      
      // Check if payment is required
      if (fineAmount > 0) {
        setPaymentData({
          bookIssueId: foundIssue.id,
          fineAmount: fineAmount,
          overdueDays: getDaysOverdue(foundIssue.dueDate),
          bookTitle: foundIssue.bookTitle
        });
        setShowConfirmation(false);
        setShowPaymentModal(true);
        return;
      }
      
      // No fine, process return via API
      const response = await axiosClient.post('/api/BookIssue/return', {
        BookIssueId: foundIssue.id
      });
      
      if (response.data.success) {
        // Capture member name before clearing foundIssue
        const memberName = foundIssue.userName;
        
        const returnResult: ReturnResult = {
          success: true,
          bookTitle: foundIssue.bookTitle,
          memberName: memberName,
          issueDate: foundIssue.issueDate,
          dueDate: foundIssue.dueDate,
          returnDate: new Date().toISOString(),
          daysOverdue: 0,
          fineAmount: 0,
          message: 'Book returned successfully'
        };
        
        setReturnResult(returnResult);
        setFoundIssue(null);
        setShowConfirmation(false);
        setScannedCode('');
        
        // Refresh dashboard data to update UI
        await refreshData();
      } else {
        setScanError(response.data.message || 'Failed to return book');
        setShowConfirmation(false);
      }
    } catch (error: any) {
      setScanError(error.response?.data?.message || 'Error processing return');
      setShowConfirmation(false);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setScannedCode('');
    setFoundIssue(null);
    setScanError('');
    setReturnResult(null);
    setShowConfirmation(false);
    setShowPaymentModal(false);
    setShowOnlinePayment(false);
    setShowOfflinePayment(false);
    setPaymentData(null);
    setQrCode(null);
    setLoading(false);
  };

  const handleOnlinePayment = async (_paymentMethod: string) => {
    try {
      setLoading(true);
      
      // Use static QR code data for demo
      const staticQrData = {
        merchantId: "LIBRARY001",
        amount: paymentData.fineAmount,
        currency: "INR",
        transactionId: `TXN${Date.now()}`,
        description: `Library Fine Payment - ₹${paymentData.fineAmount}`
      };
      
      setQrCode(staticQrData);
      setShowPaymentModal(false);
      setShowOnlinePayment(true);
    } catch (error: any) {
      setScanError('Error generating payment QR: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const confirmOnlinePayment = async () => {
    try {
      setLoading(true);
      
      // Process online payment
      await axiosClient.post('/api/BookIssue/process-online-payment', {
        BookIssueId: paymentData.bookIssueId,
        Amount: paymentData.fineAmount,
        PaymentMethod: 'PhonePe',
        TransactionId: qrCode.transactionId
      });
      
      // Complete book return with payment
      const returnResponse = await axiosClient.post('/api/BookIssue/return-with-payment', {
        BookIssueId: paymentData.bookIssueId,
        PaymentAmount: paymentData.fineAmount,
        PaymentMethod: 'Online',
        OnlinePaymentId: qrCode.transactionId
      });
      
      setReturnResult({
        success: true,
        bookTitle: paymentData.bookTitle,
        memberName: foundIssue?.userName || '',
        issueDate: foundIssue?.issueDate || '',
        dueDate: foundIssue?.dueDate || '',
        returnDate: new Date().toISOString(),
        daysOverdue: paymentData.overdueDays,
        fineAmount: paymentData.fineAmount,
        message: 'Payment successful and book returned',
        receipt: returnResponse.data.receipt
      });
      
      setShowOnlinePayment(false);
      setFoundIssue(null);
      setScannedCode('');
      
      // Refresh dashboard data to update UI
      await refreshData();
    } catch (error: any) {
      setScanError('Error processing payment: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOfflinePayment = () => {
    setShowPaymentModal(false);
    setShowOfflinePayment(true);
  };

  const confirmOfflinePayment = async (receiptId: string, librarianId: string) => {
    try {
      setLoading(true);
      
      await axiosClient.post('/api/BookIssue/process-offline-payment', {
        BookIssueId: paymentData.bookIssueId,
        Amount: paymentData.fineAmount,
        ReceiptId: receiptId,
        LibrarianId: librarianId
      });
      
      const returnResponse = await axiosClient.post('/api/BookIssue/return-with-payment', {
        BookIssueId: paymentData.bookIssueId,
        PaymentAmount: paymentData.fineAmount,
        PaymentMethod: 'Offline',
        PaymentReceiptId: receiptId
      });
      
      setReturnResult({
        success: true,
        bookTitle: paymentData.bookTitle,
        memberName: foundIssue?.userName || '',
        issueDate: foundIssue?.issueDate || '',
        dueDate: foundIssue?.dueDate || '',
        returnDate: new Date().toISOString(),
        daysOverdue: paymentData.overdueDays,
        fineAmount: paymentData.fineAmount,
        message: 'Cash payment recorded and book returned',
        receipt: returnResponse.data.receipt
      });
      
      setShowOfflinePayment(false);
      setFoundIssue(null);
      setScannedCode('');
      
      // Refresh dashboard data to update UI
      await refreshData();
    } catch (error: any) {
      setScanError('Error processing offline payment: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = () => {
    if (!returnResult) return;
    
    const receiptContent = `
      LIBRARY RETURN RECEIPT
      =====================
      
      Book: ${returnResult.bookTitle}
      Member: ${returnResult.memberName}
      Issue Date: ${new Date(returnResult.issueDate).toLocaleDateString()}
      Due Date: ${new Date(returnResult.dueDate).toLocaleDateString()}
      Return Date: ${new Date(returnResult.returnDate).toLocaleDateString()}
      
      ${returnResult.daysOverdue > 0 ? `Days Overdue: ${returnResult.daysOverdue}` : 'Returned On Time'}
      ${returnResult.fineAmount > 0 ? `Fine Amount: ₹${returnResult.fineAmount.toFixed(2)}` : 'No Fine'}
      ${returnResult.receipt ? `Payment Method: ${returnResult.receipt.paymentMethod}` : ''}
      ${returnResult.receipt ? `Receipt ID: ${returnResult.receipt.paymentReceiptNumber}` : ''}
      
      Status: ${returnResult.success ? 'RETURNED SUCCESSFULLY' : 'RETURN FAILED'}
      
      Thank you for using our library!
      Generated: ${new Date().toLocaleString()}
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Return Receipt</title></head>
          <body style="font-family: monospace; white-space: pre-line; padding: 20px;">
            ${receiptContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const emailReceipt = async () => {
    if (!returnResult || !returnResult.receipt) {
      setDialog({
        isOpen: true,
        title: 'Error',
        message: 'No receipt data available',
        type: 'error'
      });
      return;
    }

    const userEmail = foundIssue?.userEmail || prompt('Enter email address to send receipt:');
    if (!userEmail) return;

    try {
      setLoading(true);
      
      await axiosClient.post('/api/BookIssue/email-receipt', {
        Email: userEmail,
        Receipt: returnResult.receipt
      });
      
      setDialog({
        isOpen: true,
        title: 'Success',
        message: `Receipt sent successfully to ${userEmail}`,
        type: 'success'
      });
    } catch (error: any) {
      setDialog({
        isOpen: true,
        title: 'Error',
        message: 'Failed to send email: ' + (error.response?.data?.message || error.message),
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4" style={{ minHeight: '100vh' }}>
      <div className="row">
        <div className="col-12">
          <div className="card border-0" style={{ background: 'white', borderRadius: '16px' }}>
            <div className="card-body p-4">
              {/* Book Return Input Section */}
              <div className="mb-4">
                <h5 className="fw-bold mb-3" style={{ color: '#000000', fontSize: '18px' }}>
                  Enter Book Code to Return
                </h5>
                <p className="mb-4" style={{ color: '#000000', fontSize: '14px' }}>
                  Scan or enter the barcode/QR code of the book being returned
                </p>
                
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border" style={{ width: '3rem', height: '3rem', color: '#000000' }} role="status">
                      <span className="visually-hidden">Searching...</span>
                    </div>
                    <p className="mt-3" style={{ color: '#000000', fontWeight: '500' }}>Searching for book...</p>
                  </div>
                ) : (
                  <div style={{ position: 'relative', maxWidth: '600px' }}>
                    <input
                      type="text"
                      className="form-control"
                      style={{ 
                        borderRadius: '50px', 
                        border: '1px solid #d1d5db', 
                        padding: '0.75rem 3.5rem 0.75rem 1.5rem', 
                        fontSize: '15px',
                        color: '#000000'
                      }}
                      placeholder="Enter barcode or QR code"
                      value={scannedCode}
                      onChange={(e) => setScannedCode(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleManualCodeEntry()}
                    />
                    <button 
                      className="btn"
                      style={{ 
                        position: 'absolute',
                        right: '4px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent', 
                        border: 'none', 
                        color: '#000000', 
                        padding: '0.5rem 1rem', 
                        fontWeight: '600' 
                      }}
                      onClick={handleManualCodeEntry}
                      disabled={!scannedCode.trim()}
                    >
                      <i className="fas fa-search"></i>
                    </button>
                  </div>
                )}
                
                {scanError && (
                  <div className="alert border-0 mt-3" style={{ 
                    background: '#fee2e2', 
                    borderLeft: '4px solid #dc2626', 
                    borderRadius: '8px', 
                    padding: '1rem' 
                  }}>
                    <i className="fas fa-exclamation-circle me-2" style={{ color: '#dc2626' }}></i>
                    <span style={{ color: '#000000', fontWeight: '500' }}>{scanError}</span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <hr style={{ border: 'none', borderTop: '2px solid #B3CFE5', margin: '2rem 0' }} />

              {/* Return Status Section */}
              <div>
                <h5 className="fw-bold mb-3" style={{ color: '#000000', fontSize: '18px' }}>
                  Return Status
                </h5>
                
                {returnResult ? (
                  <div style={{ 
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px', 
                    padding: '1rem'
                  }}>
                    <h6 className="fw-bold mb-2" style={{ color: '#10b981', fontSize: '14px' }}>Return Completed Successfully!</h6>
                    <div className="mb-1" style={{ color: '#000000', fontSize: '13px' }}>
                      <strong>Book:</strong> {returnResult.bookTitle}
                    </div>
                    <div className="mb-1" style={{ color: '#000000', fontSize: '13px' }}>
                      <strong>Member:</strong> {returnResult.memberName}
                    </div>
                    <div className="mb-1" style={{ color: '#000000', fontSize: '13px' }}>
                      <strong>Return Date:</strong> {new Date(returnResult.returnDate).toLocaleDateString()}
                    </div>
                    {returnResult.daysOverdue > 0 && (
                      <div className="mb-1" style={{ color: '#000000', fontSize: '13px' }}>
                        <strong>Days Overdue:</strong> {returnResult.daysOverdue} days
                      </div>
                    )}
                    {returnResult.fineAmount > 0 && (
                      <div className="mb-1" style={{ color: '#000000', fontSize: '13px' }}>
                        <strong>Fine Paid:</strong> ₹{returnResult.fineAmount.toFixed(2)}
                      </div>
                    )}
                    {returnResult.receipt && (
                      <>
                        <div className="mb-1" style={{ color: '#000000', fontSize: '13px' }}>
                          <strong>Payment Method:</strong> {returnResult.receipt.paymentMethod}
                        </div>
                        <div className="mb-1" style={{ color: '#000000', fontSize: '13px' }}>
                          <strong>Receipt ID:</strong> {returnResult.receipt.paymentReceiptNumber}
                        </div>
                      </>
                    )}
                    <div className="mt-2 d-flex gap-2 flex-wrap">
                      <button 
                        className="btn btn-sm fw-bold"
                        style={{ borderRadius: '6px', background: '#4A7FA7', color: 'white', border: 'none', fontSize: '12px', padding: '0.4rem 0.8rem' }}
                        onClick={resetForm}
                      >
                        <i className="fas fa-plus me-1"></i>
                        New Return
                      </button>
                      <button 
                        className="btn btn-sm fw-bold"
                        style={{ borderRadius: '6px', background: 'white', color: '#000000', border: '1px solid #e5e7eb', fontSize: '12px', padding: '0.4rem 0.8rem' }}
                        onClick={printReceipt}
                      >
                        <i className="fas fa-print me-1"></i>
                        Print
                      </button>
                      <button 
                        className="btn btn-sm fw-bold"
                        style={{ borderRadius: '6px', background: 'white', color: '#000000', border: '1px solid #e5e7eb', fontSize: '12px', padding: '0.4rem 0.8rem' }}
                        onClick={emailReceipt}
                      >
                        <i className="fas fa-envelope me-1"></i>
                        Email
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-5" style={{ border: '2px dashed #B3CFE5', borderRadius: '12px' }}>
                    <i className="fas fa-book-open mb-3" style={{ fontSize: '3rem', color: '#4A7FA7' }}></i>
                    <p style={{ color: '#000000', fontSize: '14px', marginBottom: 0 }}>
                      Enter book code to process return
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Return Confirmation Modal */}
      {showConfirmation && foundIssue && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content" style={{ border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
              <div className="modal-header" style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem 1.5rem' }}>
                <h5 className="modal-title fw-bold" style={{ color: '#000000', fontSize: '16px' }}>Confirm Book Return</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowConfirmation(false)}
                ></button>
              </div>
              <div className="modal-body" style={{ padding: '1.5rem' }}>
                <div className="row g-2">
                  <div className="col-12">
                    <div style={{ background: 'white', borderRadius: '6px', border: '1px solid #e5e7eb', padding: '0.75rem' }}>
                      <h6 className="fw-bold mb-1" style={{ color: '#000000', fontSize: '14px' }}>{foundIssue.bookTitle}</h6>
                      <p className="mb-1" style={{ color: '#6b7280', fontSize: '12px' }}>by {foundIssue.bookAuthor}</p>
                      <span style={{ background: '#f3f4f6', color: '#000000', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>Copy #{foundIssue.copyNumber}</span>
                    </div>
                  </div>
                  
                  <div className="col-6">
                    <div style={{ background: 'white', borderRadius: '6px', border: '1px solid #e5e7eb', padding: '0.75rem' }}>
                      <small className="d-block fw-bold" style={{ color: '#6b7280', fontSize: '11px', marginBottom: '2px' }}>Issued To</small>
                      <strong style={{ color: '#000000', fontSize: '13px', display: 'block' }}>{foundIssue.userName}</strong>
                      <small style={{ color: '#6b7280', fontSize: '11px' }}>{foundIssue.userEmail}</small>
                    </div>
                  </div>
                  
                  <div className="col-6">
                    <div style={{ background: 'white', borderRadius: '6px', border: '1px solid #e5e7eb', padding: '0.75rem' }}>
                      <small className="d-block fw-bold" style={{ color: '#6b7280', fontSize: '11px', marginBottom: '2px' }}>Issue Date</small>
                      <strong style={{ color: '#000000', fontSize: '13px' }}>{new Date(foundIssue.issueDate).toLocaleDateString()}</strong>
                    </div>
                  </div>
                  
                  <div className="col-6">
                    <div style={{ background: 'white', borderRadius: '6px', border: '1px solid #e5e7eb', padding: '0.75rem' }}>
                      <small className="d-block fw-bold" style={{ color: '#6b7280', fontSize: '11px', marginBottom: '2px' }}>Due Date</small>
                      <strong style={{ color: '#000000', fontSize: '13px' }}>{new Date(foundIssue.dueDate).toLocaleDateString()}</strong>
                    </div>
                  </div>
                  
                  <div className="col-6">
                    <div style={{ background: 'white', borderRadius: '6px', border: `1px solid ${getDaysOverdue(foundIssue.dueDate) > 0 ? '#dc3545' : '#10b981'}`, padding: '0.75rem' }}>
                      <small className="d-block fw-bold" style={{ color: '#6b7280', fontSize: '11px', marginBottom: '2px' }}>Days Overdue</small>
                      <strong style={{ color: getDaysOverdue(foundIssue.dueDate) > 0 ? '#dc3545' : '#10b981', fontSize: '13px' }}>
                        {getDaysOverdue(foundIssue.dueDate) > 0 
                          ? `${getDaysOverdue(foundIssue.dueDate)} days` 
                          : 'On Time'
                        }
                      </strong>
                    </div>
                  </div>
                </div>
                
                {calculateFine(foundIssue.dueDate) > 0 && (
                  <div style={{ background: 'white', border: '1px solid #fbbf24', borderRadius: '6px', padding: '0.75rem', marginTop: '0.75rem' }}>
                    <h6 className="fw-bold mb-0" style={{ color: '#000000', fontSize: '13px' }}>Fine Due: ₹{calculateFine(foundIssue.dueDate).toFixed(2)}</h6>
                    <small style={{ color: '#6b7280', fontSize: '11px' }}>This book is {getDaysOverdue(foundIssue.dueDate)} days overdue</small>
                  </div>
                )}
              </div>
              <div className="modal-footer" style={{ background: 'white', borderTop: '1px solid #e5e7eb', padding: '1rem 1.5rem' }}>
                <button 
                  type="button" 
                  className="btn fw-bold" 
                  style={{ borderRadius: '6px', padding: '0.5rem 1rem', background: 'white', border: '1px solid #e5e7eb', color: '#000000', fontSize: '13px' }}
                  onClick={() => setShowConfirmation(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn fw-bold"
                  style={{ background: '#000000', border: 'none', borderRadius: '6px', color: 'white', padding: '0.5rem 1rem', fontSize: '13px' }}
                  onClick={handleConfirmReturn}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Processing...
                    </>
                  ) : (
                    'Confirm Return'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Options Modal */}
      {showPaymentModal && paymentData && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content" style={{ border: 'none', borderRadius: '20px' }}>
              <div className="modal-header border-0" style={{ background: 'linear-gradient(135deg, #dc3545, #c82333)', color: 'white', borderRadius: '20px 20px 0 0' }}>
                <h4 className="modal-title fw-bold">Pay Fine - ₹{paymentData.fineAmount}</h4>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowPaymentModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="text-center mb-4">
                  <h5>Choose Payment Method</h5>
                  <p className="text-muted">Book: {paymentData.bookTitle}</p>
                  <p className="text-danger">Fine Amount: ₹{paymentData.fineAmount} ({paymentData.overdueDays} days overdue)</p>
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <button 
                      className="btn btn-primary w-100 p-3" 
                      style={{ borderRadius: '15px' }}
                      onClick={() => handleOnlinePayment('PhonePe')}
                    >
                      <i className="fas fa-mobile-alt mb-2 fs-3"></i>
                      <br />Pay Online
                      <br /><small>PhonePe / GooglePay / Paytm</small>
                    </button>
                  </div>
                  <div className="col-md-6">
                    <button 
                      className="btn btn-success w-100 p-3" 
                      style={{ borderRadius: '15px' }}
                      onClick={handleOfflinePayment}
                    >
                      <i className="fas fa-money-bill-wave mb-2 fs-3"></i>
                      <br />Pay at Counter
                      <br /><small>Cash Payment</small>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Online Payment Modal */}
      {showOnlinePayment && qrCode && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content" style={{ border: 'none', borderRadius: '20px' }}>
              <div className="modal-header border-0" style={{ background: 'linear-gradient(135deg, #007bff, #0056b3)', color: 'white', borderRadius: '20px 20px 0 0' }}>
                <h4 className="modal-title fw-bold"> Scan QR Code to Pay</h4>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowOnlinePayment(false)}></button>
              </div>
              <div className="modal-body p-4 text-center">
                <div className="mb-4">
                  <div className="bg-light p-4" style={{ borderRadius: '15px', display: 'inline-block' }}>
                    <div style={{ width: '200px', height: '200px', background: 'white', border: '2px solid #dee2e6', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\' viewBox=\'0 0 200 200\'%3E%3Crect width=\'200\' height=\'200\' fill=\'white\'/%3E%3Cg fill=\'black\'%3E%3Crect x=\'10\' y=\'10\' width=\'30\' height=\'30\'/%3E%3Crect x=\'50\' y=\'10\' width=\'10\' height=\'10\'/%3E%3Crect x=\'70\' y=\'10\' width=\'10\' height=\'10\'/%3E%3Crect x=\'90\' y=\'10\' width=\'10\' height=\'10\'/%3E%3Crect x=\'110\' y=\'10\' width=\'10\' height=\'10\'/%3E%3Crect x=\'130\' y=\'10\' width=\'10\' height=\'10\'/%3E%3Crect x=\'160\' y=\'10\' width=\'30\' height=\'30\'/%3E%3Crect x=\'10\' y=\'50\' width=\'10\' height=\'10\'/%3E%3Crect x=\'30\' y=\'50\' width=\'10\' height=\'10\'/%3E%3Crect x=\'50\' y=\'50\' width=\'10\' height=\'10\'/%3E%3Crect x=\'70\' y=\'50\' width=\'10\' height=\'10\'/%3E%3Crect x=\'90\' y=\'50\' width=\'10\' height=\'10\'/%3E%3Crect x=\'110\' y=\'50\' width=\'10\' height=\'10\'/%3E%3Crect x=\'130\' y=\'50\' width=\'10\' height=\'10\'/%3E%3Crect x=\'160\' y=\'50\' width=\'10\' height=\'10\'/%3E%3Crect x=\'180\' y=\'50\' width=\'10\' height=\'10\'/%3E%3Crect x=\'10\' y=\'70\' width=\'10\' height=\'10\'/%3E%3Crect x=\'30\' y=\'70\' width=\'10\' height=\'10\'/%3E%3Crect x=\'50\' y=\'70\' width=\'10\' height=\'10\'/%3E%3Crect x=\'70\' y=\'70\' width=\'10\' height=\'10\'/%3E%3Crect x=\'90\' y=\'70\' width=\'10\' height=\'10\'/%3E%3Crect x=\'110\' y=\'70\' width=\'10\' height=\'10\'/%3E%3Crect x=\'130\' y=\'70\' width=\'10\' height=\'10\'/%3E%3Crect x=\'160\' y=\'70\' width=\'10\' height=\'10\'/%3E%3Crect x=\'180\' y=\'70\' width=\'10\' height=\'10\'/%3E%3Crect x=\'10\' y=\'160\' width=\'30\' height=\'30\'/%3E%3Crect x=\'50\' y=\'160\' width=\'10\' height=\'10\'/%3E%3Crect x=\'70\' y=\'160\' width=\'10\' height=\'10\'/%3E%3Crect x=\'90\' y=\'160\' width=\'10\' height=\'10\'/%3E%3Crect x=\'110\' y=\'160\' width=\'10\' height=\'10\'/%3E%3Crect x=\'130\' y=\'160\' width=\'10\' height=\'10\'/%3E%3Crect x=\'160\' y=\'160\' width=\'30\' height=\'30\'/%3E%3C/g%3E%3C/svg%3E")', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}>
                    </div>
                  </div>
                </div>
                <h5>Amount: ₹{paymentData.fineAmount}</h5>
                <p className="text-muted">Transaction ID: {qrCode.transactionId}</p>
                <p className="text-info">Scan this QR code with PhonePe, GooglePay, or Paytm</p>
                <div className="mt-4">
                  <button 
                    className="btn btn-success btn-lg me-3" 
                    onClick={confirmOnlinePayment}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Payment Completed'}
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setShowOnlinePayment(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offline Payment Modal */}
      {showOfflinePayment && paymentData && (
        <OfflinePaymentModal 
          paymentData={paymentData}
          onConfirm={confirmOfflinePayment}
          onCancel={() => setShowOfflinePayment(false)}
          loading={loading}
        />
      )}
      
      <Dialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog({...dialog, isOpen: false})}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        showConfirm={dialog.showConfirm}
        onConfirm={dialog.onConfirm}
      />
    </div>
  );
};


const OfflinePaymentModal: React.FC<{
  paymentData: any;
  onConfirm: (receiptId: string, librarianId: string) => void;
  onCancel: () => void;
  loading: boolean;
}> = ({ paymentData, onConfirm, onCancel, loading }) => {
  const [receiptId, setReceiptId] = useState('');
  const [librarianId, setLibrarianId] = useState('');

  const handleSubmit = () => {
    if (receiptId.trim() && librarianId.trim()) {
      onConfirm(receiptId.trim(), librarianId.trim());
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content" style={{ border: 'none', borderRadius: '20px' }}>
          <div className="modal-header border-0" style={{ background: 'linear-gradient(135deg, #28a745, #20c997)', color: 'white', borderRadius: '20px 20px 0 0' }}>
            <h4 className="modal-title fw-bold"> Cash Payment</h4>
            <button type="button" className="btn-close btn-close-white" onClick={onCancel}></button>
          </div>
          <div className="modal-body p-4">
            <div className="text-center mb-4">
              <h5>Record Cash Payment</h5>
              <p className="text-muted">Book: {paymentData.bookTitle}</p>
              <h4 className="text-success">Amount: ₹{paymentData.fineAmount}</h4>
            </div>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-bold">Receipt ID</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Enter receipt number"
                  value={receiptId}
                  onChange={(e) => setReceiptId(e.target.value)}
                  style={{ borderRadius: '10px', padding: '12px' }}
                />
              </div>
              <div className="col-12">
                <label className="form-label fw-bold">Librarian ID</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Enter librarian ID"
                  value={librarianId}
                  onChange={(e) => setLibrarianId(e.target.value)}
                  style={{ borderRadius: '10px', padding: '12px' }}
                />
              </div>
            </div>
            <div className="mt-4 text-center">
              <button 
                className="btn btn-success btn-lg me-3" 
                onClick={handleSubmit}
                disabled={!receiptId.trim() || !librarianId.trim() || loading}
                style={{ borderRadius: '12px', padding: '12px 30px' }}
              >
                {loading ? 'Recording...' : 'Record Payment'}
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={onCancel}
                style={{ borderRadius: '12px', padding: '12px 30px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookReturnSystem;