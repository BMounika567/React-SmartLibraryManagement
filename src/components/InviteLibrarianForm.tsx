import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography
} from '@mui/material';

interface InviteLibrarianFormProps {
  open: boolean;
  onSubmit: (inviteData: any) => void;
  onCancel: () => void;
}

const InviteLibrarianForm: React.FC<InviteLibrarianFormProps> = ({ open, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    expiryDays: 7
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'expiryDays' ? parseInt(value) || 7 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ name: '', email: '', expiryDays: 7 });
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', expiryDays: 7 });
    onCancel();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Invite Librarian</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Send an invitation email to invite someone as a librarian. They will receive an email with a unique invitation code.
            </Typography>
            
            <TextField
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              label="Invitation Expires In (Days)"
              name="expiryDays"
              type="number"
              value={formData.expiryDays}
              onChange={handleChange}
              inputProps={{ min: 1, max: 30 }}
              fullWidth
              helperText="The invitation will expire after this many days"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Send Invitation
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default InviteLibrarianForm;