import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Public pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// User pages
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import MyRentalsPage from './pages/MyRentalsPage';
import RentalDetailPage from './pages/RentalDetailPage';
import MaintenancePage from './pages/MaintenancePage';
import ProfilePage from './pages/ProfilePage';

// Admin pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminRentals from './pages/admin/AdminRentals';
import AdminUsers from './pages/admin/AdminUsers';
import AdminMaintenance from './pages/admin/AdminMaintenance';
import AdminReports from './pages/admin/AdminReports';

// Route guards
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  return !user ? children : <Navigate to="/" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<><Navbar /><HomePage /><Footer /></>} />
      <Route path="/products" element={<><Navbar /><ProductsPage /><Footer /></>} />
      <Route path="/products/:id" element={<><Navbar /><ProductDetailPage /><Footer /></>} />
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

      {/* Protected user routes */}
      <Route path="/cart" element={<PrivateRoute><Navbar /><CartPage /><Footer /></PrivateRoute>} />
      <Route path="/checkout" element={<PrivateRoute><Navbar /><CheckoutPage /><Footer /></PrivateRoute>} />
      <Route path="/my-rentals" element={<PrivateRoute><Navbar /><MyRentalsPage /><Footer /></PrivateRoute>} />
      <Route path="/my-rentals/:id" element={<PrivateRoute><Navbar /><RentalDetailPage /><Footer /></PrivateRoute>} />
      <Route path="/maintenance" element={<PrivateRoute><Navbar /><MaintenancePage /><Footer /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Navbar /><ProfilePage /><Footer /></PrivateRoute>} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="rentals" element={<AdminRentals />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="maintenance" element={<AdminMaintenance />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            theme="light"
          />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
