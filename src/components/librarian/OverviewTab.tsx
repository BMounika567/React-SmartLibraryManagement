import React, { useState, useEffect } from 'react';
import { useLibrarianDashboardContext } from '../../context/LibrarianDashboardContext';

interface DashboardStats {
  totalBooks: number;
  totalCopies: number;
  availableCopies: number;
  issuedBooks: number;
  overdueBooks: number;
  pendingRequests: number;
  totalUsers: number;
  totalCategories: number;
  BooksIssuedToday: number;
  BooksReturnedToday: number;
  FinesCollected: number;
}

const OverviewTab: React.FC = () => {
  const {
    statistics,
    books,
    categories,
    members,
    bookRequests,
    activeBookIssues,
    overdueBookIssues,
    finePayments,
    loading
  } = useLibrarianDashboardContext();

  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    totalCopies: 0,
    availableCopies: 0,
    issuedBooks: 0,
    overdueBooks: 0,
    pendingRequests: 0,
    totalUsers: 0,
    totalCategories: 0,
    BooksIssuedToday: 0,
    BooksReturnedToday: 0,
    FinesCollected: 0
  });

  useEffect(() => {
    if (!loading && books && categories && members) {
      const totalCopies = books.reduce((sum: number, book: any) => sum + book.totalCopies, 0);
      const availableCopies = books.reduce((sum: number, book: any) => sum + book.availableCopies, 0);
      
      // Calculate today's stats
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      
      const todayIssues = activeBookIssues.filter((issue: any) => {
        const issueDate = new Date(issue.IssueDate || issue.issueDate);
        return issueDate >= todayStart && issueDate < todayEnd;
      });
      
      const todayReturns = activeBookIssues.filter((issue: any) => {
        const returnDate = issue.ReturnDate || issue.returnDate;
        if (!returnDate) return false;
        const returnDateObj = new Date(returnDate);
        return returnDateObj >= todayStart && returnDateObj < todayEnd;
      });
      
      const todayFines = finePayments.filter((payment: any) => {
        const paymentDate = payment.PaymentDate || payment.paymentDate;
        if (!paymentDate) return false;
        const paymentDateObj = new Date(paymentDate);
        return paymentDateObj >= todayStart && paymentDateObj < todayEnd;
      });
      
      const finesCollectedToday = todayFines.reduce((sum: number, payment: any) => {
        return sum + (payment.Amount || payment.amount || 0);
      }, 0);

      setStats({
        totalBooks: books.length,
        totalCopies,
        availableCopies,
        issuedBooks: activeBookIssues.length,
        overdueBooks: overdueBookIssues.length,
        pendingRequests: statistics.PendingRequests || 0,
        totalUsers: members.length,
        totalCategories: categories.length,
        BooksIssuedToday: todayIssues.length,
        BooksReturnedToday: todayReturns.length,
        FinesCollected: finesCollectedToday
      });
    }
  }, [loading, books, categories, members, activeBookIssues, overdueBookIssues, bookRequests, finePayments, statistics]);

  const getUtilizationRate = () => {
    if (stats.totalCopies === 0) return 0;
    return ((stats.totalCopies - stats.availableCopies) / stats.totalCopies * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        color: '#2A0800' 
      }}>
        Loading dashboard...
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Books',
      value: stats.totalBooks,
      subtitle: `${stats.totalCopies} copies total`,
      icon: 'bi bi-book',
      color: '#C09891'
    },
    {
      title: 'Available',
      value: stats.availableCopies,
      subtitle: 'Ready for issue',
      icon: 'bi bi-check-circle',
      color: '#BEABA7'
    },
    {
      title: 'Issued',
      value: stats.issuedBooks,
      subtitle: `${getUtilizationRate()}% utilization`,
      icon: 'bi bi-arrow-up-circle',
      color: '#F4DBD8'
    },
    {
      title: 'Overdue',
      value: stats.overdueBooks,
      subtitle: 'Need attention',
      icon: 'bi bi-exclamation-triangle',
      color: '#C09891'
    },
    {
      title: 'Requests',
      value: stats.pendingRequests,
      subtitle: 'Pending action',
      icon: 'bi bi-clipboard',
      color: '#BEABA7'
    },
    {
      title: 'Members',
      value: stats.totalUsers,
      subtitle: 'Registered users',
      icon: 'bi bi-people',
      color: '#F4DBD8'
    },
    {
      title: 'Categories',
      value: stats.totalCategories,
      subtitle: 'Book categories',
      icon: 'bi bi-folder',
      color: '#C09891'
    }
  ];

  return (
    <div>
      {/* Library Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        {statCards.map((card, index) => (
          <div 
            key={index}
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e0e0e0',
              padding: '16px',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(42, 8, 0, 0.3)';
              e.currentTarget.style.borderColor = card.color;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(42, 8, 0, 0.2)';
              e.currentTarget.style.borderColor = '#BEABA7';
            }}
          >
            <div style={{
              background: `rgba(${card.color === '#C09891' ? '192, 152, 145' : card.color === '#BEABA7' ? '190, 171, 167' : '244, 219, 216'}, 0.2)`,
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px'
            }}>
              <i className={card.icon} style={{ 
                color: card.color, 
                fontSize: '16px' 
              }}></i>
            </div>
            <div style={{
              color: '#333333',
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '4px'
            }}>
              {card.value}
            </div>
            <div style={{
              color: '#333333',
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '3px'
            }}>
              {card.title}
            </div>
            <div style={{
              color: '#666666',
              fontSize: '12px'
            }}>
              {card.subtitle}
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <div style={{
          background: '#4A7FA7',
          borderRadius: '15px',
          border: '1px solid #B3CFE5',
          padding: '20px',
          boxShadow: '0 8px 32px rgba(74, 127, 167, 0.3)'
        }}>
          <div style={{
            background: 'rgba(179, 207, 229, 0.2)',
            borderRadius: '15px',
            padding: '15px 20px',
            marginBottom: '25px',
            borderBottom: '1px solid rgba(179, 207, 229, 0.3)'
          }}>
            <h5 style={{
              color: '#FFFFFF',
              fontWeight: '700',
              margin: '0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <i className="bi bi-activity" style={{ color: '#B3CFE5' }}></i>
              Today's Activity Summary
            </h5>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' }}>
            {[
              { 
                icon: 'bi bi-book-half', 
                value: stats.BooksIssuedToday, 
                label: 'Books Issued',
                color: '#775144'
              },
              { 
                icon: 'bi bi-check-circle', 
                value: stats.BooksReturnedToday, 
                label: 'Books Returned',
                color: '#775144'
              },
              { 
                icon: 'bi bi-currency-dollar', 
                value: `₹${stats.FinesCollected}`, 
                label: 'Fines Collected',
                color: '#775144'
              },
              { 
                icon: 'bi bi-clock-history', 
                value: stats.pendingRequests, 
                label: 'Pending Requests',
                color: '#C09891'
              }
            ].map((stat, index) => (
              <div key={index} style={{
                background: 'white',
                borderRadius: '10px',
                padding: '12px',
                textAlign: 'center',
                border: '1px solid #ddd',
                transition: 'transform 0.3s ease',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(42, 8, 0, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{
                  background: '#B3CFE5',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '6px'
                }}>
                  <i className={stat.icon} style={{ 
                    color: '#4A7FA7', 
                    fontSize: '12px' 
                  }}></i>
                </div>
                <div style={{
                  color: '#333',
                  fontSize: '16px',
                  fontWeight: '700',
                  marginBottom: '2px'
                }}>{stat.value}</div>
                <div style={{
                  color: '#666',
                  fontSize: '9px',
                  fontWeight: '600'
                }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;