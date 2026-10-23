
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type OrderItem = {
  id?: string;
  name?: string;
  color?: string;
  size?: string;
  quantity?: number;
  price?: number | string;
  unitPrice?: number | string;
  lineTotal?: number | string;
};

type Order = {
  id: number | string;
  order_number: string | null;
  created_at: string;
  status: string | null;
  payment_status: string | null;
  items: OrderItem[] | null;
  subtotal: number | string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      const supabase = createClient();

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) {
          if (active) {
            setSignedIn(false);
            setLoading(false);
          }
          return;
        }

        if (active) setSignedIn(true);

        const { data, error: queryError } = await supabase
          .from("orders")
          .select(
            "id, order_number, created_at, status, payment_status, items, subtotal"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (queryError) throw queryError;

        if (active) {
          setOrders((data ?? []) as unknown as Order[]);
        }
      } catch (err: unknown) {
        console.error("My Orders error:", err);

        const message =
          typeof err === "object" &&
          err !== null &&
          "message" in err
            ? String(err.message)
            : "Unknown error";

        if (active) {
          setError(`Unable to load orders: ${message}`);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOrders();

    return () => {
      active = false;
    };
  }, []);

  const formatPrice = (price: number | string) =>
    `₹${Number(price).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  const formatStatus = (status: string | null) => {
    if (!status) return "Pending";

    return status
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/profile"
          className="text-sm text-gray-400 hover:text-white"
        >
          ← Back to Profile
        </Link>

        <h1 className="mt-6 text-3xl font-bold sm:text-4xl">
          My Orders
        </h1>

        <p className="mt-2 text-gray-400">
          View your Palmyra purchase history and order details.
        </p>

        {loading && (
          <p className="mt-8 text-gray-400">Loading your orders...</p>
        )}

        {!loading && !signedIn && (
          <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">
              Sign in to view your orders
            </h2>

            <p className="mt-2 text-gray-400">
              Your order history is available when you sign in to your account.
            </p>

            <Link
              href="/login"
              className="mt-5 inline-block rounded-lg bg-red-600 px-5 py-3 font-semibold hover:bg-red-700"
            >
              Sign In
            </Link>
          </section>
        )}

        {!loading && signedIn && error && (
          <div
            role="alert"
            className="mt-8 rounded-xl border border-red-500/40 bg-red-500/10 p-5 text-red-300"
          >
            {error}
          </div>
        )}

        {!loading && signedIn && !error && orders.length === 0 && (
          <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <h2 className="text-xl font-semibold">No orders yet</h2>

            <p className="mt-2 text-gray-400">
              Orders placed while signed in will appear here.
            </p>

            <Link
              href="/store"
              className="mt-5 inline-block rounded-lg bg-red-600 px-5 py-3 font-semibold hover:bg-red-700"
            >
              Explore the Store
            </Link>
          </section>
        )}

        {!loading && signedIn && !error && orders.length > 0 && (
          <div className="mt-8 space-y-5">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-7"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <p className="text-sm text-gray-400">Order number</p>

                    <h2 className="mt-1 text-xl font-bold">
                      {order.order_number || `#${order.id}`}
                    </h2>

                    <p className="mt-2 text-sm text-gray-400">
                      {new Date(order.created_at).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>

                  <div className="space-y-2 text-right">
                    <div>
                      <p className="text-xs text-gray-400">Order status</p>
                      <span className="inline-block rounded-full border border-white/15 px-3 py-1 text-sm text-gray-300">
                        {formatStatus(order.status)}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">Payment status</p>
                      <span
                        className={`inline-block rounded-full border px-3 py-1 text-sm ${
                          order.payment_status?.toLowerCase() === "paid"
                            ? "border-green-500/40 text-green-400"
                            : "border-yellow-500/40 text-yellow-300"
                        }`}
                      >
                        {formatStatus(order.payment_status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {(order.items ?? []).map((item, index) => {
                    const quantity = item.quantity ?? 1;

                    const unitPrice = Number(
                      item.price ?? item.unitPrice ?? 0
                    );

                    const itemTotal =
                      item.lineTotal != null
                        ? Number(item.lineTotal)
                        : unitPrice * quantity;

                    return (
                      <div
                        key={`${item.id ?? "item"}-${index}`}
                        className="flex flex-wrap justify-between gap-3"
                      >
                        <div>
                          <p className="font-medium">
                            {item.name || "Product"}
                          </p>

                          <p className="mt-1 text-sm text-gray-400">
                            {[item.color, item.size]
                              .filter(Boolean)
                              .join(" · ")}
                            {` · Qty: ${quantity}`}
                          </p>
                        </div>

                        <p className="font-medium">
                          {formatPrice(itemTotal)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 flex justify-between border-t border-white/10 pt-4 text-lg font-bold">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
              </article>
            ))}
          </div>
        )}

        <Link
          href="/store"
          className="mt-8 inline-block text-sm text-gray-400 hover:text-white"
        >
          Continue Shopping →
        </Link>
      </div>
    </main>
  );
}
