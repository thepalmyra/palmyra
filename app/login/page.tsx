"use client";

import Link from "next/link";
import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Only allow safe internal destinations.
  const requestedDestination = searchParams.get("next");
  const destination =
    requestedDestination?.startsWith("/") &&
    !requestedDestination.startsWith("//") &&
    !requestedDestination.includes("\\")
      ? requestedDestination
      : "/store";

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      router.replace(destination);
      router.refresh();
    } catch {
      setMessage("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080808] px-4 py-10 text-white">
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-red-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-red-900/15 blur-[120px]" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#101010] shadow-2xl lg:grid-cols-2">
        <section className="relative hidden min-h-[620px] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#35090c] via-[#16090a] to-[#0c0c0c] p-10 lg:flex">
          <div className="absolute -right-20 top-20 h-72 w-72 rounded-full border border-red-500/10" />
          <div className="absolute -right-10 top-32 h-52 w-52 rounded-full border border-red-500/15" />

          <Link href="/" className="relative flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-2xl font-black shadow-lg shadow-red-950">
              P
            </span>
            <span className="text-lg font-bold tracking-[0.3em]">
              PALMYRA
            </span>
          </Link>

          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-red-400">
              Welcome to Palmyra
            </p>
            <h1 className="mt-5 text-5xl font-bold leading-tight tracking-tight">
              Your next
              <br />
              experience
              <br />
              <span className="text-red-500">starts here.</span>
            </h1>
            <p className="mt-6 max-w-sm text-sm leading-7 text-gray-400">
              Sign in to access your account, explore the collection and
              manage your orders.
            </p>
          </div>

          <p className="relative text-xs text-gray-500">
            © {new Date().getFullYear()} Palmyra. All rights reserved.
          </p>
        </section>

        <section className="p-6 sm:p-10 lg:p-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white lg:hidden"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 font-black text-white">
              P
            </span>
            PALMYRA
          </Link>

          <div className="mb-8 mt-8 lg:mt-10">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
              Your account
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome back<span className="text-red-500">.</span>
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-400">
              Enter your details to securely sign in.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                autoCapitalize="none"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-300"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="text-xs font-medium text-red-400 transition hover:text-red-300"
                >
                  {showPassword ? "Hide password" : "Show password"}
                </button>
              </div>

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
              />
            </div>

            {message && (
              <div
                role="alert"
                className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm leading-6 text-red-300"
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3.5 text-sm font-bold transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing you in..." : "Sign in to Palmyra"}
              {!loading && (
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              )}
            </button>
          </form>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] uppercase tracking-widest text-gray-600">
              Palmyra account
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <p className="text-center text-sm text-gray-400">
            New to Palmyra?{" "}
            <Link
              href="/register"
              className="font-semibold text-red-400 transition hover:text-red-300"
            >
              Create an account
            </Link>
          </p>

          <p className="mt-8 text-center text-xs leading-5 text-gray-600">
            Your account details are handled securely.
          </p>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#080808] text-white">
          <p className="text-sm text-gray-400">Loading sign-in...</p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}