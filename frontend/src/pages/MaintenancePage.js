import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import './MaintenancePage.css';

const ISSUE_TYPES = ['repair', 'replacement', 'cleaning', 'installation', 'other'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const STATUS_COLORS = {
  open: 'warning', in_progress: 'info', resolved: 'success', closed: 'gray',
};

export default function MaintenancePage() {
  const [searchParams] = useSearchParams();
  const [requests, setRequests] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    rentalId: searchParams.get('rentalId') || '',
    productId: '',
    issueType: 'repair',
    description: '',
    priority: 'medium',
  });

  const activeRentalItems = rentals
    .filter((r) => ['active', 'delivered', 'extended'].includes(r.status))
    .flatMap((r) => r.items?.map((item) => ({ ...item, rentalId: r._id })) || []);

  useEffect(() => {
    Promise.all([
      api.get('/maintenance'),
      api.get('/rentals?status=active&limit=50'),
    ])
      .then(([mRes, rRes]) => {
        setRequests(mRes.data.requests || []);
        setRentals(rRes.data.rentals || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (searchParams.get('rentalId')) setShowForm(true);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rentalId || !form.productId || !form.description.trim()) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      setSubmitting(true);
      const res = await api.post('/maintenance', form);
      setRequests((prev) => [res.data.request, ...prev]);
      setShowForm(false);
      setForm({ rentalId: '', productId: '', issueType: 'repair', description: '', priority: 'medium' });
      toast.success('Maintenance request submitted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const rentalItems = form.rentalId
    ? rentals.find((r) => r._id === form.rentalId)?.items || []
    : [];

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="maintenance-page">
      <div className="container">
        <div className="page-header flex justify-between items-center">
          <div>
            <h1 className="page-title">Maintenance Requests</h1>
            <p className="page-subtitle">Report issues with your rented items</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Request'}
          </button>
        </div>

        {/* New Request Form */}
        {showForm && (
          <div className="maintenance-form-card">
            <h2 className="form-card-title">Submit Maintenance Request</h2>
            <form onSubmit={handleSubmit} className="maintenance-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Rental Order *</label>
                  <select
                    className="form-control"
                    value={form.rentalId}
                    onChange={(e) => setForm({ ...form, rentalId: e.target.value, productId: '' })}
                    required
                  >
                    <option value="">Select Rental</option>
                    {rentals
                      .filter((r) => ['active', 'delivered', 'extended'].includes(r.status))
                      .map((r) => (
                        <option key={r._id} value={r._id}>
                          Order #{r._id.slice(-8).toUpperCase()}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Product *</label>
                  <select
                    className="form-control"
                    value={form.productId}
                    onChange={(e) => setForm({ ...form, productId: e.target.value })}
                    required
                    disabled={!form.rentalId}
                  >
                    <option value="">Select Product</option>
                    {rentalItems.map((item, i) => (
                      <option key={i} value={item.product?._id || item.product}>
                        {item.productName || item.product?.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Issue Type *</label>
                  <select
                    className="form-control"
                    value={form.issueType}
                    onChange={(e) => setForm({ ...form, issueType: e.target.value })}
                  >
                    {ISSUE_TYPES.map((t) => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-control"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Describe the issue in detail..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <><span className="spinner spinner-sm" /> Submitting...</> : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🔧</span>
            <h3>No maintenance requests</h3>
            <p>Submit a request if you have any issues with your rented items</p>
          </div>
        ) : (
          <div className="maintenance-list">
            {requests.map((req) => (
              <div key={req._id} className="maintenance-card">
                <div className="maintenance-card-header">
                  <div>
                    <h3 className="maintenance-product">{req.product?.name || 'Product'}</h3>
                    <p className="maintenance-meta">
                      {req.issueType} &middot; {new Date(req.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="maintenance-badges">
                    <span className={`badge badge-${STATUS_COLORS[req.status] || 'gray'}`}>
                      {req.status.replace('_', ' ')}
                    </span>
                    <span className={`badge badge-${req.priority === 'urgent' ? 'danger' : req.priority === 'high' ? 'warning' : 'gray'}`}>
                      {req.priority}
                    </span>
                  </div>
                </div>
                <p className="maintenance-desc">{req.description}</p>
                {req.technicianNotes && (
                  <div className="technician-notes">
                    <strong>Technician Notes:</strong> {req.technicianNotes}
                  </div>
                )}
                {req.scheduledDate && (
                  <p className="scheduled-date">
                    Scheduled: {new Date(req.scheduledDate).toLocaleDateString('en-IN')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
