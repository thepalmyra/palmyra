
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";

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

const CartContext = createContext<CartContextType | undefined>(undefined);
const GUEST_KEY = "palmyra-cart";

export function cartItemKey(item: CartItem) {
  return `${item.id}::${item.color}::${item.size}`;
}

function mergeCarts(...carts: CartItem[][]): CartItem[] {
  const merged = new Map<string, CartItem>();

  for (const cart of carts) {
    for (const item of cart) {
      const key = cartItemKey(item);
      const existing = merged.get(key);

      merged.set(
        key,
        existing
          ? { ...existing, quantity: existing.quantity + item.quantity }
          : { ...item }
      );
    }
  }

  return [...merged.values()];
}

function readGuestCart(): CartItem[] {
  try {
    const saved = localStorage.getItem(GUEST_KEY);
    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is CartItem =>
        item !== null &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.price === "number" &&
        typeof item.image === "string" &&
        typeof item.color === "string" &&
        typeof item.size === "string" &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    let revision = 0;
    let currentUserId: string | null = null;
    let busy = false;

    async function loadCart(nextUserId: string | null) {
      const task = ++revision;
      busy = true;
      currentUserId = nextUserId;

      if (active) {
        setReady(false);
        setUserId(nextUserId);
      }

      try {
        if (!nextUserId) {
          const guestItems = readGuestCart();

          if (active && task === revision) {
            setItems(guestItems);
          }
          return;
        }

        const { data, error } = await supabase
          .from("customer_carts")
          .select("items")
          .eq("user_id", nextUserId)
          .maybeSingle();

        if (error) throw error;

        if (!active || task !== revision) return;

        const savedItems = Array.isArray(data?.items)
          ? (data.items as CartItem[])
          : [];

        const guestItems = readGuestCart();
        const combined = mergeCarts(savedItems, guestItems);

        setItems(combined);

        const { error: saveError } = await supabase
          .from("customer_carts")
          .upsert(
            { user_id: nextUserId, items: combined },
            { onConflict: "user_id" }
          );

        if (saveError) throw saveError;

        if (active && task === revision) {
          localStorage.removeItem(GUEST_KEY);
        }
      } catch (error) {
        console.error("Unable to sync Palmyra cart:", error);
      } finally {
        if (active && task === revision) {
          setReady(true);
          busy = false;
        }
      }
    }

    async function initialize() {
      const { data, error } = await supabase.auth.getUser();

      if (!active) return;

      if (error) {
        console.error("Unable to identify cart customer:", error);
        await loadCart(null);
        return;
      }

      await loadCart(data.user?.id ?? null);
    }

    void initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      const nextId = session?.user?.id ?? null;

      if (event === "INITIAL_SESSION") return;
      if (nextId === currentUserId && !busy) return;

      // Defer Supabase requests until the auth callback has returned.
      setTimeout(() => {
        if (active) void loadCart(nextId);
      }, 0);
    });

    return () => {
      active = false;
      revision++;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    try {
      if (userId) {
        localStorage.setItem(GUEST_KEY, JSON.stringify(items));
      } else {
        localStorage.setItem(GUEST_KEY, JSON.stringify(items));
      }
    } catch (error) {
      console.error("Unable to save local cart:", error);
    }
  }, [items, ready, userId]);

  useEffect(() => {
    if (!ready || !userId) return;

    const supabase = createClient();

    const timer = setTimeout(async () => {
      const { error } = await supabase
        .from("customer_carts")
        .upsert(
          { user_id: userId, items },
          { onConflict: "user_id" }
        );

      if (error) {
        console.error("Unable to save Palmyra cart:", error);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [items, ready, userId]);

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

  const updateQuantity = useCallback((key: string, quantity: number) => {
    if (quantity < 1) return;

    setItems((current) =>
      current.map((item) =>
        cartItemKey(item) === key ? { ...item, quantity } : item
      )
    );
  }, []);

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
