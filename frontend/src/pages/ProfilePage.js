import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put('/auth/profile', {
        name: profile.name,
        phone: profile.phone,
        address: {
          street: profile.street,
          city: profile.city,
          state: profile.state,
          pincode: profile.pincode,
        },
      });
      updateUser(res.data.user);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      setSaving(true);
      await api.put('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="container-sm">
        <div className="page-header">
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account settings</p>
        </div>

        <div className="profile-layout">
          {/* Sidebar */}
          <div className="profile-sidebar">
            <div className="profile-avatar-section">
              <div className="profile-avatar-lg">{user?.name?.charAt(0).toUpperCase()}</div>
              <h3 className="profile-name">{user?.name}</h3>
              <p className="profile-email">{user?.email}</p>
              <span className={`badge ${user?.role === 'admin' ? 'badge-primary' : 'badge-success'}`}>
                {user?.role}
              </span>
            </div>
            <nav className="profile-nav">
              <button
                className={`profile-nav-item ${tab === 'profile' ? 'active' : ''}`}
                onClick={() => setTab('profile')}
              >
                Personal Info
              </button>
              <button
                className={`profile-nav-item ${tab === 'password' ? 'active' : ''}`}
                onClick={() => setTab('password')}
              >
                Change Password
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="profile-content">
            {tab === 'profile' && (
              <div className="profile-card">
                <h2 className="profile-card-title">Personal Information</h2>
                <form onSubmit={handleProfileSave}>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input type="text" className="form-control" value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input type="tel" className="form-control" value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-control" value={user?.email} disabled />
                    <p className="form-hint">Email cannot be changed</p>
                  </div>

                  <h3 className="address-heading">Address</h3>
                  <div className="form-group">
                    <label className="form-label">Street Address</label>
                    <input type="text" className="form-control" value={profile.street}
                      onChange={(e) => setProfile({ ...profile, street: e.target.value })}
                      placeholder="House/Flat No., Street, Area" />
                  </div>
                  <div className="form-row-3">
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input type="text" className="form-control" value={profile.city}
                        onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State</label>
                      <input type="text" className="form-control" value={profile.state}
                        onChange={(e) => setProfile({ ...profile, state: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Pincode</label>
                      <input type="text" className="form-control" value={profile.pincode}
                        onChange={(e) => setProfile({ ...profile, pincode: e.target.value })} maxLength={6} />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {tab === 'password' && (
              <div className="profile-card">
                <h2 className="profile-card-title">Change Password</h2>
                <form onSubmit={handlePasswordChange}>
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input type="password" className="form-control"
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                      required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input type="password" className="form-control"
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                      placeholder="Min. 6 characters" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input type="password" className="form-control"
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                      required />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
