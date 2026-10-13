"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function loadProfile() {
      const { data, error } = await supabase.auth.getUser();

      if (!active) return;

      if (error) {
        setError("Unable to load your profile. Please try again.");
      } else {
        setUser(data.user);
      }

      setLoading(false);
    }

    loadProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      setError(error.message);
      return;
    }

    setUser(null);
    router.push("/login");
    router.refresh();
  }

  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    "Palmyra Member";

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

          {loading ? (
            <p className="mt-6 text-gray-400">Loading profile...</p>
          ) : user ? (
            <>
              <h2 className="mt-6 text-xl font-semibold">{fullName}</h2>
              <p className="mt-2 break-words text-sm text-gray-400">
                {user.email}
              </p>

              <p className="mt-4 text-green-400">
                You are signed in.
              </p>

              <Link
                href="/store"
                className="mt-6 block rounded-lg border border-white/20 px-4 py-3 font-semibold hover:bg-white/10"
              >
                Continue Shopping
              </Link>

              <button
                onClick={handleSignOut}
                className="mt-3 w-full rounded-lg bg-red-600 px-4 py-3 font-semibold hover:bg-red-700"
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

          {error && (
            <p role="alert" className="mt-4 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
