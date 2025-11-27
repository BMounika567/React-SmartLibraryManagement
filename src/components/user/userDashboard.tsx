import React, { useState, useEffect } from 'react';
import UserDashboardHeader from '../../components/user/UserDashboardHeader';
import UserDashboardNavigation from '../../components/user/UserDashboardNavigation';
import DashboardOverview from '../../components/user/DashboardOverview';
import MyBooksTab from '../../components/user/MyBooksTab';
import FinesTab from '../../components/user/FinesTab';
import ReservationsTab from '../../components/user/ReservationsTab';
import ProfileTab from '../../components/user/ProfileTab';
import CustomDialog from '../../components/user/CustomDialog';
import BookCatalog from '../../components/BookCatalog';
import AutoNotificationHandler from '../../components/AutoNotificationHandler';
import { useUserDashboard } from '../../hooks/useUserDashboard';

const UserDashboard: React.FC = () => {
  const {
    userStats,
    books,
    categories,
    borrowedBooks,
    userReservations,
    paymentHistory,
    userProfile,
    pendingRequests,
    libraryInfo,
    loading,
    fetchUserReservations,
    fetchPaymentHistory,
    updateUserProfile,
    changePassword,
    fetchAllDashboardData,
    createBookRequest,
    createBookReservation
  } = useUserDashboard();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [newlyAddedBooks, setNewlyAddedBooks] = useState<any[]>([]);
  
  // Dialog states
  const [showDialog, setShowDialog] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error' | 'confirm';
    onConfirm?: () => void;
  }>({ title: '', message: '', type: 'success' });


  useEffect(() => {
    if (books.length > 0) {
      const shuffled = [...books].sort(() => 0.5 - Math.random());
      setNewlyAddedBooks(shuffled.slice(0, 12));
    }
  }, [books]);

  const showCustomDialog = (title: string, message: string, type: 'success' | 'error' | 'confirm', onConfirm?: () => void) => {
    setDialogConfig({ title, message, type, onConfirm });
    setShowDialog(true);
  };



  if (loading) return <div className="container mt-5"><div className="alert alert-info">Loading...</div></div>;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFFFFF',
      fontFamily: 'Inter, sans-serif'
    }}>
      <AutoNotificationHandler />
      
      <UserDashboardHeader libraryInfo={libraryInfo} />
      <UserDashboardNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Dashboard Overview Tab */}
      {activeTab === 'overview' && (
        <DashboardOverview 
          userStats={userStats}
          libraryInfo={libraryInfo}
          newlyAddedBooks={newlyAddedBooks}
          onBookSelect={setSelectedBook}
        />
      )}

      {/* Content wrapper for other tabs */}
      {activeTab !== 'overview' && (
        <div style={{
          background: '#FFFFFF',
          minHeight: 'calc(100vh - 140px)',
          margin: '0 20px 20px',
          borderRadius: '15px',
          border: '1px solid #DCC7A1',
          boxShadow: '0 8px 32px rgba(220, 199, 161, 0.2)'
        }}>
          {/* Browse Books Tab */}
          {activeTab === 'browse' && (
            <div style={{ padding: '30px' }}>
              <BookCatalog 
                books={books}
                categories={categories}
                userReservations={userReservations}
                borrowedBooks={borrowedBooks}
                pendingRequests={pendingRequests}
                onRefresh={fetchAllDashboardData}
                onCreateRequest={createBookRequest}
                onCreateReservation={createBookReservation}
              />
            </div>
          )}

          {/* My Books Tab */}
          {activeTab === 'mybooks' && (
            <MyBooksTab 
              borrowedBooks={borrowedBooks}
              books={books}
              categories={categories}
              pendingRequests={pendingRequests}
              onShowDialog={showCustomDialog}
              onRefreshData={fetchAllDashboardData}
            />
          )}

          {/* Reservations Tab */}
          {activeTab === 'reservations' && (
            <ReservationsTab 
              userReservations={userReservations}
              onShowDialog={showCustomDialog}
              onRefreshReservations={fetchUserReservations}
            />
          )}

          {/* Fines Tab */}
          {activeTab === 'fines' && (
            <FinesTab 
              userStats={userStats} 
              borrowedBooks={borrowedBooks}
              paymentHistory={paymentHistory}
              onShowDialog={showCustomDialog}
              onRefreshPayments={fetchPaymentHistory}
            />
          )}



          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <ProfileTab 
              userStats={userStats}
              borrowedBooks={borrowedBooks}
              libraryInfo={libraryInfo}
              userProfile={userProfile}
              onUpdateProfile={async (profileData: any) => {
                await updateUserProfile(profileData);
              }}
              onChangePassword={async (currentPassword: string, newPassword: string, confirmPassword: string) => {
                await changePassword(currentPassword, newPassword, confirmPassword);
              }}
            />
          )}
        </div>
      )}

      {/* Custom Dialog */}
      <CustomDialog
        show={showDialog}
        config={dialogConfig}
        onClose={() => setShowDialog(false)}
      />

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;