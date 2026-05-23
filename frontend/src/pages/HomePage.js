import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/products/ProductCard';
import './HomePage.css';

const CATEGORIES = [
  { name: 'Beds', icon: '🛏️', sub: 'Bed', cat: 'Furniture' },
  { name: 'Sofas', icon: '🛋️', sub: 'Sofa', cat: 'Furniture' },
  { name: 'Tables', icon: '🪑', sub: 'Table', cat: 'Furniture' },
  { name: 'Refrigerators', icon: '🧊', sub: 'Refrigerator', cat: 'Appliances' },
  { name: 'Washing Machines', icon: '🫧', sub: 'Washing Machine', cat: 'Appliances' },
  { name: 'TVs', icon: '📺', sub: 'TV', cat: 'Appliances' },
  { name: 'ACs', icon: '❄️', sub: 'AC', cat: 'Appliances' },
  { name: 'Microwaves', icon: '📡', sub: 'Microwave', cat: 'Appliances' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: '🔍', title: 'Browse & Choose', desc: 'Explore our wide range of furniture and appliances. Filter by category, price, and city.' },
  { step: '02', icon: '📋', title: 'Select Your Plan', desc: 'Pick a rental tenure from 3 to 12 months. Longer plans come with better discounts.' },
  { step: '03', icon: '🚚', title: 'Schedule Delivery', desc: 'Choose your delivery date and address. We deliver and set up everything for you.' },
  { step: '04', icon: '🏠', title: 'Enjoy & Return', desc: 'Use the products during your tenure. Extend, return, or swap anytime with ease.' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', city: 'Bangalore', text: 'RentEase made my relocation so easy! Got a fully furnished room in 2 days. The quality is great and the prices are very affordable.', rating: 5 },
  { name: 'Rahul Mehta', city: 'Mumbai', text: 'As a student, buying furniture was not an option. RentEase gave me everything I needed at a fraction of the cost. Highly recommend!', rating: 5 },
  { name: 'Ananya Patel', city: 'Pune', text: 'The maintenance support is excellent. Had an issue with the washing machine and it was fixed within 24 hours. Great service!', rating: 4 },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/products?limit=8')
      .then((res) => setFeaturedProducts(res.data.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container hero-content">
          <div className="hero-text fade-in">
            <span className="hero-badge">🏆 India's #1 Rental Platform</span>
            <h1 className="hero-title">
              Rent Furniture &<br />
              <span className="hero-highlight">Appliances</span> Monthly
            </h1>
            <p className="hero-subtitle">
              Affordable, flexible rentals for students and working professionals.
              No upfront costs. Free delivery. Easy returns.
            </p>

            <form className="hero-search" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search for sofa, fridge, bed..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="hero-search-input"
              />
              <button type="submit" className="btn btn-primary">Search</button>
            </form>

            <div className="hero-stats">
              <div className="hero-stat"><span className="stat-num">10,000+</span><span className="stat-label">Happy Renters</span></div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><span className="stat-num">500+</span><span className="stat-label">Products</span></div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><span className="stat-num">6</span><span className="stat-label">Cities</span></div>
            </div>
          </div>

          <div className="hero-image fade-in">
            <div className="hero-img-card">
              <img
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600"
                alt="Modern furnished room"
              />
              <div className="hero-img-badge">
                <span>🚚</span>
                <div>
                  <p className="badge-title">Free Delivery</p>
                  <p className="badge-sub">Within 48 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Browse by Category</h2>
            <Link to="/products" className="section-link">View All →</Link>
          </div>
          <div className="category-grid">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                to={`/products?category=${cat.cat}&subCategory=${encodeURIComponent(cat.sub)}`}
                className="category-card"
              >
                <span className="category-icon">{cat.icon}</span>
                <span className="category-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section section-gray">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Products</h2>
            <Link to="/products" className="section-link">See All →</Link>
          </div>
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : (
            <div className="product-grid">
              {featuredProducts.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <div className="container">
          <div className="section-header text-center" style={{ justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Get your home furnished in 4 simple steps</p>
          </div>
          <div className="how-grid">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="how-card">
                <div className="how-step">{item.step}</div>
                <div className="how-icon">{item.icon}</div>
                <h3 className="how-title">{item.title}</h3>
                <p className="how-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why RentEase */}
      <section className="section section-primary">
        <div className="container">
          <h2 className="section-title text-white text-center mb-8">Why Choose RentEase?</h2>
          <div className="benefits-grid">
            {[
              { icon: '💰', title: 'No Upfront Cost', desc: 'Pay only a small security deposit. No large capital investment.' },
              { icon: '🚚', title: 'Free Delivery & Setup', desc: 'We deliver and set up everything at your doorstep.' },
              { icon: '🔧', title: 'Free Maintenance', desc: 'Any repair or maintenance is handled by our team at no extra cost.' },
              { icon: '🔄', title: 'Easy Relocation', desc: 'Moving cities? We pick up and redeliver to your new address.' },
              { icon: '📅', title: 'Flexible Tenure', desc: 'Choose 3, 6, or 12 month plans. Extend or return anytime.' },
              { icon: '⭐', title: 'Premium Quality', desc: 'All products are thoroughly cleaned and quality-checked before delivery.' },
            ].map((b) => (
              <div key={b.title} className="benefit-card">
                <span className="benefit-icon">{b.icon}</span>
                <h3 className="benefit-title">{b.title}</h3>
                <p className="benefit-desc">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="container">
          <h2 className="section-title text-center mb-8">What Our Customers Say</h2>
          <div className="testimonials-grid">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="testimonial-card">
                <div className="testimonial-stars">{'⭐'.repeat(t.rating)}</div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.name.charAt(0)}</div>
                  <div>
                    <p className="testimonial-name">{t.name}</p>
                    <p className="testimonial-city">📍 {t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container text-center">
          <h2 className="cta-title">Ready to Furnish Your Home?</h2>
          <p className="cta-subtitle">Join thousands of happy renters across India</p>
          <div className="cta-buttons">
            <Link to="/products" className="btn btn-primary btn-lg">Browse Products</Link>
            <Link to="/register" className="btn btn-outline btn-lg">Get Started Free</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
