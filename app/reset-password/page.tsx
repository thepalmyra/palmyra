
"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function checkSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!active) return;

      setAuthorized(!error && Boolean(data.session));
      setChecking(false);
    }

    void checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setAuthorized(Boolean(session));
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    setMessage("");
    setSuccess(false);

    if (!authorized) {
      setMessage("Your reset session has expired. Request a new reset link.");
      return;
    }

    if (password.length < 8 || password.length > 128) {
      setMessage("Your password must be between 8 and 128 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("The passwords do not match.");
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setMessage(error.message);
        return;
      }

      setPassword("");
      setConfirmPassword("");
      setSuccess(true);
      setMessage("Your Palmyra password has been updated successfully.");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
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
          Account security
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Create a new password
        </h1>
        <p className="mt-3 text-sm leading-6 text-neutral-400">
          Choose a strong password you don't use on other websites.
        </p>

        {checking ? (
          <p className="mt-7 text-sm text-neutral-400">
            Checking your secure reset session...
          </p>
        ) : success ? (
          <div className="mt-7">
            <div
              role="status"
              className="rounded-xl border border-green-500/25 bg-green-500/[0.07] p-4 text-sm leading-6 text-green-300"
            >
              {message}
            </div>
            <Link
              href="/login"
              className="mt-5 block rounded-xl bg-red-600 px-5 py-3.5 text-center text-sm font-bold hover:bg-red-500"
            >
              Continue to sign in
            </Link>
          </div>
        ) : !authorized ? (
          <div className="mt-7">
            <p className="rounded-xl border border-red-500/25 bg-red-500/[0.07] p-4 text-sm leading-6 text-red-200">
              {message ||
                "This reset link is invalid, expired, or has already been used. Request a new one to continue."}
            </p>
            <Link
              href="/forgot-password"
              className="mt-5 block rounded-xl bg-red-600 px-5 py-3.5 text-center text-sm font-bold hover:bg-red-500"
            >
              Request a new reset link
            </Link>
          </div>
        ) : (
          <>
            {message && (
              <div
                role="alert"
                className="mt-6 rounded-xl border border-red-500/25 bg-red-500/[0.07] p-4 text-sm leading-6 text-red-200"
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold">
                  New password
                </label>
                <div className="flex overflow-hidden rounded-xl border border-white/10 bg-black/40 focus-within:border-red-500">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={128}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    className="min-h-[52px] min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="px-4 text-sm text-neutral-400 hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold">
                  Confirm new password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={128}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Enter it again"
                  className="min-h-[52px] w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none placeholder:text-neutral-600 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                />
              </div>

              <button
                type="submit"
                disabled={saving || !password || !confirmPassword}
                className="w-full rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-5 py-3.5 text-sm font-bold hover:from-red-500 hover:to-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Updating password..." : "Update password"}
              </button>
            </form>
          </>
        )}

        <p className="mt-7 text-center text-sm text-neutral-400">
          <Link href="/login" className="font-semibold text-red-400 hover:text-red-300">
            Back to sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
