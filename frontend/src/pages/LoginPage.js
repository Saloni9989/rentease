import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">🏠 RentEase</Link>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'error' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className={`form-control ${errors.password ? 'error' : ''}`}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
              />
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
              {loading ? <><span className="spinner spinner-sm" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div className="auth-demo">
            <p className="demo-label">Demo Accounts</p>
            <div className="demo-accounts">
              <button
                className="demo-btn"
                onClick={() => setForm({ email: 'user@rentease.com', password: 'user123' })}
              >
                👤 User Demo
              </button>
              <button
                className="demo-btn"
                onClick={() => setForm({ email: 'admin@rentease.com', password: 'admin123' })}
              >
                ⚙️ Admin Demo
              </button>
            </div>
          </div>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Sign up free</Link>
          </p>
        </div>

        <div className="auth-side">
          <div className="auth-side-content">
            <h2>Rent smarter, live better</h2>
            <p>Access premium furniture and appliances without the burden of ownership.</p>
            <ul className="auth-benefits">
              <li>✓ No upfront purchase cost</li>
              <li>✓ Free delivery & setup</li>
              <li>✓ Flexible 3–12 month plans</li>
              <li>✓ Free maintenance support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
