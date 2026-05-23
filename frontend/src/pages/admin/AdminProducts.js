import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './AdminTable.css';

const EMPTY_PRODUCT = {
  name: '', description: '', category: 'Furniture', subCategory: 'Bed',
  brand: '', securityDeposit: '', availableQuantity: '', totalQuantity: '',
  serviceAreas: [], features: [],
  tenureOptions: [
    { months: 3, monthlyRent: '', discount: 0 },
    { months: 6, monthlyRent: '', discount: 0 },
    { months: 12, monthlyRent: '', discount: 0 },
  ],
};

const SUB_CATS = {
  Furniture: ['Bed', 'Sofa', 'Table', 'Chair', 'Wardrobe', 'Desk'],
  Appliances: ['Refrigerator', 'Washing Machine', 'TV', 'AC', 'Microwave', 'Geyser'],
};
const CITIES = ['Mumbai', 'Pune', 'Bangalore', 'Delhi', 'Hyderabad', 'Chennai'];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products?limit=100');
      setProducts(res.data.products || []);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditProduct(null);
    setForm(EMPTY_PRODUCT);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      ...product,
      serviceAreas: product.serviceAreas || [],
      features: product.features || [],
      tenureOptions: product.tenureOptions?.length > 0 ? product.tenureOptions : EMPTY_PRODUCT.tenureOptions,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...form,
        securityDeposit: Number(form.securityDeposit),
        availableQuantity: Number(form.availableQuantity),
        totalQuantity: Number(form.totalQuantity),
        tenureOptions: form.tenureOptions.map((t) => ({
          months: Number(t.months),
          monthlyRent: Number(t.monthlyRent),
          discount: Number(t.discount || 0),
        })).filter((t) => t.monthlyRent > 0),
      };

      if (editProduct) {
        await api.put(`/products/${editProduct._id}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/products', payload);
        toast.success('Product created');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deactivated');
      fetchProducts();
    } catch {
      toast.error('Failed to deactivate');
    }
  };

  const toggleCity = (city) => {
    setForm((f) => ({
      ...f,
      serviceAreas: f.serviceAreas.includes(city)
        ? f.serviceAreas.filter((c) => c !== city)
        : [...f.serviceAreas, city],
    }));
  };

  const updateTenure = (index, field, value) => {
    setForm((f) => {
      const updated = [...f.tenureOptions];
      updated[index] = { ...updated[index], [field]: value };
      return { ...f, tenureOptions: updated };
    });
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-subtitle">{products.length} products in catalog</p>
        </div>
        <div className="admin-header-actions">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control admin-search"
          />
          <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Base Rent</th>
                <th>Deposit</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="product-cell">
                      <div className="product-cell-img">
                        <img src={p.images?.[0] || ''} alt={p.name}
                          onError={(e) => { e.target.style.display = 'none'; }} />
                      </div>
                      <div>
                        <p className="product-cell-name">{p.name}</p>
                        <p className="product-cell-brand">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-primary">{p.category}</span>
                    <br /><small className="text-muted">{p.subCategory}</small>
                  </td>
                  <td>Rs.{p.baseMonthlyRent?.toLocaleString() || '-'}/mo</td>
                  <td>Rs.{p.securityDeposit?.toLocaleString()}</td>
                  <td>
                    <span className={p.availableQuantity > 0 ? 'text-success' : 'text-danger'}>
                      {p.availableQuantity}/{p.totalQuantity}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${p.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)}>Edit</button>
                      {p.isActive && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeactivate(p._id)}>
                          Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="no-data-msg">No products found</p>}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave} className="modal-body">
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input type="text" className="form-control" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input type="text" className="form-control" value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-control" rows={3} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-control" value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value, subCategory: SUB_CATS[e.target.value][0] })}>
                    <option value="Furniture">Furniture</option>
                    <option value="Appliances">Appliances</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Sub-Category *</label>
                  <select className="form-control" value={form.subCategory}
                    onChange={(e) => setForm({ ...form, subCategory: e.target.value })}>
                    {(SUB_CATS[form.category] || []).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Security Deposit (Rs.) *</label>
                  <input type="number" className="form-control" value={form.securityDeposit}
                    onChange={(e) => setForm({ ...form, securityDeposit: e.target.value })} required min="0" />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Total Quantity *</label>
                  <input type="number" className="form-control" value={form.totalQuantity}
                    onChange={(e) => setForm({ ...form, totalQuantity: e.target.value })} required min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Available Quantity *</label>
                  <input type="number" className="form-control" value={form.availableQuantity}
                    onChange={(e) => setForm({ ...form, availableQuantity: e.target.value })} required min="0" />
                </div>
              </div>

              {/* Tenure Options */}
              <div className="form-group">
                <label className="form-label">Tenure Options (Monthly Rent in Rs.)</label>
                <div className="tenure-inputs">
                  {form.tenureOptions.map((t, i) => (
                    <div key={i} className="tenure-input-row">
                      <span className="tenure-months-label">{t.months} months</span>
                      <input type="number" className="form-control" placeholder="Monthly Rent"
                        value={t.monthlyRent} onChange={(e) => updateTenure(i, 'monthlyRent', e.target.value)} min="0" />
                      <input type="number" className="form-control" placeholder="Discount %"
                        value={t.discount} onChange={(e) => updateTenure(i, 'discount', e.target.value)} min="0" max="100" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Areas */}
              <div className="form-group">
                <label className="form-label">Service Areas</label>
                <div className="city-checkboxes">
                  {CITIES.map((city) => (
                    <label key={city} className="city-checkbox">
                      <input type="checkbox" checked={form.serviceAreas.includes(city)}
                        onChange={() => toggleCity(city)} />
                      <span>{city}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
