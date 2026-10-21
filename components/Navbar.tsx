"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { items, ready } = useCart();

  const cartCount = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  useEffect(() => {
    if (!menuOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const query = search.trim();
    if (!query) return;

    setSearchOpen(false);
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  }

  const mainLinks = [
    { label: "Home", href: "/" },
    { label: "Watch", href: "/watch" },
    { label: "Store", href: "/store" },
    { label: "Profile", href: "/profile" },
    { label: "Cart", href: "/cart" },
  ];

  const secondaryLinks = [
    { label: "About", href: "/about" },
    { label: "Privacy", href: "/privacy" },
  ];

  return (
    <>
      {/* MAIN NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 text-white shadow-lg shadow-black/10 backdrop-blur-xl">
        <nav
          className="relative flex h-[68px] items-center justify-between px-3 sm:px-5 md:px-8"
          aria-label="Main navigation"
        >
          {/* LEFT: MENU */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            aria-controls="palmyra-side-menu"
            className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          {/* CENTER: PALMYRA BRAND */}
          <Link
            href="/"
            aria-label="Palmyra Home"
            className="absolute left-1/2 flex max-w-[calc(100%-150px)] -translate-x-1/2 items-center gap-1.5 sm:gap-2"
          >
            <img
              src="/logo.png"
              alt=""
              className="h-8 w-8 shrink-0 object-contain sm:h-9 sm:w-9"
            />
            <span className="truncate text-lg font-black tracking-[0.06em] text-white sm:text-2xl sm:tracking-[0.08em]">
              Palmyra
            </span>
          </Link>

          {/* RIGHT: SEARCH + CART */}
          <div className="relative z-10 ml-auto flex shrink-0 items-center gap-0.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen((open) => !open)}
              aria-label={searchOpen ? "Close search" : "Open search"}
              aria-expanded={searchOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
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
                >
                  <circle cx="10.8" cy="10.8" r="6.8" />
                  <path d="m16 16 4.5 4.5" />
                </svg>
              )}
            </button>

            <Link
              href="/cart"
              aria-label={
                ready && cartCount > 0
                  ? `Shopping cart, ${cartCount} items`
                  : "Shopping cart"
              }
              className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
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
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-black">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </div>
        </nav>

        {/* SEARCH PANEL */}
        {searchOpen && (
          <form
            onSubmit={handleSearch}
            role="search"
            className="border-t border-white/10 bg-zinc-950 px-3 py-4 sm:px-4"
          >
            <div className="mx-auto flex max-w-2xl gap-2 sm:gap-3">
              <input
                autoFocus
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search videos and products..."
                aria-label="Search videos and products"
                className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-red-600 sm:px-4"
              />

              <button
                type="submit"
                className="shrink-0 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 sm:px-5"
              >
                Search
              </button>
            </div>
          </form>
        )}
      </header>

      {/* BACKDROP */}
      {menuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-[60] cursor-default bg-black/70 backdrop-blur-sm"
        />
      )}

      {/* SIDE MENU */}
      <aside
        id="palmyra-side-menu"
        aria-label="Palmyra navigation menu"
        aria-hidden={!menuOpen}
        className={`fixed left-0 top-0 z-[70] flex h-dvh w-[290px] max-w-[85vw] flex-col border-r border-white/10 bg-zinc-950 text-white shadow-2xl transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        inert={!menuOpen}
      >
        {/* MENU HEADER */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3"
          >
            <img
              src="/logo.png"
              alt=""
              className="h-9 w-9 object-contain"
            />
            <span className="text-xl font-black tracking-wide">
              Palmyra
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation menu"
            tabIndex={menuOpen ? 0 : -1}
            className="flex h-10 w-10 items-center justify-center rounded-full text-2xl text-zinc-400 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            ×
          </button>
        </div>

        {/* MAIN LINKS */}
        <nav className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-6">
          {mainLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              tabIndex={menuOpen ? 0 : -1}
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium text-zinc-300 transition hover:bg-white/5 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <span>{item.label}</span>

              {item.label === "Cart" && ready && cartCount > 0 && (
                <span className="rounded-full bg-red-600/15 px-2 py-1 text-xs font-bold text-red-400">
                  {cartCount}
                </span>
              )}
            </Link>
          ))}

          <div className="my-3 border-t border-white/10" />

          {secondaryLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              tabIndex={menuOpen ? 0 : -1}
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-sm text-zinc-500 transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* MENU FOOTER */}
        <div className="border-t border-white/10 px-6 py-5">
          <p className="text-xs tracking-[0.2em] text-zinc-600">
            YOUR WORLD. YOUR PASSION.
          </p>
        </div>
      </aside>
    </>
  );
}