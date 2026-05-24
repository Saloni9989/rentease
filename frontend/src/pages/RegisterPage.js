import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const CITY_STATE_MAP = {
  'Mumbai':    'Maharashtra',
  'Pune':      'Maharashtra',
  'Bangalore': 'Karnataka',
  'Delhi':     'Delhi',
  'Hyderabad': 'Telangana',
  'Chennai':   'Tamil Nadu',
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '',
    city: '', state: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        address: form.city ? { city: form.city, state: form.state } : undefined,
      };
      const user = await register(payload);
      toast.success(`Welcome to RentEase, ${user.name.split(' ')[0]}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card auth-card-wide">
          <div className="auth-header">
            <Link to="/" className="auth-logo">🏠 RentEase</Link>
            <h1 className="auth-title">Create your account</h1>
            <p className="auth-subtitle">Start renting in minutes</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" className={`form-control ${errors.name ? 'error' : ''}`}
                  placeholder="John Doe" value={form.name} onChange={set('name')} />
                {errors.name && <p className="form-error">{errors.name}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="tel" className="form-control"
                  placeholder="9876543210" value={form.phone} onChange={set('phone')} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input type="email" className={`form-control ${errors.email ? 'error' : ''}`}
                placeholder="you@example.com" value={form.email} onChange={set('email')} />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input type="password" className={`form-control ${errors.password ? 'error' : ''}`}
                  placeholder="Min. 6 characters" value={form.password} onChange={set('password')} />
                {errors.password && <p className="form-error">{errors.password}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input type="password" className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} />
                {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City</label>
                <select className="form-control" value={form.city}
                  onChange={(e) => {
                    const city = e.target.value;
                    setForm({ ...form, city, state: CITY_STATE_MAP[city] || '' });
                  }}>
                  <option value="">Select City</option>
                  {Object.keys(CITY_STATE_MAP).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <select className="form-control" value={form.state} onChange={set('state')}>
                  <option value="">Select State</option>
                  {['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
              {loading ? <><span className="spinner spinner-sm" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>

        <div className="auth-side">
          <div className="auth-side-content">
            <h2>Join 10,000+ happy renters</h2>
            <p>Get your home furnished without the financial burden of buying.</p>
            <ul className="auth-benefits">
              <li>✓ No upfront purchase cost</li>
              <li>✓ Free delivery & setup</li>
              <li>✓ Flexible 3–12 month plans</li>
              <li>✓ Free maintenance support</li>
              <li>✓ Easy relocation support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
