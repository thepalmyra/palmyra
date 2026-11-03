
import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Submit your request",
    text: "Contact Palmyra with your order details, the product concerned and the reason for your cancellation or return request. Use the order request feature where available.",
  },
  {
    number: "02",
    title: "Request review",
    text: "Palmyra will review the order status, product details, reason for the request and any supporting information. We may ask for additional details or photographs.",
  },
  {
    number: "03",
    title: "Eligibility check",
    text: "The available options depend on the stage of order processing, delivery status, product condition, nature of the issue and applicable consumer-protection requirements.",
  },
  {
    number: "04",
    title: "Decision and update",
    text: "Palmyra will communicate the outcome and any available next steps. Where a cancellation, return, replacement or refund is approved, the applicable instructions will be shared.",
  },
];

const faqs = [
  {
    q: "Can I cancel an order after placing it?",
    a: "You may submit a cancellation request. Approval is not guaranteed. Whether cancellation is possible depends on the order's processing and fulfilment status. Please submit your request as soon as possible.",
  },
  {
    q: "Can I return a product if I change my mind?",
    a: "A return for personal preference, an incorrect size selection or a change of mind is subject to review and applicable policy and law. Such requests are not automatically accepted.",
  },
  {
    q: "What if my product is damaged or defective?",
    a: "Contact Palmyra promptly after receiving the product. Provide your order number, a description of the issue and clear photographs or other supporting evidence. We will review the issue and available remedies.",
  },
  {
    q: "What if I receive the wrong product?",
    a: "Please contact Palmyra with your order number and clear photographs showing the product received and its packaging. We will investigate and communicate the next steps.",
  },
  {
    q: "Will every request be approved?",
    a: "No. Submitting a request does not automatically guarantee cancellation, return, replacement or refund. Each request is reviewed individually, subject to applicable law.",
  },
  {
    q: "When will I receive my refund?",
    a: "If a refund is approved, the applicable refund method and expected processing information will be communicated to you. Actual credit timing may depend on the payment provider or bank.",
  },
  {
    q: "Can I request a return after delivery?",
    a: "You may contact Palmyra with your concern after delivery. Please do so promptly. The review will consider the nature of the issue, supporting evidence, applicable policy and your legal rights.",
  },
];

