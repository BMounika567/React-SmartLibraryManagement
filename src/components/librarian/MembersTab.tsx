import React, { useState } from 'react';
import Dialog from '../common/Dialog';
import { useLibrarianDashboardContext } from '../../context/LibrarianDashboardContext';
import { Paper, Typography, Box, Grid } from '@mui/material';


interface MembersTabProps {
  members: any[];
  memberSearchTerm: string;
  setMemberSearchTerm: (term: string) => void;
  memberStatusFilter: string;
  setMemberStatusFilter: (filter: string) => void;
  memberTypeFilter: string;
  setMemberTypeFilter: (filter: string) => void;
  memberSortBy: string;
  setMemberSortBy: (sort: string) => void;
  getFilteredAndSortedMembers: () => any[];
}

const MembersTab: React.FC<MembersTabProps> = ({
  members,
  memberSearchTerm,
  setMemberSearchTerm,
  memberStatusFilter,
  setMemberStatusFilter,
  memberTypeFilter,
  setMemberTypeFilter,
  memberSortBy,
  setMemberSortBy,
  getFilteredAndSortedMembers
}) => {
  const { deleteMember, getMemberProfile, activeBookIssues, fines } = useLibrarianDashboardContext();
  const [dialog, setDialog] = useState<{isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'info', showConfirm?: boolean, onConfirm?: () => void}>({isOpen: false, title: '', message: '', type: 'info'});

  // Calculate member statistics from existing dashboard data
  const getMemberStats = (member: any) => {
    // Match by studentName since userId field doesn't exist in book issues
    const memberActiveIssues = activeBookIssues.filter(issue => 
      issue.studentName?.toLowerCase() === member.name?.toLowerCase()
    );
    
    // Match fines by userId or memberName
    const memberFines = fines.filter(fine => 
      fine.userId === member.id || fine.memberName?.toLowerCase() === member.name?.toLowerCase()
    );
    
    const totalFines = memberFines.reduce((sum, fine) => sum + (fine.fineAmount || 0), 0);
    
    return {
      booksIssued: memberActiveIssues.length,
      totalFines: totalFines,
      status: member.status || 'active'
    };
  };

  const handleViewProfile = (member: any) => {
    const result = getMemberProfile(member.id);
    if (result.success) {
      setDialog({
        isOpen: true,
        title: 'Member Profile',
        message: `Name: ${result.data.name}\nEmail: ${result.data.email}\nJoin Date: ${new Date(result.data.createdDate).toLocaleDateString()}`,
        type: 'info'
      });
    } else {
      setDialog({
        isOpen: true,
        title: 'Error',
        message: result.message || `Error loading profile for ${member.name}`,
        type: 'error'
      });
    }
  };



  const handleSuspendMember = async (member: any) => {
    setDialog({
      isOpen: true,
      title: 'Delete Member',
      message: `Are you sure you want to delete ${member.name}? This action cannot be undone.`,
      type: 'error',
      showConfirm: true,
      onConfirm: () => {
        const result = deleteMember(member.id);
        setDialog({
          isOpen: true,
          title: result.success ? 'Success' : 'Cannot Delete Member',
          message: result.message,
          type: result.success ? 'success' : 'info'
        });
      }
    });
  };

  return (
    <div style={{ padding: '0' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{
          color: '#000000',
          fontWeight: '700',
          margin: '0 0 8px 0',
          fontSize: '1.5rem'
        }}>Member Management</h3>
        <p style={{
          color: '#1a1a1a',
          margin: '0',
          fontSize: '14px'
        }}>View and manage registered library members</p>
      </div>

      {/* Filters and Search */}
      <div style={{ marginBottom: '25px' }}>
        <div style={{
          display: 'flex',
          gap: '15px',
          alignItems: 'center'
        }}>
            {/* Search Input */}
            <div style={{ flex: '2', minWidth: '300px' }}>
              <input
                type="text"
                placeholder="Search members by name or email..."
                value={memberSearchTerm}
                onChange={(e) => setMemberSearchTerm(e.target.value)}
                style={{
                  background: 'white',
                  border: '1px solid #B3CFE5',
                  borderRadius: '8px',
                  color: '#1a1a1a',
                  padding: '10px 15px',
                  fontSize: '14px',
                  width: '100%',
                  outline: 'none'
                }}
              />
            </div>
            {/* Status Filter */}
            <select
              value={memberStatusFilter}
              onChange={(e) => setMemberStatusFilter(e.target.value)}
              style={{
                background: 'white',
                color: '#1a1a1a',
                border: '1px solid #B3CFE5',
                borderRadius: '8px',
                padding: '10px 15px',
                fontSize: '14px',
                minWidth: '150px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="expired">Expired</option>
            </select>

            {/* Type Filter */}
            <select
              value={memberTypeFilter}
              onChange={(e) => setMemberTypeFilter(e.target.value)}
              style={{
                background: 'white',
                color: '#1a1a1a',
                border: '1px solid #B3CFE5',
                borderRadius: '8px',
                padding: '10px 15px',
                fontSize: '14px',
                minWidth: '150px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">All Types</option>
              <option value="librarian">Librarians</option>
              <option value="member">Members</option>
              <option value="admin">Admins</option>
            </select>

            {/* Sort By */}
            <select
              value={memberSortBy}
              onChange={(e) => setMemberSortBy(e.target.value)}
              style={{
                background: 'white',
                color: '#1a1a1a',
                border: '1px solid #B3CFE5',
                borderRadius: '8px',
                padding: '10px 15px',
                fontSize: '14px',
                minWidth: '180px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="name">Sort by Name</option>
              <option value="date">Sort by Join Date</option>
              <option value="books">Sort by Books Issued</option>
              <option value="fines">Sort by Fines</option>
            </select>
        </div>
      </div>

      {/* Members Grid */}
      {getFilteredAndSortedMembers().length > 0 ? (
        <Paper sx={{
          borderRadius: '12px',
          border: '1px solid #ddd',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          {/* Header Row */}
          <Grid container sx={{ background: '#f8f9fa', borderBottom: '1px solid #ddd' }}>
            <Grid item xs={12} sm={3} sx={{ padding: '15px 20px', minWidth: 0, maxWidth: '25%', flexBasis: '25%' }}>
              <Typography variant="subtitle2" sx={{ color: '#000000', fontWeight: '700', fontSize: '15px' }}>Member</Typography>
            </Grid>
            <Grid item xs={12} sm={2.5} sx={{ padding: '15px 20px', minWidth: 0, maxWidth: '20.8%', flexBasis: '20.8%' }}>
              <Typography variant="subtitle2" sx={{ color: '#000000', fontWeight: '700', fontSize: '15px' }}>Contact</Typography>
            </Grid>
            <Grid item xs={12} sm={2} sx={{ padding: '15px 20px', minWidth: 0, maxWidth: '16.7%', flexBasis: '16.7%' }}>
              <Typography variant="subtitle2" sx={{ color: '#000000', fontWeight: '700', fontSize: '15px' }}>Join Date</Typography>
            </Grid>
            <Grid item xs={4} sm={1} sx={{ padding: '15px 20px', minWidth: 0, maxWidth: '8.3%', flexBasis: '8.3%' }}>
              <Typography variant="subtitle2" sx={{ color: '#000000', fontWeight: '700', fontSize: '15px' }}>Books</Typography>
            </Grid>
            <Grid item xs={4} sm={1} sx={{ padding: '15px 20px', minWidth: 0, maxWidth: '8.3%', flexBasis: '8.3%' }}>
              <Typography variant="subtitle2" sx={{ color: '#000000', fontWeight: '700', fontSize: '15px' }}>Fines</Typography>
            </Grid>
            <Grid item xs={4} sm={1} sx={{ padding: '15px 20px', minWidth: 0, maxWidth: '8.3%', flexBasis: '8.3%' }}>
              <Typography variant="subtitle2" sx={{ color: '#000000', fontWeight: '700', fontSize: '15px' }}>Status</Typography>
            </Grid>
            <Grid item xs={12} sm={1.5} sx={{ padding: '15px 20px', minWidth: 0, maxWidth: '12.5%', flexBasis: '12.5%' }}>
              <Typography variant="subtitle2" sx={{ color: '#000000', fontWeight: '700', fontSize: '15px' }}>Actions</Typography>
            </Grid>
          </Grid>
          
          {/* Data Rows */}
          {getFilteredAndSortedMembers().map((member, index) => (
            <Grid container key={member.id} sx={{
              background: index % 2 === 0 ? 'white' : '#f5f5f5',
              borderBottom: index < getFilteredAndSortedMembers().length - 1 ? '1px solid #eee' : 'none',
              transition: 'background-color 0.2s ease',
              '&:hover': {
                backgroundColor: '#e3f2fd'
              }
            }}>
              <Grid item xs={12} sm={3} sx={{ padding: '15px 20px', minWidth: 0, maxWidth: '25%', flexBasis: '25%' }}>
                <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
                  <Typography sx={{
                    color: '#1a1a1a',
                    fontWeight: '600',
                    fontSize: '14px',
                    marginBottom: '2px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>{member.name}</Typography>
                  <Typography sx={{
                    color: '#4a4a4a',
                    fontSize: '12px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>ID: {member.id.substring(0, 8)}...</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={2.5} sx={{ padding: '15px 20px', minWidth: 0, maxWidth: '20.8%', flexBasis: '20.8%' }}>
                <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
                  <Typography sx={{
                    color: '#1a1a1a',
                    fontWeight: '500',
                    fontSize: '14px',
                    marginBottom: '2px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>{member.email}</Typography>
                  <Typography sx={{
                    color: '#4a4a4a',
                    fontSize: '12px'
                  }}>{member.memberType || 'Standard Member'}</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={2} sx={{ padding: '15px 20px', minWidth: 0, maxWidth: '16.7%', flexBasis: '16.7%' }}>
                <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
                  <Typography sx={{
                    color: '#1a1a1a',
                    fontWeight: '500',
                    fontSize: '14px',
                    marginBottom: '2px'
                  }}>{member.joinDate ? new Date(member.joinDate).toLocaleDateString() : new Date(member.createdDate || Date.now()).toLocaleDateString()}</Typography>
                  <Typography sx={{
                    color: '#4a4a4a',
                    fontSize: '12px'
                  }}>{member.joinDate ? Math.floor((Date.now() - new Date(member.joinDate).getTime()) / (1000 * 60 * 60 * 24)) : Math.floor((Date.now() - new Date(member.createdDate || Date.now()).getTime()) / (1000 * 60 * 60 * 24))} days ago</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={4} sm={1} sx={{ padding: '15px 20px', minWidth: 0, maxWidth: '8.3%', flexBasis: '8.3%' }}>
                <Box component="span" sx={{
                  background: '#e3f2fd',
                  color: '#1976d2',
                  borderRadius: '12px',
                  padding: '4px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'inline-block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%'
                }}>{getMemberStats(member).booksIssued}</Box>
              </Grid>
              
              <Grid item xs={4} sm={1} sx={{ padding: '15px 20px', minWidth: 0, maxWidth: '8.3%', flexBasis: '8.3%' }}>
                <Box component="span" sx={{
                  background: getMemberStats(member).totalFines > 0 ? '#ffebee' : '#e8f5e8',
                  color: getMemberStats(member).totalFines > 0 ? '#d32f2f' : '#2e7d32',
                  borderRadius: '12px',
                  padding: '4px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'inline-block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%'
                }}>₹{getMemberStats(member).totalFines}</Box>
              </Grid>
              
              <Grid item xs={4} sm={1} sx={{ padding: '15px 20px', minWidth: 0, maxWidth: '8.3%', flexBasis: '8.3%' }}>
                <Box component="span" sx={{
                  background: '#e8f5e8',
                  color: '#2e7d32',
                  borderRadius: '12px',
                  padding: '4px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  width: 'fit-content',
                  maxWidth: '100%',
                  overflow: 'hidden'
                }}>
                  <i className="fas fa-circle" style={{ 
                    fontSize: '6px', 
                    color: getMemberStats(member).status === 'active' ? '#2e7d32' : 
                           getMemberStats(member).status === 'suspended' ? '#d32f2f' : '#ff9800' 
                  }}></i>
                  {getMemberStats(member).status.charAt(0).toUpperCase() + getMemberStats(member).status.slice(1)}
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={1.5} sx={{ padding: '15px 20px', minWidth: 0, maxWidth: '12.5%', flexBasis: '12.5%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                  <Box component="span"
                    title={getMemberStats(member).booksIssued > 0 ? 'Cannot delete - user has active books' : 'Delete Member'}
                    onClick={() => handleSuspendMember(member)}
                    sx={{
                      cursor: getMemberStats(member).booksIssued > 0 ? 'not-allowed' : 'pointer',
                      fontSize: '16px',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      backgroundColor: 'transparent',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      opacity: getMemberStats(member).booksIssued > 0 ? 0.5 : 1,
                      '&:hover': getMemberStats(member).booksIssued === 0 ? {
                        backgroundColor: '#f5f5f5'
                      } : {},
                      '&:hover::after': getMemberStats(member).booksIssued === 0 ? {
                        content: '"Delete"',
                        position: 'absolute',
                        bottom: '-25px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#333',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '10px',
                        whiteSpace: 'nowrap',
                        zIndex: 1000
                      } : {}
                    }}
                  >
                    ×
                  </Box>
                </Box>
              </Grid>
            </Grid>
          ))}
        </Paper>
      ) : (
        <Paper sx={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #B3CFE5',
          boxShadow: '0 4px 12px rgba(74, 127, 167, 0.1)',
          padding: '60px 40px',
          textAlign: 'center'
        }}>
          <i className="fas fa-users" style={{
            fontSize: '4rem',
            color: '#4A7FA7',
            marginBottom: '20px'
          }}></i>
          <Typography variant="h5" sx={{
            color: '#333',
            fontWeight: '600',
            marginBottom: '10px'
          }}>
            {members.length === 0 ? 'No Members Found' : 'No Members Match Your Filters'}
          </Typography>
          <Typography sx={{
            color: '#666',
            margin: '0',
            fontSize: '14px'
          }}>
            {members.length === 0 
              ? 'Members will appear here once they register for your library.' 
              : 'Try adjusting your search or filter criteria.'
            }
          </Typography>
        </Paper>
      )}

      <Dialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog({...dialog, isOpen: false})}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        showConfirm={dialog.showConfirm}
        onConfirm={dialog.onConfirm}
      />
    </div>
  );
};

export default MembersTab;