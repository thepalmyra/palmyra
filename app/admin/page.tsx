"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type OrderItem = {
  id?: string;
  name?: string;
  color?: string;
  size?: string;
  quantity?: number;
  price?: number | string;
};

type Order = {
  id: number | string;
  order_number: string | null;
  created_at: string;
  status: string | null;
  payment_status: string | null;
  subtotal: number | string;
  total_amount: number | string | null;
  items: OrderItem[] | null;
};

const statuses = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [draftStatuses, setDraftStatuses] = useState<Record<string, string>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const supabase = createClient();
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session?.access_token) {
        setError("Please sign in with your administrator account.");
        return;
      }

      const response = await fetch("/api/admin/orders", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to load orders.");
      }

      const loadedOrders = (result.orders ?? []) as Order[];
      setOrders(loadedOrders);

      setDraftStatuses((previous) => {
        const next = { ...previous };

        for (const order of loadedOrders) {
          const key = String(order.id);
          if (!(key in next)) {
            next[key] = order.status || "pending";
          }
        }

        return next;
      });
    } catch (err: unknown) {
      const text =
        err instanceof Error ? err.message : "Unable to load orders.";
      setError(text);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  async function saveStatus(order: Order) {
    const key = String(order.id);
    const status = draftStatuses[key];

    if (!status || status === order.status) return;

    setSavingId(key);
    setError("");
    setMessage("");

    try {
      const supabase = createClient();
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session?.access_token) {
        throw new Error("Please sign in again.");
      }

      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id: order.id, status }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to update order.");
      }

      setOrders((previous) =>
        previous.map((item) =>
          String(item.id) === key
            ? { ...item, status: result.order.status }
            : item
        )
      );

      setMessage(
        `${order.order_number || `Order #${order.id}`} updated successfully.`
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to update order."
      );
    } finally {
      setSavingId(null);
    }
  }

  const money = (value: number | string | null | undefined) =>
    `₹${Number(value ?? 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  const paidCount = orders.filter(
    (order) => order.payment_status?.toLowerCase() === "paid"
  ).length;

  const pendingCount = orders.filter(
    (order) => order.payment_status?.toLowerCase() === "pending"
  ).length;

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">
              Palmyra
            </p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-gray-400">
              Manage orders and monitor payment statuses.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => void loadOrders()}
              disabled={loading}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>

            <Link
              href="/profile"
              className="rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
            >
              Profile
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-gray-400">Orders loaded</p>
            <p className="mt-2 text-3xl font-bold">{orders.length}</p>
          </section>

          <section className="rounded-2xl border border-green-500/20 bg-white/5 p-5">
            <p className="text-sm text-gray-400">Marked paid</p>
            <p className="mt-2 text-3xl font-bold text-green-400">
              {paidCount}
            </p>
          </section>

          <section className="rounded-2xl border border-yellow-500/20 bg-white/5 p-5">
            <p className="text-sm text-gray-400">Payment pending</p>
            <p className="mt-2 text-3xl font-bold text-yellow-300">
              {pendingCount}
            </p>
          </section>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300"
          >
            {error}
            {error.toLowerCase().includes("sign in") && (
              <Link href="/login" className="ml-2 underline">
                Go to sign in
              </Link>
            )}
          </div>
        )}

        {message && (
          <p
            role="status"
            className="mt-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-green-300"
          >
            {message}
          </p>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-semibold">Customer Orders</h2>
          <p className="mt-1 text-sm text-gray-400">
            Showing up to the latest 100 orders.
          </p>
        </div>

        {loading && orders.length === 0 && (
          <p className="mt-6 text-gray-400">Loading orders...</p>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-gray-400">
            No orders found.
          </div>
        )}

        <div className="mt-5 space-y-5">
          {orders.map((order) => {
            const key = String(order.id);
            const items = order.items ?? [];

            return (
              <article
                key={key}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6"
              >
                <div className="flex flex-wrap justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <p className="text-sm text-gray-400">Order number</p>
                    <h3 className="mt-1 text-xl font-bold">
                      {order.order_number || `#${order.id}`}
                    </h3>
                    <p className="mt-2 text-sm text-gray-400">
                      {new Date(order.created_at).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-sm text-gray-400">Payment status</p>
                    <p
                      className={`mt-1 font-semibold ${
                        order.payment_status?.toLowerCase() === "paid"
                          ? "text-green-400"
                          : "text-yellow-300"
                      }`}
                    >
                      {(order.payment_status || "unknown").replace(
                        /[_-]/g,
                        " "
                      )}
                    </p>
                    <p className="mt-2 text-sm text-gray-400">
                      Order status: {order.status || "pending"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {items.map((item, index) => (
                    <div
                      key={`${item.id || "item"}-${index}`}
                      className="flex flex-wrap justify-between gap-2"
                    >
                      <div>
                        <p className="font-medium">{item.name || "Product"}</p>
                        <p className="mt-1 text-sm text-gray-400">
                          {[item.color, item.size]
                            .filter(Boolean)
                            .join(" · ")}
                          {` · Qty: ${item.quantity ?? 1}`}
                        </p>
                      </div>

                      <p className="text-gray-300">
                        {money(
                          Number(item.price ?? 0) *
                            Number(item.quantity ?? 1)
                        )}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
                  <div>
                    <p className="text-sm text-gray-400">Order total</p>
                    <p className="text-xl font-bold">
                      {money(order.total_amount ?? order.subtotal)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label
                      htmlFor={`status-${key}`}
                      className="text-sm text-gray-400"
                    >
                      Fulfilment
                    </label>

                    <select
                      id={`status-${key}`}
                      value={draftStatuses[key] ?? order.status ?? "pending"}
                      onChange={(event) =>
                        setDraftStatuses((previous) => ({
                          ...previous,
                          [key]: event.target.value,
                        }))
                      }
                      className="rounded-lg border border-white/20 bg-gray-900 px-3 py-2 text-sm text-white"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => void saveStatus(order)}
                      disabled={
                        savingId === key ||
                        (draftStatuses[key] ?? order.status ?? "pending") ===
                          (order.status ?? "pending")
                      }
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {savingId === key ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Payment status is displayed from the database and cannot be changed
          here. Fulfilment changes do not process refunds or payments.
        </p>
      </div>
    </main>
  );
}