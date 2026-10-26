
import Link from "next/link";

const highlights = [
  {
    number: "01",
    title: "Thoughtful design",
    description:
      "A clean, considered shopping experience that makes discovering our collection simple.",
  },
  {
    number: "02",
    title: "Clear pricing",
    description:
      "Straightforward product information and pricing displayed before you place an order.",
  },
  {
    number: "03",
    title: "Customer-first",
    description:
      "A commitment to helping customers understand their orders and find the support they need.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#08090d] text-white">
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -top-48 left-1/2 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-red-600/[0.10] blur-[130px]" />
      </div>

      <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-8 sm:px-8 sm:pb-28 sm:pt-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"
          >
            <span aria-hidden="true">←</span> Back to home
          </Link>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
            The Palmyra story
          </span>
        </div>

        <div className="relative mt-20 max-w-4xl sm:mt-28">
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-red-400">
            <span className="h-px w-8 bg-red-500" />
            About Palmyra
          </p>

          <h1 className="mt-7 text-5xl font-bold leading-[1.05] tracking-[-0.055em] sm:text-7xl lg:text-8xl">
            Less friction.
            <br />
            <span className="text-white/40">More </span>
            <span className="text-red-500">purpose.</span>
          </h1>

          <p className="mt-8 max-w-2xl text-base leading-8 text-white/60 sm:text-xl sm:leading-9">
            Palmyra is an independent brand building a more thoughtful
            online shopping experience — bringing our collection to
            customers through clear information, considered design,
            and a straightforward way to shop.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/store"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-red-600 px-7 py-3.5 text-sm font-semibold transition hover:bg-red-500"
            >
              Explore the store <span aria-hidden="true">↗</span>
            </Link>
            <a
              href="https://www.instagram.com/palmyraofficial/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-7 py-3.5 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:bg-white/[0.05]"
            >
              Connect with us
            </a>
          </div>
        </div>

        <div className="mt-20 grid gap-4 border-y border-white/10 py-6 sm:mt-28 sm:grid-cols-3 sm:gap-8 sm:py-8">
          {[
            ["Our focus", "A considered shopping experience"],
            ["Our approach", "Clarity at every step"],
            ["Our priority", "Customer confidence"],
          ].map(([label, value]) => (
            <div key={label} className="py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35">
                {label}
              </p>
              <p className="mt-3 text-sm font-medium text-white/80 sm:text-base">
                {value}
              </p>
            </div>
          ))}
        </div>

        <section className="mt-20 sm:mt-28">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-400">
              What matters to us
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              Built around the essentials.
            </h2>
            <p className="mt-5 leading-7 text-white/55">
              The details matter. We want every part of the shopping
              journey to feel clear, accessible, and easy to understand.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {highlights.map((item) => (
              <article
                key={item.number}
                className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition duration-300 hover:border-red-500/40 hover:bg-white/[0.045] sm:p-8"
              >
                <span className="text-sm font-semibold tracking-widest text-red-400">
                  {item.number}
                </span>
                <h3 className="mt-10 text-xl font-semibold">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/55">
                  {item.description}
                </p>
                <div className="mt-8 h-px w-10 bg-red-500/70 transition-all group-hover:w-16" />
              </article>
            ))}
          </div>
        </section>

        <section className="relative mt-20 overflow-hidden rounded-3xl border border-white/10 bg-[#101116] p-7 sm:mt-28 sm:p-12 lg:p-16">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-red-600/10 blur-[90px]" />
          <div className="relative max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-400">
              Discover Palmyra
            </p>
            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">
              Good experiences start with clarity.
            </h2>
            <p className="mt-5 max-w-2xl leading-7 text-white/55">
              Browse our available collection, review product details,
              and see the applicable price and availability before
              placing your order.
            </p>
            <Link
              href="/store"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-white/85"
            >
              Shop Palmyra <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

        <footer className="mt-14 flex flex-wrap items-center justify-between gap-5 border-t border-white/10 pt-7">
          <p className="text-xs text-white/35">
            © {new Date().getFullYear()} Palmyra. All rights reserved.
          </p>
          <nav aria-label="Legal and company links" className="flex flex-wrap gap-x-5 gap-y-3 text-xs text-white/50">
            <Link className="transition hover:text-white" href="/privacy-policy">
              Privacy
            </Link>
            <Link className="transition hover:text-white" href="/terms-and-conditions">
              Terms
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
        </footer>
      </section>
    </main>
  );
}
