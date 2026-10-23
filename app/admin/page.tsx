
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  platform_fee?: number | string | null;
  delivery_fee?: number | string | null;
  total_amount: number | string | null;
  items: OrderItem[] | null;
  customer_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  country?: string | null;
};

const statuses = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const paymentFilters = [
  "all",
  "paid",
  "pending",
  "failed",
  "refunded",
];

const statusStyles: Record<string, string> = {
  pending: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  processing: "border-blue-400/20 bg-blue-400/10 text-blue-300",
  shipped: "border-violet-400/20 bg-violet-400/10 text-violet-300",
  delivered: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  cancelled: "border-red-400/20 bg-red-400/10 text-red-300",
};

function formatStatus(value: string | null | undefined) {
  return (value || "unknown")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [draftStatuses, setDraftStatuses] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

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
          next[key] = order.status || "pending";
        }

        return next;
      });
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to load orders."
      );
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

      setDraftStatuses((previous) => ({
        ...previous,
        [key]: result.order.status,
      }));

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

  function shippingAddress(order: Order) {
    return [
      order.customer_name,
      order.phone,
      order.email,
      order.address,
      [order.city, order.state].filter(Boolean).join(", "),
      order.pincode ? `PIN code: ${order.pincode}` : "",
      order.country,
    ]
      .filter((value) => value && value.trim())
      .join("\n");
  }

  async function copyAddress(order: Order) {
    const key = String(order.id);
    const address = shippingAddress(order);

    if (!address) {
      setError("No customer shipping address is available for this order.");
      return;
    }

    setCopyingId(key);
    setError("");
    setMessage("");

    try {
      await navigator.clipboard.writeText(address);
      setMessage(
        `Shipping details copied for ${order.order_number || `Order #${order.id}`}.`
      );
    } catch {
      setError(
        "Unable to copy automatically. Please select and copy the address manually."
      );
    } finally {
      setCopyingId(null);
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

  const paidRevenue = orders
    .filter((order) => order.payment_status?.toLowerCase() === "paid")
    .reduce(
      (sum, order) =>
        sum + Number(order.total_amount ?? order.subtotal ?? 0),
      0
    );

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();

    return orders.filter((order) => {
      const searchable = [
        order.order_number,
        order.customer_name,
        order.phone,
        order.email,
        order.address,
        order.city,
        order.state,
        order.pincode,
        order.country,
        ...(order.items ?? []).map((item) => item.name),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !term || searchable.includes(term);
      const matchesPayment =
        paymentFilter === "all" ||
        order.payment_status?.toLowerCase() === paymentFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (order.status || "pending").toLowerCase() === statusFilter;

      return matchesSearch && matchesPayment && matchesStatus;
    });
  }, [orders, search, paymentFilter, statusFilter]);

  return (
    <main className="min-h-screen bg-[#080808] px-4 py-8 text-white sm:px-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1b1011] via-[#100d0e] to-[#0a0a0a] p-6 sm:p-9">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-red-600/10 blur-3xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-lg font-black">
                  P
                </span>
                <span className="text-sm font-bold uppercase tracking-[0.3em] text-red-400">
                  Palmyra
                </span>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Admin
                </span>
              </div>

              <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-5xl">
                Order management<span className="text-red-500">.</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400 sm:text-base">
                Manage customer orders, verify payment status, and prepare
                shipping details for fulfilment.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void loadOrders()}
                disabled={loading}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold transition hover:bg-white/10 disabled:opacity-50"
              >
                {loading ? "Refreshing..." : "↻  Refresh orders"}
              </button>

              <Link
                href="/profile"
                className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold transition hover:bg-red-500"
              >
                My profile ↗
              </Link>
            </div>
          </div>

          <div className="relative mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-5 text-xs text-gray-500">
            <span>
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400" />
              Secure admin access
            </span>
            <span>Latest 100 orders</span>
            <span>Shipping information</span>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"
          >
            <p>{error}</p>
            {error.toLowerCase().includes("sign in") && (
              <Link href="/login" className="mt-2 inline-block underline">
                Go to sign in
              </Link>
            )}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300"
          >
            {message}
          </div>
        )}

        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-[#111111] p-5">
            <p className="text-sm text-gray-400">Orders loaded</p>
            <p className="mt-3 text-3xl font-bold">{orders.length}</p>
            <p className="mt-2 text-xs text-gray-600">Latest 100 records</p>
          </div>

          <div className="rounded-2xl border border-emerald-500/15 bg-[#101411] p-5">
            <p className="text-sm text-gray-400">Payments marked paid</p>
            <p className="mt-3 text-3xl font-bold text-emerald-400">
              {paidCount}
            </p>
            <p className="mt-2 text-xs text-gray-600">
              Based on database payment status
            </p>
          </div>

          <div className="rounded-2xl border border-amber-500/15 bg-[#15130e] p-5">
            <p className="text-sm text-gray-400">Payment pending</p>
            <p className="mt-3 text-3xl font-bold text-amber-300">
              {pendingCount}
            </p>
            <p className="mt-2 text-xs text-gray-600">
              Check payment before fulfilment
            </p>
          </div>

          <div className="rounded-2xl border border-red-500/15 bg-[#160f10] p-5">
            <p className="text-sm text-gray-400">Paid order value</p>
            <p className="mt-3 text-3xl font-bold text-red-300">
              {money(paidRevenue)}
            </p>
            <p className="mt-2 text-xs text-gray-600">
              Paid orders currently loaded
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-[#101010] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Customer orders</h2>
              <p className="mt-1 text-sm text-gray-500">
                Search orders and narrow results with filters.
              </p>
            </div>

            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300">
              {filteredOrders.length} result
              {filteredOrders.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_190px_190px]">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Search
              </span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Order, customer, phone, PIN code..."
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm outline-none transition placeholder:text-gray-600 focus:border-red-500/60"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Payment
              </span>
              <select
                value={paymentFilter}
                onChange={(event) => setPaymentFilter(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#171717] px-3 py-3 text-sm outline-none focus:border-red-500/60"
              >
                {paymentFilters.map((filter) => (
                  <option key={filter} value={filter}>
                    {filter === "all" ? "All payments" : formatStatus(filter)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Fulfilment
              </span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#171717] px-3 py-3 text-sm outline-none focus:border-red-500/60"
              >
                <option value="all">All statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {loading && orders.length === 0 && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-[#101010] p-10 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-red-500" />
            <p className="mt-4 text-sm text-gray-400">
              Loading your orders...
            </p>
          </div>
        )}

        {!loading && orders.length === 0 && !error && (
          <div className="mt-8 rounded-2xl border border-dashed border-white/15 bg-[#101010] p-12 text-center">
            <p className="text-lg font-semibold">No orders found</p>
            <p className="mt-2 text-sm text-gray-500">
              Orders will appear here once they are available in your database.
            </p>
          </div>
        )}

        {orders.length > 0 && filteredOrders.length === 0 && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-[#101010] p-8 text-center">
            <p className="font-semibold">No matching orders</p>
            <p className="mt-2 text-sm text-gray-500">
              Try a different search or change the filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPaymentFilter("all");
                setStatusFilter("all");
              }}
              className="mt-4 rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/5"
            >
              Clear filters
            </button>
          </div>
        )}

        <div className="mt-6 space-y-5">
          {filteredOrders.map((order) => {
            const key = String(order.id);
            const items = order.items ?? [];
            const payment = (order.payment_status || "unknown").toLowerCase();
            const status = order.status || "pending";
            const hasAddress = Boolean(shippingAddress(order));

            return (
              <article
                key={key}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#101010] transition hover:border-white/20"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 p-5 sm:p-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                      Order reference
                    </p>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight">
                      {order.order_number || `#${order.id}`}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                        payment === "paid"
                          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                          : payment === "failed" || payment === "refunded"
                            ? "border-red-400/20 bg-red-400/10 text-red-300"
                            : "border-amber-400/20 bg-amber-400/10 text-amber-300"
                      }`}
                    >
                      Payment: {formatStatus(payment)}
                    </span>

                    <span
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                        statusStyles[status] ||
                        "border-white/10 bg-white/5 text-gray-300"
                      }`}
                    >
                      {formatStatus(status)}
                    </span>
                  </div>
                </div>

                <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                  <section>
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h4 className="text-sm font-bold">Items ordered</h4>
                      <span className="text-xs text-gray-500">
                        {items.length} item{items.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    {items.length === 0 ? (
                      <p className="rounded-xl bg-white/[0.03] p-4 text-sm text-gray-500">
                        No item details recorded.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {items.map((item, index) => (
                          <div
                            key={`${item.id || "item"}-${index}`}
                            className="flex flex-wrap justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4"
                          >
                            <div className="min-w-0">
                              <p className="font-semibold">
                                {item.name || "Product"}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {[item.color, item.size]
                                  .filter(Boolean)
                                  .join(" · ") || "Standard option"}
                                {" · "}Qty: {item.quantity ?? 1}
                              </p>
                            </div>
                            <p className="text-sm font-semibold text-gray-200">
                              {money(
                                Number(item.price ?? 0) *
                                  Number(item.quantity ?? 1)
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 space-y-2 rounded-xl bg-white/[0.025] p-4">
                      <div className="flex justify-between gap-3 text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span>{money(order.subtotal)}</span>
                      </div>
                      {order.platform_fee != null && (
                        <div className="flex justify-between gap-3 text-sm">
                          <span className="text-gray-500">Platform fee</span>
                          <span>{money(order.platform_fee)}</span>
                        </div>
                      )}
                      {order.delivery_fee != null && (
                        <div className="flex justify-between gap-3 text-sm">
                          <span className="text-gray-500">Delivery fee</span>
                          <span>{money(order.delivery_fee)}</span>
                        </div>
                      )}
                      <div className="flex justify-between gap-3 border-t border-white/10 pt-3">
                        <span className="font-semibold">Order total</span>
                        <span className="text-xl font-bold text-white">
                          {money(order.total_amount ?? order.subtotal)}
                        </span>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold">
                          Shipping information
                        </h4>
                        <p className="mt-1 text-xs text-gray-500">
                          Customer details for fulfilment
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => void copyAddress(order)}
                        disabled={!hasAddress || copyingId === key}
                        className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {copyingId === key ? "Copying..." : "Copy details"}
                      </button>
                    </div>

                    <div className="mt-5 space-y-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                          Customer name
                        </p>
                        <p className="mt-1 break-words text-sm font-medium text-gray-200">
                          {order.customer_name || "Not provided"}
                        </p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                            Phone
                          </p>
                          {order.phone ? (
                            <a
                              href={`tel:${order.phone}`}
                              className="mt-1 block break-words text-sm text-gray-200 hover:text-red-300"
                            >
                              {order.phone}
                            </a>
                          ) : (
                            <p className="mt-1 text-sm text-gray-500">
                              Not provided
                            </p>
                          )}
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                            Email
                          </p>
                          {order.email ? (
                            <a
                              href={`mailto:${order.email}`}
                              className="mt-1 block break-all text-sm text-gray-200 hover:text-red-300"
                            >
                              {order.email}
                            </a>
                          ) : (
                            <p className="mt-1 text-sm text-gray-500">
                              Not provided
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-white/[0.07] pt-4">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                          Delivery address
                        </p>
                        <address className="mt-2 whitespace-pre-line break-words text-sm leading-6 not-italic text-gray-300">
                          {[
                            order.address,
                            [order.city, order.state]
                              .filter(Boolean)
                              .join(", "),
                            order.pincode
                              ? `PIN code: ${order.pincode}`
                              : "",
                            order.country,
                          ]
                            .filter(Boolean)
                            .join("\n") || "Address not provided"}
                        </address>
                      </div>

                      {!hasAddress && (
                        <p className="rounded-lg border border-amber-400/15 bg-amber-400/5 p-3 text-xs leading-5 text-amber-200">
                          Shipping details are missing from this order. Check
                          the order record before arranging fulfilment.
                        </p>
                      )}
                    </div>
                  </section>
                </div>

                <div className="border-t border-white/10 bg-white/[0.02] p-5 sm:px-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm font-semibold">
                        Fulfilment management
                      </p>
                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Update the order progress after verifying the payment
                        and shipping arrangements.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <label
                        htmlFor={`status-${key}`}
                        className="text-xs font-semibold text-gray-400"
                      >
                        Status
                      </label>

                      <select
                        id={`status-${key}`}
                        value={draftStatuses[key] ?? status}
                        onChange={(event) =>
                          setDraftStatuses((previous) => ({
                            ...previous,
                            [key]: event.target.value,
                          }))
                        }
                        className="min-w-36 rounded-xl border border-white/10 bg-[#171717] px-3 py-2.5 text-sm outline-none focus:border-red-500/60"
                      >
                        {statuses.map((value) => (
                          <option key={value} value={value}>
                            {formatStatus(value)}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => void saveStatus(order)}
                        disabled={
                          savingId === key ||
                          (draftStatuses[key] ?? status) === status
                        }
                        className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {savingId === key ? "Saving..." : "Save status"}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <footer className="mt-10 border-t border-white/10 py-6 text-xs leading-6 text-gray-600">
          <p>
            Palmyra Admin · Payment statuses are read from Supabase and cannot
            be changed here. Fulfilment updates do not process payments or
            refunds.
          </p>
          <p>
            Customer contact and shipping information is private. Use it only
            for legitimate order fulfilment.
          </p>
        </footer>
      </div>
    </main>
  );
}
