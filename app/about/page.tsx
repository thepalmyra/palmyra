
import Link from "next/link";

const experiences = [
  {
    number: "01",
    tag: "WATCH",
    title: "Entertainment to explore.",
    description:
      "Discover videos and entertainment on Palmyra, with content spanning sports, movies and more.",
    href: "/watch",
    linkLabel: "Explore videos",
    symbol: "▶",
    style: "from-red-500/15 via-red-500/[0.04] to-transparent",
  },
  {
    number: "02",
    tag: "DISCOVER",
    title: "Find your next favourite.",
    description:
      "Explore content, browse categories and discover something new whenever you visit.",
    href: "/watch",
    linkLabel: "Start discovering",
    symbol: "✳",
    style: "from-orange-500/10 via-white/[0.02] to-transparent",
  },
  {
    number: "03",
    tag: "SHOP",
    title: "Wear the Palmyra spirit.",
    description:
      "Explore Palmyra merchandise, check product details and pricing, and shop the available collection.",
    href: "/store",
    linkLabel: "Explore the collection",
    symbol: "↗",
    style: "from-white/[0.08] via-white/[0.02] to-transparent",
  },
];

const values = [
  {
    title: "Easy to explore",
    description:
      "Clear navigation helps you find videos, categories and products without the confusion.",
    icon: "01",
  },
  {
    title: "Clear before you buy",
    description:
      "Review product information, displayed prices and availability before placing an order.",
    icon: "02",
  },
  {
    title: "Made for discovery",
    description:
      "One Palmyra experience for exploring content and discovering our merchandise.",
    icon: "03",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#080808] text-white">
      {/* Background atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
      >
        <div className="absolute -top-52 left-1/2 h-[500px] w-[850px] -translate-x-1/2 rounded-full bg-red-600/[0.12] blur-[150px]" />
        <div className="absolute right-[-180px] top-[700px] h-[400px] w-[400px] rounded-full bg-red-800/[0.07] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        {/* Top navigation */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.09] py-6">
          <Link
            href="/"
            aria-label="Palmyra home"
            className="group flex items-center gap-3"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-lg font-black shadow-[0_0_30px_rgba(220,38,38,0.22)] transition group-hover:bg-red-500">
              P
            </span>
            <span className="text-lg font-black tracking-[0.16em]">
              PALMYRA
            </span>
          </Link>

          <nav
            aria-label="Main navigation"
            className="flex items-center gap-5 text-sm text-white/60 sm:gap-7"
          >
            <Link
              href="/watch"
              className="transition hover:text-white"
            >
              Watch
            </Link>
            <Link
              href="/store"
              className="transition hover:text-white"
            >
              Store
            </Link>
            <Link
              href="/"
              className="transition hover:text-white"
            >
              Home
            </Link>
          </nav>
        </header>

        {/* Hero */}
        <section className="relative py-20 sm:py-28 lg:py-36">
          <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <div className="inline-flex items-center gap-2.5 rounded-full border border-red-500/25 bg-red-500/[0.07] px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-red-300 sm:text-xs">
                  Get to know Palmyra
                </span>
              </div>

              <h1 className="mt-8 text-5xl font-black leading-[1.03] tracking-[-0.055em] sm:text-6xl lg:text-7xl xl:text-[82px]">
                More to watch.
                <br />
                <span className="bg-gradient-to-r from-red-400 via-red-500 to-orange-400 bg-clip-text text-transparent">
                  More to discover.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-8 text-white/65 sm:text-lg sm:leading-9">
                Palmyra is a digital platform for entertainment, sports,
                movies and culture — bringing video discovery and Palmyra
                merchandise together in one place.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/watch"
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-red-600 px-7 py-4 text-sm font-bold transition hover:-translate-y-0.5 hover:bg-red-500 hover:shadow-[0_10px_35px_rgba(220,38,38,0.2)]"
                >
                  <span aria-hidden="true">▶</span>
                  Explore Palmyra
                </Link>

                <Link
                  href="/store"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-7 py-4 text-sm font-semibold text-white/85 transition hover:border-white/30 hover:bg-white/[0.07]"
                >
                  Visit the store
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>

              <p className="mt-5 text-xs leading-6 text-white/35">
                Discover content. Explore your interests. Find your Palmyra
                favourites.
              </p>
            </div>

            {/* Brand visual */}
            <div className="relative mx-auto w-full max-w-lg lg:ml-auto">
              <div className="absolute -inset-5 rounded-[36px] bg-red-600/[0.09] blur-2xl" />

              <div className="relative overflow-hidden rounded-[30px] border border-white/[0.12] bg-[#101010] p-5 shadow-2xl sm:p-7">
                <div className="flex items-center justify-between border-b border-white/[0.09] pb-5">
                  <div>
                    <p className="text-xs font-bold tracking-[0.22em] text-white/40">
                      THE PALMYRA EXPERIENCE
                    </p>
                    <p className="mt-2 text-sm text-white/75">
                      One place. More to explore.
                    </p>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-600 text-xl font-black">
                    P
                  </span>
                </div>

                <Link
                  href="/watch"
                  className="group mt-5 flex min-h-[150px] items-end overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(ellipse_at_75%_15%,rgba(239,68,68,0.32),transparent_45%),linear-gradient(135deg,#241010,#151515_55%,#090909)] p-5 transition hover:border-red-500/40 sm:min-h-[170px] sm:p-6"
                >
                  <div className="flex w-full items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.23em] text-red-300">
                        01 / WATCH
                      </p>
                      <h2 className="mt-2 text-2xl font-bold">
                        Stories in motion.
                      </h2>
                      <p className="mt-2 text-sm text-white/50">
                        Videos, sports and entertainment
                      </p>
                    </div>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/[0.07] transition group-hover:bg-red-600">
                      <span aria-hidden="true">▶</span>
                    </span>
                  </div>
                </Link>

                <Link
                  href="/store"
                  className="group mt-3 flex min-h-[130px] items-end overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(ellipse_at_85%_20%,rgba(255,255,255,0.12),transparent_42%),linear-gradient(135deg,#1b1b1b,#111)] p-5 transition hover:border-white/25 sm:min-h-[145px] sm:p-6"
                >
                  <div className="flex w-full items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.23em] text-white/45">
                        02 / SHOP
                      </p>
                      <h2 className="mt-2 text-xl font-bold">
                        The Palmyra collection.
                      </h2>
                      <p className="mt-2 text-sm text-white/50">
                        Merchandise and everyday style
                      </p>
                    </div>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.05] text-xl transition group-hover:border-red-500/50 group-hover:text-red-400">
                      ↗
                    </span>
                  </div>
                </Link>

                <div className="mt-5 flex items-center gap-3 px-1">
                  <span className="h-px flex-1 bg-white/10" />
                  <span className="text-[9px] font-semibold tracking-[0.25em] text-white/30">
                    ENTERTAINMENT · CULTURE · STYLE
                  </span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What is Palmyra? */}
        <section className="border-y border-white/[0.09] py-14 sm:py-16">
          <div className="grid gap-6 md:grid-cols-[0.7fr_1.3fr] md:items-start md:gap-16">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-400">
                What is Palmyra?
              </p>
              <h2 className="mt-4 max-w-sm text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                Built for what you love.
              </h2>
            </div>

            <div>
              <p className="text-base leading-8 text-white/65 sm:text-lg sm:leading-9">
                Palmyra brings two experiences together: a place to explore
                video content and a store for Palmyra merchandise. Whether
                you are here to watch, discover something interesting or
                browse the collection, our goal is to make your experience
                straightforward and enjoyable.
              </p>
              <p className="mt-5 text-sm leading-7 text-white/40">
                Explore the available content and products, with details
                presented to help you decide what to watch or buy.
              </p>
            </div>
          </div>
        </section>

        {/* Main experiences */}
        <section className="py-20 sm:py-28">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-400">
              Your Palmyra journey
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              Three ways to explore.
            </h2>
            <p className="mt-5 leading-7 text-white/55">
              Start with what interests you. Move between watching,
              discovering and shopping whenever you like.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {experiences.map((item) => (
              <article
                key={item.number}
                className={`group relative flex min-h-[310px] flex-col overflow-hidden rounded-3xl border border-white/[0.10] bg-gradient-to-br ${item.style} p-6 transition duration-300 hover:-translate-y-1 hover:border-red-500/35 sm:p-8`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold tracking-[0.2em] text-white/35">
                    {item.number} / {item.tag}
                  </span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-xl text-red-300 transition group-hover:border-red-500/30 group-hover:bg-red-500/10">
                    {item.symbol}
                  </span>
                </div>

                <h3 className="mt-10 text-2xl font-bold leading-tight tracking-tight">
                  {item.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-white/55">
                  {item.description}
                </p>

                <div className="mt-auto pt-8">
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white transition group-hover:text-red-300"
                  >
                    {item.linkLabel}
                    <span
                      aria-hidden="true"
                      className="transition-transform group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Why Palmyra */}
        <section className="rounded-3xl border border-white/[0.09] bg-white/[0.025] p-6 sm:p-10 lg:p-14">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-400">
                The way we do things
              </p>
              <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                Simple to use.
                <span className="block text-white/40">
                  Clear by design.
                </span>
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-white/55">
                A good experience should feel easy to understand. We focus
                on making it clear where to go, what you are exploring and
                what to expect when shopping.
              </p>
            </div>

            <div className="divide-y divide-white/[0.09]">
              {values.map((item) => (
                <article
                  key={item.icon}
                  className="flex gap-5 py-6 first:pt-0 last:pb-0"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/[0.08] text-xs font-bold text-red-300">
                    {item.icon}
                  </span>
                  <div>
                    <h3 className="font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-white/50">
                      {item.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="relative my-20 overflow-hidden rounded-3xl border border-red-500/20 bg-[#130b0b] px-6 py-12 sm:my-28 sm:px-12 sm:py-16 lg:px-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-32 h-80 w-80 rounded-full bg-red-600/15 blur-[100px]"
          />

          <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-300">
                Your next discovery starts here
              </p>
              <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight sm:text-5xl">
                Come for what you love.
                <span className="mt-2 block text-white/45">
                  Stay curious.
                </span>
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/55 sm:text-base">
                Explore Palmyra videos, discover new interests or browse
                our merchandise collection. Your next favourite could be
                just a click away.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                href="/watch"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-3.5 text-sm font-bold transition hover:bg-red-500"
              >
                Start exploring <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/store"
                className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3.5 text-sm font-semibold transition hover:bg-white/[0.06]"
              >
                Shop Palmyra
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/[0.09] py-7">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link
                href="/"
                className="text-sm font-black tracking-[0.18em] transition hover:text-red-400"
              >
                PALMYRA
              </Link>
              <p className="mt-2 text-xs text-white/35">
                Entertainment, culture and style.
              </p>
              <p className="mt-3 text-xs text-white/30">
                © {new Date().getFullYear()} Palmyra. All rights reserved.
              </p>
            </div>

            <nav
              aria-label="Footer navigation"
              className="flex flex-wrap gap-x-5 gap-y-3 text-xs text-white/45"
            >
              <Link
                className="transition hover:text-white"
                href="/watch"
              >
                Watch
              </Link>
              <Link
                className="transition hover:text-white"
                href="/store"
              >
                Store
              </Link>
              <Link
                className="transition hover:text-white"
                href="/privacy-policy"
              >
                Privacy Policy
              </Link>
              <Link
                className="transition hover:text-white"
                href="/terms-and-conditions"
              >
                Terms & Conditions
              </Link>
              <a
                className="transition hover:text-white"
                href="https://www.instagram.com/palmyraofficial/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram ↗
              </a>
            </nav>
          </div>
        </footer>
      </div>
    </main>
  );
}
