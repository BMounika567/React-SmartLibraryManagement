import React from 'react';

interface DashboardOverviewProps {
  statistics: any;
  books: any[];
  users: any[];
  librarians: any[];
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ statistics, books, users, librarians }) => {
  return (
    <div>
      <div style={{ marginBottom: '35px' }}>
        <h2 style={{ color: '#000000', fontWeight: '700', margin: '0 0 8px 0', fontSize: '28px' }}>
          Library Dashboard Overview
        </h2>
        <p style={{ color: '#718096', margin: 0, fontSize: '14px' }}>Monitor your library's key metrics and performance</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)', padding: '35px 25px', borderRadius: '20px', textAlign: 'center', border: '2px solid #93C5FD', boxShadow: '0 10px 30px rgba(59, 130, 246, 0.15)', transition: 'all 0.3s ease', cursor: 'pointer' }}>
          <div style={{ fontSize: '3rem', fontWeight: '800', color: '#000000', marginBottom: '10px' }}>{statistics?.TotalBooks || books.length}</div>
          <div style={{ color: '#000000', fontWeight: '700', fontSize: '18px' }}>Total Books</div>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)', padding: '35px 25px', borderRadius: '20px', textAlign: 'center', border: '2px solid #86EFAC', boxShadow: '0 10px 30px rgba(34, 197, 94, 0.15)', transition: 'all 0.3s ease', cursor: 'pointer' }}>
          <div style={{ fontSize: '3rem', fontWeight: '800', color: '#000000', marginBottom: '10px' }}>{statistics?.TotalUsers || users.length}</div>
          <div style={{ color: '#000000', fontWeight: '700', fontSize: '18px' }}>Total Users</div>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #E9D5FF 0%, #D8B4FE 100%)', padding: '35px 25px', borderRadius: '20px', textAlign: 'center', border: '2px solid #C084FC', boxShadow: '0 10px 30px rgba(168, 85, 247, 0.15)', transition: 'all 0.3s ease', cursor: 'pointer' }}>
          <div style={{ fontSize: '3rem', fontWeight: '800', color: '#000000', marginBottom: '10px' }}>{statistics?.TotalLibrarians || librarians.length}</div>
          <div style={{ color: '#000000', fontWeight: '700', fontSize: '18px' }}>Total Librarians</div>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', padding: '35px 25px', borderRadius: '20px', textAlign: 'center', border: '2px solid #FCD34D', boxShadow: '0 10px 30px rgba(245, 158, 11, 0.15)', transition: 'all 0.3s ease', cursor: 'pointer' }}>
          <div style={{ fontSize: '3rem', fontWeight: '800', color: '#000000', marginBottom: '10px' }}>{statistics?.IssuedBooks || 0}</div>
          <div style={{ color: '#000000', fontWeight: '700', fontSize: '18px' }}>Issued Books</div>
        </div>
      </div>


    </div>
  );
};

export default DashboardOverview;
