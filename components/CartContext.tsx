
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
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
const OWNER_KEY = "palmyra-cart-owner";

export function cartItemKey(item: CartItem) {
  return `${item.id}::${item.color}::${item.size}`;
}

function readCart(value: string | null): CartItem[] {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is CartItem =>
        item !== null &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.price === "number" &&
        Number.isFinite(item.price) &&
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

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const generation = useRef(0);
  const activeUser = useRef<string | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function loadCart(nextUserId: string | null) {
      const requestId = ++generation.current;

      setReady(false);
      setUserId(nextUserId);
      activeUser.current = nextUserId;

      try {
        let nextItems: CartItem[];

        if (nextUserId) {
          const { data, error } = await supabase
            .from("customer_carts")
            .select("items")
            .eq("user_id", nextUserId)
            .maybeSingle();

          if (error) throw error;
          if (!active || requestId !== generation.current) return;

          const customerItems = readCart(
            JSON.stringify(data?.items ?? [])
          );

          // Only merge items explicitly identified as a guest cart.
          const isGuestCart =
            localStorage.getItem(OWNER_KEY) === "guest";

          const guestItems = isGuestCart
            ? readCart(localStorage.getItem(GUEST_KEY))
            : [];

          nextItems = mergeCarts(customerItems, guestItems);

          const { error: saveError } = await supabase
            .from("customer_carts")
            .upsert(
              {
                user_id: nextUserId,
                items: nextItems,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id" }
            );

          if (saveError) throw saveError;
          if (!active || requestId !== generation.current) return;

          localStorage.removeItem(GUEST_KEY);
          localStorage.setItem(OWNER_KEY, nextUserId);
        } else {
          const owner = localStorage.getItem(OWNER_KEY);

          // Never restore a previous signed-in customer's cart as a guest cart.
          nextItems =
            owner === "guest" || owner === null
              ? readCart(localStorage.getItem(GUEST_KEY))
              : [];

          localStorage.setItem(OWNER_KEY, "guest");
          localStorage.setItem(GUEST_KEY, JSON.stringify(nextItems));
        }

        if (!active || requestId !== generation.current) return;

        setItems(nextItems);
        initialized.current = true;
        setReady(true);
      } catch (error) {
        console.error("Unable to sync Palmyra cart:", error);

        // Do not mark the cart ready after a failed cloud load:
        // that could overwrite the customer's saved cart.
        if (active && requestId === generation.current) {
          setReady(false);
        }
      }
    }

    async function initialize() {
      const { data, error } = await supabase.auth.getUser();

      if (!active) return;

      if (error) {
        console.error("Unable to check the signed-in customer:", error);
        return;
      }

      await loadCart(data.user?.id ?? null);
    }

    void initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active || event === "INITIAL_SESSION") return;

      const nextId = session?.user?.id ?? null;

      if (nextId === activeUser.current) return;

      // Run after the auth callback returns.
      setTimeout(() => {
        if (active) void loadCart(nextId);
      }, 0);
    });

    return () => {
      active = false;
      generation.current++;
      subscription.unsubscribe();
    };
  }, []);

  // Only guest carts are stored in localStorage.
  useEffect(() => {
    if (!ready || userId !== null) return;

    try {
      localStorage.setItem(GUEST_KEY, JSON.stringify(items));
      localStorage.setItem(OWNER_KEY, "guest");
    } catch (error) {
      console.error("Unable to save guest cart:", error);
    }
  }, [items, ready, userId]);

  // Signed-in carts are saved only to the authenticated customer's Supabase row.
  useEffect(() => {
    if (!ready || !userId || !initialized.current) return;

    const supabase = createClient();
    const savingUserId = userId;
    const savingItems = items;

    const timer = setTimeout(async () => {
      if (activeUser.current !== savingUserId) return;

      const { error } = await supabase
        .from("customer_carts")
        .upsert(
          {
            user_id: savingUserId,
            items: savingItems,
            updated_at: new Date().toISOString(),
          },
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
