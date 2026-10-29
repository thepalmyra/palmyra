
"use client";

import Link from "next/link";
import {
  Suspense,
  useState,
  type FormEvent,
  type SVGProps,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function ArrowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function EyeIcon({
  visible,
  ...props
}: SVGProps<SVGSVGElement> & { visible: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {visible ? (
        <>
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="m3 3 18 18" />
          <path d="M10.6 5.2A10.9 10.9 0 0 1 12 5c6.4 0 10 7 10 7a16 16 0 0 1-3.1 3.8M6.2 6.3C3.5 8.1 2 12 2 12s3.6 7 10 7a10 10 0 0 0 4-.8" />
          <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        </>
      )}
    </svg>
  );
}

function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Permit only safe, internal destinations.
  const requestedDestination = searchParams.get("next");

  const destination =
    requestedDestination?.startsWith("/") &&
    !requestedDestination.startsWith("//") &&
    !requestedDestination.includes("\\")
      ? requestedDestination
      : "/profile";

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setMessage("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setMessage(
          error.message ||
            "We couldn't sign you in. Check your details and try again."
        );
        return;
      }

      router.replace(destination);
      router.refresh();
    } catch {
      setMessage(
        "We couldn't connect to the sign-in service. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative isolate flex min-h-screen min-h-[100dvh] items-center justify-center overflow-hidden bg-[#080808] px-4 py-8 text-white selection:bg-red-500/30 sm:px-6 lg:px-8">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-40 -z-10 h-[480px] w-[480px] rounded-full bg-red-700/[0.12] blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 -right-40 -z-10 h-[520px] w-[520px] rounded-full bg-red-950/30 blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="w-full max-w-[1080px]">
        {/* Brand outside the card on mobile */}
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            aria-label="Palmyra home"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-xl font-black shadow-lg shadow-red-950/40">
              P
            </span>
            <span className="text-base font-extrabold tracking-[0.22em]">
              PALMYRA<span className="text-red-500">.</span>
            </span>
          </Link>

          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
            Account access
          </span>
        </div>

        <div className="grid overflow-hidden rounded-[26px] border border-white/[0.10] bg-[#101010]/95 shadow-[0_30px_120px_rgba(0,0,0,0.65)] backdrop-blur-xl lg:grid-cols-[1.02fr_0.98fr]">
          {/* Brand panel */}
          <section className="relative hidden min-h-[690px] flex-col justify-between overflow-hidden border-r border-white/[0.07] bg-[#0d0d0d] p-10 xl:p-12 lg:flex">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_12%,rgba(225,29,46,0.18),transparent_47%),linear-gradient(145deg,#171010_0%,#0d0d0d_58%,#11090a_100%)]"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-32 top-28 h-[410px] w-[410px] rounded-full border border-red-500/[0.09]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 top-40 h-[310px] w-[310px] rounded-full border border-red-500/[0.12]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-8 top-52 h-[210px] w-[210px] rounded-full border border-red-500/[0.16]"
            />

            <Link
              href="/"
              className="relative z-10 inline-flex w-fit items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              aria-label="Palmyra home"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-800 text-2xl font-black shadow-xl shadow-red-950/50">
                P
              </span>
              <span className="text-lg font-extrabold tracking-[0.28em]">
                PALMYRA<span className="text-red-500">.</span>
              </span>
            </Link>

            <div className="relative z-10 max-w-[420px] py-10">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/[0.07] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-red-300">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Your world, your Palmyra
              </div>

              <h1 className="text-[46px] font-bold leading-[1.12] tracking-[-0.045em] xl:text-[54px]">
                Everything
                <br />
                starts with
                <br />
                <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-700 bg-clip-text text-transparent">
                  your account.
                </span>
              </h1>

              <p className="mt-7 max-w-[350px] text-[14px] leading-7 text-neutral-400">
                Sign in to continue your Palmyra experience, explore the
                collection, and keep track of your orders in one place.
              </p>

              <div className="mt-10 grid max-w-[360px] grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                    <ShieldIcon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-neutral-100">
                    Secure access
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-neutral-500">
                    Your account, protected.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-neutral-300">
                    <ArrowIcon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-neutral-100">
                    Easy access
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-neutral-500">
                    Continue where you left off.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between gap-4 border-t border-white/[0.08] pt-6">
              <p className="text-xs text-neutral-500">
                © {new Date().getFullYear()} Palmyra
              </p>
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
                Made for your experience
              </span>
            </div>
          </section>

          {/* Sign-in form */}
          <section className="flex min-w-0 flex-col justify-center p-6 sm:p-10 lg:p-11 xl:p-14">
            <div className="mb-9 hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 lg:flex">
              <span className="h-px w-7 bg-red-500" />
              Welcome to Palmyra
            </div>

            <div className="mb-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.23em] text-red-400">
                Your account
              </p>

              <h2 className="mt-3 text-[32px] font-bold leading-tight tracking-[-0.04em] sm:text-[38px]">
                Welcome back<span className="text-red-500">.</span>
              </h2>

              <p className="mt-3 max-w-sm text-sm leading-6 text-neutral-400">
                Enter your email and password to securely access your account.
              </p>
            </div>

            {destination === "/admin" && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4">
                <ShieldIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-100">
                    Administrator sign-in
                  </p>
                  <p className="mt-1 text-xs leading-5 text-neutral-400">
                    Use your existing administrator account to continue to
                    the store dashboard. Access is verified separately.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2.5 block text-[13px] font-semibold text-neutral-200"
                >
                  Email address
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-neutral-500">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-[18px] w-[18px]"
                      aria-hidden="true"
                    >
                      <rect x="3" y="5" width="18" height="14" rx="2.5" />
                      <path d="m4 7 8 6 8-6" />
                    </svg>
                  </span>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    autoFocus={false}
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (message) setMessage("");
                    }}
                    placeholder="you@example.com"
                    className="min-h-[52px] w-full min-w-0 rounded-xl border border-white/[0.10] bg-black/40 py-3.5 pl-12 pr-4 text-[14px] text-white outline-none transition duration-200 placeholder:text-neutral-600 hover:border-white/[0.17] focus:border-red-500 focus:bg-black/60 focus:ring-4 focus:ring-red-500/[0.08]"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2.5 flex items-center justify-between gap-3">
                  <label
                    htmlFor="password"
                    className="text-[13px] font-semibold text-neutral-200"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-md text-xs font-medium text-neutral-400 transition hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    <EyeIcon
                      visible={showPassword}
                      className="h-4 w-4"
                    />
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-neutral-500">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-[18px] w-[18px]"
                      aria-hidden="true"
                    >
                      <rect x="4" y="10" width="16" height="11" rx="2" />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                      <path d="M12 14v3" />
                    </svg>
                  </span>

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (message) setMessage("");
                    }}
                    placeholder="Enter your password"
                    className="min-h-[52px] w-full min-w-0 rounded-xl border border-white/[0.10] bg-black/40 py-3.5 pl-12 pr-4 text-[14px] text-white outline-none transition duration-200 placeholder:text-neutral-600 hover:border-white/[0.17] focus:border-red-500 focus:bg-black/60 focus:ring-4 focus:ring-red-500/[0.08]"
                  />
                </div>

                {/* Password recovery link */}
                <div className="mt-3 flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="rounded-md text-xs font-semibold text-red-400 underline-offset-4 transition hover:text-red-300 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {message && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/[0.07] p-4 text-sm leading-6 text-red-200"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/15 font-bold text-red-300">
                    !
                  </span>
                  <p className="min-w-0 break-words">{message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex min-h-[53px] w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-950/30 transition duration-200 hover:from-red-500 hover:to-red-600 hover:shadow-red-950/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-none"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing you in...
                  </>
                ) : (
                  <>
                    Sign in to Palmyra
                    <ArrowIcon className="h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/[0.09]" />
              <span className="whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.17em] text-neutral-600">
                Your Palmyra account
              </span>
              <div className="h-px flex-1 bg-white/[0.09]" />
            </div>

            <p className="text-center text-sm leading-6 text-neutral-400">
              New to Palmyra?{" "}
              <Link
                href="/register"
                className="font-semibold text-red-400 underline-offset-4 transition hover:text-red-300 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                Create an account
              </Link>
            </p>

            <div className="mt-8 flex items-start justify-center gap-2 border-t border-white/[0.07] pt-6 text-center text-xs leading-5 text-neutral-500">
              <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
              <p className="max-w-[290px]">
                Your sign-in is handled by Palmyra's authentication service.
                Never share your password with anyone.
              </p>
            </div>

            <Link
              href="/"
              className="mt-6 inline-flex items-center justify-center gap-2 self-center rounded-md text-xs font-medium text-neutral-500 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <span aria-hidden="true">←</span>
              Return to Palmyra
            </Link>
          </section>
        </div>

        <p className="mt-5 text-center text-[10px] leading-5 text-neutral-600">
          PALMYRA · YOUR ACCOUNT · YOUR EXPERIENCE
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen min-h-[100dvh] items-center justify-center bg-[#080808] px-5 text-white">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-2xl font-black shadow-lg shadow-red-950/40">
              P
            </div>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-red-500" />
            <p className="text-sm text-neutral-400">
              Preparing your secure sign-in...
            </p>
          </div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
