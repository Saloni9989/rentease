import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import './RentalDetailPage.css';

const STATUS_COLORS = {
  pending: 'warning', confirmed: 'info', delivered: 'info',
  active: 'success', return_requested: 'warning',
  returned: 'gray', cancelled: 'danger', extended: 'success',
};

export default function RentalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showExtend, setShowExtend] = useState(false);
  const [extendMonths, setExtendMonths] = useState(3);

  useEffect(() => {
    api.get(`/rentals/${id}`)
      .then((res) => setRental(res.data.rental))
      .catch(() => navigate('/my-rentals'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleRequestReturn = async () => {
    if (!window.confirm('Request return for this rental?')) return;
    try {
      setActionLoading(true);
      const res = await api.put(`/rentals/${id}/request-return`);
      setRental(res.data.rental);
      toast.success('Return requested successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request return');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExtend = async () => {
    try {
      setActionLoading(true);
      const res = await api.put(`/rentals/${id}/extend`, { additionalMonths: extendMonths });
      setRental(res.data.rental);
      setShowExtend(false);
      toast.success(`Rental extended by ${extendMonths} months`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to extend rental');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!rental) return null;

  const canReturn = ['active', 'delivered', 'extended'].includes(rental.status);
  const canExtend = ['active', 'delivered'].includes(rental.status);

  return (
    <div className="rental-detail-page">
      <div className="container">
        <div className="rental-detail-header">
          <button onClick={() => navigate('/my-rentals')} className="back-btn">
            &larr; Back to Rentals
          </button>
          <div className="rental-detail-title-row">
            <div>
              <h1 className="page-title">Order #{rental._id.slice(-8).toUpperCase()}</h1>
              <p className="page-subtitle">
                Placed on {new Date(rental.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
            <span className={`badge badge-${STATUS_COLORS[rental.status] || 'gray'}`}
              style={{ fontSize: '0.85rem', padding: '0.35rem 0.875rem' }}>
              {rental.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        <div className="rental-detail-grid">
          <div className="rental-detail-left">
            {/* Items */}
            <div className="detail-card">
              <h2 className="detail-card-title">Rented Items</h2>
              {rental.items?.map((item, i) => (
                <div key={i} className="rental-detail-item">
                  <div className="rental-detail-item-info">
                    <h3>{item.productName || item.product?.name}</h3>
                    <p>{item.tenureMonths} months &middot; Rs.{item.monthlyRent.toLocaleString()}/mo</p>
                  </div>
                  <div className="rental-detail-item-price">
                    <p className="item-total">Rs.{(item.monthlyRent * item.tenureMonths).toLocaleString()}</p>
                    <p className="item-deposit">Deposit: Rs.{item.securityDeposit.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Address */}
            <div className="detail-card">
              <h2 className="detail-card-title">Delivery Address</h2>
              <div className="address-block">
                <p>{rental.deliveryAddress?.street}</p>
                <p>
                  {rental.deliveryAddress?.city}, {rental.deliveryAddress?.state}
                  {rental.deliveryAddress?.pincode ? ` - ${rental.deliveryAddress.pincode}` : ''}
                </p>
              </div>
            </div>

            {rental.notes && (
              <div className="detail-card">
                <h2 className="detail-card-title">Special Instructions</h2>
                <p className="notes-text">{rental.notes}</p>
              </div>
            )}

            {rental.adminNotes && (
              <div className="detail-card admin-notes-card">
                <h2 className="detail-card-title">Admin Notes</h2>
                <p className="notes-text">{rental.adminNotes}</p>
              </div>
            )}
          </div>

          <div className="rental-detail-right">
            {/* Summary */}
            <div className="detail-card">
              <h2 className="detail-card-title">Rental Summary</h2>
              <div className="summary-rows">
                {[
                  ['Monthly Rent', `Rs.${rental.totalMonthlyRent.toLocaleString()}/mo`],
                  ['Security Deposit', `Rs.${rental.totalSecurityDeposit.toLocaleString()}`],
                  ['Tenure', `${rental.tenureMonths} months`],
                  ['Delivery Date', new Date(rental.deliveryDate).toLocaleDateString('en-IN')],
                  rental.startDate && ['Start Date', new Date(rental.startDate).toLocaleDateString('en-IN')],
                  rental.endDate && ['End Date', new Date(rental.endDate).toLocaleDateString('en-IN')],
                ].filter(Boolean).map(([label, value]) => (
                  <div key={label} className="summary-row">
                    <span>{label}</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
              <div className="summary-divider" />
              <div className="summary-total">
                <span>Total Rent</span>
                <span>Rs.{rental.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Actions */}
            {(canReturn || canExtend) && (
              <div className="detail-card">
                <h2 className="detail-card-title">Actions</h2>
                <div className="rental-actions">
                  {canExtend && (
                    <button className="btn btn-outline w-full" onClick={() => setShowExtend(!showExtend)}>
                      Extend Rental
                    </button>
                  )}
                  {showExtend && (
                    <div className="extend-form">
                      <label className="form-label">Additional Months</label>
                      <select
                        value={extendMonths}
                        onChange={(e) => setExtendMonths(parseInt(e.target.value))}
                        className="form-control"
                      >
                        {[1, 2, 3, 6, 12].map((m) => (
                          <option key={m} value={m}>{m} month{m > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                      <button
                        className="btn btn-primary w-full mt-2"
                        onClick={handleExtend}
                        disabled={actionLoading}
                      >
                        Confirm Extension
                      </button>
                    </div>
                  )}
                  {canReturn && (
                    <button
                      className="btn btn-danger w-full"
                      onClick={handleRequestReturn}
                      disabled={actionLoading}
                    >
                      Request Return
                    </button>
                  )}
                  <Link to={`/maintenance?rentalId=${rental._id}`} className="btn btn-ghost w-full">
                    Request Maintenance
                  </Link>
                </div>
              </div>
            )}

            {/* Payment Status */}
            <div className="detail-card">
              <h2 className="detail-card-title">Payment Status</h2>
              <span className={`badge badge-${rental.paymentStatus === 'paid' ? 'success' : 'warning'}`}>
                {rental.paymentStatus?.toUpperCase() || 'PENDING'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
