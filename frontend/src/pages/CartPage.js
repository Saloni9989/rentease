import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import './CartPage.css';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200';

export default function CartPage() {
  const { cart, cartLoading, updateCartItem, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [removing, setRemoving] = useState(null);

  const handleRemove = async (itemId) => {
    try {
      setRemoving(itemId);
      await removeFromCart(itemId);
      toast.success('Item removed from cart');
    } catch {
      toast.error('Failed to remove item');
    } finally {
      setRemoving(null);
    }
  };

  const handleTenureChange = async (itemId, product, newTenure) => {
    try {
      await updateCartItem(itemId, { tenureMonths: parseInt(newTenure) });
    } catch {
      toast.error('Failed to update tenure');
    }
  };

  if (cartLoading) return <div className="loading-center"><div className="spinner" /></div>;

  const items = cart.items || [];
  const totalMonthly = cart.totalMonthlyRent || 0;
  const totalDeposit = cart.totalSecurityDeposit || 0;

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <span className="empty-cart-icon">🛒</span>
            <h2>Your cart is empty</h2>
            <p>Browse our products and add items to get started</p>
            <Link to="/products" className="btn btn-primary btn-lg mt-4">Browse Products</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Your Cart</h1>
          <p className="page-subtitle">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="cart-layout">
          {/* Cart Items */}
          <div className="cart-items">
            {items.map((item) => {
              const product = item.product;
              if (!product) return null;
              return (
                <div key={item._id} className="cart-item">
                  <div className="cart-item-img">
                    <img
                      src={product.images?.[0] || PLACEHOLDER}
                      alt={product.name}
                      onError={(e) => { e.target.src = PLACEHOLDER; }}
                    />
                  </div>
                  <div className="cart-item-info">
                    <p className="cart-item-brand">{product.brand}</p>
                    <h3 className="cart-item-name">{product.name}</h3>
                    <p className="cart-item-category">{product.category} · {product.subCategory}</p>

                    <div className="cart-item-tenure">
                      <label className="tenure-select-label">Tenure:</label>
                      <select
                        value={item.tenureMonths}
                        onChange={(e) => handleTenureChange(item._id, product, e.target.value)}
                        className="tenure-select"
                      >
                        {product.tenureOptions?.map((t) => (
                          <option key={t.months} value={t.months}>
                            {t.months} months – ₹{t.monthlyRent.toLocaleString()}/mo
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="cart-item-pricing">
                    <p className="cart-item-rent">₹{item.monthlyRent.toLocaleString()}<span>/mo</span></p>
                    <p className="cart-item-deposit">Deposit: ₹{item.securityDeposit.toLocaleString()}</p>
                    <p className="cart-item-total">
                      Total: ₹{(item.monthlyRent * item.tenureMonths).toLocaleString()}
                    </p>
                  </div>

                  <button
                    className="cart-item-remove"
                    onClick={() => handleRemove(item._id)}
                    disabled={removing === item._id}
                    aria-label="Remove item"
                  >
                    {removing === item._id ? <span className="spinner spinner-sm" /> : '✕'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="cart-summary">
            <div className="summary-card">
              <h2 className="summary-title">Order Summary</h2>

              <div className="summary-rows">
                <div className="summary-row">
                  <span>Monthly Rent</span>
                  <span>₹{totalMonthly.toLocaleString()}/mo</span>
                </div>
                <div className="summary-row">
                  <span>Security Deposit</span>
                  <span>₹{totalDeposit.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery</span>
                  <span className="text-success">Free</span>
                </div>
                <div className="summary-row">
                  <span>Setup</span>
                  <span className="text-success">Free</span>
                </div>
              </div>

              <div className="summary-divider" />

              <div className="summary-total">
                <span>Due Today</span>
                <span>₹{(totalMonthly + totalDeposit).toLocaleString()}</span>
              </div>
              <p className="summary-note">
                * Includes first month's rent + refundable security deposit
              </p>

              <button
                className="btn btn-primary w-full btn-lg"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout →
              </button>

              <Link to="/products" className="btn btn-ghost w-full mt-2">
                ← Continue Shopping
              </Link>
            </div>

            <div className="trust-badges">
              <div className="trust-badge"><span>🔒</span> Secure Checkout</div>
              <div className="trust-badge"><span>🚚</span> Free Delivery</div>
              <div className="trust-badge"><span>🔧</span> Free Maintenance</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
