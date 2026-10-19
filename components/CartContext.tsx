
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

const GUEST_KEY = "palmyra-guest-cart-v3";

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

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const generationRef = useRef(0);
  const activeUserRef = useRef<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function loadCart(nextUserId: string | null) {
      const requestId = ++generationRef.current;

      activeUserRef.current = nextUserId;
      setReady(false);
      setUserId(nextUserId);

      try {
        let nextItems: CartItem[];

        if (nextUserId) {
          // Signed-in users load only their own Supabase cart.
          const { data, error } = await supabase
            .from("customer_carts")
            .select("items")
            .eq("user_id", nextUserId)
            .maybeSingle();

          if (error) throw error;

          if (!active || requestId !== generationRef.current) return;

          nextItems = readCart(JSON.stringify(data?.items ?? []));

          // Do not merge guest or previously cached account items.
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

          if (!active || requestId !== generationRef.current) return;

          // Discard any legacy local cart from the old implementation.
          localStorage.removeItem("palmyra-cart");
          localStorage.removeItem("palmyra-cart-owner");
          localStorage.removeItem(GUEST_KEY);
        } else {
          // Guests have a separate storage key.
          nextItems = readCart(localStorage.getItem(GUEST_KEY));
        }

        if (!active || requestId !== generationRef.current) return;

        setItems(nextItems);
        setReady(true);
      } catch (error) {
        console.error("Unable to load Palmyra cart:", error);

        // Keep ready=false so we never overwrite a saved cart
        // when loading it from Supabase fails.
        if (active && requestId === generationRef.current) {
          setReady(false);
        }
      }
    }

    async function initialize() {
      const { data, error } = await supabase.auth.getUser();

      if (!active) return;

      if (error) {
        console.error("Unable to check the signed-in user:", error);
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

      if (nextId === activeUserRef.current) return;

      setTimeout(() => {
        if (active) void loadCart(nextId);
      }, 0);
    });

    return () => {
      active = false;
      generationRef.current++;
      subscription.unsubscribe();
    };
  }, []);

  // Save to localStorage only for guests.
  useEffect(() => {
    if (!ready || userId !== null) return;

    try {
      localStorage.setItem(GUEST_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Unable to save guest cart:", error);
    }
  }, [items, ready, userId]);

  // Save signed-in carts only to that customer's Supabase row.
  useEffect(() => {
    if (!ready || !userId) return;

    const supabase = createClient();
    const savingUserId = userId;
    const savingItems = items;

    const timer = setTimeout(async () => {
      if (activeUserRef.current !== savingUserId) return;

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
