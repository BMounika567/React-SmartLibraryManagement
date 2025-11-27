import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box
} from '@mui/material';

interface BookCategory {
  id?: string;
  name: string;
  description?: string;
}

interface CategoryFormProps {
  category?: BookCategory;
  onSubmit: (categoryData: any) => void;
  onCancel: () => void;
  open?: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSubmit, onCancel, open = true }) => {
  const [formData, setFormData] = useState<BookCategory>({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (category) {
      setFormData(category);
    } else {
      setFormData({ name: '', description: '' });
    }
  }, [category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{category ? 'Edit Category' : 'Add New Category'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Category Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="contained">
            {category ? 'Update Category' : 'Add Category'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CategoryForm;