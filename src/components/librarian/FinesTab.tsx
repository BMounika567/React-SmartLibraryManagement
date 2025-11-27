import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Chip, Button, CircularProgress } from '@mui/material';
import { useFines } from '../../hooks/useFines';
import type { ProcessedFine } from '../../services/fineService';

const FinesTab: React.FC = () => {
  const { 
    allFines, 
    loading, 
    error, 
    getPendingFines, 
    getPaidFines, 
    getTotalPendingAmount, 
    getTotalPaidAmount,
    refetch 
  } = useFines();

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'paid'>('all');

  const pendingFines = getPendingFines();
  const paidFines = getPaidFines();

  const getDisplayFines = (): ProcessedFine[] => {
    switch (activeTab) {
      case 'pending': return pendingFines;
      case 'paid': return paidFines;
      default: return allFines;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#4caf50';
      case 'partial': return '#ff9800';
      case 'pending': return '#f44336';
      default: return '#757575';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" p={4}>
        <Typography color="error">{error}</Typography>
        <Button onClick={refetch} variant="contained" sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
            <Typography variant="h6" color="#e65100">Total Fines</Typography>
            <Typography variant="h4" fontWeight="bold">
              ₹{(getTotalPendingAmount() + getTotalPaidAmount()).toFixed(2)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {allFines.length} records
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#ffebee' }}>
            <Typography variant="h6" color="#d32f2f">Pending</Typography>
            <Typography variant="h4" fontWeight="bold">
              ₹{getTotalPendingAmount().toFixed(2)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {pendingFines.length} records
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e8' }}>
            <Typography variant="h6" color="#2e7d32">Paid</Typography>
            <Typography variant="h4" fontWeight="bold">
              ₹{getTotalPaidAmount().toFixed(2)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {paidFines.length} records
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Button onClick={refetch} variant="outlined" fullWidth>
              Refresh Data
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Tab Navigation */}
      <Box sx={{ mb: 3 }}>
        <Button 
          variant={activeTab === 'all' ? 'contained' : 'outlined'}
          onClick={() => setActiveTab('all')}
          sx={{ mr: 1 }}
        >
          All ({allFines.length})
        </Button>
        <Button 
          variant={activeTab === 'pending' ? 'contained' : 'outlined'}
          onClick={() => setActiveTab('pending')}
          sx={{ mr: 1 }}
        >
          Pending ({pendingFines.length})
        </Button>
        <Button 
          variant={activeTab === 'paid' ? 'contained' : 'outlined'}
          onClick={() => setActiveTab('paid')}
        >
          Paid ({paidFines.length})
        </Button>
      </Box>

      {/* Fines List */}
      <Paper>
        {getDisplayFines().length === 0 ? (
          <Box p={4} textAlign="center">
            <Typography variant="h6" color="textSecondary">
              No {activeTab} fines found
            </Typography>
          </Box>
        ) : (
          getDisplayFines().map((fine) => (
            <Box key={fine.id} sx={{ p: 2, borderBottom: '1px solid #eee' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {fine.userName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {fine.userEmail}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Typography variant="body1">{fine.bookTitle}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    by {fine.bookAuthor}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={2}>
                  <Typography variant="body2">
                    Due: {new Date(fine.dueDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {fine.isReturned ? 'Returned' : 'Not Returned'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={2}>
                  <Typography variant="body1">
                    Total: ₹{fine.fineAmount.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Paid: ₹{fine.paidAmount.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="error">
                    Pending: ₹{fine.pendingAmount.toFixed(2)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={2}>
                  <Chip 
                    label={fine.status.toUpperCase()}
                    sx={{ 
                      bgcolor: getStatusColor(fine.status),
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          ))
        )}
      </Paper>
    </Box>
  );
};

export default FinesTab;