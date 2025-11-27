import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from '@mui/material';

interface Book {
  id?: string;
  title: string;
  author: string;
  isbn: string;
  categoryId: string;
  coverImageUrl?: string;
  publishYear: number;
  totalCopies: number;
  description?: string;
  shelfNumber?: string;
  section?: string;
}

interface BookCategory {
  id: string;
  name: string;
}

interface BookFormProps {
  book?: Book;
  categories: BookCategory[];
  onSubmit: (bookData: any) => void;
  onCancel: () => void;
  open?: boolean;
  uploadBookCover?: (file: File) => Promise<{ success: boolean; data?: string }>;
}

const BookForm: React.FC<BookFormProps> = ({ book, categories, onSubmit, onCancel, open = true, uploadBookCover }) => {
  const [formData, setFormData] = useState<Book>({
    title: '',
    author: '',
    isbn: '',
    categoryId: '',
    coverImageUrl: '',
    publishYear: new Date().getFullYear(),
    totalCopies: 1,
    description: '',
    shelfNumber: 'A1', // Default shelf number
    section: 'General' // Default section
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (book) {
      setFormData(book);
    }
  }, [book]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'publishYear' || name === 'totalCopies' ? parseInt(value) || 0 : value
    }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    let coverImageUrl = formData.coverImageUrl;
    
    // Upload cover image if a file is selected and uploadBookCover function is available
    if (selectedFile && uploadBookCover) {
      const uploadResult = await uploadBookCover(selectedFile);
      if (uploadResult.success) {
        coverImageUrl = uploadResult.data || '';
      }
    }
    
    // Ensure required fields have default values
    const submitData = {
      ...formData,
      shelfNumber: formData.shelfNumber || 'A1',
      section: formData.section || 'General',
      description: formData.description || '',
      coverImageUrl: coverImageUrl
    };
    
    setUploading(false);
    onSubmit(submitData);
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{book ? 'Edit Book' : 'Add New Book'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              label="Author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              label="ISBN"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              required
              fullWidth
            />

            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleSelectChange}
                label="Category"
              >
                {categories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Cover Image URL"
              name="coverImageUrl"
              value={formData.coverImageUrl}
              onChange={handleChange}
              fullWidth
            />

            <Box>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ marginBottom: '8px' }}
              />
              {selectedFile && (
                <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                  Selected: {selectedFile.name}
                </Box>
              )}
            </Box>

            <TextField
              label="Publish Year"
              name="publishYear"
              type="number"
              value={formData.publishYear}
              onChange={handleChange}
              inputProps={{ min: 1000, max: new Date().getFullYear() + 1 }}
              fullWidth
            />

            <TextField
              label="Total Copies"
              name="totalCopies"
              type="number"
              value={formData.totalCopies}
              onChange={handleChange}
              inputProps={{ min: 1 }}
              fullWidth
            />

            <TextField
              label="Shelf Number (Optional)"
              name="shelfNumber"
              value={formData.shelfNumber || ''}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Section (Optional)"
              name="section"
              value={formData.section || ''}
              onChange={handleChange}
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
          <Button onClick={onCancel} disabled={uploading}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={uploading}>
            {uploading ? 'Uploading...' : (book ? 'Update Book' : 'Add Book')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BookForm;