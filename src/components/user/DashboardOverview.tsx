import React from 'react';

interface DashboardOverviewProps {
  userStats: any;
  libraryInfo: any;
  newlyAddedBooks: any[];
  onBookSelect: (book: any) => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ 
  userStats, 
  libraryInfo, 
  newlyAddedBooks, 
  onBookSelect 
}) => {
  return (
    <div className="container-fluid" style={{ padding: '30px 20px' }}>
      
      <div className="row g-3 mb-4 justify-content-center">
        {[
          { icon: 'bi bi-book-half', value: userStats?.booksIssued || 0, label: 'Currently Borrowed', color: '#DCC7A1' },
          { icon: 'bi bi-clock', value: userStats?.dueSoon || 0, label: 'Due Soon', color: '#F8E4C2' },
          { icon: 'bi bi-exclamation-triangle', value: `₹${userStats?.totalFines?.toFixed(2) || '0.00'}`, label: 'Outstanding Fines', color: userStats?.hasOutstandingFines ? '#DCC7A1' : '#F8E4C2' },
          { icon: 'bi bi-bookmark', value: userStats?.reservedBooks || 0, label: 'Reserved Books', color: '#DCC7A1' }
        ].map((stat, index) => (
          <div key={index} className="col-6 col-md-3 col-lg-2">
            <div style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #B8860B',
              padding: '12px',
              textAlign: 'center',
              height: '100%',
              minWidth: '140px',
              maxWidth: '180px'
            }}>
              <div style={{
                background: stat.color,
                borderRadius: '50%',
                width: '35px',
                height: '35px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px'
              }}>
                <i className={stat.icon} style={{ color: '#5A5548', fontSize: '16px' }}></i>
              </div>
              <h3 style={{
                color: '#000000',
                fontWeight: '700',
                margin: '4px 0',
                fontSize: '24px'
              }}>{stat.value}</h3>
              <p style={{
                color: '#5A5548',
                margin: '0',
                fontSize: '11px',
                fontWeight: '600'
              }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* New Books Carousel */}
      {newlyAddedBooks.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div style={{
              background: '#FFFFFF',
              borderRadius: '15px',
              border: '1px solid #B8860B',
              padding: '25px'
            }}>
              <h5 style={{
                color: '#000000',
                fontWeight: '700',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <i className="bi bi-stars" style={{ color: '#FFD700', marginRight: '10px' }}></i>
                New Arrivals in {libraryInfo?.name || 'Library'}
              </h5>
              
              <div style={{
                position: 'relative',
                overflow: 'hidden',
                height: '200px',
                background: 'linear-gradient(90deg, #FFFFFF 0%, transparent 10%, transparent 90%, #FFFFFF 100%)'
              }}>
                <div 
                  className="marquee-container"
                  style={{
                    display: 'flex',
                    animation: 'marquee 30s linear infinite',
                    gap: '20px',
                    alignItems: 'center',
                    height: '100%'
                  }}
                >
                  {newlyAddedBooks.concat(newlyAddedBooks).map((book, index) => (
                    <div key={index} style={{
                      minWidth: '140px',
                      height: '180px',
                      background: '#EFE9DD',
                      borderRadius: '10px',
                      border: '1px solid #B8860B',
                      padding: '10px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'transform 0.3s ease',
                      flexShrink: 0
                    }}
                    onClick={() => onBookSelect(book)}
                    >
                      <div style={{
                        background: '#FFFFFF',
                        borderRadius: '6px',
                        height: '110px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '8px',
                        overflow: 'hidden',
                        border: '1px solid #B8860B'
                      }}>
                        <i className="bi bi-book" style={{ 
                          fontSize: '1.8rem', 
                          color: '#5A5548'
                        }}></i>
                      </div>
                      <h6 style={{
                        color: '#000000',
                        fontWeight: '700',
                        fontSize: '11px',
                        marginBottom: '3px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>{book.title}</h6>
                      <p style={{
                        color: '#5A5548',
                        fontSize: '9px',
                        margin: '0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>{book.author}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;