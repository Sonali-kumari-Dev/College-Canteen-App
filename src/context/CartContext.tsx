import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Food, CartItem } from '../types.js';
import { useAuth } from './AuthContext.js';

interface CartContextType {
  items: CartItem[];
  addToCart: (food: Food, quantity?: number) => void;
  updateQuantity: (foodId: string, quantity: number) => void;
  removeFromCart: (foodId: string) => void;
  clearCart: () => void;
  subtotal: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const cartStorageKey = user ? `canteenx_cart_${user.organizationId}_${user._id}` : 'canteenx_cart_guest';

  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(cartStorageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Re-sync cart on user change
  useEffect(() => {
    try {
      const stored = localStorage.getItem(cartStorageKey);
      setItems(stored ? JSON.parse(stored) : []);
    } catch {
      setItems([]);
    }
  }, [cartStorageKey]);

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(cartStorageKey, JSON.stringify(items));
    } catch (err) {
      console.warn('Failed to save cart to localStorage:', err);
    }
  }, [items, cartStorageKey]);

  const addToCart = (food: Food, quantity: number = 1) => {
    if (!food.isAvailable) return;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.food._id === food._id);
      if (existingIndex > -1) {
        const next = [...prevItems];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      } else {
        return [...prevItems, { food, quantity }];
      }
    });
  };

  const updateQuantity = (foodId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(foodId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.food._id === foodId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (foodId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.food._id !== foodId));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(cartStorageKey);
  };

  const subtotal = items.reduce((sum, item) => sum + item.food.price * item.quantity, 0);
  const total = subtotal; // Cash at counter, no unexpected fees
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
