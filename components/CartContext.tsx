
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

export function cartItemKey(item: CartItem): string {
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
        item.price > 0 &&
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

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
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

      // Prevent showing the previous user's items during account changes.
      setItems([]);

      try {
        let nextItems: CartItem[];

        if (nextUserId) {
          // Signed-in customers load only their own Supabase cart.
          const { data, error } = await supabase
            .from("customer_carts")
            .select("items")
            .eq("user_id", nextUserId)
            .maybeSingle();

          if (error) {
            throw error;
          }

          if (!active || requestId !== generationRef.current) {
            return;
          }

          nextItems = readCart(JSON.stringify(data?.items ?? []));

          // Create or refresh this customer's cart row.
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

          if (saveError) {
            throw saveError;
          }

          if (!active || requestId !== generationRef.current) {
            return;
          }

          // Remove legacy guest-cart keys only after the account cart loads.
          localStorage.removeItem("palmyra-cart");
          localStorage.removeItem("palmyra-cart-owner");
          localStorage.removeItem(GUEST_KEY);
        } else {
          // Visitors who are not signed in use their browser's guest cart.
          nextItems = readCart(localStorage.getItem(GUEST_KEY));
        }

        if (!active || requestId !== generationRef.current) {
          return;
        }

        setItems(nextItems);
        setReady(true);
      } catch (error) {
        console.error("Unable to load Palmyra cart:", error);

        // Do not mark the cart ready after a failed database load.
        // This prevents an accidental overwrite of saved cart data.
        if (active && requestId === generationRef.current) {
          setReady(false);
        }
      }
    }

    async function initialize() {
      // getSession() handles a missing signed-in session without treating
      // an ordinary guest visitor as an authentication error.
      const { data, error } = await supabase.auth.getSession();

      if (!active) return;

      if (error) {
        console.error("Unable to initialize Palmyra cart:", error);
        return;
      }

      await loadCart(data.session?.user.id ?? null);
    }

    void initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active || event === "INITIAL_SESSION") return;

      const nextId = session?.user?.id ?? null;

      if (nextId === activeUserRef.current) return;

      // Defer cart loading until the auth callback finishes.
      setTimeout(() => {
        if (active) {
          void loadCart(nextId);
        }
      }, 0);
    });

    return () => {
      active = false;
      generationRef.current++;
      subscription.unsubscribe();
    };
  }, []);

  // Save guest carts to this browser only.
  useEffect(() => {
    if (!ready || userId !== null) return;

    try {
      localStorage.setItem(GUEST_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Unable to save Palmyra guest cart:", error);
    }
  }, [items, ready, userId]);

  // Save signed-in customers' carts to their own Supabase rows.
  useEffect(() => {
    if (!ready || !userId) return;

    const supabase = createClient();
    const savingUserId = userId;
    const savingItems = items;

    const timer = setTimeout(async () => {
      if (activeUserRef.current !== savingUserId) return;

      try {
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
      } catch (error) {
        console.error("Unexpected error saving Palmyra cart:", error);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [items, ready, userId]);

  const addItem = useCallback((item: CartItem) => {
    // Ignore malformed items. Product validity and prices must also
    // be checked by the server before an order is created.
    if (
      !item.id ||
      !item.name ||
      !item.color ||
      !item.size ||
      !Number.isFinite(item.price) ||
      item.price <= 0 ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1
    ) {
      console.error("Invalid item supplied to Palmyra cart.");
      return;
    }

    setItems((current) => {
      const key = cartItemKey(item);
      const existing = current.find(
        (entry) => cartItemKey(entry) === key
      );

      if (existing) {
        return current.map((entry) =>
          cartItemKey(entry) === key
            ? {
                ...entry,
                quantity: entry.quantity + item.quantity,
              }
            : entry
        );
      }

      return [...current, { ...item }];
    });
  }, []);

  const updateQuantity = useCallback(
    (key: string, quantity: number) => {
      if (!Number.isInteger(quantity) || quantity < 1) return;

      setItems((current) =>
        current.map((item) =>
          cartItemKey(item) === key
            ? { ...item, quantity }
            : item
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
