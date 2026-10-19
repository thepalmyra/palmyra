
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

function Icon({
  name,
  size = 22,
}: {
  name: "user" | "package" | "map" | "shield" | "shopping" | "logout" | "edit" | "mail" | "calendar" | "arrow" | "check";
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "user":
      return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" /></svg>;
    case "package":
      return <svg {...common}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="M3 8v9l9 5 9-5V8" /><path d="M12 13v9" /></svg>;
    case "map":
      return <svg {...common}><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" /><path d="M9 3v15m6-12v15" /></svg>;
    case "shield":
      return <svg {...common}><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></svg>;
    case "shopping":
      return <svg {...common}><path d="M5 8h14l1 13H4L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>;
    case "logout":
      return <svg {...common}><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></svg>;
    case "edit":
      return <svg {...common}><path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" /></svg>;
    case "mail":
      return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>;
    case "calendar":
      return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></svg>;
    case "arrow":
      return <svg {...common}><path d="M5 12h14m-6-6 6 6-6 6" /></svg>;
    case "check":
      return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>;
  }
}

function formatDate(value?: string) {
  if (!value) return "Member";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Member";

  return date.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function loadProfile() {
      const { data, error: authError } = await supabase.auth.getUser();

      if (!active) return;

      if (authError) {
        setError("Unable to load your profile. Please refresh and try again.");
      }

      const currentUser = data.user ?? null;
      setUser(currentUser);
      setFullName(
        currentUser?.user_metadata?.full_name ??
          currentUser?.user_metadata?.name ??
          ""
      );
      setPhone(currentUser?.user_metadata?.phone ?? "");
      setLoading(false);
    }

    void loadProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setFullName(
        currentUser?.user_metadata?.full_name ??
          currentUser?.user_metadata?.name ??
          ""
      );
      setPhone(currentUser?.user_metadata?.phone ?? "");
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const supabase = createClient();
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

      setFullName(
        data.user?.user_metadata?.full_name ?? fullName.trim()
      );
      setPhone(data.user?.user_metadata?.phone ?? phone.trim());
      setEditing(false);
      setSuccess("Your profile details have been saved.");
    } catch {
      setError("Unable to save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    setError("");
    setSuccess("");
    setSigningOut(true);

    try {
      const supabase = createClient();
      const { error: signOutError } = await supabase.auth.signOut();

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

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-5 text-white">
        <p className="text-sm text-zinc-400">Loading your Palmyra account...</p>
      </main>
    );
  }

  const memberName =
    fullName.trim() || user?.email?.split("@")[0] || "Palmyra Member";

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/10 pb-5">
          <Link href="/" className="text-2xl font-black tracking-[0.18em] text-red-500">
            PALMYRA
          </Link>

          <Link
            href="/store"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm transition hover:border-red-500 hover:text-red-400"
          >
            <Icon name="shopping" size={18} />
            Store
          </Link>
        </header>

        {error && (
          <p role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-300">
            {error}
          </p>
        )}

        {success && (
          <p role="status" className="mt-5 rounded-xl border border-green-500/30 bg-green-950/30 p-4 text-sm text-green-300">
            {success}
          </p>
        )}

        {user ? (
          <>
            {/* Profile Hero */}
            <section className="relative mt-8 overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-6 sm:p-10">
              <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-red-600/10 blur-3xl" />

              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-red-500/30 bg-red-600/10 text-red-400">
                  <Icon name="user" size={38} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-400">
                    Your account
                  </p>

                  <h1 className="mt-2 break-words text-3xl font-bold sm:text-4xl">
                    Welcome, {memberName}
                  </h1>

                  <p className="mt-2 break-all text-sm text-zinc-400">
                    {user.email}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-green-400">
                      <Icon name="check" size={14} />
                      Signed in
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="calendar" size={15} />
                      Member since {formatDate(user.created_at)}
                    </span>
                  </div>
                </div>

                {!editing && (
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setSuccess("");
                      setEditing(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold transition hover:border-red-500 hover:bg-white/5"
                  >
                    <Icon name="edit" size={17} />
                    Edit Profile
                  </button>
                )}
              </div>
            </section>

            {/* Account Details */}
            <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/5 p-3 text-red-400">
                    <Icon name="user" size={23} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold">Personal Information</h2>
                    <p className="mt-1 text-sm text-zinc-400">
                      Manage your account details.
                    </p>
                  </div>
                </div>

                {editing ? (
                  <form onSubmit={saveProfile} className="mt-7 space-y-5">
                    <div>
                      <label htmlFor="fullName" className="mb-2 block text-sm text-zinc-300">
                        Full name
                      </label>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        autoComplete="name"
                        maxLength={100}
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 outline-none transition focus:border-red-500"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="mb-2 block text-sm text-zinc-300">
                        Email address
                      </label>
                      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-zinc-400">
                        <Icon name="mail" size={18} />
                        <span className="break-all">{user.email}</span>
                      </div>
                      <p className="mt-2 text-xs text-zinc-500">
                        Email changes are not available in this form.
                      </p>
                    </div>

                    <div>
                      <label htmlFor="phone" className="mb-2 block text-sm text-zinc-300">
                        Phone number
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        maxLength={30}
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 outline-none transition focus:border-red-500"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-semibold transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </button>

                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => {
                          setFullName(
                            user.user_metadata?.full_name ??
                              user.user_metadata?.name ??
                              ""
                          );
                          setPhone(user.user_metadata?.phone ?? "");
                          setEditing(false);
                          setError("");
                        }}
                        className="rounded-xl border border-white/15 px-5 py-3 font-semibold transition hover:bg-white/5 disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-7 space-y-5">
                    <div className="border-b border-white/10 pb-4">
                      <p className="text-xs uppercase tracking-wider text-zinc-500">
                        Full name
                      </p>
                      <p className="mt-2 font-medium">
                        {fullName.trim() || "Not added yet"}
                      </p>
                    </div>

                    <div className="border-b border-white/10 pb-4">
                      <p className="text-xs uppercase tracking-wider text-zinc-500">
                        Email address
                      </p>
                      <p className="mt-2 break-all font-medium">
                        {user.email}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-500">
                        Phone number
                      </p>
                      <p className="mt-2 font-medium">
                        {phone || "Not added yet"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Your Palmyra</h2>

                <Link
                  href="/store"
                  className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-zinc-950 p-5 transition hover:border-red-500/50"
                >
                  <div className="rounded-xl bg-red-600/10 p-3 text-red-400">
                    <Icon name="shopping" size={23} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">Continue Shopping</h3>
                    <p className="mt-1 text-sm text-zinc-400">
                      Explore the Palmyra collection.
                    </p>
                  </div>
                  <Icon name="arrow" size={19} />
                </Link>

                <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-white/5 p-3 text-zinc-300">
                      <Icon name="package" size={23} />
                    </div>
                    <div>
                      <h3 className="font-semibold">My Orders</h3>
                      <p className="mt-1 text-sm text-zinc-400">
                        Your purchase history will appear here once order history is connected.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-white/5 p-3 text-zinc-300">
                      <Icon name="map" size={23} />
                    </div>
                    <div>
                      <h3 className="font-semibold">Saved Addresses</h3>
                      <p className="mt-1 text-sm text-zinc-400">
                        Address management will be connected to secure saved customer data.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-white/5 p-3 text-zinc-300">
                      <Icon name="shield" size={23} />
                    </div>
                    <div>
                      <h3 className="font-semibold">Account Security</h3>
                      <p className="mt-1 text-sm text-zinc-400">
                        Your sign-in is managed by Supabase Authentication.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Sign Out */}
            <section className="mt-8 flex flex-col gap-4 rounded-2xl border border-red-500/20 bg-red-950/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <h2 className="font-semibold">Sign out of Palmyra</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Sign out when you are using a shared device.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/40 px-5 py-3 font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-60"
              >
                <Icon name="logout" size={18} />
                {signingOut ? "Signing out..." : "Sign Out"}
              </button>
            </section>
          </>
        ) : (
          /* Signed Out */
          <section className="mx-auto mt-16 max-w-lg rounded-3xl border border-white/10 bg-zinc-950 p-8 text-center sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-red-500/30 bg-red-600/10 text-red-400">
              <Icon name="user" size={38} />
            </div>

            <h1 className="mt-6 text-3xl font-bold">Your Palmyra Account</h1>
            <p className="mt-3 leading-7 text-zinc-400">
              Sign in to manage your profile and access your account.
            </p>

            <Link
              href="/login"
              className="mt-7 block rounded-xl bg-red-600 px-5 py-3 font-semibold transition hover:bg-red-700"
            >
              Sign In
            </Link>

            <Link
              href="/register"
              className="mt-3 block rounded-xl border border-white/15 px-5 py-3 font-semibold transition hover:bg-white/5"
            >
              Create Account
            </Link>

            <Link
              href="/store"
              className="mt-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
            >
              Continue Shopping
              <Icon name="arrow" size={16} />
            </Link>
          </section>
        )}

        <footer className="mt-12 border-t border-white/10 py-6 text-center text-xs text-zinc-500">
          © 2026 Palmyra. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
