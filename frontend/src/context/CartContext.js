import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], totalMonthlyRent: 0, totalSecurityDeposit: 0 });
  const [cartLoading, setCartLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setCart({ items: [], totalMonthlyRent: 0, totalSecurityDeposit: 0 }); return; }
    try {
      setCartLoading(true);
      const res = await api.get('/cart');
      setCart(res.data.cart);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, tenureMonths, quantity = 1) => {
    const res = await api.post('/cart/add', { productId, tenureMonths, quantity });
    setCart(res.data.cart);
    return res.data.cart;
  };

  const updateCartItem = async (itemId, updates) => {
    const res = await api.put(`/cart/update/${itemId}`, updates);
    setCart(res.data.cart);
    return res.data.cart;
  };

  const removeFromCart = async (itemId) => {
    const res = await api.delete(`/cart/remove/${itemId}`);
    setCart(res.data.cart);
    return res.data.cart;
  };

  const clearCart = async () => {
    await api.delete('/cart/clear');
    setCart({ items: [], totalMonthlyRent: 0, totalSecurityDeposit: 0 });
  };

  const cartCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{
      cart, cartLoading, cartCount,
      addToCart, updateCartItem, removeFromCart, clearCart, fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
