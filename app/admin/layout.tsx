
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    label: "Overview",
    href: "/admin",
    icon: "layout",
  },
  {
    label: "Orders",
    href: "/admin",
    icon: "orders",
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: "products",
  },
  {
    label: "Video Cards",
    href: "/admin/videos",
    icon: "videos",
  },
  {
    label: "Business Analytics",
    href: "/admin/analytics",
    icon: "analytics",
  },
];

function NavIcon({ name }: { name: string }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "layout":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "orders":
      return (
        <svg {...common}>
          <path d="M8 4h-3a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3" />
          <rect x="8" y="2" width="8" height="4" rx="1" />
          <path d="M8 11h8M8 15h8M8 19h4" />
        </svg>
      );
    case "products":
      return (
        <svg {...common}>
          <path d="m12 3 9 5-9 5-9-5 9-5Z" />
          <path d="m3 12 9 5 9-5M3 16l9 5 9-5M12 13v8" />
        </svg>
      );
    case "videos":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m10 9 5 3-5 3V9Z" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M3 3v18h18" />
          <path d="m7 14 4-4 4 3 5-7" />
        </svg>
      );
  }
}

function SidebarLink({
  label,
  href,
  icon,
  active,
}: {
  label: string;
  href: string;
  icon: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={[
        "group flex items-center gap-3 rounded-xl px-3.5 py-3",
        "text-sm font-medium transition-all duration-200",
        active
          ? "bg-[#D9B878]/10 text-[#E5C98F] ring-1 ring-inset ring-[#D9B878]/20"
          : "text-zinc-400 hover:bg-white/[0.05] hover:text-white",
      ].join(" ")}
    >
      <span
        className={
          active
            ? "text-[#E5C98F]"
            : "text-zinc-500 group-hover:text-zinc-200"
        }
      >
        <NavIcon name={icon} />
      </span>
      <span>{label}</span>
      {active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#D9B878]" />
      )}
    </Link>
  );
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const isOverview = pathname === "/admin";

  return (
    <div className="min-h-screen bg-[#0B0C0F] text-zinc-100">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-white/[0.07] bg-[#101114] lg:flex">
        <Link
          href="/admin"
          className="flex h-[88px] items-center gap-3 border-b border-white/[0.07] px-7"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#D9B878]/30 bg-[#D9B878]/10 text-xl font-semibold tracking-tight text-[#E5C98F]">
            P
          </span>
          <span className="min-w-0">
            <span className="block text-lg font-semibold tracking-[0.19em] text-white">
              PALMYRA
            </span>
            <span className="mt-1 block text-[9px] font-medium tracking-[0.22em] text-zinc-500">
              COMMERCE ADMIN
            </span>
          </span>
        </Link>

        <div className="px-5 pt-8">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
            Workspace
          </p>
          <nav className="space-y-1.5" aria-label="Admin navigation">
            {navigation.map((item) => {
              const active =
                item.href === "/admin"
                  ? isOverview
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

              return (
                <SidebarLink
                  key={item.label}
                  {...item}
                  active={active}
                />
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-5">
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-medium text-zinc-300">
                Admin workspace
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Manage your store, orders and content from one place.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-[#D9B878] transition hover:text-[#F0D7A5]"
            >
              View storefront <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <p className="mt-4 text-center text-[10px] tracking-wide text-zinc-700">
            PALMYRA ADMINISTRATION
          </p>
        </div>
      </aside>

      <div className="min-w-0 lg:pl-[260px]">
        <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#0B0C0F]/95 backdrop-blur-xl">
          <div className="flex min-h-[76px] items-center justify-between gap-4 px-5 sm:px-8">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D9B878]/25 bg-[#D9B878]/10 text-lg font-semibold text-[#E5C98F] lg:hidden">
                P
              </span>
              <div>
                <p className="text-sm font-semibold text-white">
                  {navigation.find((item) =>
                    item.href === "/admin"
                      ? isOverview
                      : pathname === item.href ||
                        pathname.startsWith(`${item.href}/`)
                  )?.label ?? "Administration"}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Palmyra / Admin workspace
                </p>
              </div>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-[#D9B878]/40 hover:text-[#E5C98F]"
            >
              <span>View Store</span>
              <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <nav
            className="flex gap-1 overflow-x-auto border-t border-white/[0.05] px-4 py-2.5 lg:hidden"
            aria-label="Mobile admin navigation"
          >
            {navigation.map((item) => {
              const active =
                item.href === "/admin"
                  ? isOverview
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition",
                    active
                      ? "bg-[#D9B878]/10 text-[#E5C98F]"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white",
                  ].join(" ")}
                >
                  <NavIcon name={item.icon} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-[1600px] p-5 sm:p-8 xl:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
