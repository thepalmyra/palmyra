
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
        <Link
          href="/"
          className="inline-flex text-sm text-white/60 transition hover:text-white"
        >
          ← Back to Home
        </Link>

        <div className="mt-12 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
            ABOUT PALMYRA
          </p>

          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-6xl">
            Made for everyday life.
          </h1>

          <p className="mt-6 text-lg leading-8 text-white/65 sm:text-xl">
            Palmyra is an independent brand focused on bringing
            thoughtfully presented products to customers through a
            simple, convenient online shopping experience.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <div className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-xl">
              <span aria-hidden="true">✦</span>
            </div>
            <h2 className="mt-5 text-xl font-semibold">Our approach</h2>
            <p className="mt-3 leading-7 text-white/65">
              We aim to make browsing and shopping straightforward,
              with clear product information, transparent pricing,
              and an easy-to-follow checkout experience.
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <div className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-xl">
              <span aria-hidden="true">◇</span>
            </div>
            <h2 className="mt-5 text-xl font-semibold">Our commitment</h2>
            <p className="mt-3 leading-7 text-white/65">
              We want customers to understand what they are buying,
              what they will pay, and how to find help with an order.
              We continue to improve the experience as the brand grows.
            </p>
          </article>
        </div>

        <section className="mt-14 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-7 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
            THE PALMYRA EXPERIENCE
          </p>
          <h2 className="mt-4 max-w-2xl text-2xl font-semibold sm:text-3xl">
            A straightforward way to discover and shop our collection.
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-white/65">
            Explore our available products, review their details,
            and place an order through our online store. Product
            availability, prices, delivery arrangements, and applicable
            policies are shown or communicated through the relevant
            parts of the shopping process.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/85"
          >
            Explore Palmyra
            <span className="ml-2" aria-hidden="true">→</span>
          </Link>
        </section>

        <footer className="mt-12 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-sm text-white/50">
          <Link className="hover:text-white" href="/privacy-policy">
            Privacy Policy
          </Link>
          <Link className="hover:text-white" href="/terms-and-conditions">
            Terms &amp; Conditions
          </Link>
          <Link className="hover:text-white" href="/">
            Home
          </Link>
        </footer>
      </section>
    </main>
  );
}
