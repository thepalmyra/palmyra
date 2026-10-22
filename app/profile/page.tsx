
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
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
  if (!parts.length) return "P";
  return parts.slice(0, 2).map((part) => part[0].toUpperCase()).join("");
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
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

    const [ordersResult, addressesResult] = await Promise.all([
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
    ]);

    if (ordersResult.error) {
      console.error("Profile orders load failed:", ordersResult.error.message);
      setError("Your recent orders could not be loaded. Please try again later.");
    } else {
      setOrders((ordersResult.data ?? []) as Order[]);
    }

    if (addressesResult.error) {
      console.error(
        "Profile addresses load failed:",
        addressesResult.error.message
      );
      setError((previous) =>
        previous ||
        "Your saved addresses could not be loaded. Please try again later."
      );
    } else {
      setAddresses((addressesResult.data ?? []) as Address[]);
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
        setLoading(false);
      } else {
        // The initial load handles dashboard data. Update identity here;
        // avoid making additional Supabase requests inside this callback.
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

  async function deleteAccount() {
    setError("");
    setNotice("");
    setDeleting(true);

    try {
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.error ?? "Unable to delete your account.");
        return;
      }

      await supabase.auth.signOut({ scope: "local" });
      router.replace("/");
      router.refresh();
    } catch {
      setError("Unable to delete your account. Please try again.");
    } finally {
      setDeleting(false);
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

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between border-b border-white/10 pb-5">
          <Link href="/" className="text-2xl font-black tracking-[0.18em] text-red-500">
            PALMYRA
          </Link>
          <Link
            href="/store"
            className="rounded-full border border-white/15 px-4 py-2 text-sm hover:border-red-500 hover:text-red-400"
          >
            Continue shopping →
          </Link>
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

        <section className="relative mt-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-red-950/30 p-6 sm:p-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-red-500/40 bg-red-600/15 text-3xl font-black text-red-300">
              {initials(memberName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-400">
                My Palmyra
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
                  To change your email, use your account's email-change flow.
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
                    setFullName(user.user_metadata?.full_name ?? user.user_metadata?.name ?? "");
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

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <p className="text-sm text-zinc-400">Recent orders</p>
            <p className="mt-2 text-3xl font-bold">{orders.length}</p>
            <p className="mt-1 text-xs text-zinc-500">Latest five orders shown below</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <p className="text-sm text-zinc-400">Saved addresses</p>
            <p className="mt-2 text-3xl font-bold">{addresses.length}</p>
            <p className="mt-1 text-xs text-zinc-500">Latest three addresses shown below</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <p className="text-sm text-zinc-400">Account security</p>
            <p className="mt-2 text-lg font-bold">{verified ? "Email verified" : "Verification needed"}</p>
            <Link href="/profile/security" className="mt-2 inline-block text-sm text-red-400 hover:text-red-300">
              Manage security →
            </Link>
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
                      <p className="mt-1 text-xs capitalize text-zinc-400">{order.status || "Processing"}</p>
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
                <p className="mt-1 text-sm text-zinc-400">Manage delivery details.</p>
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

        <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-950 p-6">
          <h2 className="text-xl font-bold">Account & security</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link href="/profile/security" className="rounded-xl border border-white/10 p-4 hover:border-red-500/50">
              <p className="font-semibold">Password & sessions</p>
              <p className="mt-1 text-sm text-zinc-400">Update your password and manage sign-in sessions.</p>
            </Link>
            <Link href="/addresses" className="rounded-xl border border-white/10 p-4 hover:border-red-500/50">
              <p className="font-semibold">Delivery addresses</p>
              <p className="mt-1 text-sm text-zinc-400">Add, edit, or remove saved addresses.</p>
            </Link>
            <Link href="/orders" className="rounded-xl border border-white/10 p-4 hover:border-red-500/50">
              <p className="font-semibold">Order history</p>
              <p className="mt-1 text-sm text-zinc-400">Review orders and their current status.</p>
            </Link>
            <button
              type="button"
              onClick={signOut}
              disabled={signingOut}
              className="rounded-xl border border-red-500/30 p-4 text-left hover:bg-red-500/5 disabled:opacity-50"
            >
              <p className="font-semibold text-red-300">{signingOut ? "Signing out..." : "Sign out of this device"}</p>
              <p className="mt-1 text-sm text-zinc-400">End this browser session securely.</p>
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-red-500/25 bg-red-950/10 p-6">
          <h2 className="font-semibold text-red-300">Delete account</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Permanently delete your Palmyra login account. Order or payment
            records may need to be retained where legally required.
          </p>
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="mt-4 rounded-xl border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/10"
            >
              Delete my account
            </button>
          ) : (
            <div className="mt-4 rounded-xl border border-red-500/20 p-4">
              <p className="text-sm font-semibold">Are you sure? This action cannot be undone.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={deleteAccount}
                  disabled={deleting}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Yes, delete account"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                  className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/5"
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
