
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
  image?: string;
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

const ORDER_STEPS = [
  { key: "pending", label: "Order placed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

function normalizeStatus(status: string | null) {
  return (status ?? "pending").toLowerCase().replace(/[\s-]+/g, "_");
}

function formatStatus(status: string | null) {
  if (!status) return "Pending";

  return status
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatPrice(price: number | string) {
  const amount = Number(price);

  return `₹${(Number.isFinite(amount) ? amount : 0).toLocaleString(
    "en-IN",
    { maximumFractionDigits: 2 }
  )}`;
}

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "Date unavailable";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusStyle(status: string | null) {
  const normalized = normalizeStatus(status);

  if (normalized === "delivered") {
    return "border-green-500/30 bg-green-500/10 text-green-400";
  }

  if (normalized === "shipped") {
    return "border-blue-500/30 bg-blue-500/10 text-blue-300";
  }

  if (normalized === "cancelled") {
    return "border-red-500/30 bg-red-500/10 text-red-400";
  }

  return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";
}

function OrderProgress({ status }: { status: string | null }) {
  const normalized = normalizeStatus(status);
  const cancelled = normalized === "cancelled";
  const currentIndex = ORDER_STEPS.findIndex(
    (step) => step.key === normalized
  );

  const progressIndex = currentIndex === -1 ? 0 : currentIndex;

  if (cancelled) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15 text-red-400">
            ✕
          </div>
          <div>
            <p className="font-semibold text-red-300">Order cancelled</p>
            <p className="mt-1 text-xs text-gray-400">
              This order will not progress further.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4 sm:p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">
          Order progress
        </p>
        <span className="text-xs text-gray-500">
          {ORDER_STEPS[progressIndex].label}
        </span>
      </div>

      <div className="relative">
        <div className="absolute left-0 right-0 top-[11px] h-[2px] bg-white/10" />

        <div
          className="absolute left-0 top-[11px] h-[2px] bg-red-500 transition-all"
          style={{
            width: `${(progressIndex / (ORDER_STEPS.length - 1)) * 100}%`,
          }}
        />

        <div className="relative grid grid-cols-4">
          {ORDER_STEPS.map((step, index) => {
            const completed = index <= progressIndex;
            const active = index === progressIndex;

            return (
              <div
                key={step.key}
                className="flex flex-col items-center text-center"
              >
                <div
                  className={`z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                    completed
                      ? "border-red-500 bg-red-500 text-white"
                      : "border-gray-700 bg-[#171717] text-gray-600"
                  } ${active ? "ring-4 ring-red-500/10" : ""}`}
                >
                  {completed && (
                    <span className="text-xs font-bold">✓</span>
                  )}
                </div>

                <p
                  className={`mt-3 text-[10px] leading-tight sm:text-xs ${
                    completed ? "text-white" : "text-gray-500"
                  }`}
                >
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

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

    void loadOrders();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#080808] px-4 py-8 text-white sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
        >
          <span>←</span>
          Back to Profile
        </Link>

        <header className="mt-8 border-b border-white/10 pb-7">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-500">
            PALMYRA ACCOUNT
          </p>

          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                My Orders
              </h1>
              <p className="mt-2 text-sm text-gray-400">
                Track your purchases and follow your order progress.
              </p>
            </div>

            {!loading && signedIn && (
              <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2">
                <p className="text-xs text-gray-500">Total orders</p>
                <p className="text-xl font-bold">{orders.length}</p>
              </div>
            )}
          </div>
        </header>

        {loading && (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-red-500" />
            <p className="mt-4 text-sm text-gray-400">
              Loading your orders...
            </p>
          </div>
        )}

        {!loading && !signedIn && (
          <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-2xl text-red-400">
              ♡
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              Sign in to view your orders
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
              Sign in to your Palmyra account to access your purchase history
              and order updates.
            </p>

            <Link
              href="/login?next=/orders"
              className="mt-6 inline-flex rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold transition hover:bg-red-700"
            >
              Sign In
            </Link>
          </section>
        )}

        {!loading && signedIn && error && (
          <div
            role="alert"
            className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {!loading && signedIn && !error && orders.length === 0 && (
          <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-2xl">
              🛍
            </div>

            <h2 className="mt-5 text-xl font-semibold">No orders yet</h2>

            <p className="mt-2 text-sm text-gray-400">
              Your Palmyra purchases will appear here after you place an order.
            </p>

            <Link
              href="/store"
              className="mt-6 inline-flex rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold transition hover:bg-red-700"
            >
              Explore the Store
            </Link>
          </section>
        )}

        {!loading && signedIn && !error && orders.length > 0 && (
          <div className="mt-8 space-y-6">
            {orders.map((order) => {
              const paymentPaid =
                order.payment_status?.toLowerCase() === "paid";

              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-xl shadow-black/20"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 p-5 sm:p-6">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        Order number
                      </p>

                      <h2 className="mt-2 text-lg font-bold sm:text-xl">
                        {order.order_number || `#${order.id}`}
                      </h2>

                      <p className="mt-2 text-sm text-gray-400">
                        Placed on {formatDate(order.created_at)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                          order.status
                        )}`}
                      >
                        {formatStatus(order.status)}
                      </span>

                      <span
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                          paymentPaid
                            ? "border-green-500/30 bg-green-500/10 text-green-400"
                            : "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
                        }`}
                      >
                        {formatStatus(order.payment_status)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-5 p-5 sm:p-6">
                    <OrderProgress status={order.status} />

                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-semibold">
                          Items in this order
                        </h3>
                        <span className="text-xs text-gray-500">
                          {(order.items ?? []).length} item
                          {(order.items ?? []).length === 1 ? "" : "s"}
                        </span>
                      </div>

                      <div className="divide-y divide-white/10">
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
                              className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                            >
                              <div className="min-w-0">
                                <p className="font-medium text-white">
                                  {item.name || "Palmyra Product"}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                  {[
                                    item.color,
                                    item.size,
                                  ]
                                    .filter(Boolean)
                                    .join(" · ")}
                                  {item.color || item.size ? " · " : ""}
                                  Qty: {quantity}
                                </p>
                              </div>

                              <p className="text-sm font-semibold text-white">
                                {formatPrice(itemTotal)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-5">
                      <div>
                        <p className="text-sm font-semibold">Subtotal</p>
                        <p className="mt-1 text-xs text-gray-500">
                          Order item subtotal
                        </p>
                      </div>

                      <p className="text-xl font-bold text-white">
                        {formatPrice(order.subtotal)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-xs leading-relaxed text-gray-400">
                        <span className="font-semibold text-gray-300">
                          Order updates:
                        </span>{" "}
                        Your order progress changes when Palmyra updates its
                        status. Check this page for the latest available
                        information.
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
          <p className="text-xs text-gray-500">
            Thank you for choosing Palmyra.
          </p>

          <Link
            href="/store"
            className="text-sm font-semibold text-gray-300 transition hover:text-red-400"
          >
            Continue Shopping →
          </Link>
        </div>
      </div>
    </main>
  );
}
