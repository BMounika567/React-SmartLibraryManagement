import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LandingPage from '../components/landingpage/LandingPage';
import Login from '../pages/auth/Login';
import LibraryRegister from '../pages/auth/LibraryRegister';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import PasswordReset from '../components/PasswordReset';
import AcceptInvitation from '../pages/auth/AcceptInvitation';

import BookReader from '../components/landingpage/BookReader';
import StyledSuperAdminDashboard from '../components/superadmin/StyledSuperAdminDashboard';
import { SuperAdminDashboardProvider } from '../context/SuperAdminDashboardContext';
import StyledLibraryAdminDashboard from '../components/admin/StyledLibraryAdminDashboard';
import { LibraryAdminDashboardProvider } from '../context/LibraryAdminDashboardContext';

import StyledLibrarianDashboard from '../components/librarian/StyledLibrarianDashboard';
import UserDashboard from '../components/user/userDashboard';
import WelcomePage from '../pages/WelcomePage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/book-reader" element={<BookReader />} />
        <Route path="/login" element={<Login />} />
        <Route path="/library-login" element={<Login />} />
        <Route path="/user-login" element={<Login />} />
        <Route path="/register-library" element={<LibraryRegister />} />
        <Route path="/user-register" element={<Register />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<PasswordReset />} />

        <Route path="/accept-invitation/:token" element={<AcceptInvitation />} />
        <Route 
          path="/welcome" 
          element={
            <ProtectedRoute>
              <WelcomePage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/super-admin/dashboard" 
          element={
            <ProtectedRoute requiredRole="SuperAdmin">
              <SuperAdminDashboardProvider>
                <StyledSuperAdminDashboard />
              </SuperAdminDashboardProvider>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute requiredRole="LibraryAdmin">
              <LibraryAdminDashboardProvider>
                <StyledLibraryAdminDashboard />
              </LibraryAdminDashboardProvider>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/librarian/dashboard" 
          element={
            <ProtectedRoute requiredRole="Librarian">
              <StyledLibrarianDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/user/dashboard" 
          element={
            <ProtectedRoute requiredRole="Member">
              <UserDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route path="/test-librarian" element={<StyledLibrarianDashboard />} />

        <Route path="/test" element={<div><h1>Simple Test</h1><p>This should work</p></div>} />
        <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;