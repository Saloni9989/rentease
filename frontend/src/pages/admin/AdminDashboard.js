import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './AdminDashboard.css';

const STATUS_COLORS = {
  pending: 'warning', confirmed: 'info', delivered: 'info',
  active: 'success', return_requested: 'warning',
  returned: 'gray', cancelled: 'danger', extended: 'success',
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!data) return null;

  const { stats, recentRentals, rentalsByStatus } = data;

  const STAT_CARDS = [
    { label: 'Active Rentals', value: stats.activeRentals, icon: '🏠', color: 'success', link: '/admin/rentals?status=active' },
    { label: 'Monthly Revenue', value: `Rs.${stats.mrr?.toLocaleString() || 0}`, icon: '💰', color: 'primary', link: '/admin/reports' },
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'info', link: '/admin/users' },
    { label: 'Pending Orders', value: stats.pendingRentals, icon: '⏳', color: 'warning', link: '/admin/rentals?status=pending' },
    { label: 'Total Products', value: stats.totalProducts, icon: '📦', color: 'primary', link: '/admin/products' },
    { label: 'Open Maintenance', value: stats.openMaintenance, icon: '🔧', color: 'danger', link: '/admin/maintenance' },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-subtitle">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {STAT_CARDS.map((card) => (
          <Link key={card.label} to={card.link} className={`stat-card stat-card-${card.color}`}>
            <div className="stat-card-icon">{card.icon}</div>
            <div className="stat-card-info">
              <p className="stat-card-value">{card.value}</p>
              <p className="stat-card-label">{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Recent Rentals */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h2>Recent Orders</h2>
            <Link to="/admin/rentals" className="view-all-link">View All</Link>
          </div>
          <div className="recent-rentals">
            {recentRentals?.length === 0 ? (
              <p className="no-data">No orders yet</p>
            ) : (
              recentRentals?.map((rental) => (
                <div key={rental._id} className="recent-rental-row">
                  <div className="recent-rental-info">
                    <p className="recent-rental-id">#{rental._id.slice(-8).toUpperCase()}</p>
                    <p className="recent-rental-user">{rental.user?.name}</p>
                  </div>
                  <div className="recent-rental-meta">
                    <span className={`badge badge-${STATUS_COLORS[rental.status] || 'gray'}`}>
                      {rental.status}
                    </span>
                    <span className="recent-rental-amount">
                      Rs.{rental.totalMonthlyRent?.toLocaleString()}/mo
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Rentals by Status */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h2>Rentals by Status</h2>
          </div>
          <div className="status-breakdown">
            {rentalsByStatus?.map((item) => (
              <div key={item._id} className="status-row">
                <div className="status-row-left">
                  <span className={`badge badge-${STATUS_COLORS[item._id] || 'gray'}`}>
                    {item._id}
                  </span>
                </div>
                <div className="status-bar-wrap">
                  <div
                    className="status-bar"
                    style={{
                      width: `${Math.min((item.count / stats.totalRentals) * 100, 100)}%`,
                    }}
                  />
                </div>
                <span className="status-count">{item.count}</span>
              </div>
            ))}
            {(!rentalsByStatus || rentalsByStatus.length === 0) && (
              <p className="no-data">No rental data</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2 className="quick-actions-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          <Link to="/admin/products" className="quick-action-btn">
            <span>📦</span> Add Product
          </Link>
          <Link to="/admin/rentals?status=pending" className="quick-action-btn">
            <span>✅</span> Confirm Orders
          </Link>
          <Link to="/admin/maintenance?status=open" className="quick-action-btn">
            <span>🔧</span> Handle Maintenance
          </Link>
          <Link to="/admin/reports" className="quick-action-btn">
            <span>📈</span> View Reports
          </Link>
        </div>
      </div>
    </div>
  );
}
