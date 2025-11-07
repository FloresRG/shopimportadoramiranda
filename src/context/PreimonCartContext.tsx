// src/context/PreimonCartContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type PreimonCartItem = {
  id: number;
  nombre: string;
  precio: number;
  foto: string;
  cantidad: number;
};

type PreimonCartContextType = {
  items: PreimonCartItem[];
  addToCart: (item: Omit<PreimonCartItem, 'cantidad'>) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
};

const PreimonCartContext = createContext<PreimonCartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'preimon_cart_v1';

export const PreimonCartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<PreimonCartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (item: Omit<PreimonCartItem, 'cantidad'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [...prev, { ...item, cantidad: 1 }];
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, cantidad: quantity } : item))
    );
  };

  const removeFromCart = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setItems([]);

  const getTotalItems = () => items.reduce((sum, item) => sum + item.cantidad, 0);
  const getTotalPrice = () => items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  return (
    <PreimonCartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </PreimonCartContext.Provider>
  );
};

export const usePreimonCart = () => {
  const context = useContext(PreimonCartContext);
  if (!context) {
    throw new Error('usePreimonCart debe usarse dentro de un PreimonCartProvider');
  }
  return context;
};