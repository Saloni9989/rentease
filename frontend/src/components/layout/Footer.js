import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">🏠 Rent<span>Ease</span></div>
            <p className="footer-tagline">
              Affordable furniture & appliance rentals for students and working professionals.
              Move in, move out — hassle free.
            </p>
            <div className="footer-social">
              <a href="#!" aria-label="Facebook" className="social-link">📘</a>
              <a href="#!" aria-label="Twitter" className="social-link">🐦</a>
              <a href="#!" aria-label="Instagram" className="social-link">📸</a>
              <a href="#!" aria-label="LinkedIn" className="social-link">💼</a>
            </div>
          </div>

          {/* Products */}
          <div className="footer-col">
            <h4 className="footer-heading">Products</h4>
            <ul className="footer-links">
              <li><Link to="/products?category=Furniture&subCategory=Bed">Beds</Link></li>
              <li><Link to="/products?category=Furniture&subCategory=Sofa">Sofas</Link></li>
              <li><Link to="/products?category=Furniture&subCategory=Table">Tables</Link></li>
              <li><Link to="/products?category=Appliances&subCategory=Refrigerator">Refrigerators</Link></li>
              <li><Link to="/products?category=Appliances&subCategory=Washing Machine">Washing Machines</Link></li>
              <li><Link to="/products?category=Appliances&subCategory=TV">TVs</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="footer-col">
            <h4 className="footer-heading">Company</h4>
            <ul className="footer-links">
              <li><a href="#!">About Us</a></li>
              <li><a href="#!">How It Works</a></li>
              <li><a href="#!">Service Areas</a></li>
              <li><a href="#!">Careers</a></li>
              <li><a href="#!">Blog</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-col">
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links">
              <li><a href="#!">Help Center</a></li>
              <li><a href="#!">Contact Us</a></li>
              <li><a href="#!">Privacy Policy</a></li>
              <li><a href="#!">Terms of Service</a></li>
              <li><a href="#!">Refund Policy</a></li>
            </ul>
            <div className="footer-contact">
              <p>📞 1800-123-4567</p>
              <p>✉️ support@rentease.com</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} RentEase. All rights reserved.</p>
          <p className="footer-cities">
            Serving: Mumbai · Pune · Bangalore · Delhi · Hyderabad · Chennai
          </p>
        </div>
      </div>
    </footer>
  );
}
