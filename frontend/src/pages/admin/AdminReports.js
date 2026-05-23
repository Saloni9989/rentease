import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminReports.css';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminReports() {
  const [revenueData, setRevenueData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/reports/revenue'),
      api.get('/admin/reports/products'),
    ])
      .then(([revRes, prodRes]) => {
        setRevenueData(revRes.data.monthlyRevenue || []);
        setProductData(prodRes.data.products || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const maxRevenue = Math.max(...revenueData.map((r) => r.revenue), 1);
  const totalRevenue = revenueData.reduce((sum, r) => sum + r.revenue, 0);
  const totalOrders = revenueData.reduce((sum, r) => sum + r.count, 0);

  const sortedProducts = [...productData].sort((a, b) => b.utilizationRate - a.utilizationRate);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="admin-reports">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Reports & Analytics</h1>
        <p className="admin-page-subtitle">Business performance overview</p>
      </div>

      {/* Summary Cards */}
      <div className="report-summary-grid">
        <div className="report-summary-card">
          <p className="report-summary-label">Total Revenue (12 months)</p>
          <p className="report-summary-value">Rs.{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="report-summary-card">
          <p className="report-summary-label">Total Orders (12 months)</p>
          <p className="report-summary-value">{totalOrders}</p>
        </div>
        <div className="report-summary-card">
          <p className="report-summary-label">Avg. Order Value</p>
          <p className="report-summary-value">
            Rs.{totalOrders > 0 ? Math.round(totalRevenue / totalOrders).toLocaleString() : 0}
          </p>
        </div>
        <div className="report-summary-card">
          <p className="report-summary-label">Products Tracked</p>
          <p className="report-summary-value">{productData.length}</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="report-card">
        <h2 className="report-card-title">Monthly Revenue</h2>
        {revenueData.length === 0 ? (
          <p className="no-data-msg">No revenue data available</p>
        ) : (
          <div className="bar-chart">
            {[...revenueData].reverse().map((item) => (
              <div key={`${item._id.year}-${item._id.month}`} className="bar-item">
                <div className="bar-wrap">
                  <div
                    className="bar"
                    style={{ height: `${(item.revenue / maxRevenue) * 180}px` }}
                    title={`Rs.${item.revenue.toLocaleString()}`}
                  >
                    <span className="bar-value">Rs.{(item.revenue / 1000).toFixed(0)}k</span>
                  </div>
                </div>
                <p className="bar-label">
                  {MONTH_NAMES[item._id.month - 1]} {String(item._id.year).slice(2)}
                </p>
                <p className="bar-count">{item.count} orders</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Utilization */}
      <div className="report-card">
        <h2 className="report-card-title">Product Utilization Rate</h2>
        {productData.length === 0 ? (
          <p className="no-data-msg">No product data available</p>
        ) : (
          <div className="utilization-table">
            <div className="utilization-header">
              <span>Product</span>
              <span>Category</span>
              <span>Total</span>
              <span>Rented</span>
              <span>Utilization</span>
            </div>
            {sortedProducts.map((p) => (
              <div key={p._id} className="utilization-row">
                <span className="util-name">{p.name}</span>
                <span>
                  <span className="badge badge-primary">{p.category}</span>
                </span>
                <span>{p.totalQuantity}</span>
                <span>{p.rentedQuantity}</span>
                <span>
                  <div className="util-bar-wrap">
                    <div
                      className="util-bar"
                      style={{
                        width: `${p.utilizationRate}%`,
                        background: p.utilizationRate > 80 ? 'var(--success)' :
                          p.utilizationRate > 50 ? 'var(--warning)' : 'var(--info)',
                      }}
                    />
                    <span className="util-pct">{p.utilizationRate}%</span>
                  </div>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
