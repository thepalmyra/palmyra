
"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { useCart } from "@/components/CartContext";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  const { items, ready } = useCart();

  const cartCount = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const memberName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "My Profile";

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();

      if (!active) return;

      setUser(error ? null : data.user);
      setAuthLoading(false);
    }

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!menuOpen && !searchOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen, searchOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = search.trim();

    if (!query) return;

    setSearchOpen(false);
    setMenuOpen(false);

    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  }

  async function handleSignOut() {
    if (signingOut) return;

    setSigningOut(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        window.alert("Unable to sign out. Please try again.");
        return;
      }

      setUser(null);
      setMenuOpen(false);
      window.location.href = "/";
    } catch {
      window.alert("Unable to sign out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  }

  const mainLinks = [
    { label: "Home", href: "/" },
    { label: "Watch", href: "/watch" },
    { label: "Store", href: "/store" },
    { label: "Cart", href: "/cart" },
  ];

  const secondaryLinks = [
    { label: "About Palmyra", href: "/about" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms-and-conditions" },
  ];

  return (
    <>
      {/* STICKY PREMIUM TOP BAR */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.09] bg-black/95 text-white shadow-xl shadow-black/20 backdrop-blur-2xl">
        <nav
          aria-label="Main navigation"
          className="relative mx-auto flex h-[68px] w-full max-w-[1800px] items-center justify-between px-3 sm:px-6 lg:h-[76px] lg:px-10"
        >
          {/* MENU BUTTON */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            aria-controls="palmyra-side-menu"
            className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-transparent transition duration-200 hover:border-white/10 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6 transition-transform duration-200 group-hover:scale-105"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          {/* CENTERED BRAND */}
          <Link
            href="/"
            aria-label="Palmyra Home"
            className="absolute left-1/2 flex max-w-[calc(100%-170px)] -translate-x-1/2 items-center gap-2 sm:gap-2.5"
          >
            <img
              src="/logo.png"
              alt=""
              className="h-8 w-8 shrink-0 object-contain sm:h-9 sm:w-9"
            />

            <span className="truncate text-lg font-black tracking-[0.07em] text-white sm:text-2xl sm:tracking-[0.1em]">
              PALMYRA
            </span>
          </Link>

          {/* RIGHT SIDE ACTIONS */}
          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            {/* DESKTOP ACCOUNT ACTIONS */}
            {!authLoading && !user && (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  href="/login"
                  className="rounded-full px-4 py-2.5 text-sm font-semibold text-zinc-300 transition duration-200 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="rounded-full border border-red-500/30 bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-950/20 transition duration-200 hover:border-red-400 hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                >
                  Register
                </Link>
              </div>
            )}

            {!authLoading && user && (
              <Link
                href="/profile"
                aria-label="Open your profile"
                className="hidden max-w-48 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 transition duration-200 hover:border-red-500/50 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 sm:flex"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-600/15 text-red-400">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21a8 8 0 0 1 16 0" />
                  </svg>
                </span>

                <span className="max-w-32 truncate text-sm font-semibold">
                  {memberName}
                </span>

                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 shrink-0 text-zinc-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m7 10 5 5 5-5" />
                </svg>
              </Link>
            )}

            {/* SEARCH BUTTON */}
            <button
              type="button"
              onClick={() => setSearchOpen((open) => !open)}
              aria-label={searchOpen ? "Close search" : "Open search"}
              aria-expanded={searchOpen}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-transparent transition duration-200 hover:border-white/10 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              {searchOpen ? (
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                >
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="10.8" cy="10.8" r="6.8" />
                  <path d="m16 16 4.5 4.5" />
                </svg>
              )}
            </button>

            {/* SHOPPING CART */}
            <Link
              href="/cart"
              aria-label={
                ready && cartCount > 0
                  ? `Shopping cart, ${cartCount} items`
                  : "Shopping cart"
              }
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-transparent transition duration-200 hover:border-white/10 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 4h2l2.2 11a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 1.9-1.5L22 8H6" />
                <circle cx="10" cy="21" r="1" />
                <circle cx="18" cy="21" r="1" />
              </svg>

              {ready && cartCount > 0 && (
                <span className="absolute right-0 top-0 flex h-[19px] min-w-[19px] items-center justify-center rounded-full border-2 border-black bg-red-600 px-1 text-[10px] font-extrabold leading-none text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </nav>

        {/* EXPANDABLE SEARCH */}
        {searchOpen && (
          <div className="border-t border-white/[0.08] bg-zinc-950/95 px-3 py-5 sm:px-6">
            <form
              onSubmit={handleSearch}
              role="search"
              className="mx-auto max-w-2xl"
            >
              <label
                htmlFor="palmyra-navbar-search"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500"
              >
                Discover Palmyra
              </label>

              <div className="flex gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 transition focus-within:border-red-500/70 sm:px-4">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 shrink-0 text-zinc-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="10.8" cy="10.8" r="6.8" />
                    <path d="m16 16 4.5 4.5" />
                  </svg>

                  <input
                    id="palmyra-navbar-search"
                    autoFocus
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search videos and products..."
                    className="min-w-0 flex-1 bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-zinc-600"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 sm:px-6"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        )}
      </header>

      {/* MOBILE MENU BACKDROP */}
      {menuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeMenu}
          className="fixed inset-0 z-[60] cursor-default bg-black/75 backdrop-blur-sm"
        />
      )}

      {/* SLIDE-OUT MENU */}
      <aside
        id="palmyra-side-menu"
        aria-label="Palmyra navigation menu"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
        className={`fixed left-0 top-0 z-[70] flex h-dvh w-[310px] max-w-[88vw] flex-col border-r border-white/10 bg-[#090909] text-white shadow-2xl shadow-black/60 transition-transform duration-300 ease-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* DRAWER BRAND HEADER */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-5">
          <Link
            href="/"
            onClick={closeMenu}
            className="flex items-center gap-3"
          >
            <img
              src="/logo.png"
              alt=""
              className="h-9 w-9 object-contain"
            />

            <div>
              <p className="text-lg font-black tracking-[0.08em]">
                PALMYRA
              </p>
              <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Your world. Your passion.
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close navigation menu"
            tabIndex={menuOpen ? 0 : -1}
            className="flex h-10 w-10 items-center justify-center rounded-full text-2xl text-zinc-400 transition hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            ×
          </button>
        </div>

        {/* ACCOUNT CARD */}
        <div className="border-b border-white/[0.08] p-4">
          {authLoading ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="h-3 w-28 animate-pulse rounded bg-white/10" />
              <div className="mt-3 h-3 w-40 animate-pulse rounded bg-white/[0.06]" />
            </div>
          ) : user ? (
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-red-500/25 bg-red-600/15 text-red-400">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21a8 8 0 0 1 16 0" />
                  </svg>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Welcome back
                  </p>
                  <p className="mt-1 truncate text-sm font-bold text-white">
                    {memberName}
                  </p>
                  <p className="mt-1 truncate text-xs text-zinc-500">
                    {user.email}
                  </p>
                </div>
              </div>

              <Link
                href="/profile"
                onClick={closeMenu}
                tabIndex={menuOpen ? 0 : -1}
                className="mt-4 flex items-center justify-between rounded-xl bg-red-600 px-4 py-3 text-sm font-bold transition hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                My Profile
                <span aria-hidden="true">→</span>
              </Link>

              <Link
                href="/orders"
                onClick={closeMenu}
                tabIndex={menuOpen ? 0 : -1}
                className="mt-2 flex items-center justify-between rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                My Orders
                <span aria-hidden="true" className="text-zinc-500">
                  →
                </span>
              </Link>

              <button
                type="button"
                onClick={() => void handleSignOut()}
                disabled={signingOut}
                tabIndex={menuOpen ? 0 : -1}
                className="mt-2 w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {signingOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-4">
              <p className="text-base font-bold">Welcome to Palmyra</p>
              <p className="mt-1 text-sm leading-6 text-zinc-500">
                Sign in or create an account to manage your profile and orders.
              </p>

              <Link
                href="/login"
                onClick={closeMenu}
                tabIndex={menuOpen ? 0 : -1}
                className="mt-4 block rounded-xl bg-red-600 px-4 py-3 text-center text-sm font-bold transition hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                Login
              </Link>

              <Link
                href="/register"
                onClick={closeMenu}
                tabIndex={menuOpen ? 0 : -1}
                className="mt-2 block rounded-xl border border-white/15 px-4 py-3 text-center text-sm font-semibold text-zinc-200 transition hover:border-white/30 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>

        {/* MAIN NAVIGATION */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-5">
          <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
            Explore
          </p>

          {mainLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              tabIndex={menuOpen ? 0 : -1}
              onClick={closeMenu}
              className="group flex items-center justify-between rounded-xl border border-transparent px-4 py-3.5 text-sm font-medium text-zinc-300 transition duration-200 hover:border-white/[0.06] hover:bg-white/[0.04] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <span>{item.label}</span>

              {item.label === "Cart" && ready && cartCount > 0 ? (
                <span className="rounded-full border border-red-500/20 bg-red-600/10 px-2.5 py-1 text-xs font-bold text-red-400">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              ) : (
                <span className="text-zinc-700 transition group-hover:translate-x-0.5 group-hover:text-red-400">
                  →
                </span>
              )}
            </Link>
          ))}

          <div className="my-4 border-t border-white/[0.08]" />

          <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
            Information
          </p>

          {secondaryLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              tabIndex={menuOpen ? 0 : -1}
              onClick={closeMenu}
              className="rounded-xl px-4 py-3 text-sm text-zinc-500 transition hover:bg-white/[0.04] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* DRAWER FOOTER */}
        <div className="border-t border-white/[0.08] px-6 py-5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Your world. Your passion.
            </p>
          </div>
          <p className="mt-2 text-[11px] text-zinc-700">
            © 2026 Palmyra. All rights reserved.
          </p>
        </div>
      </aside>
    </>
  );
}
