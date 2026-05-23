import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './MyRentalsPage.css';

const STATUS_COLORS = {
  pending: 'warning',
  confirmed: 'info',
  delivered: 'info',
  active: 'success',
  return_requested: 'warning',
  returned: 'gray',
  cancelled: 'danger',
  extended: 'success',
};

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  delivered: 'Delivered',
  active: 'Active',
  return_requested: 'Return Requested',
  returned: 'Returned',
  cancelled: 'Cancelled',
  extended: 'Extended',
};

export default function MyRentalsPage() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const params = activeTab !== 'all' ? `?status=${activeTab}` : '';
    api.get(`/rentals${params}`)
      .then((res) => setRentals(res.data.rentals || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeTab]);

  const TABS = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'pending', label: 'Pending' },
    { key: 'returned', label: 'Returned' },
  ];

  return (
    <div className="my-rentals-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">My Rentals</h1>
          <p className="page-subtitle">Track and manage your rental orders</p>
        </div>

        {/* Tabs */}
        <div className="rentals-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab.key); setLoading(true); }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : rentals.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📦</span>
            <h3>No rentals found</h3>
            <p>You haven't placed any rental orders yet</p>
            <Link to="/products" className="btn btn-primary mt-4">Browse Products</Link>
          </div>
        ) : (
          <div className="rentals-list">
            {rentals.map((rental) => (
              <div key={rental._id} className="rental-card">
                <div className="rental-card-header">
                  <div>
                    <p className="rental-id">Order #{rental._id.slice(-8).toUpperCase()}</p>
                    <p className="rental-date">
                      Placed on {new Date(rental.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <span className={`badge badge-${STATUS_COLORS[rental.status] || 'gray'}`}>
                    {STATUS_LABELS[rental.status] || rental.status}
                  </span>
                </div>

                <div className="rental-items-preview">
                  {rental.items?.slice(0, 3).map((item, i) => (
                    <div key={i} className="rental-item-chip">
                      {item.productName || item.product?.name || 'Product'}
                    </div>
                  ))}
                  {rental.items?.length > 3 && (
                    <div className="rental-item-chip more">+{rental.items.length - 3} more</div>
                  )}
                </div>

                <div className="rental-card-footer">
                  <div className="rental-meta">
                    <span>📅 Delivery: {new Date(rental.deliveryDate).toLocaleDateString('en-IN')}</span>
                    <span>⏱ {rental.tenureMonths} months</span>
                    <span>💰 ₹{rental.totalMonthlyRent.toLocaleString()}/mo</span>
                  </div>
                  <Link to={`/my-rentals/${rental._id}`} className="btn btn-outline btn-sm">
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
