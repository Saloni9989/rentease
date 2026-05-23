import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/products/ProductCard';
import './ProductsPage.css';

const CATEGORIES = ['Furniture', 'Appliances'];
const SUB_CATEGORIES = {
  Furniture: ['Bed', 'Sofa', 'Table', 'Chair', 'Wardrobe', 'Desk'],
  Appliances: ['Refrigerator', 'Washing Machine', 'TV', 'AC', 'Microwave', 'Geyser'],
};
const CITIES = ['Mumbai', 'Pune', 'Bangalore', 'Delhi', 'Hyderabad', 'Chennai'];
const SORT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'rent_asc', label: 'Rent: Low to High' },
  { value: 'rent_desc', label: 'Rent: High to Low' },
  { value: 'newest', label: 'Newest First' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    subCategory: searchParams.get('subCategory') || '',
    city: searchParams.get('city') || '',
    search: searchParams.get('search') || '',
    minRent: '',
    maxRent: '',
    sort: '',
    page: 1,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.set('category', filters.category);
      if (filters.subCategory) params.set('subCategory', filters.subCategory);
      if (filters.city) params.set('city', filters.city);
      if (filters.search) params.set('search', filters.search);
      if (filters.minRent) params.set('minRent', filters.minRent);
      if (filters.maxRent) params.set('maxRent', filters.maxRent);
      params.set('page', filters.page);
      params.set('limit', 12);

      const res = await api.get(`/products?${params}`);
      let prods = res.data.products || [];

      // Client-side sort
      if (filters.sort === 'rent_asc') prods.sort((a, b) => (a.baseMonthlyRent || 0) - (b.baseMonthlyRent || 0));
      if (filters.sort === 'rent_desc') prods.sort((a, b) => (b.baseMonthlyRent || 0) - (a.baseMonthlyRent || 0));

      setProducts(prods);
      setPagination(res.data.pagination || { total: prods.length, pages: 1, page: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ category: '', subCategory: '', city: '', search: '', minRent: '', maxRent: '', sort: '', page: 1 });
    setSearchParams({});
  };

  const activeFilterCount = [filters.category, filters.subCategory, filters.city, filters.minRent, filters.maxRent]
    .filter(Boolean).length;

  return (
    <div className="products-page">
      <div className="container">
        {/* Page Header */}
        <div className="products-header">
          <div>
            <h1 className="page-title">Browse Products</h1>
            <p className="page-subtitle">{pagination.total} products available for rent</p>
          </div>
          <div className="products-header-actions">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="form-control"
              />
            </div>
            <select
              value={filters.sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="form-control sort-select"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button
              className="btn btn-outline btn-sm filter-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              🔽 Filters {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
            </button>
          </div>
        </div>

        <div className="products-layout">
          {/* Sidebar Filters */}
          <aside className={`filters-sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="filters-header">
              <h3>Filters</h3>
              {activeFilterCount > 0 && (
                <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear All</button>
              )}
            </div>

            {/* Category */}
            <div className="filter-group">
              <h4 className="filter-label">Category</h4>
              <div className="filter-options">
                <label className="filter-option">
                  <input type="radio" name="category" value="" checked={!filters.category} onChange={() => updateFilter('category', '')} />
                  <span>All</span>
                </label>
                {CATEGORIES.map((cat) => (
                  <label key={cat} className="filter-option">
                    <input type="radio" name="category" value={cat} checked={filters.category === cat} onChange={() => { updateFilter('category', cat); updateFilter('subCategory', ''); }} />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sub Category */}
            {filters.category && (
              <div className="filter-group">
                <h4 className="filter-label">Type</h4>
                <div className="filter-options">
                  <label className="filter-option">
                    <input type="radio" name="sub" value="" checked={!filters.subCategory} onChange={() => updateFilter('subCategory', '')} />
                    <span>All</span>
                  </label>
                  {(SUB_CATEGORIES[filters.category] || []).map((sub) => (
                    <label key={sub} className="filter-option">
                      <input type="radio" name="sub" value={sub} checked={filters.subCategory === sub} onChange={() => updateFilter('subCategory', sub)} />
                      <span>{sub}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* City */}
            <div className="filter-group">
              <h4 className="filter-label">City</h4>
              <select value={filters.city} onChange={(e) => updateFilter('city', e.target.value)} className="form-control">
                <option value="">All Cities</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Rent Range */}
            <div className="filter-group">
              <h4 className="filter-label">Monthly Rent (₹)</h4>
              <div className="rent-range">
                <input type="number" placeholder="Min" value={filters.minRent} onChange={(e) => updateFilter('minRent', e.target.value)} className="form-control" min="0" />
                <span>–</span>
                <input type="number" placeholder="Max" value={filters.maxRent} onChange={(e) => updateFilter('maxRent', e.target.value)} className="form-control" min="0" />
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="products-main">
            {loading ? (
              <div className="loading-center"><div className="spinner" /></div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🔍</span>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search query</p>
                <button className="btn btn-primary mt-4" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="product-grid">
                  {products.map((p) => <ProductCard key={p._id} product={p} />)}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="pagination">
                    <button
                      className="btn btn-outline btn-sm"
                      disabled={filters.page <= 1}
                      onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                    >
                      ← Prev
                    </button>
                    <span className="pagination-info">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      className="btn btn-outline btn-sm"
                      disabled={filters.page >= pagination.pages}
                      onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
