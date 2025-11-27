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

interface ActiveIssuesTableProps {
  issues: BookIssue[];
}

const ActiveIssuesTable: React.FC<ActiveIssuesTableProps> = ({ issues }) => {
  const getDaysRemaining = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const activeNonOverdueIssues = issues.filter(issue => getDaysRemaining(issue.dueDate) > 0);

  if (activeNonOverdueIssues.length === 0) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #ddd',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        padding: '60px 40px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>📖</div>
        <h4 style={{
          color: '#2c3e50',
          fontWeight: '600',
          marginBottom: '10px'
        }}>No Active Issues</h4>
        <p style={{
          color: '#7f8c8d',
          margin: '0',
          fontSize: '14px'
        }}>No books are currently issued (non-overdue)</p>
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
        background: '#f8f9fa',
        padding: '20px',
        borderBottom: '1px solid #ddd'
      }}>
        <h5 style={{
          color: '#2c3e50',
          fontWeight: '600',
          margin: '0 0 5px 0'
        }}>📖 Currently Issued Books (Non-Overdue)</h5>
        <p style={{
          color: '#7f8c8d',
          margin: '0',
          fontSize: '14px'
        }}>Books that are currently issued and not overdue</p>
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
              }}>Issue Date</th>
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
              }}>Days Left</th>
              <th style={{
                color: '#2c3e50',
                fontWeight: '600',
                fontSize: '14px',
                padding: '15px 20px',
                textAlign: 'left',
                borderBottom: '1px solid #ddd'
              }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {activeNonOverdueIssues.map((issue, index) => (
              <tr key={issue.id} style={{
                background: index % 2 === 0 ? 'white' : '#f5f5f5',
                borderBottom: index < activeNonOverdueIssues.length - 1 ? '1px solid #eee' : 'none'
              }}>
                <td style={{ padding: '15px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      background: '#3498db',
                      color: 'white',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px'
                    }}>
                      👤
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
                  }}>{new Date(issue.issueDate).toLocaleDateString()}</div>
                </td>
                <td style={{ padding: '15px 20px' }}>
                  <div style={{
                    color: '#2c3e50',
                    fontSize: '14px'
                  }}>{new Date(issue.dueDate).toLocaleDateString()}</div>
                </td>
                <td style={{ padding: '15px 20px' }}>
                  <span style={{
                    background: getDaysRemaining(issue.dueDate) <= 3 ? '#fff3cd' : '#e8f5e8',
                    color: getDaysRemaining(issue.dueDate) <= 3 ? '#f57c00' : '#27ae60',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {getDaysRemaining(issue.dueDate)} days left
                  </span>
                </td>
                <td style={{ padding: '15px 20px' }}>
                  <span style={{
                    background: '#e8f5e8',
                    color: '#27ae60',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActiveIssuesTable;