
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type OrderItem = {
  id?: string | number;
  name?: string;
  title?: string;
  product_name?: string;
  quantity?: number;
  price?: number | string;
  color?: string;
  size?: string;
};

type Order = {
  id: string | number;
  order_number?: string | null;
  created_at?: string | null;
  customer_name?: string | null;
  full_name?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  postal_code?: string | null;
  country?: string | null;
  items?: OrderItem[] | null;
  subtotal?: number | string | null;
  platform_fee?: number | string | null;
  delivery_fee?: number | string | null;
  total_amount?: number | string | null;
  total?: number | string | null;
  payment_status?: string | null;
  status?: string | null;
  razorpay_payment_id?: string | null;
  razorpay_order_id?: string | null;
};

type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type AccessState =
  | "checking"
  | "signed-out"
  | "forbidden"
  | "error"
  | "ready";

const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const money = (value: unknown) => {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
};

const formatDate = (value?: string | null) => {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const normalizeStatus = (status?: string | null) =>
  (status || "pending").toLowerCase();

const statusClass = (status?: string | null) => {
  switch (normalizeStatus(status)) {
    case "paid":
    case "delivered":
    case "captured":
    case "success":
    case "successful":
      return "status-green";
    case "processing":
      return "status-blue";
    case "shipped":
      return "status-purple";
    case "failed":
    case "cancelled":
    case "canceled":
      return "status-red";
    default:
      return "status-yellow";
  }
};

const getCustomerName = (order: Order) =>
  order.customer_name || order.full_name || order.name || "Customer";

const getOrderNumber = (order: Order) =>
  order.order_number || String(order.id);

const getTotal = (order: Order) =>
  Number(order.total_amount ?? order.total ?? 0);

const isPaid = (order: Order) =>
  ["paid", "captured", "success", "successful"].includes(
    normalizeStatus(order.payment_status),
  );

export default function AdminPage() {
  const supabase = useMemo(() => createClient(), []);

  const [orders, setOrders] = useState<Order[]>([]);
  const [access, setAccess] = useState<AccessState>("checking");
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadOrders = useCallback(async () => {
    setAccess("checking");
    setLoading(true);
    setError("");
    setNotice("");
    setOrders([]);
    setSelectedOrder(null);

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
        method: "GET",
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
        setError(
          result.error ||
            `Unable to load orders. Server returned ${response.status}.`,
        );
        setAccess("error");
        return;
      }

      const receivedOrders = Array.isArray(result)
        ? result
        : Array.isArray(result.orders)
          ? result.orders
          : null;

      if (!receivedOrders) {
        setError("The orders API returned an unexpected response.");
        setAccess("error");
        return;
      }

      setOrders(receivedOrders as Order[]);
      setAccess("ready");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the orders API.",
      );
      setAccess("error");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadOrders();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setOrders([]);
        setSelectedOrder(null);
        setAccess("signed-out");
        setLoading(false);
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        void loadOrders();
      }
    });

    return () => subscription.unsubscribe();
  }, [loadOrders, supabase]);

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();

    return orders.filter((order) => {
      const status = normalizeStatus(order.status);
      const paid = isPaid(order);

      const matchesFilter =
        filter === "all" ||
        (filter === "paid" && paid) ||
        (filter === "unpaid" && !paid) ||
        status === filter;

      const searchableText = [
        getOrderNumber(order),
        String(order.id),
        getCustomerName(order),
        order.email,
        order.phone,
        order.razorpay_payment_id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesFilter && (!term || searchableText.includes(term));
    });
  }, [orders, search, filter]);

  const metrics = useMemo(() => {
    const paidOrders = orders.filter(isPaid);

    return {
      total: orders.length,
      paid: paidOrders.length,
      pending: orders.filter(
        (order) => normalizeStatus(order.status) === "pending",
      ).length,
      revenue: paidOrders.reduce((sum, order) => sum + getTotal(order), 0),
    };
  }, [orders]);

  const updateStatus = async (
    order: Order,
    newStatus: OrderStatus,
  ) => {
    if (normalizeStatus(order.status) === newStatus) return;

    setUpdatingId(String(order.id));
    setError("");
    setNotice("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        setAccess("signed-out");
        setOrders([]);
        setSelectedOrder(null);
        return;
      }

      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: order.id,
          status: newStatus,
        }),
        cache: "no-store",
      });

      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        setAccess("signed-out");
        setOrders([]);
        setSelectedOrder(null);
        return;
      }

      if (response.status === 403) {
        setAccess("forbidden");
        setOrders([]);
        setSelectedOrder(null);
        return;
      }

      if (!response.ok) {
        throw new Error(
          result.error || `Unable to update order (${response.status}).`,
        );
      }

      const updatedOrder: Order = {
        ...order,
        ...(result.order || {}),
        status: result.order?.status || newStatus,
      };

      setOrders((current) =>
        current.map((item) =>
          String(item.id) === String(order.id)
            ? { ...item, ...updatedOrder }
            : item,
        ),
      );

      setSelectedOrder((current) =>
        current && String(current.id) === String(order.id)
          ? { ...current, ...updatedOrder }
          : current,
      );

      setNotice(`Order ${getOrderNumber(order)} updated successfully.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update order.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const copyShippingDetails = async (order: Order) => {
    const details = [
      `Order: ${getOrderNumber(order)}`,
      `Customer: ${getCustomerName(order)}`,
      `Phone: ${order.phone || "Not provided"}`,
      `Email: ${order.email || "Not provided"}`,
      `Address: ${order.address || "Not provided"}`,
      `City: ${order.city || ""}`,
      `State: ${order.state || ""}`,
      `PIN code: ${order.pincode || order.postal_code || ""}`,
      `Country: ${order.country || ""}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(details);
      setNotice("Shipping details copied.");
      setError("");
    } catch {
      setError("Unable to copy details. Please copy them manually.");
    }
  };

  if (access !== "ready") {
    const signedOut = access === "signed-out";
    const forbidden = access === "forbidden";
    const checking = access === "checking";

    return (
      <main className="auth-screen">
        <div className="auth-card">
          <Link href="/" className="brand" aria-label="Palmyra home">
            PALMYRA<span>.</span>
          </Link>

          <div className="brand-caption">STORE ADMINISTRATION</div>

          {checking ? (
            <>
              <div className="loader" aria-hidden="true" />
              <h1>Verifying access</h1>
              <p>Please wait while we securely verify your administrator access.</p>
            </>
          ) : signedOut ? (
            <>
              <div className="auth-icon">↗</div>
              <h1>Sign-in required</h1>
              <p>
                Sign in to continue to your Palmyra store dashboard. You must
                use the administrator account to access customer orders.
              </p>
              <Link href="/login?next=/admin" className="login-button">
                Go to sign in <span aria-hidden="true">→</span>
              </Link>
            </>
          ) : forbidden ? (
            <>
              <div className="auth-icon">!</div>
              <h1>Administrator access only</h1>
              <p>
                Your account is signed in, but it is not authorized to manage
                store orders. Sign in with the configured administrator account.
              </p>
              <Link href="/login?next=/admin" className="login-button">
                Return to sign in <span aria-hidden="true">→</span>
              </Link>
            </>
          ) : (
            <>
              <div className="auth-icon">!</div>
              <h1>Unable to verify access</h1>
              <p>{error || "Something went wrong. Please try again."}</p>
              <button
                type="button"
                className="login-button"
                onClick={() => void loadOrders()}
                disabled={loading}
              >
                {loading ? "Checking..." : "Try again"}
                <span aria-hidden="true">→</span>
              </button>
            </>
          )}

          <div className="auth-divider">
            <span />
            <span>PALMYRA STORE</span>
            <span />
          </div>

          <Link href="/" className="back-link">
            <span aria-hidden="true">←</span> Return to website
          </Link>

          <p className="security-note">
            Protected administrator access
          </p>
        </div>

        <style jsx>{`
          .auth-screen {
            min-height: 100vh;
            box-sizing: border-box;
            display: grid;
            place-items: center;
            padding: 32px 20px;
            background:
              radial-gradient(ellipse at 50% 0%, #281015 0%, transparent 48%),
              #090909;
            color: #f5f5f5;
            font-family: Arial, Helvetica, sans-serif;
          }
          .auth-card {
            width: 100%;
            max-width: 430px;
            box-sizing: border-box;
            padding: 40px;
            border: 1px solid #303030;
            border-radius: 20px;
            background: rgb(17 17 17 / 96%);
            box-shadow: 0 24px 90px rgb(0 0 0 / 40%);
            text-align: center;
          }
          .brand {
            display: inline-block;
            color: #fff;
            font-size: 30px;
            font-weight: 900;
            letter-spacing: 3px;
            text-decoration: none;
          }
          .brand span {
            color: #e11d2e;
          }
          .brand-caption {
            margin-top: 9px;
            margin-bottom: 36px;
            color: #777;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 2.5px;
          }
          .auth-icon {
            width: 48px;
            height: 48px;
            display: grid;
            place-items: center;
            margin: 0 auto 20px;
            border: 1px solid #57252b;
            border-radius: 15px;
            background: #261115;
            color: #ff7884;
            font-size: 23px;
            font-weight: 800;
          }
          .loader {
            width: 30px;
            height: 30px;
            margin: 0 auto 22px;
            border: 3px solid #383838;
            border-top-color: #e11d2e;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          h1 {
            margin: 0;
            color: #fff;
            font-size: clamp(23px, 5vw, 29px);
            line-height: 1.3;
            letter-spacing: -0.7px;
            overflow-wrap: anywhere;
          }
          p {
            margin: 14px 0 0;
            color: #aaa;
            font-size: 14px;
            line-height: 1.8;
            overflow-wrap: anywhere;
          }
          .login-button {
            display: flex;
            width: 100%;
            min-height: 50px;
            box-sizing: border-box;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-top: 28px;
            padding: 14px 20px;
            border: 1px solid #e11d2e;
            border-radius: 10px;
            background: #e11d2e;
            color: #fff;
            font-family: inherit;
            font-size: 14px;
            font-weight: 700;
            text-align: center;
            text-decoration: none;
            cursor: pointer;
            transition: background 0.2s ease, transform 0.2s ease;
          }
          .login-button:hover {
            background: #c91626;
            transform: translateY(-1px);
          }
          .login-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }
          .auth-divider {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-top: 30px;
            color: #656565;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 1.5px;
          }
          .auth-divider span:first-child,
          .auth-divider span:last-child {
            height: 1px;
            flex: 1;
            background: #2d2d2d;
          }
          .back-link {
            display: flex;
            width: fit-content;
            min-height: 42px;
            box-sizing: border-box;
            align-items: center;
            justify-content: center;
            gap: 9px;
            margin: 24px auto 0;
            padding: 11px 17px;
            border: 1px solid #333;
            border-radius: 9px;
            color: #ccc;
            font-size: 13px;
            font-weight: 600;
            text-decoration: none;
            transition: color 0.2s ease, border-color 0.2s ease;
          }
          .back-link:hover {
            color: #fff;
            border-color: #777;
          }
          .security-note {
            margin-top: 24px;
            color: #666;
            font-size: 11px;
          }
          @media (max-width: 480px) {
            .auth-screen {
              padding: 20px 14px;
            }
            .auth-card {
              padding: 30px 22px;
            }
            .brand-caption {
              margin-bottom: 30px;
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <style jsx>{`
        .admin-page {
          min-height: 100vh;
          padding: 32px;
          box-sizing: border-box;
          background: #090909;
          color: #f5f5f5;
          font-family: Arial, Helvetica, sans-serif;
        }
        .container {
          max-width: 1440px;
          margin: 0 auto;
        }
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 36px;
        }
        .brand {
          color: #f5f5f5;
          font-size: 25px;
          font-weight: 900;
          letter-spacing: 2px;
        }
        .brand span {
          color: #e11d2e;
        }
        .subtitle,
        .heading p,
        .metric-note,
        .muted,
        .results {
          color: #929292;
        }
        .subtitle {
          margin-top: 8px;
          font-size: 13px;
        }
        .actions,
        .toolbar,
        .drawer-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .button,
        .row-button {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          min-height: 42px;
          box-sizing: border-box;
          padding: 10px 14px;
          border: 1px solid #303030;
          border-radius: 9px;
          background: #171717;
          color: #fff;
          font-family: inherit;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .button:hover,
        .row-button:hover {
          border-color: #666;
          background: #202020;
        }
        .button-primary {
          border-color: #e11d2e;
          background: #e11d2e;
        }
        .button-primary:hover {
          border-color: #c91626;
          background: #c91626;
        }
        button:disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }
        .heading {
          margin-bottom: 22px;
        }
        .heading h1 {
          margin: 0;
          font-size: clamp(27px, 4vw, 38px);
          letter-spacing: -1px;
        }
        .heading p {
          font-size: 14px;
          line-height: 1.7;
        }
        .metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 28px;
        }
        .metric,
        .table-wrap,
        .section {
          border: 1px solid #292929;
          border-radius: 14px;
          background: #111;
        }
        .metric {
          min-width: 0;
          padding: 22px;
        }
        .metric-label {
          color: #aaa;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .metric-value {
          margin-top: 15px;
          font-size: clamp(23px, 3vw, 34px);
          font-weight: 800;
          overflow-wrap: anywhere;
        }
        .metric-note,
        .muted {
          margin-top: 8px;
          font-size: 12px;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }
        .toolbar {
          margin-bottom: 18px;
        }
        .search,
        .select,
        .status-select {
          min-height: 44px;
          box-sizing: border-box;
          padding: 10px 12px;
          border: 1px solid #303030;
          border-radius: 9px;
          outline: none;
          background: #121212;
          color: #fff;
          font-family: inherit;
          font-size: 13px;
        }
        .search {
          flex: 1;
          min-width: 220px;
        }
        .search:focus,
        .select:focus,
        .status-select:focus {
          border-color: #a43a44;
          box-shadow: 0 0 0 2px rgb(225 29 46 / 12%);
        }
        .results {
          font-size: 12px;
          white-space: nowrap;
        }
        .table-wrap {
          overflow-x: auto;
        }
        .orders-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        th {
          padding: 15px;
          border-bottom: 1px solid #292929;
          background: #151515;
          color: #999;
          font-size: 10px;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          white-space: nowrap;
        }
        td {
          padding: 16px;
          border-bottom: 1px solid #242424;
          color: #ddd;
          font-size: 13px;
          vertical-align: top;
        }
        tbody tr:last-child td {
          border-bottom: 0;
        }
        tbody tr:hover td {
          background: #141414;
        }
        .order-id,
        .amount {
          color: #fff;
          font-weight: 800;
        }
        .amount {
          white-space: nowrap;
        }
        .status {
          display: inline-flex;
          align-items: center;
          padding: 6px 9px;
          border: 1px solid #444;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .status-green {
          color: #8fe0ad;
          background: #11251a;
          border-color: #286342;
        }
        .status-yellow {
          color: #f2d58a;
          background: #241d0d;
          border-color: #66521f;
        }
        .status-red {
          color: #ff9ca5;
          background: #281215;
          border-color: #6c2c34;
        }
        .status-blue {
          color: #9bc8ff;
          background: #111d2c;
          border-color: #294d7a;
        }
        .status-purple {
          color: #d0b4ff;
          background: #1c142a;
          border-color: #513b7a;
        }
        .status-select {
          width: 130px;
          max-width: 100%;
        }
        .alert {
          margin: 16px 0;
          padding: 14px 16px;
          border: 1px solid #383838;
          border-radius: 10px;
          background: #141414;
          font-size: 13px;
          line-height: 1.7;
          overflow-wrap: anywhere;
        }
        .alert-error {
          border-color: #71313a;
          background: #241114;
          color: #ffb8bf;
        }
        .alert-success {
          border-color: #285c3c;
          background: #102117;
          color: #a9edc0;
        }
        .empty {
          padding: 45px 20px;
          color: #929292;
          text-align: center;
          line-height: 1.8;
        }
        .overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          justify-content: flex-end;
          background: rgb(0 0 0 / 75%);
        }
        .drawer {
          width: min(540px, 100%);
          height: 100%;
          box-sizing: border-box;
          overflow-y: auto;
          padding: 26px;
          border-left: 1px solid #333;
          background: #101010;
          box-shadow: -20px 0 70px rgb(0 0 0 / 25%);
        }
        .drawer-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 25px;
        }
        .drawer-header h2 {
          margin: 0;
          font-size: 23px;
          overflow-wrap: anywhere;
        }
        .section {
          margin-top: 22px;
          padding: 18px;
          background: #151515;
        }
        .section h3 {
          margin: 0 0 15px;
          color: #aaa;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .detail {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          padding: 10px 0;
          font-size: 13px;
          line-height: 1.6;
        }
        .detail + .detail {
          border-top: 1px solid #292929;
        }
        .detail-label {
          flex-shrink: 0;
          color: #929292;
        }
        .detail-value {
          min-width: 0;
          color: #f0f0f0;
          text-align: right;
          overflow-wrap: anywhere;
        }
        .item {
          padding: 12px 0;
          border-bottom: 1px solid #2a2a2a;
        }
        .item:last-child {
          border-bottom: 0;
        }
        .item-name {
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          overflow-wrap: anywhere;
        }
        .item-meta {
          margin-top: 6px;
          color: #999;
          font-size: 12px;
          line-height: 1.7;
          overflow-wrap: anywhere;
        }
        .drawer-actions {
          margin-top: 16px;
        }
        @media (max-width: 1000px) {
          .admin-page {
            padding: 22px 16px;
          }
          .metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .topbar {
            align-items: flex-start;
          }
        }
        @media (max-width: 650px) {
          .admin-page {
            padding: 18px 12px;
          }
          .topbar {
            flex-direction: column;
            gap: 18px;
            margin-bottom: 28px;
          }
          .actions {
            width: 100%;
          }
          .actions .button {
            flex: 1;
          }
          .metrics {
            gap: 10px;
          }
          .metric {
            padding: 16px;
          }
          .metric-value {
            font-size: 25px;
          }
          .toolbar {
            align-items: stretch;
            flex-direction: column;
          }
          .search,
          .toolbar .select {
            width: 100%;
            min-width: 0;
          }
          .results {
            white-space: normal;
          }
          .drawer {
            padding: 18px;
          }
          .detail {
            gap: 12px;
          }
        }
        @media (max-width: 360px) {
          .metrics {
            grid-template-columns: 1fr;
          }
          .auth-card {
            padding: 26px 18px;
          }
        }
      `}</style>

      <div className="container">
        <header className="topbar">
          <div>
            <div className="brand">
              PALMYRA<span>.</span>
            </div>
            <div className="subtitle">Store administration</div>
          </div>

          <div className="actions">
            <Link href="/" className="button">
              View website
            </Link>
            <button
              type="button"
              className="button button-primary"
              onClick={() => void loadOrders()}
              disabled={loading}
            >
              {loading ? "Loading..." : "↻ Refresh orders"}
            </button>
          </div>
        </header>

        <section className="heading">
          <h1>Orders dashboard</h1>
          <p>
            Manage customer orders, review payment status, and update
            fulfilment progress.
          </p>
        </section>

        <section className="metrics">
          <div className="metric">
            <div className="metric-label">Total orders</div>
            <div className="metric-value">{metrics.total}</div>
            <div className="metric-note">Orders returned by the API</div>
          </div>
          <div className="metric">
            <div className="metric-label">Paid orders</div>
            <div className="metric-value">{metrics.paid}</div>
            <div className="metric-note">Payments marked successful</div>
          </div>
          <div className="metric">
            <div className="metric-label">Pending fulfilment</div>
            <div className="metric-value">{metrics.pending}</div>
            <div className="metric-note">Orders awaiting processing</div>
          </div>
          <div className="metric">
            <div className="metric-label">Paid revenue</div>
            <div className="metric-value">{money(metrics.revenue)}</div>
            <div className="metric-note">Total value of paid orders shown</div>
          </div>
        </section>

        {error && (
          <div className="alert alert-error" role="alert">
            <strong>Unable to complete the request.</strong>
            <div>{error}</div>
          </div>
        )}

        {notice && (
          <div className="alert alert-success" role="status">
            {notice}
          </div>
        )}

        <section className="toolbar">
          <input
            className="search"
            type="search"
            placeholder="Search order, customer, email, phone..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search orders"
          />

          <select
            className="select"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter orders"
          >
            <option value="all">All orders</option>
            <option value="paid">Payment successful</option>
            <option value="unpaid">Payment not confirmed</option>
            <option value="pending">Pending fulfilment</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <span className="results">
            Showing {filteredOrders.length} of {orders.length} orders
          </span>
        </section>

        <section className="table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Fulfilment</th>
                <th>Update status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="empty">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty">
                    <strong>No orders found.</strong>
                    <br />
                    {orders.length === 0
                      ? "No orders were returned by the admin API."
                      : "Try changing your search or filter."}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={String(order.id)}>
                    <td>
                      <div className="order-id">
                        {getOrderNumber(order)}
                      </div>
                      <div className="muted">
                        {formatDate(order.created_at)}
                      </div>
                    </td>
                    <td>
                      <div className="order-id">
                        {getCustomerName(order)}
                      </div>
                      <div className="muted">
                        {order.email || "No email"}
                      </div>
                      <div className="muted">
                        {order.phone || "No phone"}
                      </div>
                    </td>
                    <td>
                      <div className="amount">{money(getTotal(order))}</div>
                    </td>
                    <td>
                      <span
                        className={`status ${statusClass(order.payment_status)}`}
                      >
                        {order.payment_status || "pending"}
                      </span>
                    </td>
                    <td>
                      <span className={`status ${statusClass(order.status)}`}>
                        {order.status || "pending"}
                      </span>
                    </td>
                    <td>
                      <select
                        className="status-select"
                        value={
                          STATUS_OPTIONS.includes(
                            normalizeStatus(order.status) as OrderStatus,
                          )
                            ? normalizeStatus(order.status)
                            : "pending"
                        }
                        disabled={updatingId === String(order.id)}
                        onChange={(event) =>
                          void updateStatus(
                            order,
                            event.target.value as OrderStatus,
                          )
                        }
                        aria-label={`Update status for ${getOrderNumber(order)}`}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                      {updatingId === String(order.id) && (
                        <div className="muted">Saving...</div>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="row-button"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>

      {selectedOrder && (
        <div
          className="overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedOrder(null);
            }
          }}
        >
          <aside
            className="drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-details-title"
          >
            <div className="drawer-header">
              <div>
                <h2 id="order-details-title">
                  Order {getOrderNumber(selectedOrder)}
                </h2>
                <div className="muted">
                  {formatDate(selectedOrder.created_at)}
                </div>
              </div>
              <button
                type="button"
                className="button"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </button>
            </div>

            <section className="section">
              <h3>Customer information</h3>
              <div className="detail">
                <span className="detail-label">Name</span>
                <span className="detail-value">
                  {getCustomerName(selectedOrder)}
                </span>
              </div>
              <div className="detail">
                <span className="detail-label">Email</span>
                <span className="detail-value">
                  {selectedOrder.email || "Not provided"}
                </span>
              </div>
              <div className="detail">
                <span className="detail-label">Phone</span>
                <span className="detail-value">
                  {selectedOrder.phone || "Not provided"}
                </span>
              </div>
            </section>

            <section className="section">
              <h3>Shipping address</h3>
              {[
                ["Address", selectedOrder.address],
                ["City", selectedOrder.city],
                ["State", selectedOrder.state],
                [
                  "PIN code",
                  selectedOrder.pincode || selectedOrder.postal_code,
                ],
                ["Country", selectedOrder.country],
              ].map(([label, value]) => (
                <div className="detail" key={label}>
                  <span className="detail-label">{label}</span>
                  <span className="detail-value">
                    {value || "Not provided"}
                  </span>
                </div>
              ))}
              <div className="drawer-actions">
                <button
                  type="button"
                  className="button"
                  onClick={() => void copyShippingDetails(selectedOrder)}
                >
                  Copy shipping details
                </button>
              </div>
            </section>

            <section className="section">
              <h3>Items</h3>
              {!Array.isArray(selectedOrder.items) ||
              selectedOrder.items.length === 0 ? (
                <div className="muted">No item details available.</div>
              ) : (
                selectedOrder.items.map((item, index) => (
                  <div
                    className="item"
                    key={`${item.id || item.name || "item"}-${index}`}
                  >
                    <div className="item-name">
                      {item.name ||
                        item.title ||
                        item.product_name ||
                        item.id ||
                        "Product"}
                    </div>
                    <div className="item-meta">
                      Quantity: {item.quantity ?? 1}
                      {item.color ? ` · Colour: ${item.color}` : ""}
                      {item.size ? ` · Size: ${item.size}` : ""}
                      {item.price != null
                        ? ` · Price: ${money(item.price)}`
                        : ""}
                    </div>
                  </div>
                ))
              )}
            </section>

            <section className="section">
              <h3>Payment and totals</h3>
              {[
                ["Subtotal", money(selectedOrder.subtotal)],
                ["Platform fee", money(selectedOrder.platform_fee)],
                ["Delivery fee", money(selectedOrder.delivery_fee)],
                ["Total", money(getTotal(selectedOrder))],
                [
                  "Payment status",
                  selectedOrder.payment_status || "pending",
                ],
                [
                  "Payment ID",
                  selectedOrder.razorpay_payment_id || "Not available",
                ],
                [
                  "Payment order ID",
                  selectedOrder.razorpay_order_id || "Not available",
                ],
              ].map(([label, value]) => (
                <div className="detail" key={label}>
                  <span className="detail-label">{label}</span>
                  <span className="detail-value">{value}</span>
                </div>
              ))}
            </section>

            <section className="section">
              <h3>Fulfilment</h3>
              <div className="detail">
                <span className="detail-label">Current status</span>
                <span className="detail-value">
                  {selectedOrder.status || "pending"}
                </span>
              </div>
              <label
                htmlFor="drawer-status"
                className="detail-label"
                style={{ display: "block", margin: "14px 0 8px" }}
              >
                Update fulfilment status
              </label>
              <select
                id="drawer-status"
                className="select"
                style={{ width: "100%" }}
                value={
                  STATUS_OPTIONS.includes(
                    normalizeStatus(selectedOrder.status) as OrderStatus,
                  )
                    ? normalizeStatus(selectedOrder.status)
                    : "pending"
                }
                disabled={updatingId === String(selectedOrder.id)}
                onChange={(event) =>
                  void updateStatus(
                    selectedOrder,
                    event.target.value as OrderStatus,
                  )
                }
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </section>
          </aside>
        </div>
      )}
    </main>
  );
}
