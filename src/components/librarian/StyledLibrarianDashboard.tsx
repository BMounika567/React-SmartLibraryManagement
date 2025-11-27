import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import { LibrarianDashboardProvider, useLibrarianDashboardContext } from '../../context/LibrarianDashboardContext';
import Dialog from '../common/Dialog';
import { Modal, Box, Typography, Button } from '@mui/material';
import * as styles from './styles/librarianDashboard.styles';

import BookIssueSystem from './BookIssueSystem';
import ErrorBoundary from '../ErrorBoundary';
import BookReturnSystem from '../BookReturnSystem';
import BookRequestSystem from '../BookRequestSystem';
import FinesAndPayments from '../FinesAndPayments';
import BookReservationSystem from '../BookReservationSystem';
import LibrarySettings from '../LibrarySettings';

// Import styled tab components
import OverviewTab from './OverviewTab';
import BooksTab from './BooksTab';
import MembersTab from './MembersTab';
import LibrarianProfileTab from './LibrarianProfileTab';

interface BookCopy {
  id: string;
  copyNumber: number;
  barcode: string;
  qrCode: string;
  status: 'Available' | 'Issued' | 'Reserved' | 'Lost' | 'Maintenance';
  condition: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  categoryId: string;
  categoryName?: string;
  totalCopies: number;
  availableCopies: number;
  coverImageUrl?: string;
  copies?: BookCopy[];
}

interface BookCategory {
  id: string;
  name: string;
}

