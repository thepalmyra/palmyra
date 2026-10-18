
"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const query = search.trim();
    if (!query) return;

    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  }

  return (
    <>
      {/* MAIN NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 text-white backdrop-blur-xl">
        <nav className="relative flex h-[68px] items-center justify-between px-4 md:px-8">

          {/* LEFT: MENU */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/10"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          {/* CENTER: PALMYRA BRAND */}
          <Link
            href="/"
            aria-label="Palmyra Home"
            className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2"
          >
            <img
              src="/logo.png"
              alt=""
              className="h-9 w-9 object-contain"
            />
            <span className="text-xl font-black tracking-[0.08em] text-white sm:text-2xl">
              Palmyra
            </span>
          </Link>

          {/* RIGHT: SEARCH + CART */}
          <div className="ml-auto flex items-center gap-1 sm:gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Open search"
              className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/10"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <circle cx="10.8" cy="10.8" r="6.8" />
                <path d="m16 16 4.5 4.5" />
              </svg>
            </button>

            <Link
              href="/cart"
              aria-label="Shopping cart"
              className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/10"
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
            </Link>
          </div>
        </nav>

        {/* SEARCH PANEL */}
        {searchOpen && (
          <form
            onSubmit={handleSearch}
            className="border-t border-white/10 bg-zinc-950 px-4 py-4"
          >
            <div className="mx-auto flex max-w-2xl gap-3">
              <input
                autoFocus
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search videos and products..."
                className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-red-600"
              />
              <button
                type="submit"
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold transition hover:bg-red-700"
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
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-[60] cursor-default bg-black/70 backdrop-blur-sm"
        />
      )}

      {/* SIDE MENU */}
      <aside
        className={`fixed left-0 top-0 z-[70] flex h-dvh w-[290px] max-w-[85vw] flex-col border-r border-white/10 bg-zinc-950 text-white shadow-2xl transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!menuOpen}
      >
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
            aria-label="Close menu"
            className="flex h-10 w-10 items-center justify-center rounded-full text-2xl text-zinc-400 transition hover:bg-white/10 hover:text-white"
          >
            ×
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-6">
          {[
            { label: "Home", href: "/" },
            { label: "Watch", href: "/watch" },
            { label: "Store", href: "/store" },
            { label: "Profile", href: "/profile" },
            { label: "Cart", href: "/cart" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3.5 text-sm font-medium text-zinc-300 transition hover:bg-white/5 hover:text-red-500"
            >
              {item.label}
            </Link>
          ))}

          <div className="my-3 border-t border-white/10" />

          {[
            { label: "About", href: "/about" },
            { label: "Privacy", href: "/privacy" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-sm text-zinc-500 transition hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/10 px-6 py-5">
          <p className="text-xs tracking-[0.2em] text-zinc-600">
            YOUR WORLD. YOUR PASSION.
          </p>
        </div>
      </aside>
    </>
  );
}
