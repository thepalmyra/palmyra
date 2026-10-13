"use client";

import Link from "next/link";
import { useState } from "react";

export default function ProfilePage() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <main className="min-h-screen bg-black px-5 py-12 text-white">
      <div className="mx-auto max-w-md">
        <Link href="/" className="text-xl font-bold text-red-500">
          PALMYRA
        </Link>

        <div className="mt-10 rounded-2xl border border-white/10 bg-zinc-950 p-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800 text-3xl">
            👤
          </div>

          <h1 className="mt-5 text-3xl font-bold">My Profile</h1>
          <p className="mt-2 text-sm text-gray-400">
            Your Palmyra account
          </p>

          {loggedIn ? (
            <>
              <p className="mt-6 text-green-400">
                You are signed in for this session.
              </p>
              <button
                onClick={() => setLoggedIn(false)}
                className="mt-6 w-full rounded-lg bg-red-600 px-4 py-3 font-semibold hover:bg-red-700"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <p className="mt-6 text-gray-300">
                Sign in or create an account to get started.
              </p>

              <Link
                href="/login"
                className="mt-6 block rounded-lg bg-red-600 px-4 py-3 font-semibold hover:bg-red-700"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="mt-3 block rounded-lg border border-white/20 px-4 py-3 font-semibold hover:bg-white/10"
              >
                Create Account
              </Link>

              <Link
                href="/store"
                className="mt-6 inline-block text-sm text-gray-400 hover:text-white"
              >
                Continue Shopping →
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}