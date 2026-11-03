
import Link from "next/link";

const sections = [
  {
    number: "01",
    title: "Order processing",
    text: "After you place an order, Palmyra begins the order verification and processing process. Processing time may vary depending on product availability, order volume and other operational factors.",
  },
  {
    number: "02",
    title: "Shipping and delivery",
    text: "Delivery estimates, where available, will be displayed during checkout or communicated through your order updates. Actual delivery may vary depending on the delivery location, courier operations, weather and other circumstances.",
  },
  {
    number: "03",
    title: "Shipping charges",
    text: "Applicable shipping charges, if any, will be displayed during checkout before you confirm your purchase. Please review the final order amount before placing your order.",
  },
  {
    number: "04",
    title: "Order tracking",
    text: "Where tracking information is available, it will be shared through the order updates or communication channel provided by Palmyra. Tracking updates may take time to appear after dispatch.",
  },
  {
    number: "05",
    title: "Delivery delays",
    text: "Unexpected delays may occur due to courier operations, incorrect addresses, weather, public holidays, service interruptions or other circumstances beyond our reasonable control. We will assist with order-related enquiries where possible.",
  },
  {
    number: "06",
    title: "Incorrect delivery information",
    text: "Customers are responsible for providing a complete and accurate delivery address and reachable contact information. Please contact Palmyra as soon as possible if you notice an error. Address changes may not be possible once an order has entered processing or dispatch.",
  },
];

const faqs = [
  {
    q: "How long will my order take to arrive?",
    a: "Delivery estimates may vary by product and location. Please check the estimated information displayed at checkout or in your order updates.",
  },
  {
    q: "Will I receive tracking information?",
    a: "Tracking information will be shared when it is available for your shipment. Please allow time for courier tracking systems to update.",
  },
  {
    q: "Can I change my delivery address?",
    a: "Contact Palmyra as soon as possible. Address changes are subject to the order's processing and dispatch status and cannot be guaranteed.",
  },
  {
    q: "What if my order is delayed?",
    a: "Please contact Palmyra with your order number. We will review the available shipment information and assist you.",
  },
  {
    q: "What if I receive a damaged or incorrect product?",
    a: "Please contact Palmyra promptly with your order details and clear photographs of the product and packaging. We will review the issue under our Returns & Refund Policy and applicable law.",
  },
];

export default function ShippingPolicyPage() {
  return (
    <main className="min-h-screen bg-[#080808] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute -right-32 -top-40 h-[440px] w-[440px] rounded-full bg-red-600/15 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-32 h-[350px] w-[350px] rounded-full bg-red-600/10 blur-[110px]" />

        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 sm:pb-24 sm:pt-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 transition hover:text-white"
          >
            <span aria-hidden="true">←</span> Back to Palmyra
          </Link>

          <div className="mt-16 max-w-3xl sm:mt-24">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-red-400">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Palmyra Store Policies
            </div>

            <p className="text-sm font-bold uppercase tracking-[0.28em] text-white/40">
              Clear information. Better shopping.
            </p>

            <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-7xl">
              Shipping
              <span className="block text-red-500">Policy.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">
              Everything you need to know about order processing, shipping,
              delivery, tracking and delivery-related support when shopping
              with Palmyra.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#shipping-details"
                className="rounded-full bg-red-600 px-6 py-3 text-sm font-bold transition hover:bg-red-500"
              >
                Explore the policy <span aria-hidden="true">↓</span>
              </a>
              <Link
                href="/returns-refund"
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white/80 transition hover:border-white/50 hover:text-white"
              >
                Returns & Refunds
              </Link>
            </div>
          </div>

          <div className="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-6 text-xs text-white/40">
            <span>PALMYRA</span>
            <span>SHIPPING INFORMATION</span>
            <span>INDIA</span>
          </div>
        </div>
      </section>

      {/* Intro cards */}
      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-12 sm:grid-cols-3 sm:px-8 sm:py-16">
        {[
          {
            icon: "01",
            title: "Order processing",
            desc: "Your order is verified and prepared for fulfilment.",
          },
          {
            icon: "02",
            title: "Delivery updates",
            desc: "Check your order updates for available shipping information.",
          },
          {
            icon: "03",
            title: "Customer support",
            desc: "We're here to help with delivery-related questions.",
          },
        ].map((item) => (
          <div
            key={item.icon}
            className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 transition hover:border-red-500/40"
          >
            <span className="text-sm font-black tracking-widest text-red-500">
              {item.icon}
            </span>
            <h2 className="mt-5 text-lg font-bold">{item.title}</h2>
            <p className="mt-2 text-sm leading-7 text-white/50">
              {item.desc}
            </p>
          </div>
        ))}
      </section>

      {/* Policy details */}
      <section
        id="shipping-details"
        className="mx-auto max-w-6xl scroll-mt-8 px-5 pb-16 sm:px-8 sm:pb-24"
      >
        <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
              Shipping information
            </p>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              From our store
              <span className="block text-white/40">to your doorstep.</span>
            </h2>
            <p className="mt-5 text-sm leading-8 text-white/50">
              Please read the following information before placing your order.
              It explains how Palmyra handles shipping and delivery-related
              matters.
            </p>

            <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/[0.07] p-6">
              <p className="text-sm font-bold text-red-400">
                Important information
              </p>
              <p className="mt-3 text-sm leading-7 text-white/65">
                Delivery estimates are not guaranteed arrival dates.
                Unforeseen circumstances may affect delivery.
              </p>
            </div>
          </div>

          <div className="space-y-0">
            {sections.map((section, index) => (
              <article
                key={section.number}
                className="grid gap-4 border-b border-white/10 py-7 sm:grid-cols-[58px_1fr]"
              >
                <span className="text-sm font-black text-red-500">
                  {section.number}
                </span>
                <div>
                  <h3 className="text-lg font-bold">{section.title}</h3>
                  <p className="mt-3 text-sm leading-8 text-white/55">
                    {section.text}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
            Need to know
          </p>
          <h2 className="mt-4 text-3xl font-black sm:text-4xl">
            Shipping FAQs
          </h2>

          <div className="mt-9 divide-y divide-white/10">
            {faqs.map((faq) => (
              <details key={faq.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-bold sm:text-base">
                  {faq.q}
                  <span className="text-xl text-red-500 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="max-w-3xl pt-4 text-sm leading-8 text-white/55">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-red-950/50 to-white/[0.025] p-7 sm:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-400">
            Palmyra support
          </p>
          <h2 className="mt-4 text-3xl font-black sm:text-4xl">
            Need help with an order?
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-8 text-white/55">
            Keep your order details ready when contacting Palmyra so we can
            understand and review your enquiry.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/profile"
              className="rounded-full bg-red-600 px-6 py-3 text-sm font-bold transition hover:bg-red-500"
            >
              Go to your profile
            </Link>
            <Link
              href="/returns-refund"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold transition hover:border-white/50"
            >
              Returns & Refund Policy
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-7 text-center text-xs text-white/35">
        © {new Date().getFullYear()} Palmyra. All rights reserved.
      </footer>
    </main>
  );
}
