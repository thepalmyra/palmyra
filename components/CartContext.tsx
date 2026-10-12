"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  ready: boolean;
  addItem: (item: CartItem) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(
  undefined
);

export function cartItemKey(item: CartItem) {
  return `${item.id}::${item.color}::${item.size}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("palmyra-cart");
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      localStorage.removeItem("palmyra-cart");
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (ready) {
      localStorage.setItem("palmyra-cart", JSON.stringify(items));
    }
  }, [items, ready]);

  const addItem = useCallback((item: CartItem) => {
    setItems((current) => {
      const key = cartItemKey(item);
      const existing = current.find(
        (entry) => cartItemKey(entry) === key
      );

      if (existing) {
        return current.map((entry) =>
          cartItemKey(entry) === key
            ? { ...entry, quantity: entry.quantity + item.quantity }
            : entry
        );
      }

      return [...current, item];
    });
  }, []);

  const updateQuantity = useCallback(
    (key: string, quantity: number) => {
      if (quantity < 1) return;

      setItems((current) =>
        current.map((item) =>
          cartItemKey(item) === key ? { ...item, quantity } : item
        )
      );
    },
    []
  );

  const removeItem = useCallback((key: string) => {
    setItems((current) =>
      current.filter((item) => cartItemKey(item) !== key)
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        ready,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}