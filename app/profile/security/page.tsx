
"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

function passwordStrength(value: string) {
  if (!value) return { score: 0, label: "Enter a password" };

  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  if (score <= 1) return { score, label: "Weak" };
  if (score <= 3) return { score, label: "Fair" };
  return { score, label: "Strong" };
}

export default function SecurityPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);
  const [signingOutAll, setSigningOutAll] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const supabase = createClient();
  const strength = passwordStrength(password);
  const verified = Boolean(user?.email_confirmed_at);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();
      if (!active) return;

      if (error) {
        console.error("Security page authentication check:", error.message);
      }

      setUser(data.user ?? null);
      setLoading(false);
    }

    void loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSuccess(false);

    if (!user) {
      setMessage("Please sign in again to change your password.");
      return;
    }

    if (password.length < 8) {
      setMessage("Your new password must be at least 8 characters.");
      return;
    }

    if (password.length > 128) {
      setMessage("Your password must be 128 characters or fewer.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("The passwords do not match.");
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await supabase.auth.updateUser({ password });

      if (error) {
        setMessage(error.message);
        return;
      }

      if (data.user) setUser(data.user);
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirm(false);
      setSuccess(true);
      setMessage("Your password has been updated successfully.");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function resendVerification() {
    setMessage("");
    setSuccess(false);

    if (!user?.email) {
      setMessage("We couldn't find an email address for this account.");
      return;
    }

    setResending(true);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setSuccess(true);
      setMessage("Verification email requested. Check your inbox and spam folder.");
    } catch {
      setMessage("Unable to request a verification email. Please try again later.");
    } finally {
      setResending(false);
    }
  }

  async function signOutAllDevices() {
    setMessage("");
    setSuccess(false);
    setSigningOutAll(true);

    try {
      // Global scope ends this session and other sessions for this user.
      const { error } = await supabase.auth.signOut({ scope: "global" });

      if (error) {
        setMessage(error.message);
        return;
      }

      router.replace("/login");
      router.refresh();
    } catch {
      setMessage("Unable to sign out all devices. Please try again.");
    } finally {
      setSigningOutAll(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="animate-pulse text-sm text-zinc-400">
          Loading security settings...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-5 text-white">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-8 text-center">
          <h1 className="text-2xl font-bold">Sign in required</h1>
          <p className="mt-3 text-sm text-zinc-400">
            Sign in to manage your Palmyra account security.
          </p>
          <Link
            href="/login"
            className="mt-6 block rounded-xl bg-red-600 px-5 py-3 font-semibold hover:bg-red-700"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-6 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <Link href="/profile" className="text-sm text-zinc-400 hover:text-white">
          ← Back to Profile
        </Link>

        <header className="mt-7">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-400">
            Palmyra account
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Account Security
          </h1>
          <p className="mt-3 leading-7 text-zinc-400">
            Manage your password, email verification and sign-in sessions.
          </p>
        </header>

        {message && (
          <div
            role={success ? "status" : "alert"}
            className={`mt-6 rounded-xl border p-4 text-sm ${
              success
                ? "border-green-500/30 bg-green-950/20 text-green-300"
                : "border-red-500/30 bg-red-950/30 text-red-300"
            }`}
          >
            {message}
          </div>
        )}

        <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-950 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-red-600/15 text-xl font-black text-red-300">
              {user.email?.[0]?.toUpperCase() ?? "P"}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold">Email verification</h2>
              <p className="mt-1 break-all text-sm text-zinc-400">
                {user.email}
              </p>
            </div>
            <span
              className={`w-fit rounded-full border px-3 py-1.5 text-xs ${
                verified
                  ? "border-green-500/25 bg-green-500/10 text-green-300"
                  : "border-amber-500/25 bg-amber-500/10 text-amber-300"
              }`}
            >
              {verified ? "Verified" : "Not verified"}
            </span>
          </div>

          {verified ? (
            <p className="mt-5 text-sm text-zinc-400">
              Your email address is verified.
            </p>
          ) : (
            <>
              <p className="mt-5 text-sm leading-6 text-zinc-400">
                Request a new verification email if you haven't received one.
                Check your spam folder too.
              </p>
              <button
                type="button"
                onClick={resendVerification}
                disabled={resending || !user.email}
                className="mt-4 rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold hover:border-red-500 disabled:opacity-50"
              >
                {resending ? "Requesting email..." : "Resend verification email"}
              </button>
            </>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-zinc-950 p-6 sm:p-8">
          <h2 className="text-xl font-bold">Change password</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Use a unique password that you don't use on other websites.
          </p>

          <form onSubmit={updatePassword} className="mt-6 space-y-5">
            <div>
              <label htmlFor="newPassword" className="mb-2 block text-sm text-zinc-300">
                New password
              </label>
              <div className="flex overflow-hidden rounded-xl border border-white/15 bg-black focus-within:border-red-500">
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={128}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter a new password"
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="px-4 text-sm text-zinc-400 hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Password strength</span>
                  <span className={
                    strength.label === "Strong"
                      ? "text-green-300"
                      : strength.label === "Fair"
                        ? "text-amber-300"
                        : "text-zinc-400"
                  }>
                    {strength.label}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-5 gap-1.5" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((part) => (
                    <div
                      key={part}
                      className={`h-1.5 rounded-full ${
                        part <= strength.score
                          ? strength.score >= 4
                            ? "bg-green-500"
                            : strength.score >= 2
                              ? "bg-amber-500"
                              : "bg-red-500"
                          : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  Aim for 12+ characters, mixed case, a number and a symbol.
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm text-zinc-300">
                Confirm new password
              </label>
              <div className="flex overflow-hidden rounded-xl border border-white/15 bg-black focus-within:border-red-500">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={128}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Enter the password again"
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((value) => !value)}
                  className="px-4 text-sm text-zinc-400 hover:text-white"
                  aria-label={showConfirm ? "Hide confirmation" : "Show confirmation"}
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="mt-2 text-xs text-red-300">
                  The passwords do not match yet.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={saving || !password || !confirmPassword}
              className="w-full rounded-xl bg-red-600 px-5 py-3 font-semibold hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Updating password..." : "Update password"}
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-zinc-950 p-6 sm:p-8">
          <h2 className="text-xl font-bold">Sign-in sessions</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            If you think someone else may have access to your account, sign out
            all sessions. You'll need to sign in again on this device too.
          </p>
          <button
            type="button"
            onClick={signOutAllDevices}
            disabled={signingOutAll}
            className="mt-5 rounded-xl border border-red-500/40 px-5 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-50"
          >
            {signingOutAll ? "Signing out..." : "Sign out all devices"}
          </button>
          <p className="mt-3 text-xs leading-5 text-zinc-500">
            For security, this page doesn't display a list of devices or IP addresses.
          </p>
        </section>

        <footer className="mt-10 border-t border-white/10 py-6 text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} Palmyra. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
