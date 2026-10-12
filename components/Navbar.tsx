"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between gap-3 px-4 py-4 bg-black border-b border-zinc-800">

  <div className="flex items-center gap-3">

    <button
   onClick={() => setMenuOpen(true)}
   className="text-white text-3xl mr-2 relative z-[60]"
  >
   ☰
 </button>

   <Link href="/" className="flex items-center gap-2">
      <img
        src="/logo.png"
        alt="Palmyra"
        className="w-10 h-10"
      />

      <h1 className="text-2xl md:text-3xl font-bold text-red-600">
        Palmyra
      </h1>
    </Link>

  </div>

        <div className="relative">
          <input
           type="text"
           placeholder="Search videos..."
           value={search}
           onChange={(e) => setSearch(e.target.value)}
           className="bg-zinc-900 border border-zinc-700 rounded-full px-10 py-2 w-32 sm:w-48 md:w-72 focus:outline-none focus:border-red-600"
          />

          <span className="absolute left-3 top-2.5 text-gray-400">
            ⌕
          </span>
        </div>

      </header>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setMenuOpen(false)}
          />

          <div className="fixed left-0 top-0 h-full w-64 bg-zinc-950 z-50">

  <button
  onClick={() => setMenuOpen(false)}
  className="text-white text-3xl p-5"
>
  ✕
</button>

            <nav className="flex flex-col gap-6 px-6 mt-10">

    <Link href="/" className="text-white hover:text-red-500">
      Home
    </Link>

    <Link href="/watch" className="text-white hover:text-red-500">
      Watch
    </Link>

    <Link href="/store" className="text-white hover:text-red-500">
      Store
    </Link>

    <Link href="/profile" className="text-white hover:text-red-500">
      Profile
    </Link>

    <Link href="/cart" className="text-white hover:text-red-500">
      Cart
    </Link>

    <Link href="/about" className="text-white hover:text-red-500">
      About
    </Link>

    <Link href="/privacy" className="text-white hover:text-red-500">
      Privacy
    </Link>

  </nav>

          </div>
        </>
      )}
    </>
  );
}