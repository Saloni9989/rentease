import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './ProductDetailPage.css';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTenure, setSelectedTenure] = useState(null);
  const [adding, setAdding] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data.product);
        if (res.data.product.tenureOptions?.length > 0) {
          setSelectedTenure(res.data.product.tenureOptions[0]);
        }
      })
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    if (!selectedTenure) { toast.error('Please select a tenure plan'); return; }
    try {
      setAdding(true);
      await addToCart(product._id, selectedTenure.months);
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleRentNow = async () => {
    if (!user) { navigate('/login'); return; }
    if (!selectedTenure) { toast.error('Please select a tenure plan'); return; }
    try {
      setAdding(true);
      await addToCart(product._id, selectedTenure.months);
      navigate('/cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to proceed');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!product) return null;

  const images = product.images?.length > 0 ? product.images : [PLACEHOLDER];
  const totalRent = selectedTenure ? selectedTenure.monthlyRent * selectedTenure.months : 0;

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <button onClick={() => navigate('/products')} className="breadcrumb-link">Products</button>
          <span>›</span>
          <span>{product.category}</span>
          <span>›</span>
          <span>{product.subCategory}</span>
          <span>›</span>
          <span className="breadcrumb-current">{product.name}</span>
        </nav>

        <div className="product-detail-grid">
          {/* Images */}
          <div className="product-images">
            <div className="main-image">
              <img
                src={images[activeImg]}
                alt={product.name}
                onError={(e) => { e.target.src = PLACEHOLDER; }}
              />
              {!product.availableQuantity && (
                <div className="out-of-stock-overlay">Out of Stock</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="image-thumbnails">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`thumb ${activeImg === i ? 'active' : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={img} alt={`View ${i + 1}`} onError={(e) => { e.target.src = PLACEHOLDER; }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="product-info">
            <div className="product-meta">
              <span className="product-category-badge">{product.category}</span>
              <span className="product-sub-badge">{product.subCategory}</span>
            </div>

            <h1 className="product-detail-name">{product.name}</h1>
            <p className="product-detail-brand">by {product.brand}</p>

            <div className="product-availability-row">
              <span className={`availability-badge ${product.availableQuantity > 0 ? 'in-stock' : 'out-stock'}`}>
                {product.availableQuantity > 0
                  ? `✓ In Stock (${product.availableQuantity} available)`
                  : '✗ Out of Stock'}
              </span>
            </div>

            <p className="product-detail-desc">{product.description}</p>

            {/* Tenure Selection */}
            <div className="tenure-section">
              <h3 className="tenure-heading">Select Rental Plan</h3>
              <div className="tenure-options">
                {product.tenureOptions?.map((t) => (
                  <button
                    key={t.months}
                    className={`tenure-option ${selectedTenure?.months === t.months ? 'selected' : ''}`}
                    onClick={() => setSelectedTenure(t)}
                  >
                    <span className="tenure-months">{t.months} Months</span>
                    <span className="tenure-rent">₹{t.monthlyRent.toLocaleString()}/mo</span>
                    {t.discount > 0 && (
                      <span className="tenure-discount">{t.discount}% off</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Pricing Summary */}
            {selectedTenure && (
              <div className="pricing-summary">
                <div className="pricing-row">
                  <span>Monthly Rent</span>
                  <span className="pricing-value">₹{selectedTenure.monthlyRent.toLocaleString()}</span>
                </div>
                <div className="pricing-row">
                  <span>Security Deposit (refundable)</span>
                  <span className="pricing-value">₹{product.securityDeposit.toLocaleString()}</span>
                </div>
                <div className="pricing-row">
                  <span>Tenure</span>
                  <span className="pricing-value">{selectedTenure.months} months</span>
                </div>
                <div className="pricing-divider" />
                <div className="pricing-row pricing-total">
                  <span>Total Rent ({selectedTenure.months} months)</span>
                  <span>₹{totalRent.toLocaleString()}</span>
                </div>
                <div className="pricing-row pricing-due">
                  <span>Amount Due Today</span>
                  <span>₹{(selectedTenure.monthlyRent + product.securityDeposit).toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="product-actions">
              <button
                className="btn btn-outline btn-lg"
                onClick={handleAddToCart}
                disabled={adding || !product.availableQuantity}
              >
                {adding ? <span className="spinner spinner-sm" /> : '🛒 Add to Cart'}
              </button>
              <button
                className="btn btn-primary btn-lg"
                onClick={handleRentNow}
                disabled={adding || !product.availableQuantity}
              >
                {adding ? <span className="spinner spinner-sm" /> : '⚡ Rent Now'}
              </button>
            </div>

            {/* Features */}
            {product.features?.length > 0 && (
              <div className="product-features">
                <h3 className="features-heading">Key Features</h3>
                <ul className="features-list">
                  {product.features.map((f, i) => (
                    <li key={i} className="feature-item">
                      <span className="feature-check">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Service Areas */}
            {product.serviceAreas?.length > 0 && (
              <div className="service-areas">
                <h3 className="features-heading">Available In</h3>
                <div className="city-chips">
                  {product.serviceAreas.map((city) => (
                    <span key={city} className="city-chip">📍 {city}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="info-cards">
          {[
            { icon: '🚚', title: 'Free Delivery', desc: 'Delivered and set up within 48 hours of order confirmation.' },
            { icon: '🔧', title: 'Free Maintenance', desc: 'All repairs and maintenance covered at no extra cost.' },
            { icon: '🔄', title: 'Easy Returns', desc: 'Schedule a pickup anytime. We handle the rest.' },
            { icon: '💰', title: 'Deposit Refund', desc: 'Full security deposit refunded after return inspection.' },
          ].map((card) => (
            <div key={card.title} className="info-card">
              <span className="info-icon">{card.icon}</span>
              <div>
                <h4 className="info-title">{card.title}</h4>
                <p className="info-desc">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
