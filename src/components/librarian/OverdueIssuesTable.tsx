import React from 'react';

interface BookIssue {
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
  returnDate?: string;
  status: 'Active' | 'Returned' | 'Overdue';
  fineAmount?: number;
}

interface OverdueIssuesTableProps {
  issues: BookIssue[];
}

const OverdueIssuesTable: React.FC<OverdueIssuesTableProps> = ({ issues }) => {
  const getDaysRemaining = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (issues.length === 0) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #ddd',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        padding: '60px 40px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
        <h4 style={{
          color: '#2c3e50',
          fontWeight: '600',
          marginBottom: '10px'
        }}>No Overdue Books</h4>
        <p style={{
          color: '#7f8c8d',
          margin: '0',
          fontSize: '14px'
        }}>All books have been returned on time</p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      border: '1px solid #ddd',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    }}>
      <div style={{
        background: '#ffebee',
        padding: '20px',
        borderBottom: '1px solid #ddd'
      }}>
        <h5 style={{
          color: '#c62828',
          fontWeight: '600',
          margin: '0 0 5px 0'
        }}>⚠️ Overdue Books</h5>
        <p style={{
          color: '#d32f2f',
          margin: '0',
          fontSize: '14px'
        }}>Books that are past their due date and need immediate attention</p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse'
        }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{
                color: '#2c3e50',
                fontWeight: '600',
                fontSize: '14px',
                padding: '15px 20px',
                textAlign: 'left',
                borderBottom: '1px solid #ddd'
              }}>Student</th>
              <th style={{
                color: '#2c3e50',
                fontWeight: '600',
                fontSize: '14px',
                padding: '15px 20px',
                textAlign: 'left',
                borderBottom: '1px solid #ddd'
              }}>Book</th>
              <th style={{
                color: '#2c3e50',
                fontWeight: '600',
                fontSize: '14px',
                padding: '15px 20px',
                textAlign: 'left',
                borderBottom: '1px solid #ddd'
              }}>Due Date</th>
              <th style={{
                color: '#2c3e50',
                fontWeight: '600',
                fontSize: '14px',
                padding: '15px 20px',
                textAlign: 'left',
                borderBottom: '1px solid #ddd'
              }}>Days Overdue</th>
              <th style={{
                color: '#2c3e50',
                fontWeight: '600',
                fontSize: '14px',
                padding: '15px 20px',
                textAlign: 'left',
                borderBottom: '1px solid #ddd'
              }}>Fine Amount</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue, index) => (
              <tr key={issue.id} style={{
                background: index % 2 === 0 ? '#fff5f5' : '#ffebee',
                borderBottom: index < issues.length - 1 ? '1px solid #ffcdd2' : 'none'
              }}>
                <td style={{ padding: '15px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      background: '#e74c3c',
                      color: 'white',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px'
                    }}>
                      ⚠️
                    </div>
                    <div>
                      <div style={{
                        color: '#2c3e50',
                        fontWeight: '600',
                        fontSize: '14px',
                        marginBottom: '2px'
                      }}>{issue.userName}</div>
                      <small style={{
                        color: '#7f8c8d',
                        fontSize: '12px'
                      }}>{issue.userEmail}</small>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '15px 20px' }}>
                  <div>
                    <div style={{
                      color: '#2c3e50',
                      fontWeight: '600',
                      fontSize: '14px',
                      marginBottom: '2px'
                    }}>{issue.bookTitle}</div>
                    <small style={{
                      color: '#7f8c8d',
                      fontSize: '12px'
                    }}>by {issue.bookAuthor} (Copy #{issue.copyNumber})</small>
                  </div>
                </td>
                <td style={{ padding: '15px 20px' }}>
                  <div style={{
                    color: '#2c3e50',
                    fontSize: '14px'
                  }}>{new Date(issue.dueDate).toLocaleDateString()}</div>
                </td>
                <td style={{ padding: '15px 20px' }}>
                  <span style={{
                    background: '#ffebee',
                    color: '#c62828',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    border: '1px solid #ef5350'
                  }}>
                    {Math.abs(getDaysRemaining(issue.dueDate))} days overdue
                  </span>
                </td>
                <td style={{ padding: '15px 20px' }}>
                  <span style={{
                    background: '#c62828',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    ₹{issue.fineAmount || (Math.abs(getDaysRemaining(issue.dueDate)) * 1).toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {issues.length > 0 && (
        <div style={{
          background: '#fff3cd',
          padding: '15px 20px',
          borderTop: '1px solid #ddd'
        }}>
          <div style={{
            color: '#856404',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            💡 <strong>Tip:</strong> Contact these members to return their overdue books and pay fines.
          </div>
        </div>
      )}
    </div>
  );
};

export default OverdueIssuesTable;