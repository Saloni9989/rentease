import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400';

export default function ProductCard({ product }) {
  const baseRent = product.baseMonthlyRent || product.tenureOptions?.[0]?.monthlyRent || 0;
  const isAvailable = product.availableQuantity > 0;

  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <div className="product-card-img-wrap">
        <img
          src={product.images?.[0] || PLACEHOLDER}
          alt={product.name}
          className="product-card-img"
          onError={(e) => { e.target.src = PLACEHOLDER; }}
          loading="lazy"
        />
        <span className={`product-availability ${isAvailable ? 'available' : 'unavailable'}`}>
          {isAvailable ? '✓ Available' : '✗ Out of Stock'}
        </span>
        <span className="product-category-tag">{product.subCategory}</span>
      </div>

      <div className="product-card-body">
        <p className="product-brand">{product.brand}</p>
        <h3 className="product-name">{product.name}</h3>

        <div className="product-tenure-chips">
          {product.tenureOptions?.slice(0, 3).map((t) => (
            <span key={t.months} className="tenure-chip">{t.months}M</span>
          ))}
        </div>

        <div className="product-pricing">
          <div>
            <span className="rent-label">Starts at</span>
            <span className="rent-amount">₹{baseRent.toLocaleString()}</span>
            <span className="rent-period">/month</span>
          </div>
          <div className="deposit-info">
            <span className="deposit-label">Deposit: </span>
            <span className="deposit-amount">₹{product.securityDeposit?.toLocaleString()}</span>
          </div>
        </div>

        <button className="product-card-btn" disabled={!isAvailable}>
          {isAvailable ? 'View Details' : 'Out of Stock'}
        </button>
      </div>
    </Link>
  );
}
