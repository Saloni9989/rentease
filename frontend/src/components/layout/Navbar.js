import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🏠</span>
          <span className="logo-text">Rent<span className="logo-accent">Ease</span></span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="navbar-links hide-mobile">
          <Link to="/" className={`nav-link ${isActive('/') && location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>Browse</Link>
          <Link to="/products?category=Furniture" className="nav-link">Furniture</Link>
          <Link to="/products?category=Appliances" className="nav-link">Appliances</Link>
        </div>

        {/* Right Actions */}
        <div className="navbar-actions">
          {user && (
            <Link to="/cart" className="cart-btn" aria-label="Cart">
              <span className="cart-icon">🛒</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          )}

          {user ? (
            <div className="user-menu">
              <button
                className="user-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
              >
                <span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span>
                <span className="user-name hide-mobile">{user.name.split(' ')[0]}</span>
                <span className="chevron">▾</span>
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu" onMouseLeave={() => setDropdownOpen(false)}>
                  <div className="dropdown-header">
                    <p className="dropdown-name">{user.name}</p>
                    <p className="dropdown-email">{user.email}</p>
                  </div>
                  <div className="dropdown-divider" />
                  {user.role === 'admin' && (
                    <Link to="/admin" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      ⚙️ Admin Dashboard
                    </Link>
                  )}
                  <Link to="/my-rentals" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    📦 My Rentals
                  </Link>
                  <Link to="/maintenance" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    🔧 Maintenance
                  </Link>
                  <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    👤 Profile
                  </Link>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/products" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Browse All</Link>
          <Link to="/products?category=Furniture" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Furniture</Link>
          <Link to="/products?category=Appliances" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Appliances</Link>
          {user && (
            <>
              <Link to="/cart" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Cart {cartCount > 0 && `(${cartCount})`}</Link>
              <Link to="/my-rentals" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>My Rentals</Link>
              <Link to="/maintenance" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Maintenance</Link>
              <Link to="/profile" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Profile</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Admin</Link>
              )}
              <button className="mobile-nav-link mobile-logout" onClick={() => { handleLogout(); setMenuOpen(false); }}>
                Logout
              </button>
            </>
          )}
          {!user && (
            <>
              <Link to="/login" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
