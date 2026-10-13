
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: signupError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (signupError) {
        setError(signupError.message);
        return;
      }

      if (data.session) {
        router.push("/store");
        router.refresh();
        return;
      }

      setMessage(
        "Your registration was submitted. Check your email for a confirmation link before logging in."
      );
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-12 text-white">
      <div className="w-full max-w-md">
        <Link
          href="/store"
          className="text-sm text-gray-400 hover:text-white"
        >
          ← Back to Palmyra
        </Link>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
          <h1 className="text-3xl font-bold">
            Create Account
          </h1>
          <p className="mt-2 text-gray-400">
            Join Palmyra and create your account.
          </p>

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          {message && (
            <div
              role="status"
              className="mt-5 rounded-lg border border-green-500/40 bg-green-500/10 p-3 text-sm text-green-300"
            >
              {message}
              <Link
                href="/login"
                className="mt-3 block font-semibold text-white underline"
              >
                Go to Login
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="fullName" className="mb-2 block text-sm">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
                maxLength={100}
                className="w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                maxLength={254}
                className="w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                className="w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={8}
                className="w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
                placeholder="Enter your password again"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-red-600 px-5 py-3 font-semibold hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Register"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-white hover:text-red-400"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
