import React, { useState } from 'react';
import { useLibrarianDashboardContext } from '../context/LibrarianDashboardContext';
import Notification from './Notification';
import axiosClient from '../api/axiosClient';
import styles from './FinesAndPayments.module.css';

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
  paymentMethod: 'Cash' | 'Card' | 'Online' | 'BankTransfer' | 'Waived' | 'PhonePe';
  status: 'Completed' | 'Pending' | 'Failed' | 'Refunded' | 'Paid';
  transactionId?: string;
  receiptNumber?: string;
  notes?: string;
  processedBy?: string;
}

const FinesAndPayments: React.FC = () => {
  const { finePayments, fines, loading, processPayment, waiveFine, calculateAllFines } = useLibrarianDashboardContext();
  const [activeTab, setActiveTab] = useState<'fines' | 'payments' | 'history'>('fines');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [processing, setProcessing] = useState(false);
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showWaiverModal, setShowWaiverModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    fineId: '',
    amount: 0,
    paymentMethod: 'Cash',
    notes: ''
  });
  const [waiverForm, setWaiverForm] = useState({
    fineId: '',
    waiverReason: '',
    notes: ''
  });
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);
  const [calculatingFines, setCalculatingFines] = useState(false);

  const payments: Payment[] = finePayments || [];

  const filteredFines = fines.filter(fine => {
    const searchLower = searchTerm.toLowerCase();
    const memberName = fine.memberName || fine.userName || '';
    const memberEmail = fine.memberEmail || fine.userEmail || '';
    
    const matchesSearch = !searchTerm || 
      memberName.toLowerCase().includes(searchLower) ||
      memberEmail.toLowerCase().includes(searchLower) ||
      (fine.bookTitle?.toLowerCase() || '').includes(searchLower);
    
    const matchesStatus = statusFilter === 'All' || fine.status === statusFilter;
    
    const matchesDate = !dateFilter || 
      new Date(fine.createdDate).toDateString() === new Date(dateFilter).toDateString();
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const filteredPayments = payments.filter(payment => {
    const searchLower = searchTerm.toLowerCase();
    const memberName = payment.memberName || payment.userName || '';
    
    const matchesSearch = !searchTerm || 
      memberName.toLowerCase().includes(searchLower) ||
      (payment.receiptNumber?.toLowerCase() || '').includes(searchLower) ||
      (payment.transactionId?.toLowerCase() || '').includes(searchLower);
    
    const matchesStatus = statusFilter === 'All' || payment.status === statusFilter;
    
    const matchesDate = !dateFilter || 
      new Date(payment.paymentDate).toDateString() === new Date(dateFilter).toDateString();
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate totals - show ALL fines and payments (not just outstanding)
  const totalFineAmount = fines.reduce((sum, f) => sum + (f.fineAmount || 0), 0);
  const totalPaidAmount = fines.reduce((sum, f) => sum + ((f as any).paidAmount || 0), 0);
  // Total waived = sum of all payments with method 'Waived'
  const totalWaived = payments.filter(p => p.paymentMethod === 'Waived' || p.paymentMethod === 'PhonePe').reduce((sum, p) => sum + p.amount, 0);

  const openPaymentModal = (fine: Fine) => {
    setSelectedFine(fine);
    setPaymentForm({
      fineId: fine.id,
      amount: fine.daysOverdue * 1,
      paymentMethod: 'Cash',
      notes: ''
    });
    setShowPaymentModal(true);
  };

  const openWaiverModal = (fine: Fine) => {
    setSelectedFine(fine);
    setWaiverForm({
      fineId: fine.id,
      waiverReason: '',
      notes: ''
    });
    setShowWaiverModal(true);
  };

  const handleProcessPayment = async () => {
    if (!selectedFine) return;
    
    setProcessing(true);
    try {
      const result = processPayment(paymentForm.fineId, paymentForm.amount, paymentForm.paymentMethod, paymentForm.notes);
      
      setShowPaymentModal(false);
      setNotification({
        message: result.message,
        type: 'success'
      });
    } catch (error: any) {
      setNotification({
        message: 'Error processing payment',
        type: 'error'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleWaiveFine = async () => {
    if (!selectedFine) return;
    
    setProcessing(true);
    try {
      const result = await waiveFine(waiverForm.fineId, waiverForm.waiverReason, waiverForm.notes);
      
      setShowWaiverModal(false);
      setNotification({
        message: result.message,
        type: result.success ? 'success' : 'error'
      });
    } catch (error: any) {
      setNotification({
        message: 'Error waiving fine',
        type: 'error'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleCalculateAllFines = async () => {
    setCalculatingFines(true);
    try {
      const result = calculateAllFines();
      
      setNotification({
        message: result.message,
        type: 'success'
      });
    } catch (error: any) {
      setNotification({
        message: 'Error calculating fines',
        type: 'error'
      });
    } finally {
      setCalculatingFines(false);
    }
  };



  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading fines and payments...</p>
        </div>
      </div>
    );
  }



  return (
    <div style={{ background: 'white', minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ background: 'white', borderBottom: '2px solid #e5e7eb', padding: '1.5rem 2rem' }}>
            <h4 style={{ color: '#000000', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 1.5rem 0' }}>
              Fines & Payments Management
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#fca5a5', padding: '1.25rem', borderRadius: '8px', border: '1px solid #f87171' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#000000', marginBottom: '0.25rem' }}>₹{totalFineAmount.toFixed(2)}</div>
                <div style={{ fontSize: '0.85rem', color: '#000000', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Fines</div>
              </div>
              <div style={{ background: '#6ee7b7', padding: '1.25rem', borderRadius: '8px', border: '1px solid #34d399' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#000000', marginBottom: '0.25rem' }}>₹{totalPaidAmount.toFixed(2)}</div>
                <div style={{ fontSize: '0.85rem', color: '#000000', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Collected</div>
              </div>
              <div style={{ background: '#fcd34d', padding: '1.25rem', borderRadius: '8px', border: '1px solid #fbbf24' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#000000', marginBottom: '0.25rem' }}>{fines.length}</div>
                <div style={{ fontSize: '0.85rem', color: '#000000', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Fines</div>
              </div>
              <div style={{ background: '#d1d5db', padding: '1.25rem', borderRadius: '8px', border: '1px solid #9ca3af' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#000000', marginBottom: '0.25rem' }}>₹{totalWaived.toFixed(2)}</div>
                <div style={{ fontSize: '0.85rem', color: '#000000', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Waived</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <button 
                onClick={() => setActiveTab('fines')}
                style={{
                  background: activeTab === 'fines' ? '#000000' : 'white',
                  color: activeTab === 'fines' ? 'white' : '#000000',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Fines <span style={{ color: activeTab === 'fines' ? '#fcd34d' : '#f59e0b' }}>({fines.length})</span>
              </button>
              <button 
                onClick={() => setActiveTab('payments')}
                style={{
                  background: activeTab === 'payments' ? '#000000' : 'white',
                  color: activeTab === 'payments' ? 'white' : '#000000',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Payments <span style={{ color: activeTab === 'payments' ? '#fcd34d' : '#f59e0b' }}>({payments.length})</span>
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                style={{
                  background: activeTab === 'history' ? '#000000' : 'white',
                  color: activeTab === 'history' ? 'white' : '#000000',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                History
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: '1', minWidth: '250px', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem' }}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={styles.luxurySelect}
              >
                <option value="All">All Status</option>
                {activeTab === 'fines' ? (
                  <>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="partial">Partial</option>
                  </>
                ) : (
                  <>
                    <option value="Completed">Completed</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </>
                )}
              </select>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{ padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem' }}
              />
              <button 
                onClick={handleCalculateAllFines}
                disabled={calculatingFines}
                style={{
                  background: '#000000',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: calculatingFines ? 'not-allowed' : 'pointer',
                  opacity: calculatingFines ? 0.6 : 1
                }}
              >
                {calculatingFines ? 'Recalculating...' : 'Recalculate Fines'}
              </button>
            </div>
          </div>

          <div style={{ padding: '2rem' }}>



            {activeTab === 'fines' && (
              <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                  <thead>
                    <tr style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'left', color: '#000000', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Member</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'left', color: '#000000', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Book</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'left', color: '#000000', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Amount</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'left', color: '#000000', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'right', color: '#000000', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFines.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '3rem', textAlign: 'center' }}>
                          <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>No fines found</div>
                        </td>
                      </tr>
                    ) : (
                      filteredFines.map((fine) => (
                        <tr key={fine.id} style={{ background: 'white', borderBottom: '1px solid #f3f4f6', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#000000', marginBottom: '0.25rem' }}>{fine.memberName || fine.userName || 'Unknown'}</div>
                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{fine.memberEmail || fine.userEmail || 'N/A'}</div>
                          </td>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#000000', marginBottom: '0.25rem' }}>{fine.bookTitle || 'Unknown'}</div>
                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>by {fine.bookAuthor || 'N/A'}</div>
                          </td>
                          <td style={{ padding: '1rem 1.25rem', fontSize: '0.9rem', fontWeight: '700', color: '#000000' }}>₹{(fine.fineAmount || 0).toFixed(2)}</td>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: fine.status === 'paid' ? '#10b981' : fine.status === 'partial' ? '#f59e0b' : '#ef4444' }}>{fine.status === 'paid' ? 'Paid' : fine.status === 'partial' ? 'Partial' : 'Pending'}</div>
                          </td>
                          <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              {fine.status !== 'paid' && (
                                <>
                                  <button 
                                    onClick={() => openPaymentModal(fine)}
                                    style={{ background: '#000000', color: 'white', border: 'none', borderRadius: '6px', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}
                                  >
                                    Pay
                                  </button>
                                  <button 
                                    onClick={() => openWaiverModal(fine)}
                                    style={{ background: 'white', color: '#000000', border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}
                                  >
                                    Waive
                                  </button>
                                </>
                              )}
                              {fine.status === 'paid' && (
                                <span style={{ background: '#d1fae5', color: '#065f46', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' }}>Paid</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'payments' && (
              <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                  <thead>
                    <tr style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'left', color: '#000000', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Member</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'left', color: '#000000', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Amount</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'left', color: '#000000', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Method</th>
                      <th style={{ padding: '1rem 1.25rem', textAlign: 'left', color: '#000000', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: '3rem', textAlign: 'center' }}>
                          <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>No payments found</div>
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map((payment) => (
                        <tr key={payment.id} style={{ background: 'white', borderBottom: '1px solid #f3f4f6', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#000000' }}>{payment.memberName || payment.userName || 'Unknown'}</div>
                          </td>
                          <td style={{ padding: '1rem 1.25rem', fontSize: '0.9rem', fontWeight: '700', color: '#10b981' }}>₹{payment.amount.toFixed(2)}</td>
                          <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', fontWeight: '600', color: '#000000' }}>{payment.paymentMethod || 'N/A'}</td>
                          <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#000000' }}>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'history' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                  <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                    <h6 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: '#000000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recent Fines</h6>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#000000', fontSize: '0.8rem', fontWeight: '700' }}>Member</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#000000', fontSize: '0.8rem', fontWeight: '700' }}>Amount</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#000000', fontSize: '0.8rem', fontWeight: '700' }}>Status</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#000000', fontSize: '0.8rem', fontWeight: '700' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fines.slice(0, 10).map((fine) => (
                        <tr key={fine.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#000000' }}>{fine.memberName || fine.userName || 'Unknown'}</td>
                          <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', fontWeight: '600', color: '#000000' }}>₹{(fine.fineAmount || 0).toFixed(2)}</td>
                          <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: '600', color: fine.status === 'paid' ? '#10b981' : '#ef4444' }}>{fine.status || 'pending'}</td>
                          <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#6b7280' }}>{new Date(fine.createdDate || Date.now()).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                  <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                    <h6 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: '#000000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recent Payments</h6>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#000000', fontSize: '0.8rem', fontWeight: '700' }}>Member</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#000000', fontSize: '0.8rem', fontWeight: '700' }}>Amount</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#000000', fontSize: '0.8rem', fontWeight: '700' }}>Method</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#000000', fontSize: '0.8rem', fontWeight: '700' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.slice(0, 10).map((payment) => (
                        <tr key={payment.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#000000' }}>{payment.memberName || payment.userName || 'Unknown'}</td>
                          <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', fontWeight: '600', color: '#10b981' }}>₹{payment.amount.toFixed(2)}</td>
                          <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#000000' }}>{payment.paymentMethod || 'N/A'}</td>
                          <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#6b7280' }}>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {showPaymentModal && selectedFine && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog" style={{ maxWidth: '600px' }}>
              <div className="modal-content" style={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                <div className="modal-header" style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '1.5rem' }}>
                  <h5 style={{ color: '#000000', fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>Process Payment</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowPaymentModal(false)}
                  ></button>
                </div>
                <div className="modal-body" style={{ background: 'white', padding: '1.5rem' }}>
                  <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '1rem', border: '1px solid #e5e7eb', marginBottom: '1rem' }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong style={{ color: '#000000', fontSize: '0.85rem' }}>Member:</strong>
                      <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>{selectedFine.memberName || selectedFine.userName}</div>
                    </div>
                    <div>
                      <strong style={{ color: '#000000', fontSize: '0.85rem' }}>Book:</strong>
                      <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>{selectedFine.bookTitle}</div>
                    </div>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ color: '#000000', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment Amount</label>
                    <input
                      type="number"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({...paymentForm, amount: parseFloat(e.target.value) || 0})}
                      min="0"
                      step="0.01"
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', fontWeight: '600' }}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ color: '#000000', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment Method</label>
                    <select
                      value={paymentForm.paymentMethod}
                      onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value as any})}
                      style={{ 
                        width: '100%', 
                        padding: '0.75rem', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '6px', 
                        fontSize: '0.9rem',
                        background: 'white',
                        color: '#000000',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#000000';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#d1d5db';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                      }}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="Online">Online</option>
                      <option value="Waived">Waived</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ color: '#000000', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Notes</label>
                    <textarea
                      rows={3}
                      value={paymentForm.notes}
                      onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                      placeholder="Add payment notes..."
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem', resize: 'none' }}
                    />
                  </div>
                </div>
                <div className="modal-footer" style={{ background: 'white', borderTop: '1px solid #e5e7eb', padding: '1rem 1.5rem' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowPaymentModal(false)}
                    disabled={processing}
                    style={{ background: 'white', color: '#000000', border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.5rem 1.25rem', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    onClick={handleProcessPayment}
                    disabled={processing || paymentForm.amount <= 0}
                    style={{ background: '#000000', color: 'white', border: 'none', borderRadius: '6px', padding: '0.5rem 1.25rem', fontSize: '0.9rem', fontWeight: '600', cursor: (processing || paymentForm.amount <= 0) ? 'not-allowed' : 'pointer', opacity: (processing || paymentForm.amount <= 0) ? 0.6 : 1 }}
                  >
                    {processing ? 'Processing...' : 'Process Payment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {showWaiverModal && selectedFine && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog" style={{ maxWidth: '600px' }}>
              <div className="modal-content" style={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                <div className="modal-header" style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '1.5rem' }}>
                  <h5 style={{ color: '#000000', fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>Waive Fine</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowWaiverModal(false)}
                  ></button>
                </div>
                <div className="modal-body" style={{ background: 'white', padding: '1.5rem' }}>
                  <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '1rem', border: '1px solid #e5e7eb', marginBottom: '1rem' }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong style={{ color: '#000000', fontSize: '0.85rem' }}>Member:</strong>
                      <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>{selectedFine.memberName || selectedFine.userName}</div>
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong style={{ color: '#000000', fontSize: '0.85rem' }}>Book:</strong>
                      <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>{selectedFine.bookTitle}</div>
                    </div>
                    <div>
                      <strong style={{ color: '#000000', fontSize: '0.85rem' }}>Fine Amount:</strong>
                      <div style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: '700' }}>₹{(selectedFine.fineAmount || 0).toFixed(2)}</div>
                    </div>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ color: '#000000', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Waiver Reason</label>
                    <select
                      value={waiverForm.waiverReason}
                      onChange={(e) => setWaiverForm({...waiverForm, waiverReason: e.target.value})}
                      style={{ 
                        width: '100%', 
                        padding: '0.75rem', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '6px', 
                        fontSize: '0.9rem',
                        background: 'white',
                        color: '#000000',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#000000';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#d1d5db';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                      }}
                    >
                      <option value="">Select reason...</option>
                      <option value="Administrative Decision">Administrative Decision</option>
                      <option value="First Time Offender">First Time Offender</option>
                      <option value="System Error">System Error</option>
                      <option value="Library Closure">Library Closure</option>
                      <option value="Medical Emergency">Medical Emergency</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ color: '#000000', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Notes</label>
                    <textarea
                      rows={3}
                      value={waiverForm.notes}
                      onChange={(e) => setWaiverForm({...waiverForm, notes: e.target.value})}
                      placeholder="Add waiver notes..."
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem', resize: 'none' }}
                    />
                  </div>
                </div>
                <div className="modal-footer" style={{ background: 'white', borderTop: '1px solid #e5e7eb', padding: '1rem 1.5rem' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowWaiverModal(false)}
                    disabled={processing}
                    style={{ background: 'white', color: '#000000', border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.5rem 1.25rem', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    onClick={handleWaiveFine}
                    disabled={processing || !waiverForm.waiverReason}
                    style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', padding: '0.5rem 1.25rem', fontSize: '0.9rem', fontWeight: '600', cursor: (processing || !waiverForm.waiverReason) ? 'not-allowed' : 'pointer', opacity: (processing || !waiverForm.waiverReason) ? 0.6 : 1 }}
                  >
                    {processing ? 'Processing...' : 'Waive Fine'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default FinesAndPayments;