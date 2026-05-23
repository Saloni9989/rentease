import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './AdminTable.css';

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed'];
const PRIORITY_COLORS = { low: 'gray', medium: 'info', high: 'warning', urgent: 'danger' };
const STATUS_COLORS = { open: 'warning', in_progress: 'info', resolved: 'success', closed: 'gray' };

export default function AdminMaintenance() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [updateForm, setUpdateForm] = useState({ status: '', technicianNotes: '', scheduledDate: '', priority: '' });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/admin/maintenance${params}`);
      setRequests(res.data.requests || []);
    } catch {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const openUpdate = (req) => {
    setSelected(req);
    setUpdateForm({
      status: req.status,
      technicianNotes: req.technicianNotes || '',
      scheduledDate: req.scheduledDate ? req.scheduledDate.split('T')[0] : '',
      priority: req.priority,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await api.put(`/admin/maintenance/${selected._id}`, updateForm);
      toast.success('Request updated');
      setSelected(null);
      fetchRequests();
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
          <h1 className="admin-page-title">Maintenance Requests</h1>
          <p className="admin-page-subtitle">{requests.length} requests</p>
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
                <th>Customer</th>
                <th>Product</th>
                <th>Issue Type</th>
                <th>Priority</th>
                <th>Submitted</th>
                <th>Scheduled</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req._id}>
                  <td>
                    <p style={{ fontWeight: 500 }}>{req.user?.name}</p>
                    <p className="text-muted text-sm">{req.user?.phone}</p>
                  </td>
                  <td>{req.product?.name || '-'}</td>
                  <td style={{ textTransform: 'capitalize' }}>{req.issueType}</td>
                  <td>
                    <span className={`badge badge-${PRIORITY_COLORS[req.priority] || 'gray'}`}>
                      {req.priority}
                    </span>
                  </td>
                  <td>{new Date(req.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    {req.scheduledDate
                      ? new Date(req.scheduledDate).toLocaleDateString('en-IN')
                      : <span className="text-muted">Not scheduled</span>}
                  </td>
                  <td>
                    <span className={`badge badge-${STATUS_COLORS[req.status] || 'gray'}`}>
                      {req.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => openUpdate(req)}>
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {requests.length === 0 && <p className="no-data-msg">No maintenance requests found</p>}
        </div>
      )}

      {/* Update Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Maintenance Request</h2>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <form onSubmit={handleUpdate} className="modal-body">
              <div className="maintenance-detail-info">
                <p><strong>Product:</strong> {selected.product?.name}</p>
                <p><strong>Issue:</strong> {selected.description}</p>
                <p><strong>Customer:</strong> {selected.user?.name} ({selected.user?.phone})</p>
              </div>

              <div className="form-row-2">
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
                  <label className="form-label">Priority</label>
                  <select className="form-control" value={updateForm.priority}
                    onChange={(e) => setUpdateForm({ ...updateForm, priority: e.target.value })}>
                    {['low', 'medium', 'high', 'urgent'].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Scheduled Date</label>
                <input type="date" className="form-control" value={updateForm.scheduledDate}
                  onChange={(e) => setUpdateForm({ ...updateForm, scheduledDate: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Technician Notes</label>
                <textarea className="form-control" rows={3} value={updateForm.technicianNotes}
                  onChange={(e) => setUpdateForm({ ...updateForm, technicianNotes: e.target.value })}
                  placeholder="Notes from technician..." />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setSelected(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={updating}>
                  {updating ? 'Updating...' : 'Update Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
