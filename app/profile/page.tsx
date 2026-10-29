
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type Order = {
  id: number;
  order_number: string | null;
  status: string | null;
  created_at: string;
  total_amount: number | string | null;
};

type Address = {
  id: number;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default: boolean;
};

type DeletionRequest = {
  id: number;
  status: "pending" | "completed" | "rejected";
  requested_at: string;
};

const money = (value: number | string | null) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));

const dateLabel = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length
    ? parts.slice(0, 2).map((part) => part[0].toUpperCase()).join("")
    : "P";
}

function statusStyle(status: string | null) {
  const value = (status ?? "processing").toLowerCase();

  if (["delivered", "completed", "paid"].includes(value)) {
    return "border-green-500/25 bg-green-500/10 text-green-300";
  }

  if (["cancelled", "canceled", "failed", "refunded"].includes(value)) {
    return "border-red-500/25 bg-red-500/10 text-red-300";
  }

  return "border-amber-500/25 bg-amber-500/10 text-amber-300";
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [deletionRequest, setDeletionRequest] =
    useState<DeletionRequest | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadDashboard = useCallback(async (currentUser: User) => {
    setUser(currentUser);
    setFullName(
      currentUser.user_metadata?.full_name ??
        currentUser.user_metadata?.name ??
        ""
    );
    setPhone(currentUser.user_metadata?.phone ?? "");

    const [ordersResult, addressesResult, requestResult] = await Promise.all([
      supabase
        .from("orders")
        .select("id, order_number, status, created_at, total_amount")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false })
        .limit(5),

      supabase
        .from("customer_addresses")
        .select(
          "id, full_name, phone, address, city, state, pincode, country, is_default"
        )
        .eq("user_id", currentUser.id)
        .order("is_default", { ascending: false })
        .limit(3),

      supabase
        .from("account_deletion_requests")
        .select("id, status, requested_at")
        .eq("user_id", currentUser.id)
        .eq("status", "pending")
        .maybeSingle(),
    ]);

    if (ordersResult.error) {
      console.error("Orders load failed:", ordersResult.error.message);
      setError("Recent orders could not be loaded.");
    } else {
      setOrders((ordersResult.data ?? []) as Order[]);
    }

    if (addressesResult.error) {
      console.error("Addresses load failed:", addressesResult.error.message);
      setError((previous) => previous || "Saved addresses could not be loaded.");
    } else {
      setAddresses((addressesResult.data ?? []) as Address[]);
    }

    if (requestResult.error) {
      console.error("Deletion request load failed:", requestResult.error.message);
      // Do not block the profile if the request table is not configured yet.
    } else {
      setDeletionRequest(
        (requestResult.data as DeletionRequest | null) ?? null
      );
    }
  }, [supabase]);

  useEffect(() => {
    let active = true;

    async function init() {
      const { data, error: authError } = await supabase.auth.getUser();

      if (!active) return;

      if (authError) {
        console.error("Profile authentication check:", authError.message);
      }

      if (!data.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      await loadDashboard(data.user);

      if (active) setLoading(false);
    }

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      if (!session?.user) {
        setUser(null);
        setOrders([]);
        setAddresses([]);
        setDeletionRequest(null);
        setLoading(false);
      } else {
        setUser(session.user);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase, loadDashboard]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);

    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
        },
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      if (data.user) setUser(data.user);
      setEditing(false);
      setNotice("Your profile details have been saved.");
    } catch {
      setError("Unable to save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    setError("");
    setSigningOut(true);

    try {
      const { error: signOutError } = await supabase.auth.signOut({
        scope: "local",
      });

      if (signOutError) {
        setError("Unable to sign out. Please try again.");
        return;
      }

      router.replace("/login");
      router.refresh();
    } catch {
      setError("Unable to sign out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  }

  async function requestAccountDeletion() {
    setError("");
    setNotice("");
    setSubmittingRequest(true);

    try {
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.error ?? "Unable to submit your request.");
        return;
      }

      setNotice(
        result.message ??
          "Your account deletion request has been submitted for review."
      );
      setConfirmDelete(false);

      // Refresh the pending request from Supabase.
      if (user) {
        const { data, error: requestError } = await supabase
          .from("account_deletion_requests")
          .select("id, status, requested_at")
          .eq("user_id", user.id)
          .eq("status", "pending")
          .maybeSingle();

        if (!requestError) {
          setDeletionRequest((data as DeletionRequest | null) ?? null);
        }
      }
    } catch {
      setError("Unable to submit your request. Please try again.");
    } finally {
      setSubmittingRequest(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="animate-pulse text-sm text-zinc-400">
          Loading your Palmyra account...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-5 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600/15 text-2xl font-black text-red-400">
            P
          </div>
          <h1 className="mt-5 text-2xl font-bold">Your Palmyra Account</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Sign in to manage your profile, orders and addresses.
          </p>
          <Link
            href="/login"
            className="mt-6 block rounded-xl bg-red-600 px-5 py-3 font-semibold hover:bg-red-700"
          >
            Sign In
          </Link>
          <Link href="/" className="mt-4 inline-block text-sm text-zinc-400 hover:text-white">
            Back to Palmyra
          </Link>
        </div>
      </main>
    );
  }

  const memberName =
    fullName.trim() || user.email?.split("@")[0] || "Palmyra Member";
  const verified = Boolean(user.email_confirmed_at);
  const completedRecentOrders = orders.filter((order) =>
    ["delivered", "completed"].includes((order.status ?? "").toLowerCase())
  ).length;
  const recentOrderValue = orders.reduce(
    (sum, order) => sum + Number(order.total_amount ?? 0),
    0
  );

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <Link href="/" className="text-2xl font-black tracking-[0.18em] text-red-500">
            PALMYRA
          </Link>
          <nav className="flex flex-wrap items-center gap-3 text-sm">
            <Link href="/store" className="text-zinc-300 hover:text-white">
              Store
            </Link>
            <Link
              href="/orders"
              className="rounded-full border border-white/15 px-4 py-2 hover:border-red-500 hover:text-red-300"
            >
              My orders →
            </Link>
          </nav>
        </header>

        {(error || notice) && (
          <div
            role={error ? "alert" : "status"}
            className={`mt-5 rounded-xl border p-4 text-sm ${
              error
                ? "border-red-500/30 bg-red-950/30 text-red-300"
                : "border-green-500/30 bg-green-950/20 text-green-300"
            }`}
          >
            {error || notice}
          </div>
        )}

        <section className="relative mt-7 overflow-hidden rounded-3xl border border-red-500/20 bg-gradient-to-br from-zinc-900 via-zinc-950 to-red-950/40 p-6 sm:p-9">
          <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-red-600/10 blur-3xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-red-500/40 bg-red-600/15 text-3xl font-black text-red-300">
              {initials(memberName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-400">
                Your member space
              </p>
              <h1 className="mt-2 break-words text-3xl font-bold sm:text-4xl">
                Welcome, {memberName}
              </h1>
              <p className="mt-2 break-all text-sm text-zinc-400">{user.email}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-green-500/25 bg-green-500/10 px-3 py-1.5 text-green-300">
                  ● Signed in
                </span>
                <span className={`rounded-full border px-3 py-1.5 ${
                  verified
                    ? "border-green-500/25 bg-green-500/10 text-green-300"
                    : "border-amber-500/25 bg-amber-500/10 text-amber-300"
                }`}>
                  {verified ? "✓ Email verified" : "Email not verified"}
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1.5 text-zinc-400">
                  Member since {dateLabel(user.created_at)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setError("");
                setNotice("");
                setEditing((value) => !value);
              }}
              className="rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold hover:border-red-500 hover:bg-white/5"
            >
              {editing ? "Close editor" : "Edit profile"}
            </button>
          </div>
        </section>

        {editing && (
          <section className="mt-6 rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <h2 className="text-xl font-bold">Personal information</h2>
            <form onSubmit={saveProfile} className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="fullName" className="mb-2 block text-sm text-zinc-300">
                  Full name
                </label>
                <input
                  id="fullName"
                  autoComplete="name"
                  maxLength={100}
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 outline-none focus:border-red-500"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label htmlFor="phone" className="mb-2 block text-sm text-zinc-300">
                  Phone number
                </label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  maxLength={30}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 outline-none focus:border-red-500"
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-zinc-400">
                  Email: <span className="break-all text-zinc-200">{user.email}</span>
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  To change your email, use your account&apos;s email-change flow.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 sm:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-red-600 px-5 py-3 font-semibold hover:bg-red-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFullName(
                      user.user_metadata?.full_name ?? user.user_metadata?.name ?? ""
                    );
                    setPhone(user.user_metadata?.phone ?? "");
                    setEditing(false);
                  }}
                  className="rounded-xl border border-white/15 px-5 py-3 hover:bg-white/5"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-400">Recent orders</p>
            <p className="mt-3 text-3xl font-bold">{orders.length}</p>
            <p className="mt-2 text-xs text-zinc-500">Up to five latest orders</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-400">Recently completed</p>
            <p className="mt-3 text-3xl font-bold">{completedRecentOrders}</p>
            <p className="mt-2 text-xs text-zinc-500">Among the latest five orders</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-400">Recent order value</p>
            <p className="mt-3 break-words text-2xl font-bold">{money(recentOrderValue)}</p>
            <p className="mt-2 text-xs text-zinc-500">Sum of loaded recent orders</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
            <p className="text-sm text-zinc-400">Saved addresses</p>
            <p className="mt-3 text-3xl font-bold">{addresses.length}</p>
            <p className="mt-2 text-xs text-zinc-500">Up to three saved addresses</p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Recent orders</h2>
                <p className="mt-1 text-sm text-zinc-400">Your latest Palmyra purchases.</p>
              </div>
              <Link href="/orders" className="shrink-0 text-sm text-red-400 hover:text-red-300">
                All orders →
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-white/15 p-6 text-center">
                <p className="font-medium">No orders to show yet</p>
                <p className="mt-2 text-sm text-zinc-400">Your purchases will appear here.</p>
                <Link href="/store" className="mt-4 inline-block rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-700">
                  Explore the store
                </Link>
              </div>
            ) : (
              <div className="mt-5 divide-y divide-white/10">
                {orders.map((order) => (
                  <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                    <div className="min-w-0">
                      <p className="font-semibold">{order.order_number || `Order #${order.id}`}</p>
                      <p className="mt-1 text-xs text-zinc-500">{dateLabel(order.created_at)}</p>
                      <span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs capitalize ${statusStyle(order.status)}`}>
                        {order.status || "Processing"}
                      </span>
                    </div>
                    <p className="font-semibold">{money(order.total_amount)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Saved addresses</h2>
                <p className="mt-1 text-sm text-zinc-400">Your delivery details.</p>
              </div>
              <Link href="/addresses" className="shrink-0 text-sm text-red-400 hover:text-red-300">
                Manage →
              </Link>
            </div>

            {addresses.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-white/15 p-6 text-center">
                <p className="font-medium">No saved addresses</p>
                <p className="mt-2 text-sm text-zinc-400">Add an address for easier checkout.</p>
                <Link href="/addresses" className="mt-4 inline-block rounded-lg border border-white/15 px-4 py-2 text-sm hover:border-red-500">
                  Add address
                </Link>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {addresses.map((address) => (
                  <div key={address.id} className="rounded-xl border border-white/10 bg-black/50 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{address.full_name}</p>
                      {address.is_default && (
                        <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-300">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      {address.address}, {address.city}, {address.state} {address.pincode}, {address.country}
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">{address.phone}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-950 p-6 sm:p-8">
          <h2 className="text-xl font-bold">Account & security</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Manage your account, privacy and sign-in settings.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link href="/profile/security" className="rounded-xl border border-white/10 p-4 transition hover:border-red-500/50 hover:bg-white/[0.02]">
              <p className="font-semibold">Password & sessions</p>
              <p className="mt-1 text-sm text-zinc-400">Update your password and manage security.</p>
            </Link>
            <Link href="/addresses" className="rounded-xl border border-white/10 p-4 transition hover:border-red-500/50 hover:bg-white/[0.02]">
              <p className="font-semibold">Delivery addresses</p>
              <p className="mt-1 text-sm text-zinc-400">Add, edit, or remove saved addresses.</p>
            </Link>
            <Link href="/orders" className="rounded-xl border border-white/10 p-4 transition hover:border-red-500/50 hover:bg-white/[0.02]">
              <p className="font-semibold">Order history</p>
              <p className="mt-1 text-sm text-zinc-400">Review your purchases and order status.</p>
            </Link>
            <button
              type="button"
              onClick={signOut}
              disabled={signingOut}
              className="rounded-xl border border-white/10 p-4 text-left transition hover:border-red-500/50 hover:bg-white/[0.02] disabled:opacity-50"
            >
              <p className="font-semibold">{signingOut ? "Signing out..." : "Sign out of this device"}</p>
              <p className="mt-1 text-sm text-zinc-400">End this browser session.</p>
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-red-500/25 bg-gradient-to-br from-red-950/20 to-zinc-950 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
                Privacy controls
              </p>
              <h2 className="mt-2 text-xl font-bold">Delete account</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                You can request deletion of your Palmyra account. The request
                will be reviewed manually. Your account will not be deleted
                immediately when you submit this request. Some order or
                transaction records may need to be retained where legally required.
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300">
              {deletionRequest ? "Request pending" : "Manual review"}
            </span>
          </div>

          {deletionRequest ? (
            <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="font-semibold text-amber-300">Request submitted</p>
              <p className="mt-2 text-sm text-zinc-300">
                Status: Pending review
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Submitted on {dateLabel(deletionRequest.requested_at)}
              </p>
            </div>
          ) : !confirmDelete ? (
            <button
              type="button"
              onClick={() => {
                setError("");
                setNotice("");
                setConfirmDelete(true);
              }}
              className="mt-5 rounded-xl border border-red-500/40 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
            >
              Request account deletion
            </button>
          ) : (
            <div className="mt-5 rounded-xl border border-red-500/20 bg-black/40 p-4">
              <p className="font-semibold">Submit a deletion request?</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                This submits a request for manual review. It does not delete
                your account immediately.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={requestAccountDeletion}
                  disabled={submittingRequest}
                  className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                >
                  {submittingRequest ? "Submitting..." : "Confirm request"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  disabled={submittingRequest}
                  className="rounded-xl border border-white/15 px-4 py-3 text-sm hover:bg-white/5"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>

        <footer className="mt-12 border-t border-white/10 py-6 text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} Palmyra. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
