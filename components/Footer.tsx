
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
  { label: "About Palmyra", href: "/about" },
  { label: "Store", href: "/store" },
  { label: "My Profile", href: "/profile" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
];

function SocialIcon({ type }: { type: "instagram" | "youtube" | "facebook" | "x" }) {
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

export default function Footer() {
  const pathname = usePathname();

  return (
    <>
      <footer className="border-t border-white/10 bg-[#080808] text-white">
        <div className="mx-auto max-w-7xl px-5 pb-28 pt-12 sm:px-8 sm:pb-12 sm:pt-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-16">
            {/* Brand */}
            <div>
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-xl font-black text-red-500">
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
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                Explore the store
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            {/* Quick links */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
                Explore
              </h2>

              <ul className="mt-5 space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex text-sm text-zinc-400 transition hover:translate-x-1 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Socials */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
                Follow Palmyra
              </h2>

              <p className="mt-5 text-sm leading-6 text-zinc-400">
                Stay connected for updates, new drops, and more.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href="https://www.instagram.com/palmyraofficial/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Palmyra on Instagram"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:border-pink-500/40 hover:bg-pink-500/10 hover:text-pink-400"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
                    <SocialIcon type="instagram" />
                  </svg>
                </a>

                <a
                  href="https://www.youtube.com/@palmyraofficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Palmyra on YouTube"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
                    <SocialIcon type="youtube" />
                  </svg>
                </a>

                <a
                  href="https://www.facebook.com/palmyrastv"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Palmyra on Facebook"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <SocialIcon type="facebook" />
                  </svg>
                </a>

                <a
                  href="https://x.com/guerreroisravel"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Palmyra on X"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <SocialIcon type="x" />
                  </svg>
                </a>
              </div>

              <p className="mt-5 text-xs leading-5 text-zinc-500">
                Follow our official channels for Palmyra updates.
              </p>
            </div>
          </div>

          {/* Bottom footer bar */}
          <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-center sm:mt-14 sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <p className="text-xs leading-5 text-zinc-500">
              © {new Date().getFullYear()} Palmyra by Assist Network Ltd.
              All rights reserved.
            </p>

            <Link
              href="/privacy"
              className="text-xs text-zinc-500 transition hover:text-white"
            >
              Your privacy matters
            </Link>
          </div>
        </div>
      </footer>

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
                className={`relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl transition ${
                  active
                    ? "text-red-400"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                {active && (
                  <span className="absolute top-0 h-0.5 w-8 rounded-full bg-red-500" />
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

                <span className="text-[11px] font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
