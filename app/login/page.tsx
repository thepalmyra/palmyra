"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Authentication is not connected yet. Please connect Supabase Auth.");
  }

  return (
    <main className="min-h-screen bg-black px-5 py-12 text-white">
      <div className="mx-auto max-w-md">
        <Link href="/" className="text-xl font-bold text-red-500">
          PALMYRA
        </Link>

        <div className="mt-10 rounded-2xl border border-white/10 bg-zinc-950 p-8">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="mt-2 text-gray-400">Login to your Palmyra account.</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm">Email</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-black px-4 py-3 outline-none focus:border-red-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm">Password</label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-black px-4 py-3 outline-none focus:border-red-500"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-red-600 px-4 py-3 font-semibold hover:bg-red-700"
            >
              Login
            </button>

            {message && (
              <p role="status" className="text-sm text-yellow-400">{message}</p>
            )}
          </form>

          <p className="mt-6 text-sm text-gray-400">
            New to Palmyra?{" "}
            <Link href="/register" className="text-red-500 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}