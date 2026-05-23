import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './CheckoutPage.css';

const CITIES = ['Mumbai', 'Pune', 'Bangalore', 'Delhi', 'Hyderabad', 'Chennai'];

// Get min delivery date (tomorrow)
const getMinDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

export default function CheckoutPage() {
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
    deliveryDate: getMinDate(),
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.street.trim()) e.street = 'Street address is required';
    if (!form.city) e.city = 'City is required';
    if (!form.state.trim()) e.state = 'State is required';
    if (!form.pincode.trim()) e.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(form.pincode)) e.pincode = 'Invalid pincode (6 digits)';
    if (!form.deliveryDate) e.deliveryDate = 'Delivery date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      const res = await api.post('/rentals/checkout', {
        deliveryAddress: {
          street: form.street,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        },
        deliveryDate: form.deliveryDate,
        notes: form.notes,
      });
      await fetchCart();
      toast.success('Order placed successfully!');
      navigate(`/my-rentals/${res.data.rental._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const items = cart.items || [];
  const totalMonthly = cart.totalMonthlyRent || 0;
  const totalDeposit = cart.totalSecurityDeposit || 0;
  const tenure = items[0]?.tenureMonths || 0;

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Checkout</h1>
          <p className="page-subtitle">Complete your rental order</p>
        </div>

        <div className="checkout-layout">
          {/* Form */}
          <form onSubmit={handleSubmit} className="checkout-form" noValidate>
            {/* Delivery Address */}
            <div className="checkout-section">
              <h2 className="checkout-section-title">📍 Delivery Address</h2>
              <div className="form-group">
                <label className="form-label">Street Address *</label>
                <input type="text" className={`form-control ${errors.street ? 'error' : ''}`}
                  placeholder="House/Flat No., Street, Area" value={form.street} onChange={set('street')} />
                {errors.street && <p className="form-error">{errors.street}</p>}
              </div>
              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <select className={`form-control ${errors.city ? 'error' : ''}`} value={form.city} onChange={set('city')}>
                    <option value="">Select City</option>
                    {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.city && <p className="form-error">{errors.city}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input type="text" className={`form-control ${errors.state ? 'error' : ''}`}
                    placeholder="Maharashtra" value={form.state} onChange={set('state')} />
                  {errors.state && <p className="form-error">{errors.state}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode *</label>
                  <input type="text" className={`form-control ${errors.pincode ? 'error' : ''}`}
                    placeholder="400001" value={form.pincode} onChange={set('pincode')} maxLength={6} />
                  {errors.pincode && <p className="form-error">{errors.pincode}</p>}
                </div>
              </div>
            </div>

            {/* Delivery Schedule */}
            <div className="checkout-section">
              <h2 className="checkout-section-title">📅 Delivery Schedule</h2>
              <div className="form-group">
                <label className="form-label">Preferred Delivery Date *</label>
                <input type="date" className={`form-control ${errors.deliveryDate ? 'error' : ''}`}
                  value={form.deliveryDate} onChange={set('deliveryDate')} min={getMinDate()} />
                {errors.deliveryDate && <p className="form-error">{errors.deliveryDate}</p>}
                <p className="form-hint">Delivery available Mon–Sat, 9 AM – 6 PM</p>
              </div>
              <div className="form-group">
                <label className="form-label">Special Instructions (optional)</label>
                <textarea className="form-control" rows={3}
                  placeholder="Any specific delivery instructions..."
                  value={form.notes} onChange={set('notes')} />
              </div>
            </div>

            {/* Payment Note */}
            <div className="checkout-section payment-note">
              <h2 className="checkout-section-title">💳 Payment</h2>
              <div className="payment-info">
                <span className="payment-icon">🔒</span>
                <div>
                  <p className="payment-title">Secure Payment on Delivery</p>
                  <p className="payment-desc">
                    Pay via UPI, card, or cash at the time of delivery. Your order will be confirmed immediately.
                  </p>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
              {loading ? <><span className="spinner spinner-sm" /> Placing Order...</> : '✓ Place Order'}
            </button>
          </form>

          {/* Order Summary */}
          <div className="checkout-summary">
            <div className="summary-card">
              <h2 className="summary-title">Order Summary</h2>

              <div className="checkout-items">
                {items.map((item) => (
                  <div key={item._id} className="checkout-item">
                    <div className="checkout-item-info">
                      <p className="checkout-item-name">{item.product?.name || 'Product'}</p>
                      <p className="checkout-item-tenure">{item.tenureMonths} months</p>
                    </div>
                    <p className="checkout-item-price">₹{item.monthlyRent.toLocaleString()}/mo</p>
                  </div>
                ))}
              </div>

              <div className="summary-divider" />

              <div className="summary-rows">
                <div className="summary-row">
                  <span>Monthly Rent</span>
                  <span>₹{totalMonthly.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>Security Deposit</span>
                  <span>₹{totalDeposit.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery & Setup</span>
                  <span className="text-success font-semibold">Free</span>
                </div>
              </div>

              <div className="summary-divider" />

              <div className="summary-total">
                <span>Due Today</span>
                <span>₹{(totalMonthly + totalDeposit).toLocaleString()}</span>
              </div>

              {tenure > 0 && (
                <div className="summary-tenure-info">
                  <p>Total for {tenure} months: <strong>₹{(totalMonthly * tenure).toLocaleString()}</strong></p>
                  <p className="text-muted text-sm">+ ₹{totalDeposit.toLocaleString()} refundable deposit</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
