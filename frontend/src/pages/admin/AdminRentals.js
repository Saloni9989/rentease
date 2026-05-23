import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './AdminTable.css';

const STATUS_OPTIONS = ['pending', 'confirmed', 'delivered', 'active', 'return_requested', 'returned', 'cancelled'];
const STATUS_COLORS = {
  pending: 'warning', confirmed: 'info', delivered: 'info',
  active: 'success', return_requested: 'warning',
  returned: 'gray', cancelled: 'danger', extended: 'success',
};

export default function AdminRentals() {
  const [searchParams] = useSearchParams();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [selectedRental, setSelectedRental] = useState(null);
  const [updateForm, setUpdateForm] = useState({ status: '', adminNotes: '', damageReport: '', damageCharges: 0 });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchRentals();
  }, [statusFilter]);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/admin/rentals${params}`);
      setRentals(res.data.rentals || []);
    } catch {
      toast.error('Failed to load rentals');
    } finally {
      setLoading(false);
    }
  };

  const openUpdate = (rental) => {
    setSelectedRental(rental);
    setUpdateForm({
      status: rental.status,
      adminNotes: rental.adminNotes || '',
      damageReport: rental.damageReport || '',
      damageCharges: rental.damageCharges || 0,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await api.put(`/admin/rentals/${selectedRental._id}/status`, updateForm);
      toast.success('Rental updated');
      setSelectedRental(null);
      fetchRentals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div>
          <h1 className="admin-page-title">Rentals</h1>
          <p className="admin-page-subtitle">{rentals.length} orders</p>
        </div>
        <div className="admin-header-actions">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-control"
            style={{ minWidth: '160px' }}
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Monthly Rent</th>
                <th>Tenure</th>
                <th>Delivery Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map((rental) => (
                <tr key={rental._id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      #{rental._id.slice(-8).toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <p style={{ fontWeight: 500 }}>{rental.user?.name}</p>
                    <p className="text-muted text-sm">{rental.user?.email}</p>
                  </td>
                  <td>
                    {rental.items?.slice(0, 2).map((item, i) => (
                      <p key={i} className="text-sm">{item.productName || item.product?.name}</p>
                    ))}
                    {rental.items?.length > 2 && (
                      <p className="text-sm text-muted">+{rental.items.length - 2} more</p>
                    )}
                  </td>
                  <td>Rs.{rental.totalMonthlyRent?.toLocaleString()}/mo</td>
                  <td>{rental.tenureMonths} months</td>
                  <td>{new Date(rental.deliveryDate).toLocaleDateString('en-IN')}</td>
                  <td>
                    <span className={`badge badge-${STATUS_COLORS[rental.status] || 'gray'}`}>
                      {rental.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => openUpdate(rental)}>
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rentals.length === 0 && <p className="no-data-msg">No rentals found</p>}
        </div>
      )}

      {/* Update Modal */}
      {selectedRental && (
        <div className="modal-overlay" onClick={() => setSelectedRental(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Rental #{selectedRental._id.slice(-8).toUpperCase()}</h2>
              <button className="modal-close" onClick={() => setSelectedRental(null)}>✕</button>
            </div>
            <form onSubmit={handleUpdate} className="modal-body">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={updateForm.status}
                  onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Admin Notes</label>
                <textarea className="form-control" rows={3} value={updateForm.adminNotes}
                  onChange={(e) => setUpdateForm({ ...updateForm, adminNotes: e.target.value })}
                  placeholder="Internal notes..." />
              </div>
              {updateForm.status === 'returned' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Damage Report</label>
                    <textarea className="form-control" rows={2} value={updateForm.damageReport}
                      onChange={(e) => setUpdateForm({ ...updateForm, damageReport: e.target.value })}
                      placeholder="Describe any damages..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Damage Charges (Rs.)</label>
                    <input type="number" className="form-control" value={updateForm.damageCharges}
                      onChange={(e) => setUpdateForm({ ...updateForm, damageCharges: e.target.value })} min="0" />
                  </div>
                </>
              )}
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setSelectedRental(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={updating}>
                  {updating ? 'Updating...' : 'Update Rental'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