const StyledLibrarianDashboardContent: React.FC = () => {
  const { user, logout } = useAuth();
  const { 
    books, 
    categories, 
    members, 
    loading, 
    refreshData,
    
    addCategory,
    updateCategory,
    deleteCategory,
    addBook,
    updateBook,
    uploadBookCover,
    getBookCopies,
    addBookCopies 
  } = useLibrarianDashboardContext();

  const [activeTab, setActiveTab] = useState<'overview' | 'books' | 'members' | 'issue' | 'return' | 'requests' | 'reservations' | 'fines' | 'settings' | 'profile' | 'addbook' | 'addcategory' | 'bookdetails'>('overview');
  
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<BookCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [showCopies, setShowCopies] = useState(false);
  const [bookCopies, setBookCopies] = useState<BookCopy[]>([]);
  const [showAddCopies, setShowAddCopies] = useState(false);
  const [copiesToAdd, setCopiesToAdd] = useState(1);
  const [addingCopies, setAddingCopies] = useState(false);
  const [showEditBook, setShowEditBook] = useState(false);
  const [editBookForm, setEditBookForm] = useState<{
    id: string;
    title: string;
    author: string;
    isbn: string;
    categoryId: string;
    description: string;
    totalCopies: number;
    publishYear: number;
    shelfNumber: string;
    section: string;
    coverImageUrl: string;
  }>({ 
    id: '',
    title: '', 
    author: '', 
    isbn: '', 
    categoryId: '', 
    description: '',
    totalCopies: 1,
    publishYear: new Date().getFullYear(),
    shelfNumber: '',
    section: '',
    coverImageUrl: ''
  });
  const [updatingBook, setUpdatingBook] = useState(false);
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BookCategory | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [showDeleteBookModal, setShowDeleteBookModal] = useState(false);
  const [deleteBookId, setDeleteBookId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ show: false, title: '', message: '', type: 'success' });

  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [memberStatusFilter, setMemberStatusFilter] = useState('');
  const [memberTypeFilter, setMemberTypeFilter] = useState('');
  const [memberSortBy, setMemberSortBy] = useState('name');
  const [bookForm, setBookForm] = useState<{
    title: string;
    author: string;
    isbn: string;
    categoryId: string;
    description: string;
    totalCopies: number;
    publishYear: number;
    shelfNumber: string;
    section: string;
    coverImageUrl: string;
    floor: string;
    aisle: string;
    locationNotes: string;
    publisher: string;
    edition: string;
    language: string;
    pageCount: number | null;
  }>({
    title: '', 
    author: '', 
    isbn: '', 
    categoryId: '', 
    description: '',
    totalCopies: 1,
    publishYear: new Date().getFullYear(),
    shelfNumber: '',
    section: '',
    coverImageUrl: '',
    floor: '',
    aisle: '',
    locationNotes: '',
    publisher: '',
    edition: '',
    language: 'English',
    pageCount: null
  });

  useEffect(() => {
    const handleBookDataChange = () => {
      refreshData();
    };
    
    window.addEventListener('bookDataChanged', handleBookDataChange);
    
    return () => {
      window.removeEventListener('bookDataChanged', handleBookDataChange);
    };
  }, []);

  const handleAddCopies = async () => {
    if (!selectedBook || copiesToAdd < 1) return;
    
    setAddingCopies(true);
    try {
      const result = await addBookCopies(selectedBook.id, copiesToAdd);
      
      if (result.success) {
        setDialog({
          show: true,
          title: 'Success',
          message: `Successfully added ${copiesToAdd} copies to "${selectedBook.title}"!`,
          type: 'success'
        });
        
        // Update selectedBook with fresh data from context
        setTimeout(() => {
          const updatedBook = books.find(book => book.id === selectedBook.id);
          if (updatedBook) {
            setSelectedBook(updatedBook);
          }
        }, 100);
        
        if (showCopies) {
          fetchBookCopies(selectedBook.id);
        }
        
        setShowAddCopies(false);
        setCopiesToAdd(1);
      } else {
        setDialog({
          show: true,
          title: 'Error',
          message: result.message || 'Failed to add copies',
          type: 'error'
        });
      }
    } catch (error: any) {
      setDialog({
        show: true,
        title: 'Error',
        message: 'Error adding copies: ' + (error.message || 'Unknown error occurred'),
        type: 'error'
      });
    } finally {
      setAddingCopies(false);
    }
  };

  const fetchBookCopies = async (bookId: string) => {
    try {
      const copies = await getBookCopies(bookId);
      setBookCopies(copies || []);
    } catch (error) {
      setBookCopies([]);
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let categoryId = bookForm.categoryId;
    let coverImageUrl = bookForm.coverImageUrl;
    
    if (showNewCategoryInput && newCategoryName.trim()) {
      try {
        await addCategory({ name: newCategoryName.trim(), description: '' });
        // Get the newly created category ID from the refreshed categories
        await refreshData();
        const newCategory = categories.find(cat => cat.name === newCategoryName.trim());
        categoryId = newCategory?.id || categoryId;
      } catch (error: any) {
        setDialog({
          show: true,
          title: 'Error',
          message: 'Error creating category: ' + (error.response?.data?.message || error.message),
          type: 'error'
        });
        return;
      }
    }
    
    if (selectedCoverFile) {
      setUploadingCover(true);
      try {
        const uploadResult = await uploadBookCover(selectedCoverFile);
        if (uploadResult.success) {
          coverImageUrl = uploadResult.data || '';
        } else {
          setDialog({
            show: true,
            title: 'Error',
            message: uploadResult.message || 'Error uploading cover image',
            type: 'error'
          });
          setUploadingCover(false);
          return;
        }
      } catch (error: any) {
        setDialog({
          show: true,
          title: 'Error',
          message: 'Error uploading cover image: ' + error.message,
          type: 'error'
        });
        setUploadingCover(false);
        return;
      }
      setUploadingCover(false);
    }
    
    // Validate required fields
    if (!bookForm.title.trim()) {
      setDialog({
        show: true,
        title: 'Validation Error',
        message: 'Book title is required.',
        type: 'error'
      });
      return;
    }
    
    if (!bookForm.author.trim()) {
      setDialog({
        show: true,
        title: 'Validation Error',
        message: 'Author name is required.',
        type: 'error'
      });
      return;
    }
    
    if (!bookForm.isbn.trim()) {
      setDialog({
        show: true,
        title: 'Validation Error',
        message: 'ISBN is required.',
        type: 'error'
      });
      return;
    }

    // Validate ISBN format (5 to 10 digits, can have hyphens)
    const isbnClean = bookForm.isbn.replace(/[-\s]/g, '');
    if (!/^\d{5,10}$/.test(isbnClean)) {
      setDialog({
        show: true,
        title: 'Validation Error',
        message: 'ISBN must be between 5 and 10 digits (hyphens allowed).',
        type: 'error'
      });
      return;
    }

    if (!categoryId) {
      setDialog({
        show: true,
        title: 'Validation Error',
        message: 'Please select a category.',
        type: 'error'
      });
      return;
    }

    // Validate total copies
    if (bookForm.totalCopies < 1 || bookForm.totalCopies > 1000) {
      setDialog({
        show: true,
        title: 'Validation Error',
        message: 'Total copies must be between 1 and 1000.',
        type: 'error'
      });
      return;
    }

    // Validate publish year
    const currentYear = new Date().getFullYear();
    if (bookForm.publishYear < 1000 || bookForm.publishYear > currentYear + 1) {
      setDialog({
        show: true,
        title: 'Validation Error',
        message: `Publish year must be between 1000 and ${currentYear + 1}.`,
        type: 'error'
      });
      return;
    }
    
    try {
      const bookData = { ...bookForm, categoryId, coverImageUrl };
      const result = await addBook(bookData);
      
      if (result.success) {
        setActiveTab('books');
        setShowNewCategoryInput(false);
        setNewCategoryName('');
        setSelectedCoverFile(null);
        setBookForm({
          title: '', author: '', isbn: '', categoryId: '', description: '',
          totalCopies: 1, publishYear: new Date().getFullYear(), shelfNumber: '',
          section: '', coverImageUrl: '', floor: '', aisle: '', locationNotes: '',
          publisher: '', edition: '', language: 'English', pageCount: null
        });
        setDialog({
          show: true,
          title: 'Success',
          message: 'Book added successfully!',
          type: 'success'
        });
      } else {
        setDialog({
          show: true,
          title: 'Error',
          message: result.message || 'Failed to add book',
          type: 'error'
        });
      }
    } catch (error: any) {
      setDialog({
        show: true,
        title: 'Error',
        message: 'Error adding book: ' + (error.response?.data?.message || error.message),
        type: 'error'
      });
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryForm.name.trim()) {
      setDialog({
        show: true,
        title: 'Error',
        message: 'Category name is required.',
        type: 'error'
      });
      return;
    }
    
    addCategory(categoryForm);
    setActiveTab('books');
    setCategoryForm({ name: '', description: '' });
    setDialog({
      show: true,
      title: 'Success',
      message: 'Category added successfully!',
      type: 'success'
    });
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    
    try {
      const result = await updateCategory(editingCategory.id, categoryForm);
      if (result.success) {
        setShowEditCategory(false);
        setEditingCategory(null);
        setCategoryForm({ name: '', description: '' });
        setDialog({
          show: true,
          title: 'Success',
          message: 'Category updated successfully!',
          type: 'success'
        });
      } else {
        setDialog({
          show: true,
          title: 'Error',
          message: result.message || 'Failed to update category',
          type: 'error'
        });
      }
    } catch (error: any) {
      setDialog({
        show: true,
        title: 'Error',
        message: 'Error updating category: ' + (error.response?.data?.message || error.message),
        type: 'error'
      });
    }
  };

  const handleDeleteBook = (bookId: string) => {
    setDeleteBookId(bookId);
    setShowDeleteBookModal(true);
  };

  const confirmDeleteBook = async () => {
    if (!deleteBookId) return;
    try {
      await axiosClient.post('/api/Book/delete', { Id: deleteBookId });
      
      // Close book details if it's the deleted book
      if (selectedBook?.id === deleteBookId) {
        setSelectedBook(null);
        setActiveTab('books');
      }
      
      setShowDeleteBookModal(false);
      setDeleteBookId(null);
      
      // Force refresh dashboard data
      await refreshData();
      
      setDialog({
        show: true,
        title: 'Success',
        message: 'Book deleted successfully!',
        type: 'success'
      });
    } catch (error: any) {
      setShowDeleteBookModal(false);
      setDeleteBookId(null);
      setDialog({
        show: true,
        title: 'Error',
        message: 'Error deleting book: ' + (error.response?.data?.message || error.message || 'Unknown error occurred'),
        type: 'error'
      });
    }
  };

  const handleEditBook = (book: Book) => {
    setEditBookForm({
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      categoryId: book.categoryId,
      description: '',
      totalCopies: book.totalCopies,
      publishYear: new Date().getFullYear(),
      shelfNumber: '',
      section: '',
      coverImageUrl: book.coverImageUrl || ''
    });
    setShowEditBook(true);
  };

  const handleUpdateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;
    
    setUpdatingBook(true);
    let coverImageUrl = editBookForm.coverImageUrl;
    
    try {
      if (selectedCoverFile) {
        setUploadingCover(true);
        const uploadResult = await uploadBookCover(selectedCoverFile);
        if (uploadResult.success) {
          coverImageUrl = uploadResult.data || '';
        } else {
          setDialog({
            show: true,
            title: 'Error',
            message: uploadResult.message || 'Error uploading cover image',
            type: 'error'
          });
          setUploadingCover(false);
          setUpdatingBook(false);
          return;
        }
        setUploadingCover(false);
      }
      
      // Update book through context
      const result = await updateBook(selectedBook.id, {
        ...editBookForm,
        coverImageUrl: coverImageUrl
      });
      
      if (result.success) {
        // Update selectedBook with new data
        const updatedBook = books.find(book => book.id === selectedBook.id);
        if (updatedBook) {
          setSelectedBook({ ...updatedBook, coverImageUrl });
        }
      } else {
        setDialog({
          show: true,
          title: 'Error',
          message: result.message || 'Failed to update book',
          type: 'error'
        });
        setUploadingCover(false);
        setUpdatingBook(false);
        return;
      }
      
      setShowEditBook(false);
      setSelectedCoverFile(null);
      setDialog({
        show: true,
        title: 'Success',
        message: 'Book updated successfully!',
        type: 'success'
      });
    } catch (error: any) {
      setDialog({
        show: true,
        title: 'Error',
        message: 'Error updating book: ' + (error.response?.data?.message || error.message || 'Unknown error occurred'),
        type: 'error'
      });
      setUploadingCover(false);
    } finally {
      setUpdatingBook(false);
    }
  };

  const getFilteredAndSortedMembers = () => {
    let filtered = members.filter(member => {
      const matchesSearch = memberSearchTerm === '' || 
        member.name.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(memberSearchTerm.toLowerCase());
      
      const matchesStatus = memberStatusFilter === '' || memberStatusFilter === 'active';
      const matchesType = memberTypeFilter === '' || memberTypeFilter === 'member';
      
      return matchesSearch && matchesStatus && matchesType;
    });

    filtered.sort((a, b) => {
      switch (memberSortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'date':
          const dateA = new Date(a.createdDate || Date.now()).getTime();
          const dateB = new Date(b.createdDate || Date.now()).getTime();
          return dateB - dateA;
        case 'books':
        case 'fines':
        default:
          return (a.name || '').localeCompare(b.name || '');
      }
    });

    return filtered;
  };

  if (loading) return (
    <div style={{
      background: '#F4DBD8',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: '#BEABA7',
        color: '#2A0800',
        padding: '20px 40px',
        borderRadius: '15px',
        border: '1px solid #C09891'
      }}>
        Loading...
      </div>
    </div>
  );

  return (
    <div style={{
      background: '#FFFFFF',
      minHeight: '100vh',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Header */}
      <nav style={{
        background: '#4A7FA7',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #B3CFE5',
        padding: '15px 0',
        boxShadow: '0 2px 10px rgba(74, 127, 167, 0.3)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{
              color: '#FFFFFF',
              fontSize: '1.5rem',
              fontWeight: '700',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              Library Management System
            </span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  color: '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>Welcome back, {user?.name}</div>
                <div style={{
                  color: '#D1D5DB',
                  fontSize: '14px'
                }}>Last login: {new Date().toLocaleDateString()}</div>
              </div>
              <button 
                onClick={logout}
                style={{
                  background: '#B3CFE5',
                  color: '#4A7FA7',
                  border: '1px solid #B3CFE5',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#FFFFFF';
                  e.currentTarget.style.color = '#4A7FA7';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#B3CFE5';
                  e.currentTarget.style.color = '#4A7FA7';
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tabs */}
      <div style={{
        background: '#B3CFE5',
        borderBottom: '1px solid #B3CFE5',
        padding: '10px 20px',
        overflowX: 'auto'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'flex',
            gap: '8px',
            minWidth: 'max-content'
          }}>
            {[
              { key: 'overview', label: 'Dashboard', count: null },
              { key: 'books', label: 'Books', count: books.length },
              { key: 'members', label: 'Members', count: members.length },
              { key: 'issue', label: 'Issue', count: null },
              { key: 'return', label: 'Return', count: null },
              { key: 'requests', label: 'Requests', count: null },
              { key: 'reservations', label: 'Reserves', count: null },
              { key: 'fines', label: 'Fines', count: null },
              { key: 'settings', label: 'Settings', count: null },
              { key: 'profile', label: 'Profile', count: null }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  background: activeTab === tab.key ? '#4A7FA7' : 'transparent',
                  color: '#333333',
                  border: activeTab === tab.key ? '1px solid #4A7FA7' : '1px solid transparent',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '700',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexShrink: 0
                }}
                onMouseOver={(e) => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.color = '#333333';
                    e.currentTarget.style.background = 'rgba(74, 127, 167, 0.3)';
                  }
                }}
                onMouseOut={(e) => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.color = '#333333';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {tab.label}
                {tab.count !== null && (
                  <span style={{
                    background: activeTab === tab.key ? '#FFFFFF' : '#4A7FA7',
                    color: activeTab === tab.key ? '#4A7FA7' : '#FFFFFF',
                    borderRadius: '10px',
                    padding: '2px 6px',
                    fontSize: '10px',
                    fontWeight: '600',
                    minWidth: '16px',
                    textAlign: 'center'
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div style={{
        background: '#FFFFFF',
        minHeight: 'calc(100vh - 140px)',
        margin: '0 20px 20px',
        borderRadius: '15px',
        padding: '30px'
      }}>
        {activeTab === 'overview' && (
          <OverviewTab />
        )}

        {activeTab === 'books' && (
          <BooksTab
            books={books}
            categories={categories}
            selectedCategory={selectedCategory}
            searchTerm={searchTerm}
            onCategorySelect={setSelectedCategory}
            onSearchChange={setSearchTerm}
            onAddBook={() => setActiveTab('addbook')}
            onAddCategory={() => setActiveTab('addcategory')}
            onBookSelect={(book) => {
              setSelectedBook(book);
              setActiveTab('bookdetails');
            }}
            onDeleteBook={handleDeleteBook}
            onEditBook={handleEditBook}
            onViewCopies={(book) => {
              fetchBookCopies(book.id);
              setShowCopies(true);
            }}
            onEditCategory={(category) => {
              setCategoryForm({ name: category.name, description: '' });
              setEditingCategory(category);
              setShowEditCategory(true);
            }}
            onDeleteCategory={(categoryId) => {
              setDeleteCategoryId(categoryId);
              setShowDeleteModal(true);
            }}
          />
        )}

        {activeTab === 'members' && (
          <MembersTab
            members={members}
            memberSearchTerm={memberSearchTerm}
            setMemberSearchTerm={setMemberSearchTerm}
            memberStatusFilter={memberStatusFilter}
            setMemberStatusFilter={setMemberStatusFilter}
            memberTypeFilter={memberTypeFilter}
            setMemberTypeFilter={setMemberTypeFilter}
            memberSortBy={memberSortBy}
            setMemberSortBy={setMemberSortBy}
            getFilteredAndSortedMembers={getFilteredAndSortedMembers}
          />
        )}

        {activeTab === 'issue' && (
          <ErrorBoundary>
            <BookIssueSystem />
          </ErrorBoundary>
        )}

        {activeTab === 'return' && (
          <div>
            <BookReturnSystem />
          </div>
        )}

        {activeTab === 'requests' && (
          <div>
            <BookRequestSystem />
          </div>
        )}

        {activeTab === 'reservations' && (
          <div>
            <BookReservationSystem />
          </div>
        )}

        {activeTab === 'fines' && (
          <div>
            <FinesAndPayments />
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <LibrarySettings />
          </div>
        )}

        {activeTab === 'profile' && (
          <LibrarianProfileTab />
        )}

        {activeTab === 'addbook' && (
          <div style={{
            background: 'white',
            borderRadius: '15px',
            border: '1px solid #ddd',
            padding: '30px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ marginBottom: '30px' }}>
              <button
                onClick={() => setActiveTab('books')}
                style={{
                  background: 'transparent',
                  color: '#1B4332',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <i className="bi bi-arrow-left"></i>
                Back to Books
              </button>
              <h3 style={{
                color: '#333',
                fontWeight: '600',
                margin: 0
              }}>Add New Book</h3>
            </div>
            <form onSubmit={handleAddBook} style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              <div>
                <label style={{
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  display: 'block'
                }}>Title <span style={{ color: '#dc3545' }}>*</span></label>
                <input
                  type="text"
                  value={bookForm.title}
                  onChange={(e) => setBookForm({...bookForm, title: e.target.value})}
                  required
                  style={{
                    background: 'white',
                    color: '#333',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '12px 15px',
                    fontSize: '14px',
                    width: '100%'
                  }}
                />
              </div>
              <div>
                <label style={{
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  display: 'block'
                }}>Author <span style={{ color: '#dc3545' }}>*</span></label>
                <input
                  type="text"
                  value={bookForm.author}
                  onChange={(e) => setBookForm({...bookForm, author: e.target.value})}
                  required
                  style={{
                    background: 'white',
                    color: '#333',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '12px 15px',
                    fontSize: '14px',
                    width: '100%'
                  }}
                />
              </div>
              <div>
                <label style={{
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  display: 'block'
                }}>ISBN <span style={{ color: '#dc3545' }}>*</span></label>
                <input
                  type="text"
                  value={bookForm.isbn}
                  onChange={(e) => setBookForm({...bookForm, isbn: e.target.value})}
                  style={{
                    background: 'white',
                    color: '#333',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '12px 15px',
                    fontSize: '14px',
                    width: '100%'
                  }}
                />
              </div>
              <div>
                <label style={{
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  display: 'block'
                }}>Category <span style={{ color: '#dc3545' }}>*</span></label>
                <select
                  value={bookForm.categoryId}
                  onChange={(e) => setBookForm({...bookForm, categoryId: e.target.value})}
                  required
                  style={{
                    background: 'white',
                    color: '#333',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '12px 15px',
                    fontSize: '14px',
                    width: '100%'
                  }}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  display: 'block'
                }}>Total Copies</label>
                <input
                  type="number"
                  value={bookForm.totalCopies}
                  onChange={(e) => setBookForm({...bookForm, totalCopies: parseInt(e.target.value) || 1})}
                  min="1"
                  style={{
                    background: 'white',
                    color: '#333',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '12px 15px',
                    fontSize: '14px',
                    width: '100%'
                  }}
                />
              </div>
              <div>
                <label style={{
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  display: 'block'
                }}>Book Cover Image <span style={{ color: '#dc3545' }}>*</span></label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedCoverFile(e.target.files?.[0] || null)}
                  style={{
                    background: 'white',
                    color: '#333',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '12px 15px',
                    fontSize: '14px',
                    width: '100%'
                  }}
                />
                {selectedCoverFile && (
                  <small style={{ color: '#666', fontSize: '12px' }}>
                    Selected: {selectedCoverFile.name}
                  </small>
                )}
              </div>
              <div style={{
                gridColumn: '1 / -1',
                display: 'flex',
                gap: '15px',
                justifyContent: 'flex-end',
                marginTop: '20px'
              }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('books')}
                  style={{
                    background: 'transparent',
                    color: '#666',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#6B7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Add Book
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'addcategory' && (
          <div style={{
            background: 'white',
            borderRadius: '15px',
            border: '1px solid #ddd',
            padding: '30px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ marginBottom: '30px' }}>
              <button
                onClick={() => setActiveTab('books')}
                style={{
                  background: 'transparent',
                  color: '#1B4332',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <i className="bi bi-arrow-left"></i>
                Back to Books
              </button>
              <h3 style={{
                color: '#333',
                fontWeight: '600',
                margin: 0
              }}>Add New Category</h3>
            </div>
            <form onSubmit={handleAddCategory} style={{ maxWidth: '500px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  display: 'block'
                }}>Category Name *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                  required
                  style={{
                    background: 'white',
                    color: '#333',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '12px 15px',
                    fontSize: '14px',
                    width: '100%'
                  }}
                />
                {!categoryForm.name.trim() && (
                  <small style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    Category name is required
                  </small>
                )}
              </div>
              <div style={{ marginBottom: '30px' }}>
                <label style={{
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  display: 'block'
                }}>Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                  rows={3}
                  style={{
                    background: 'white',
                    color: '#333',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '12px 15px',
                    fontSize: '14px',
                    width: '100%',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('books')}
                  style={{
                    background: 'transparent',
                    color: '#666',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#6B7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'bookdetails' && selectedBook && (
          <div style={{
            background: 'white',
            borderRadius: '15px',
            border: '1px solid #ddd',
            padding: '30px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ marginBottom: '30px' }}>
              <button
                onClick={() => setActiveTab('books')}
                style={{
                  background: 'transparent',
                  color: '#1B4332',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                ← Back to Books
              </button>
              <h3 style={{
                color: '#333',
                fontWeight: '600',
                margin: 0
              }}>Book Details</h3>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '30px',
              alignItems: 'start'
            }}>
              {selectedBook.coverImageUrl ? (
                <img 
                  src={selectedBook.coverImageUrl.startsWith('/') 
                    ? `https://localhost:7020${selectedBook.coverImageUrl}` 
                    : selectedBook.coverImageUrl
                  } 
                  alt={selectedBook.title}
                  style={{
                    width: '200px',
                    height: '300px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #ddd'
                  }}
                />
              ) : (
                <div style={{
                  width: '200px',
                  height: '300px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  color: '#6c757d'
                }}>
                  <i className="fas fa-book"></i>
                </div>
              )}
              <div>
                <h2 style={{
                  color: '#333',
                  fontWeight: '700',
                  marginBottom: '10px'
                }}>{selectedBook.title}</h2>
                <p style={{
                  color: '#666',
                  fontSize: '18px',
                  marginBottom: '20px'
                }}>by {selectedBook.author}</p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '15px',
                  marginBottom: '20px'
                }}>
                  <div>
                    <strong style={{ color: '#374151' }}>ISBN:</strong>
                    <p style={{ margin: '5px 0', color: '#666' }}>{selectedBook.isbn || 'N/A'}</p>
                  </div>
                  <div>
                    <strong style={{ color: '#374151' }}>Category:</strong>
                    <p style={{ margin: '5px 0', color: '#666' }}>{selectedBook.categoryName || 'Unknown'}</p>
                  </div>
                  <div>
                    <strong style={{ color: '#374151' }}>Total Copies:</strong>
                    <p style={{ margin: '5px 0', color: '#666' }}>{selectedBook.totalCopies}</p>
                  </div>
                  <div>
                    <strong style={{ color: '#374151' }}>Available Copies:</strong>
                    <p style={{ margin: '5px 0', color: selectedBook.availableCopies > 0 ? '#28a745' : '#dc3545' }}>
                      {selectedBook.availableCopies}
                    </p>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={() => {
                      fetchBookCopies(selectedBook.id);
                      setShowCopies(true);
                    }}
                    style={{
                      background: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <i className="fas fa-chart-bar"></i>
                    View Copies
                  </button>
                  <button
                    onClick={() => setShowAddCopies(true)}
                    style={{
                      background: '#6f42c1',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <i className="fas fa-plus"></i>
                    Add More Copies
                  </button>
                  <button
                    onClick={() => handleEditBook(selectedBook)}
                    style={{
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <i className="fas fa-edit"></i>
                    Edit Book
                  </button>
                  <button
                    onClick={() => handleDeleteBook(selectedBook.id)}
                    style={{
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <i className="fas fa-trash"></i>
                    Delete Book
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Copies Modal */}
        {showCopies && selectedBook && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '30px',
              maxWidth: '800px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{
                  color: '#333',
                  fontWeight: '600',
                  margin: 0
                }}>Book Copies - {selectedBook.title}</h3>
                <button
                  onClick={() => setShowCopies(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  ×
                </button>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '15px'
              }}>
                {Array.isArray(bookCopies) && bookCopies.map((copy) => {
                  const getStatusText = (status: any) => {
                    if (typeof status === 'number') {
                      const statusMap = {
                        0: 'Available',
                        1: 'Issued',
                        2: 'Reserved',
                        3: 'Lost',
                        4: 'Maintenance'
                      };
                      return statusMap[status as keyof typeof statusMap] || 'Unknown';
                    }
                    return status || 'Unknown';
                  };
                  
                  const statusText = getStatusText(copy.status);
                  
                  return (
                    <div key={copy.id} style={{
                      background: '#f8f9fa',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '15px'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '10px'
                      }}>
                        <strong>Copy #{copy.copyNumber}</strong>
                        <span style={{
                          background: statusText === 'Available' ? '#28a745' : '#dc3545',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px'
                        }}>
                          {statusText}
                        </span>
                      </div>
                      <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                        <strong>Barcode:</strong> {copy.barcode}
                      </p>
                      <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                        <strong>Condition:</strong> {copy.condition}
                      </p>
                    </div>
                  );
                })}
              </div>
              {(!Array.isArray(bookCopies) || bookCopies.length === 0) && (
                <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                  No copies found for this book.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Add More Copies Modal */}
        {showAddCopies && selectedBook && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '30px',
              maxWidth: '400px',
              width: '90%'
            }}>
              <h3 style={{
                color: '#333',
                fontWeight: '600',
                marginBottom: '20px'
              }}>Add More Copies</h3>
              <p style={{
                color: '#666',
                marginBottom: '20px'
              }}>Add more copies for "{selectedBook.title}"</p>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  display: 'block'
                }}>Number of Copies</label>
                <input
                  type="number"
                  value={copiesToAdd}
                  onChange={(e) => setCopiesToAdd(parseInt(e.target.value) || 1)}
                  min="1"
                  max="100"
                  style={{
                    background: 'white',
                    color: '#333',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '12px 15px',
                    fontSize: '14px',
                    width: '100%'
                  }}
                />
              </div>
              <div style={{
                display: 'flex',
                gap: '15px',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCopies(false);
                    setCopiesToAdd(1);
                  }}
                  style={{
                    background: 'transparent',
                    color: '#666',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCopies}
                  disabled={addingCopies}
                  style={{
                    background: addingCopies ? '#ccc' : '#6f42c1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    cursor: addingCopies ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  {addingCopies ? 'Adding...' : 'Add Copies'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Book Modal */}
        {showEditBook && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '30px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              <h3 style={{
                color: '#333',
                fontWeight: '600',
                marginBottom: '20px'
              }}>Edit Book</h3>
              <form onSubmit={handleUpdateBook}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                  <div>
                    <label style={styles.formLabelStyle}>Title *</label>
                    <input
                      type="text"
                      value={editBookForm.title}
                      onChange={(e) => setEditBookForm({...editBookForm, title: e.target.value})}
                      required
                      style={styles.inputStyle}
                    />
                  </div>
                  <div>
                    <label style={styles.formLabelStyle}>Author *</label>
                    <input
                      type="text"
                      value={editBookForm.author}
                      onChange={(e) => setEditBookForm({...editBookForm, author: e.target.value})}
                      required
                      style={styles.inputStyle}
                    />
                  </div>
                  <div>
                    <label style={styles.formLabelStyle}>ISBN</label>
                    <input
                      type="text"
                      value={editBookForm.isbn}
                      onChange={(e) => setEditBookForm({...editBookForm, isbn: e.target.value})}
                      style={styles.inputStyle}
                    />
                  </div>
                  <div>
                    <label style={styles.formLabelStyle}>Category *</label>
                    <select
                      value={editBookForm.categoryId}
                      onChange={(e) => setEditBookForm({...editBookForm, categoryId: e.target.value})}
                      required
                      style={styles.selectStyle}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={styles.fullWidthGridItemStyle}>
                    <label style={styles.formLabelStyle}>Book Cover Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedCoverFile(e.target.files?.[0] || null)}
                      style={styles.fileInputStyle}
                    />
                    {selectedCoverFile && (
                      <small style={styles.smallTextStyle}>
                        Selected: {selectedCoverFile.name}
                      </small>
                    )}
                    {editBookForm.coverImageUrl && !selectedCoverFile && (
                      <small style={styles.smallTextStyle}>
                        Current: Cover image exists
                      </small>
                    )}
                  </div>
                </div>
                <div style={styles.flexEndStyle}>
                  <button
                    type="button"
                    onClick={() => setShowEditBook(false)}
                    style={styles.secondaryButtonStyle}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingBook}
                    style={updatingBook ? styles.disabledButtonStyle : { ...styles.primaryButtonStyle, background: '#6B7280' }}
                  >
                    {updatingBook ? 'Updating...' : 'Update Book'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Category Modal */}
        {showEditCategory && editingCategory && (
          <div style={styles.modalOverlayStyle}>
            <div style={styles.modalContentStyle}>
              <h3 style={styles.modalTitleStyle}>Edit Category</h3>
              <form onSubmit={handleUpdateCategory}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={styles.formLabelStyle}>Category Name *</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                    required
                    style={styles.inputStyle}
                  />
                </div>
                <div style={{ marginBottom: '30px' }}>
                  <label style={styles.formLabelStyle}>Description</label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                    rows={3}
                    style={styles.textareaStyle}
                  />
                </div>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditCategory(false);
                      setEditingCategory(null);
                      setCategoryForm({ name: '', description: '' });
                    }}
                    style={styles.secondaryButtonStyle}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={styles.primaryButtonStyle}
                  >
                    Update Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Box sx={styles.deleteModalBoxStyle}>
            <Box sx={styles.deleteModalHeaderStyle}>
              <Box sx={styles.deleteModalIconContainerStyle}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Box>
              <Typography variant="h6" sx={{ margin: 0, fontWeight: '700', letterSpacing: '0.5px' }}>Delete Category</Typography>
            </Box>
            <Box sx={styles.deleteModalContentStyle}>
              <Typography sx={styles.deleteModalTextStyle}>
                Are you sure you want to delete this category? This action cannot be undone.
              </Typography>

              <Box sx={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <Button
                  onClick={async () => {
                    if (deleteCategoryId) {
                      const result = await deleteCategory(deleteCategoryId);
                      setDialog({
                        show: true,
                        title: result.success ? 'Success' : 'Error',
                        message: result.message,
                        type: result.success ? 'success' : 'error'
                      });
                    }
                    setShowDeleteModal(false);
                    setDeleteCategoryId(null);
                  }}
                  sx={styles.muiButtonPrimaryStyle}
                >
                  Delete
                </Button>
                <Button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteCategoryId(null);
                  }}
                  sx={styles.muiButtonSecondaryStyle}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </Box>
        </Modal>

        {/* Delete Book Confirmation Modal */}
        <Modal
          open={showDeleteBookModal}
          onClose={() => setShowDeleteBookModal(false)}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Box sx={styles.deleteModalBoxStyle}>
            <Box sx={styles.deleteModalHeaderStyle}>
              <Box sx={styles.deleteModalIconContainerStyle}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Box>
              <Typography variant="h6" sx={{ margin: 0, fontWeight: '700', letterSpacing: '0.5px' }}>Delete Book</Typography>
            </Box>
            <Box sx={styles.deleteModalContentStyle}>
              <Typography sx={styles.deleteModalTextStyle}>
                Are you sure you want to delete this book? This action cannot be undone.
              </Typography>
              <Box sx={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <Button onClick={confirmDeleteBook} sx={styles.muiButtonPrimaryStyle}>Delete</Button>
                <Button
                  onClick={() => {
                    setShowDeleteBookModal(false);
                    setDeleteBookId(null);
                  }}
                  sx={styles.muiButtonSecondaryStyle}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </Box>
        </Modal>

        {/* Dialog Component */}
        <Dialog
          isOpen={dialog.show}
          onClose={() => setDialog({ show: false, title: '', message: '', type: 'success' })}
          title={dialog.title}
          message={dialog.message}
          type={dialog.type}
          theme="library"
        />
      </div>
    </div>
  );
};

const StyledLibrarianDashboard: React.FC = () => {
  return (
    <LibrarianDashboardProvider>
      <StyledLibrarianDashboardContent />
    </LibrarianDashboardProvider>
  );
};

export default StyledLibrarianDashboard;