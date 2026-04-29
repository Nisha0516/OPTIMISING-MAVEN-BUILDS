import React, { useState, useEffect } from 'react';
import { adminAPI, adminAdvancedAPI } from '../../services/api';
import './AdminStyles.css';

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllUsers();
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to mock data
      const mockUsers = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          joinDate: '2024-01-01',
          status: 'active',
          totalBookings: 5
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+0987654321',
          joinDate: '2024-01-05',
          status: 'inactive',
          totalBookings: 2
        }
      ];
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  const [filterRole, setFilterRole] = useState('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserRoleColor = (role) => {
    const colors = {
      admin: '#8b5cf6',
      owner: '#3b82f6',
      customer: '#10b981'
    };
    return colors[role] || '#6b7280';
  };

  const toggleUserStatus = async (userId) => {
    try {
      await adminAdvancedAPI.toggleUserStatus(userId);
      alert('User status updated!');
      fetchUsers();
    } catch (error) {
      alert(error.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminAdvancedAPI.deleteUser(userId);
      alert('User deleted successfully!');
      fetchUsers();
    } catch (error) {
      alert(error.message || 'Failed to delete user');
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h1>👥 User Management</h1>
          <p>Manage {users.length} registered users across the platform</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{ 
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <input
              type="text"
              placeholder="🔍 Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['all', 'admin', 'owner', 'customer'].map(role => (
              <button
                key={role}
                onClick={() => setFilterRole(role)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: filterRole === role ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f3f4f6',
                  color: filterRole === role ? 'white' : '#374151',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'capitalize'
                }}
              >
                {role === 'all' ? 'All Users' : role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredUsers.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ color: '#111827', marginBottom: '0.5rem' }}>No users found</h3>
            <p style={{ color: '#6b7280' }}>Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredUsers.map(user => (
            <div key={user._id || user.id} style={{
              background: 'white',
              borderRadius: '14px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              border: '2px solid #f3f4f6'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{
                padding: '1.5rem',
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                gap: '1.5rem',
                alignItems: 'center'
              }}>
                {/* Avatar */}
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${getUserRoleColor(user.role)} 0%, ${getUserRoleColor(user.role)}dd 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  boxShadow: `0 4px 12px ${getUserRoleColor(user.role)}40`
                }}>
                  {getInitials(user.name)}
                </div>

                {/* User Info */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  {/* Name & Email */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{
                        margin: 0,
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        color: '#111827'
                      }}>
                        {user.name}
                      </h3>
                      <span style={{
                        background: getUserRoleColor(user.role),
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {user.role}
                      </span>
                    </div>
                    <p style={{
                      margin: 0,
                      fontSize: '0.85rem',
                      color: '#6b7280'
                    }}>
                      📧 {user.email}
                    </p>
                  </div>

                  {/* Phone & Join Date */}
                  <div>
                    <p style={{
                      margin: '0 0 6px 0',
                      fontSize: '0.85rem',
                      color: '#6b7280'
                    }}>
                      📱 {user.phone || 'N/A'}
                    </p>
                    <p style={{
                      margin: 0,
                      fontSize: '0.85rem',
                      color: '#6b7280'
                    }}>
                      📅 Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : user.joinDate || 'N/A'}
                    </p>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{
                      background: '#f3f4f6',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: '#111827'
                      }}>
                        {user.totalBookings || 0}
                      </div>
                      <div style={{
                        fontSize: '0.7rem',
                        color: '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginTop: '2px'
                      }}>
                        Bookings
                      </div>
                    </div>
                    <div style={{
                      background: user.active !== false ? '#d1fae5' : '#fee2e2',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: '700',
                        color: user.active !== false ? '#065f46' : '#991b1b'
                      }}>
                        {user.active !== false ? '✓' : '✗'}
                      </div>
                      <div style={{
                        fontSize: '0.7rem',
                        color: user.active !== false ? '#065f46' : '#991b1b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginTop: '2px'
                      }}>
                        {user.active !== false ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={() => handleViewUser(user)}
                    style={{
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    👁️ View
                  </button>
                  <button
                    onClick={() => toggleUserStatus(user._id || user.id)}
                    style={{
                      padding: '10px 20px',
                      background: user.active !== false ? '#f59e0b' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    {user.active !== false ? '⏸️ Deactivate' : '▶️ Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div 
          className="modal-overlay"
          onClick={() => setShowUserModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(4px)'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}
          >
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '2rem',
              borderRadius: '16px 16px 0 0',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  backdropFilter: 'blur(10px)'
                }}>
                  {getInitials(selectedUser.name)}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700' }}>
                    {selectedUser.name}
                  </h2>
                  <p style={{ 
                    margin: '4px 0 0 0', 
                    opacity: 0.9,
                    fontSize: '0.95rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: '600'
                  }}>
                    {selectedUser.role}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUserModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '2rem' }}>
              {/* Contact Information */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  margin: '0 0 1rem 0',
                  fontSize: '1.2rem',
                  color: '#111827',
                  fontWeight: '700',
                  paddingBottom: '0.5rem',
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  📇 Contact Information
                </h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{
                    background: '#f9fafb',
                    padding: '1rem',
                    borderRadius: '8px',
                    borderLeft: '4px solid #667eea'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase' }}>
                      Email Address
                    </div>
                    <div style={{ fontSize: '1rem', color: '#111827', fontWeight: '600' }}>
                      📧 {selectedUser.email}
                    </div>
                  </div>
                  <div style={{
                    background: '#f9fafb',
                    padding: '1rem',
                    borderRadius: '8px',
                    borderLeft: '4px solid #667eea'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase' }}>
                      Phone Number
                    </div>
                    <div style={{ fontSize: '1rem', color: '#111827', fontWeight: '600' }}>
                      📱 {selectedUser.phone || 'Not provided'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  margin: '0 0 1rem 0',
                  fontSize: '1.2rem',
                  color: '#111827',
                  fontWeight: '700',
                  paddingBottom: '0.5rem',
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  🔐 Account Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{
                    background: '#f9fafb',
                    padding: '1rem',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      User ID
                    </div>
                    <div style={{ fontSize: '1.5rem', color: '#667eea', fontWeight: '700' }}>
                      #{selectedUser._id?.slice(-6) || selectedUser.id}
                    </div>
                  </div>
                  <div style={{
                    background: '#f9fafb',
                    padding: '1rem',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Account Status
                    </div>
                    <div style={{
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      color: selectedUser.active !== false ? '#10b981' : '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}>
                      {selectedUser.active !== false ? '✓ Active' : '✗ Inactive'}
                    </div>
                  </div>
                  <div style={{
                    background: '#f9fafb',
                    padding: '1rem',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Join Date
                    </div>
                    <div style={{ fontSize: '1rem', color: '#111827', fontWeight: '600' }}>
                      {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : selectedUser.joinDate || 'N/A'}
                    </div>
                  </div>
                  <div style={{
                    background: '#f9fafb',
                    padding: '1rem',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Total Bookings
                    </div>
                    <div style={{ fontSize: '1.5rem', color: '#667eea', fontWeight: '700' }}>
                      {selectedUser.totalBookings || 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{
                padding: '1.5rem',
                background: '#f9fafb',
                borderRadius: '12px',
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => toggleUserStatus(selectedUser._id || selectedUser.id)}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    background: selectedUser.active !== false ? '#f59e0b' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    minWidth: '150px'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  {selectedUser.active !== false ? '⏸️ Deactivate Account' : '▶️ Activate Account'}
                </button>
                <button
                  onClick={() => {
                    handleDeleteUser(selectedUser._id || selectedUser.id);
                    setShowUserModal(false);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    minWidth: '150px'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  🗑️ Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUser;