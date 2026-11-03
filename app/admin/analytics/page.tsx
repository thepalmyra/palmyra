
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type OrderItem = {
  id?: string | number;
  name?: string;
  title?: string;
  product_name?: string;
  quantity?: number | string;
  price?: number | string;
};

type Order = {
  id: string | number;
  order_number?: string | null;
  created_at?: string | null;
  items?: OrderItem[] | null;
  subtotal?: number | string | null;
  total_amount?: number | string | null;
  total?: number | string | null;
  payment_status?: string | null;
  status?: string | null;
};

type AccessState =
  | "checking"
  | "signed-out"
  | "forbidden"
  | "error"
  | "ready";

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

const numberValue = (value: unknown) => {
  const result = Number(value ?? 0);
  return Number.isFinite(result) ? result : 0;
};

const normalize = (value?: string | null) =>
  (value || "pending").toLowerCase();

const isPaid = (order: Order) =>
  ["paid", "captured", "success", "successful"].includes(
    normalize(order.payment_status),
  );

const orderTotal = (order: Order) =>
  numberValue(order.total_amount ?? order.total ?? order.subtotal);

const productName = (item: OrderItem) =>
  item.name || item.title || item.product_name || String(item.id || "Product");

export default function AdminAnalyticsPage() {
  const supabase = useMemo(() => createClient(), []);

  const [orders, setOrders] = useState<Order[]>([]);
  const [access, setAccess] = useState<AccessState>("checking");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("all");

  const loadAnalytics = useCallback(async () => {
    setAccess("checking");
    setLoading(true);
    setError("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        setAccess("signed-out");
        return;
      }

      const response = await fetch("/api/admin/orders", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
      });

      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        setAccess("signed-out");
        return;
      }

      if (response.status === 403) {
        setAccess("forbidden");
        return;
      }

      if (!response.ok) {
        throw new Error(result.error || "Unable to load analytics.");
      }

      const received = Array.isArray(result.orders)
        ? result.orders
        : Array.isArray(result)
          ? result
          : null;

      if (!received) {
        throw new Error("Unexpected response from the orders API.");
      }

      setOrders(received as Order[]);
      setAccess("ready");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load analytics.",
      );
      setAccess("error");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadAnalytics();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setOrders([]);
        setAccess("signed-out");
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        void loadAnalytics();
      }
    });

    return () => subscription.unsubscribe();
  }, [loadAnalytics, supabase]);

  const filteredOrders = useMemo(() => {
    if (period === "all") return orders;

    const days = Number(period);
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    return orders.filter((order) => {
      if (!order.created_at) return false;
      const date = new Date(order.created_at).getTime();
      return Number.isFinite(date) && date >= cutoff;
    });
  }, [orders, period]);

  const analytics = useMemo(() => {
    const paidOrders = filteredOrders.filter(isPaid);
    const pendingOrders = filteredOrders.filter(
      (order) => normalize(order.status) === "pending",
    );
    const processingOrders = filteredOrders.filter(
      (order) => normalize(order.status) === "processing",
    );
    const shippedOrders = filteredOrders.filter(
      (order) => normalize(order.status) === "shipped",
    );
    const deliveredOrders = filteredOrders.filter(
      (order) => normalize(order.status) === "delivered",
    );
    const cancelledOrders = filteredOrders.filter(
      (order) => ["cancelled", "canceled"].includes(normalize(order.status)),
    );

    const productMap = new Map<
      string,
      { quantity: number; sales: number }
    >();

    for (const order of paidOrders) {
      if (!Array.isArray(order.items)) continue;

      for (const item of order.items) {
        const name = productName(item);
        const quantity = Math.max(0, numberValue(item.quantity || 1));
        const price = numberValue(item.price);

        const current = productMap.get(name) || {
          quantity: 0,
          sales: 0,
        };

        current.quantity += quantity;
        current.sales += price * quantity;
        productMap.set(name, current);
      }
    }

    const products = Array.from(productMap.entries())
      .map(([name, values]) => ({
        name,
        quantity: values.quantity,
        sales: values.sales,
      }))
      .sort((a, b) => b.quantity - a.quantity);

    return {
      total: filteredOrders.length,
      paid: paidOrders.length,
      unpaid: filteredOrders.length - paidOrders.length,
      pending: pendingOrders.length,
      processing: processingOrders.length,
      shipped: shippedOrders.length,
      delivered: deliveredOrders.length,
      cancelled: cancelledOrders.length,
      revenue: paidOrders.reduce(
        (sum, order) => sum + orderTotal(order),
        0,
      ),
      averageOrderValue:
        paidOrders.length > 0
          ? paidOrders.reduce(
              (sum, order) => sum + orderTotal(order),
              0,
            ) / paidOrders.length
          : 0,
      products,
    };
  }, [filteredOrders]);

  if (access !== "ready") {
    const signedOut = access === "signed-out";
    const forbidden = access === "forbidden";
    const checking = access === "checking";

    return (
      <main className="auth-screen">
        <div className="auth-card">
          <Link href="/" className="brand">
            PALMYRA<span>.</span>
          </Link>
          <div className="caption">STORE ADMINISTRATION</div>

          {checking ? (
            <>
              <div className="loader" />
              <h1>Verifying access</h1>
              <p>Please wait while we verify your administrator access.</p>
            </>
          ) : signedOut ? (
            <>
              <h1>Sign-in required</h1>
              <p>Sign in with your administrator account to view analytics.</p>
              <Link href="/login?next=/admin/analytics" className="button">
                Go to sign in →
              </Link>
            </>
          ) : forbidden ? (
            <>
              <h1>Administrator access only</h1>
              <p>Your account is not authorized to view store analytics.</p>
              <Link href="/login?next=/admin/analytics" className="button">
                Return to sign in →
              </Link>
            </>
          ) : (
            <>
              <h1>Unable to load analytics</h1>
              <p>{error || "Something went wrong."}</p>
              <button className="button" onClick={() => void loadAnalytics()}>
                Try again
              </button>
            </>
          )}
          <Link href="/admin" className="back-link">
            ← Back to orders dashboard
          </Link>
        </div>

        <style jsx>{`
          .auth-screen {
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 24px;
            box-sizing: border-box;
            background: #090909;
            color: #fff;
            font-family: Arial, sans-serif;
          }
          .auth-card {
            width: 100%;
            max-width: 420px;
            padding: 36px;
            box-sizing: border-box;
            border: 1px solid #303030;
            border-radius: 18px;
            background: #121212;
            text-align: center;
          }
          .brand {
            color: #fff;
            font-size: 29px;
            font-weight: 900;
            letter-spacing: 3px;
            text-decoration: none;
          }
          .brand span {
            color: #e11d2e;
          }
          .caption {
            margin: 10px 0 30px;
            color: #888;
            font-size: 10px;
            letter-spacing: 2px;
          }
          h1 {
            font-size: 25px;
          }
          p {
            color: #aaa;
            font-size: 14px;
            line-height: 1.7;
          }
          .button {
            display: inline-flex;
            justify-content: center;
            margin-top: 18px;
            padding: 13px 20px;
            border: 0;
            border-radius: 9px;
            background: #e11d2e;
            color: #fff;
            font-weight: 700;
            text-decoration: none;
            cursor: pointer;
          }
          .back-link {
            display: block;
            margin-top: 28px;
            color: #aaa;
            font-size: 13px;
            text-decoration: none;
          }
          .loader {
            width: 30px;
            height: 30px;
            margin: 0 auto 20px;
            border: 3px solid #333;
            border-top-color: #e11d2e;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="page">
      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 30px;
          box-sizing: border-box;
          background: #090909;
          color: #f5f5f5;
          font-family: Arial, Helvetica, sans-serif;
        }
        .container {
          max-width: 1400px;
          margin: 0 auto;
        }
        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          margin-bottom: 28px;
        }
        .brand {
          font-size: 25px;
          font-weight: 900;
          letter-spacing: 2px;
        }
        .brand span {
          color: #e11d2e;
        }
        .subtitle {
          margin-top: 7px;
          color: #929292;
          font-size: 13px;
        }
        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .button {
          display: inline-flex;
          min-height: 42px;
          align-items: center;
          justify-content: center;
          padding: 10px 15px;
          border: 1px solid #333;
          border-radius: 9px;
          background: #171717;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
        }
        .primary {
          border-color: #e11d2e;
          background: #e11d2e;
        }
        .navigation {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 28px;
          padding: 12px;
          border: 1px solid #292929;
          border-radius: 13px;
          background: #111;
        }
        .nav-link {
          padding: 11px 15px;
          border: 1px solid #333;
          border-radius: 9px;
          color: #ddd;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
        }
        .active {
          border-color: #e11d2e;
          background: #291114;
          color: #fff;
        }
        .heading {
          margin-bottom: 22px;
        }
        .heading h1 {
          margin: 0;
          font-size: clamp(28px, 4vw, 38px);
          letter-spacing: -1px;
        }
        .heading p {
          color: #999;
          font-size: 14px;
          line-height: 1.7;
        }
        .toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        select {
          min-height: 43px;
          padding: 10px 13px;
          border: 1px solid #333;
          border-radius: 9px;
          background: #141414;
          color: #fff;
          font: inherit;
        }
        .metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 24px;
        }
        .metric,
        .panel {
          min-width: 0;
          border: 1px solid #292929;
          border-radius: 14px;
          background: #111;
        }
        .metric {
          padding: 21px;
        }
        .metric-label {
          color: #999;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .metric-value {
          margin-top: 13px;
          font-size: clamp(23px, 3vw, 33px);
          font-weight: 800;
          overflow-wrap: anywhere;
        }
        .metric-note {
          margin-top: 7px;
          color: #888;
          font-size: 12px;
        }
        .panel {
          margin-top: 20px;
          padding: 22px;
        }
        .panel h2 {
          margin: 0 0 17px;
          font-size: 18px;
        }
        .status-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }
        .status-card {
          padding: 15px;
          border: 1px solid #292929;
          border-radius: 10px;
          background: #151515;
        }
        .status-card span {
          display: block;
          color: #999;
          font-size: 12px;
        }
        .status-card strong {
          display: block;
          margin-top: 8px;
          font-size: 23px;
        }
        .table-wrap {
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        th {
          padding: 13px;
          border-bottom: 1px solid #303030;
          color: #999;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }
        td {
          padding: 14px 13px;
          border-bottom: 1px solid #252525;
          color: #ddd;
          font-size: 13px;
        }
        .product-name {
          color: #fff;
          font-weight: 700;
        }
        .muted {
          color: #999;
        }
        .bar-track {
          width: 130px;
          max-width: 100%;
          height: 7px;
          overflow: hidden;
          border-radius: 10px;
          background: #303030;
        }
        .bar {
          height: 100%;
          border-radius: 10px;
          background: #e11d2e;
        }
        .notice {
          margin-top: 18px;
          padding: 14px;
          border: 1px solid #55451f;
          border-radius: 10px;
          background: #201b10;
          color: #e9d59c;
          font-size: 12px;
          line-height: 1.7;
        }
        .error {
          margin: 16px 0;
          padding: 14px;
          border: 1px solid #71313a;
          border-radius: 10px;
          background: #241114;
          color: #ffb8bf;
          font-size: 13px;
        }
        .empty {
          padding: 25px;
          color: #999;
          text-align: center;
        }
        @media (max-width: 900px) {
          .metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 600px) {
          .page { padding: 18px 12px; }
          .topbar {
            align-items: flex-start;
            flex-direction: column;
          }
          .actions { width: 100%; }
          .actions .button { flex: 1; }
          .navigation {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .nav-link { text-align: center; }
          .toolbar {
            align-items: stretch;
            flex-direction: column;
          }
          .toolbar select { width: 100%; }
          .metric { padding: 15px; }
          .status-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .panel { padding: 15px; }
        }
        @media (max-width: 360px) {
          .metrics, .status-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="container">
        <header className="topbar">
          <div>
            <div className="brand">PALMYRA<span>.</span></div>
            <div className="subtitle">Store administration</div>
          </div>
          <div className="actions">
            <Link href="/" className="button">View website</Link>
            <button
              className="button primary"
              onClick={() => void loadAnalytics()}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>
        </header>

        <nav className="navigation">
          <Link href="/admin" className="nav-link">Orders</Link>
          <Link href="/admin/analytics" className="nav-link active">Analytics</Link>
          <Link href="/admin/videos" className="nav-link">Video management</Link>
        </nav>

        <section className="heading">
          <h1>Business analytics</h1>
          <p>
            Review order activity, collected revenue and product sales
            from the orders currently returned by your Admin API.
          </p>
        </section>

        <div className="toolbar">
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            aria-label="Analytics date range"
          >
            <option value="all">All available orders</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <span className="muted">
            Showing {filteredOrders.length} of {orders.length} orders
          </span>
        </div>

        {error && <div className="error">{error}</div>}

        <section className="metrics">
          <div className="metric">
            <div className="metric-label">Total orders</div>
            <div className="metric-value">{analytics.total}</div>
            <div className="metric-note">Orders in selected period</div>
          </div>
          <div className="metric">
            <div className="metric-label">Paid orders</div>
            <div className="metric-value">{analytics.paid}</div>
            <div className="metric-note">Payments marked successful</div>
          </div>
          <div className="metric">
            <div className="metric-label">Paid revenue</div>
            <div className="metric-value">{money(analytics.revenue)}</div>
            <div className="metric-note">Total value of paid orders</div>
          </div>
          <div className="metric">
            <div className="metric-label">Average paid order</div>
            <div className="metric-value">{money(analytics.averageOrderValue)}</div>
            <div className="metric-note">Paid revenue divided by paid orders</div>
          </div>
        </section>

        <section className="panel">
          <h2>Order status overview</h2>
          <div className="status-grid">
            <div className="status-card">
              <span>Payment not confirmed</span>
              <strong>{analytics.unpaid}</strong>
            </div>
            <div className="status-card">
              <span>Pending</span>
              <strong>{analytics.pending}</strong>
            </div>
            <div className="status-card">
              <span>Processing</span>
              <strong>{analytics.processing}</strong>
            </div>
            <div className="status-card">
              <span>Shipped</span>
              <strong>{analytics.shipped}</strong>
            </div>
            <div className="status-card">
              <span>Delivered</span>
              <strong>{analytics.delivered}</strong>
            </div>
            <div className="status-card">
              <span>Cancelled</span>
              <strong>{analytics.cancelled}</strong>
            </div>
          </div>
        </section>

        <section className="panel">
          <h2>Product performance</h2>
          <p className="muted">
            Quantities and item sales are calculated from paid orders
            and the item details stored with each order.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Units sold</th>
                  <th>Item sales</th>
                  <th>Volume</th>
                </tr>
              </thead>
              <tbody>
                {analytics.products.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty">
                      No product item data is available for paid orders.
                    </td>
                  </tr>
                ) : (
                  analytics.products.map((product) => {
                    const maxQuantity = analytics.products[0]?.quantity || 1;
                    const width = Math.max(
                      2,
                      (product.quantity / maxQuantity) * 100,
                    );

                    return (
                      <tr key={product.name}>
                        <td className="product-name">{product.name}</td>
                        <td>{product.quantity}</td>
                        <td>{money(product.sales)}</td>
                        <td>
                          <div className="bar-track">
                            <div
                              className="bar"
                              style={{ width: `${width}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="notice">
          <strong>Financial accuracy:</strong> This page currently reports
          order revenue and item sales only. Profit, net earnings, product
          costs, advertising expenses, refunds and gateway fees are not
          calculated because verified cost and expense records have not
          been connected. The figures are based on the orders returned by
          your current API, which is limited to its latest 100 orders.
        </div>
      </div>
    </main>
  );
}