export default function ReturnsRefundPage() {
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
              Fair review. Clear communication.
            </p>

            <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-7xl">
              Returns
              <span className="block text-red-500">& Refunds.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">
              Understand how Palmyra reviews cancellation, return, replacement
              and refund requests. Every request is considered based on its
              circumstances and applicable law.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#how-it-works"
                className="rounded-full bg-red-600 px-6 py-3 text-sm font-bold transition hover:bg-red-500"
              >
                How requests work <span aria-hidden="true">↓</span>
              </a>
              <Link
                href="/shipping-policy"
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white/80 transition hover:border-white/50 hover:text-white"
              >
                Shipping Policy
              </Link>
            </div>
          </div>

          <div className="mt-14 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-6 text-xs text-white/40">
            <span>PALMYRA</span>
            <span>RETURNS & REFUNDS</span>
            <span>INDIA</span>
          </div>
        </div>
      </section>

      {/* Important notice */}
      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/[0.07] p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-xl text-red-400">
              !
            </div>
            <div>
              <h2 className="text-lg font-black">
                Please read before submitting a request
              </h2>
              <p className="mt-3 text-sm leading-8 text-white/65">
                Cancellation, return, replacement and refund requests are
                subject to review. Submitting a request does not automatically
                cancel an order or guarantee approval, a replacement or a
                refund. However, this policy does not limit any rights or
                remedies available to customers under applicable law.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Request types */}
      <section className="mx-auto max-w-6xl px-5 pb-14 sm:px-8 sm:pb-20">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
            Request types
          </p>
          <h2 className="mt-4 text-3xl font-black sm:text-4xl">
            What can you request?
          </h2>
          <p className="mt-4 text-sm leading-8 text-white/50">
            Select the request that best describes your situation. Palmyra
            will review the details before communicating the available
            options.
          </p>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-2">
          {[
            {
              icon: "↗",
              title: "Order cancellation",
              desc: "For customers who wish to cancel an order. The possibility of cancellation depends on the order's current processing status.",
            },
            {
              icon: "↩",
              title: "Return request",
              desc: "For customers who want to request a product return. Eligibility depends on the reason, product condition and applicable requirements.",
            },
            {
              icon: "◇",
              title: "Damaged or defective product",
              desc: "For products that arrive damaged, defective or with a quality issue. Supporting photographs or evidence may be requested.",
            },
            {
              icon: "✓",
              title: "Incorrect product received",
              desc: "For an item that does not match the product ordered. Please provide photographs and your order details for review.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 transition hover:border-red-500/40 sm:p-8"
            >
              <span className="text-3xl font-light text-red-500">
                {item.icon}
              </span>
              <h3 className="mt-5 text-lg font-bold">{item.title}</h3>
              <p className="mt-3 text-sm leading-8 text-white/50">
                {item.desc}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="scroll-mt-8 border-y border-white/10 bg-white/[0.025]"
      >
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
              The review process
            </p>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              How it works.
            </h2>
            <p className="mt-4 text-sm leading-8 text-white/50">
              Palmyra reviews requests individually. The steps below explain
              what happens after you contact us.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {steps.map((step) => (
              <article
                key={step.number}
                className="rounded-2xl border border-white/10 bg-[#080808] p-6 sm:p-8"
              >
                <span className="text-sm font-black tracking-widest text-red-500">
                  STEP {step.number}
                </span>
                <h3 className="mt-5 text-xl font-bold">{step.title}</h3>
                <p className="mt-3 text-sm leading-8 text-white/50">
                  {step.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Request requirements */}
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
            Help us review
          </p>
          <h2 className="mt-4 text-3xl font-black sm:text-4xl">
            What information should you provide?
          </h2>
          <p className="mt-4 text-sm leading-8 text-white/50">
            Providing accurate information helps us understand your request
            and review it more efficiently.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
          <ul className="space-y-5 text-sm text-white/65">
            {[
              "Your Palmyra order number",
              "The product name and quantity",
              "Whether you are requesting cancellation, return or replacement",
              "A clear explanation of the issue or reason",
              "Clear product and packaging photographs, where relevant",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 text-red-500">✓</span>
                <span className="leading-7">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Refund details */}
      <section className="border-y border-white/10 bg-white/[0.025]">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
            Refund information
          </p>
          <h2 className="mt-4 text-3xl font-black sm:text-4xl">
            How refunds are handled
          </h2>
          <div className="mt-7 space-y-5 text-sm leading-8 text-white/55">
            <p>
              A refund is considered after the relevant request has been
              reviewed and a refund has been determined to be an appropriate
              remedy under the circumstances and applicable law.
            </p>
            <p>
              Where a refund is approved, the applicable refund method and
              processing information will be communicated to the customer.
              The time taken for the amount to appear may depend on the
              payment provider or bank.
            </p>
            <p>
              Any refund, replacement or other remedy will be handled in
              accordance with applicable consumer-protection requirements.
              Nothing in this policy is intended to exclude or restrict
              mandatory customer rights.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
          Common questions
        </p>
        <h2 className="mt-4 text-3xl font-black sm:text-4xl">
          Returns & Refund FAQs
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
      </section>

      {/* Footer CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-red-950/50 to-white/[0.025] p-7 sm:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-400">
            We're here to help
          </p>
          <h2 className="mt-4 text-3xl font-black sm:text-4xl">
            Need help with a request?
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-8 text-white/55">
            Keep your order number and relevant product details ready when
            contacting Palmyra.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/profile"
              className="rounded-full bg-red-600 px-6 py-3 text-sm font-bold transition hover:bg-red-500"
            >
              Go to your profile
            </Link>
            <Link
              href="/shipping-policy"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold transition hover:border-white/50"
            >
              Shipping Policy
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
