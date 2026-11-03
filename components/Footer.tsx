
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const INSTAGRAM_URL = "https://www.instagram.com/palmyraofficial/";
const YOUTUBE_URL = "https://www.youtube.com/@palmyraofficial";
const FACEBOOK_URL = "https://www.facebook.com/palmyrastv";
const X_URL = "https://x.com/guerreroisravel";

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v12h14V9" />
        <path d="M9 21v-7h6v7" />
      </>
    ),
  },
  {
    label: "Watch",
    href: "/watch",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m10 9 5 3-5 3V9Z" />
      </>
    ),
  },
  {
    label: "Store",
    href: "/store",
    icon: (
      <>
        <path d="M5 8h14l1 13H4L5 8Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </>
    ),
  },
  {
    label: "Profile",
    href: "/profile",
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
      </>
    ),
  },
];

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Watch", href: "/watch" },
  { label: "Store", href: "/store" },
  { label: "About Palmyra", href: "/about" },
  { label: "My Profile", href: "/profile" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Returns & Refunds", href: "/returns-refund" },
];

type SocialType = "instagram" | "youtube" | "facebook" | "x";

function SocialIcon({ type }: { type: SocialType }) {
  if (type === "instagram") {
    return (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r=".8" fill="currentColor" />
      </>
    );
  }

  if (type === "youtube") {
    return (
      <>
        <rect x="3" y="5" width="18" height="14" rx="4" />
        <path d="m10 9 5 3-5 3V9Z" />
      </>
    );
  }

  if (type === "facebook") {
    return (
      <path d="M14 21v-8h3l.5-4H14V7c0-1.2.4-2 2-2h1.7V1.4C17 1.2 16 1 14.5 1 11.3 1 9 2.9 9 6.5V9H6v4h3v8h5Z" />
    );
  }

  return (
    <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.9 5.8 22H2.7l7.3-8.4L2.3 2h6.5l4.5 6.7L18.9 2Zm-1.1 18h1.7L7.8 3.9H6L17.8 20Z" />
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M14 4h6v6" />
      <path d="m20 4-9 9" />
      <path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" />
    </svg>
  );
}

function InstagramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <SocialIcon type="instagram" />
    </svg>
  );
}

function BackToTopIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="m6 14 6-6 6 6" />
    </svg>
  );
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-white">
      {children}
    </h2>
  );
}

