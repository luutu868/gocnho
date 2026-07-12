'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { CartItem, OrderInfo } from '@/lib/types';
import { menuData } from '@/lib/data/menu';

interface CartContextType {
  items: CartItem[];
  addItem: (menuItemId: number, size: string, sugar?: string, ice?: string, toppings?: string[], note?: string) => void;
  removeItem: (cartIndex: number) => void;
  updateQuantity: (cartIndex: number, delta: number) => void;
  clearCart: () => void;
  totalAmount: number;
  itemCount: number;
  tableNumber: string;
  setTableNumber: (table: string) => void;
  lastOrder: OrderInfo | null;
  placeOrder: (paymentMethod: 'vietqr' | 'cash') => OrderInfo;
}

const CartContext = createContext<CartContextType | null>(null);

function generateOrderCode(): string {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
  return `TC-${today}-${seq}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumberState] = useState('');
  const [lastOrder, setLastOrder] = useState<OrderInfo | null>(null);

  // Load from localStorage on mount; also read table from URL if present
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try { setItems(JSON.parse(savedCart)); } catch { /* ignore */ }
    }

    // BAN-01: đọc table từ URL param → lưu localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const tableFromUrl = urlParams.get('table');
    const savedTable = localStorage.getItem('table');

    if (tableFromUrl) {
      setTableNumberState(tableFromUrl);
      localStorage.setItem('table', tableFromUrl);
    } else if (savedTable) {
      setTableNumberState(savedTable);
    }
    // Nếu không có cả 2 → để trống, popup sẽ hiện khi cần checkout
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const setTableNumber = useCallback((table: string) => {
    setTableNumberState(table);
    localStorage.setItem('table', table);
  }, []);

  const addItem = useCallback(
    (menuItemId: number, size: string, sugar?: string, ice?: string, toppings?: string[], note?: string) => {
      const menuItem = menuData.find((i) => i.id === menuItemId);
      if (!menuItem) return;

      const basePrice = menuItem.prices[size] || Object.values(menuItem.prices)[0];
      const toppingList = toppings || [];
      const toppingTotal = toppingList.length * 7000;

      const cartItem: CartItem = {
        menuItemId,
        name: menuItem.name,
        size,
        price: basePrice + toppingTotal,
        quantity: 1,
        sugar: sugar || '',
        ice: ice || '',
        toppings: toppingList,
        toppingTotal,
        note: note || '',
      };

      setItems((prev) => [...prev, cartItem]);
    },
    []
  );

  const removeItem = useCallback((cartIndex: number) => {
    setItems((prev) => prev.filter((_, i) => i !== cartIndex));
  }, []);

  const updateQuantity = useCallback((cartIndex: number, delta: number) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== cartIndex) return item;
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem('cart');
  }, []);

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const placeOrder = useCallback(
    (paymentMethod: 'vietqr' | 'cash'): OrderInfo => {
      const order: OrderInfo = {
        code: generateOrderCode(),
        table: tableNumber || '?',
        items: [...items],
        totalAmount,
        paymentMethod,
        createdAt: new Date().toISOString(),
      };
      setLastOrder(order);
      clearCart();
      return order;
    },
    [items, totalAmount, tableNumber, clearCart]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalAmount,
        itemCount,
        tableNumber,
        setTableNumber,
        lastOrder,
        placeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
