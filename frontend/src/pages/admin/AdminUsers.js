import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './AdminTable.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users?limit=100');
      setUsers(res.data.users || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (userId) => {
    try {
      setToggling(userId);
      const res = await api.put(`/admin/users/${userId}/toggle`);
      setUsers((prev) => prev.map((u) => u._id === userId ? res.data.user : u));
      toast.success('User status updated');
    } catch {
      toast.error('Failed to update user');
    } finally {
      setToggling(null);
    }
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div>
          <h1 className="admin-page-title">Users</h1>
          <p className="admin-page-subtitle">{users.length} registered users</p>
        </div>
        <div className="admin-header-actions">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control admin-search"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Phone</th>
                <th>City</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'var(--primary)', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.875rem', flexShrink: 0,
                      }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight: 500 }}>{user.name}</p>
                        <p className="text-muted text-sm">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>{user.phone || '-'}</td>
                  <td>{user.address?.city || '-'}</td>
                  <td>
                    <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-gray'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    {user.role !== 'admin' && (
                      <button
                        className={`btn btn-sm ${user.isActive ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => handleToggle(user._id)}
                        disabled={toggling === user._id}
                      >
                        {toggling === user._id ? '...' : user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="no-data-msg">No users found</p>}
        </div>
      )}
    </div>
  );
}