export default function Footer() {
  const pathname = usePathname();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <footer className="relative overflow-hidden border-t border-white/[0.09] bg-[#070707] text-white">
        {/* Decorative background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[min(900px,100%)] -translate-x-1/2 rounded-full bg-red-600/[0.09] blur-[110px]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -right-32 h-80 w-80 rounded-full bg-red-700/[0.07] blur-[110px]"
        />

        <div className="relative mx-auto max-w-7xl px-5 pb-32 pt-12 sm:px-8 sm:pb-12 sm:pt-16 lg:pt-20">
          {/* Customer support banner */}
          <div className="group relative mb-14 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1c1111] via-[#110d0d] to-[#090909] p-5 transition duration-300 hover:border-red-500/30 sm:p-8 lg:mb-16 lg:p-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-red-600/10 blur-[80px] transition group-hover:bg-red-600/20"
            />

            <div className="relative flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-pink-400/20 bg-pink-500/10 text-pink-400 transition group-hover:scale-105">
                  <InstagramIcon className="h-7 w-7" />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-400">
                    PALMYRA CUSTOMER CARE
                  </p>

                  <h2 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
                    We're here to help.
                  </h2>

                  <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-400">
                    Questions about an order, delivery, product or return?
                    Connect with Palmyra through our official Instagram
                    profile.
                  </p>

                  <p className="mt-3 text-sm font-semibold text-zinc-200">
                    @palmyraofficial
                  </p>
                </div>
              </div>

              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Message Palmyra customer care on Instagram"
                className="group/button inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-950/30 transition hover:-translate-y-0.5 hover:bg-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#100d0d]"
              >
                <InstagramIcon className="h-5 w-5" />
                Message us on Instagram
                <ExternalLinkIcon />
              </a>
            </div>
          </div>

          {/* Main footer columns */}
          <div className="grid gap-11 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr_1fr] lg:gap-12">
            {/* Brand */}
            <div>
              <Link
                href="/"
                aria-label="Palmyra home"
                className="group inline-flex items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/20 to-red-950/20 text-2xl font-black text-red-400 transition group-hover:scale-105 group-hover:border-red-400/60">
                  P
                </span>

                <span className="text-2xl font-black tracking-[0.12em]">
                  PALMYRA<span className="text-red-500">.</span>
                </span>
              </Link>

              <p className="mt-5 max-w-sm text-sm leading-7 text-zinc-400">
                Everyday essentials. Contemporary style. Express yourself
                with Palmyra.
              </p>

              <Link
                href="/store"
                className="group mt-6 inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-white transition hover:border-red-500/40 hover:bg-red-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                Explore the store
                <ArrowIcon />
              </Link>

              <div className="mt-7 flex items-center gap-2 text-xs text-zinc-500">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Made for the Palmyra community
              </div>
            </div>

            {/* Explore */}
            <div>
              <FooterHeading>Explore</FooterHeading>

              <ul className="mt-6 space-y-4">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:translate-x-1 hover:text-white focus:outline-none focus-visible:text-white"
                    >
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Information */}
            <div>
              <FooterHeading>Information</FooterHeading>

              <ul className="mt-6 space-y-4">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group/link inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:translate-x-1 hover:text-red-400 focus:outline-none focus-visible:text-red-400"
                    >
                      <span>{link.label}</span>
                      <span className="text-red-500 opacity-0 transition group-hover/link:opacity-100">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
                <li>
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-pink-400 focus:outline-none focus-visible:text-pink-400"
                  >
                    Contact Support
                    <ExternalLinkIcon />
                  </a>
                </li>
              </ul>
            </div>

            {/* Social links */}
            <div>
              <FooterHeading>Follow Palmyra</FooterHeading>

              <p className="mt-6 text-sm leading-7 text-zinc-400">
                Follow our channels for updates, announcements and new drops.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Palmyra on Instagram"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:-translate-y-1 hover:border-pink-500/40 hover:bg-pink-500/10 hover:text-pink-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                >
                  <InstagramIcon />
                </a>

                <a
                  href={YOUTUBE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Palmyra on YouTube"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:-translate-y-1 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <SocialIcon type="youtube" />
                  </svg>
                </a>

                <a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Palmyra on Facebook"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:-translate-y-1 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <SocialIcon type="facebook" />
                  </svg>
                </a>

                <a
                  href={X_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Palmyra on X"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:-translate-y-1 hover:border-white/30 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <SocialIcon type="x" />
                  </svg>
                </a>
              </div>

              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-300 transition hover:text-pink-400"
              >
                <InstagramIcon className="h-4 w-4" />
                Customer care via Instagram DM
              </a>
            </div>
          </div>

          {/* Trust / policy strip */}
          <div className="mt-14 grid gap-3 border-y border-white/[0.08] py-6 sm:grid-cols-3">
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-red-400">
                ✓
              </span>
              <span>Secure checkout</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-red-400">
                ↗
              </span>
              <span>Order and delivery updates</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-red-400">
                ◇
              </span>
              <span>Customer support</span>
            </div>
          </div>

          {/* Bottom footer bar */}
          <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-xs leading-6 text-zinc-500 sm:text-left">
              © {currentYear} Palmyra by Assist Network Ltd. All rights
              reserved.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 sm:justify-end">
              <Link
                href="/privacy-policy"
                className="text-xs text-zinc-500 transition hover:text-white focus:outline-none focus-visible:text-white"
              >
                Privacy
              </Link>

              <Link
                href="/terms-and-conditions"
                className="text-xs text-zinc-500 transition hover:text-white focus:outline-none focus-visible:text-white"
              >
                Terms
              </Link>

              <Link
                href="/shipping-policy"
                className="text-xs text-zinc-500 transition hover:text-white focus:outline-none focus-visible:text-white"
              >
                Shipping
              </Link>

              <Link
                href="/returns-refund"
                className="text-xs text-zinc-500 transition hover:text-white focus:outline-none focus-visible:text-white"
              >
                Returns
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to top */}
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="fixed bottom-24 right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#171111]/95 text-white shadow-xl backdrop-blur transition hover:-translate-y-1 hover:border-red-500/50 hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 sm:bottom-7 sm:right-7"
        >
          <BackToTopIcon />
        </button>
      )}

      {/* Fixed mobile bottom navigation */}
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#090909]/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:hidden"
      >
        <div className="mx-auto grid max-w-lg grid-cols-4 px-2 pt-2">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 ${
                  active
                    ? "text-red-400"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute top-0 h-0.5 w-8 rounded-full bg-red-500"
                  />
                )}

                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-[22px] w-[22px]"
                >
                  {item.icon}
                </svg>

                <span className="text-[11px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
