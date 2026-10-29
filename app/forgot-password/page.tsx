
"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const supabase = createClient();

      const redirectTo =
        `${window.location.origin}/auth/callback?next=/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo }
      );

      if (error) {
        setMessage(
          "We couldn't send the reset email. Please check your email address and try again."
        );
        return;
      }

      setSuccess(true);
      setMessage(
        "If an account exists for that email, a password-reset email will be sent. Check your inbox and spam folder."
      );
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen min-h-[100dvh] items-center justify-center bg-[#080808] px-4 py-10 text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-[#101010] p-6 shadow-2xl sm:p-9">
        <Link href="/" className="inline-flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 text-2xl font-black">
            P
          </span>
          <span className="font-extrabold tracking-[0.22em]">
            PALMYRA<span className="text-red-500">.</span>
          </span>
        </Link>

        <p className="mt-9 text-xs font-bold uppercase tracking-[0.2em] text-red-400">
          Account recovery
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Forgot password?
        </h1>
        <p className="mt-3 text-sm leading-6 text-neutral-400">
          Enter the email address associated with your Palmyra account.
          We’ll send you a link to reset your password.
        </p>

        {message && (
          <div
            role={success ? "status" : "alert"}
            className={`mt-6 rounded-xl border p-4 text-sm leading-6 ${
              success
                ? "border-green-500/25 bg-green-500/[0.07] text-green-300"
                : "border-red-500/25 bg-red-500/[0.07] text-red-200"
            }`}
          >
            {message}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="min-h-[52px] w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none placeholder:text-neutral-600 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-5 py-3.5 text-sm font-bold hover:from-red-500 hover:to-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending reset email..." : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-7 text-center text-sm text-neutral-400">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-semibold text-red-400 hover:text-red-300"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
