import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem("cart_items");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("cart_items", JSON.stringify(cart));
    } catch (e) {
      // ignore
    }
  }, [cart]);

  const addItem = (book) => {
    setCart((prev) => {
      const idx = prev.findIndex((it) => it.id === book.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: (next[idx].qty || 1) + 1 };
        return next;
      }
      return [...prev, { ...book, qty: 1 }];
    });
  };

  const removeItem = (bookId) => {
    setCart((prev) => prev.filter((it) => it.id !== bookId));
  };

  const changeQty = (bookId, delta) => {
    setCart((prev) => {
      const idx = prev.findIndex((it) => it.id === bookId);
      if (idx < 0) return prev;
      const next = [...prev];
      const newQty = (next[idx].qty || 1) + delta;
      if (newQty <= 0) {
        return next.filter((it) => it.id !== bookId);
      }
      next[idx] = { ...next[idx], qty: newQty };
      return next;
    });
  };

  const updateQty = (bookId, qty) => {
    setCart((prev) => {
      const idx = prev.findIndex((it) => it.id === bookId);
      if (idx < 0) return prev;
      if (qty <= 0) return prev.filter((it) => it.id !== bookId);
      const next = [...prev];
      next[idx] = { ...next[idx], qty };
      return next;
    });
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, addItem, removeItem, clearCart, changeQty, updateQty }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export default CartContext;
