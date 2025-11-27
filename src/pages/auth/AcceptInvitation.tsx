import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';

const AcceptInvitation: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (token) {
      handleInvitationAcceptance();
    } else {
      setError('Invalid invitation link');
      setLoading(false);
    }
  }, [token]);

  const handleInvitationAcceptance = async () => {
    try {
      const response = await axiosClient.get(`/api/UserRegistration/accept-invitation/${token}`);
      
      if (response.data.success) {
        // Auto-login with the returned data
        const userData = response.data.data;
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Small delay to ensure localStorage is set
        setTimeout(() => {
          // Redirect based on role
          if (userData.role === 'Librarian') {
            window.location.href = '/librarian/dashboard';
          } else {
            window.location.href = '/';
          }
        }, 1000);
      } else {
        setError(response.data.message || 'Failed to accept invitation');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired invitation link');
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
        p: 2
      }}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 500, width: '100%', textAlign: 'center' }}>
        {loading ? (
          <>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Processing Your Invitation...
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please wait while we set up your librarian account.
            </Typography>
          </>
        ) : error ? (
          <>
            <Typography variant="h5" color="error" gutterBottom>
              Invitation Error
            </Typography>
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Please contact your library administrator for a new invitation.
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="h5" color="success.main" gutterBottom>
              Welcome to the Library!
            </Typography>
            <Typography variant="body1">
              Your account has been created successfully. Redirecting to your dashboard...
            </Typography>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default AcceptInvitation;