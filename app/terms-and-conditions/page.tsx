
import Link from "next/link";

const sections = [
  {
    title: "About These Terms",
    paragraphs: [
      "These Terms & Conditions apply to your access to and use of the Palmyra online store, including placing orders through the website.",
      "By using the store or placing an order, you agree to these terms and any applicable policies published on the website. If you do not agree, please do not use the store.",
    ],
  },
  {
    title: "Products and Availability",
    paragraphs: [
      "We aim to display product descriptions, images, colours, sizes, and availability accurately. Actual colours may vary depending on your display and device.",
      "Products are subject to availability. We may correct listing errors, update product information, or make products unavailable. A product in your cart is not guaranteed to remain available until your order is accepted.",
    ],
  },
  {
    title: "Prices and Charges",
    paragraphs: [
      "Prices are displayed in Indian rupees unless stated otherwise. The price and applicable charges shown at checkout are used to calculate the amount payable for an order.",
      "The website may display an original or reference price alongside a selling price where applicable. Any discount displayed should reflect the prices shown on the product page.",
      "We may correct pricing or calculation errors. If an error affects an order, we will take appropriate steps consistent with applicable law and communicate with the customer where necessary.",
    ],
  },
  {
    title: "Orders and Order Numbers",
    paragraphs: [
      "When you submit an order, you must provide accurate contact and delivery information. An order number helps identify and track the order; it does not, by itself, prove that payment has succeeded.",
      "Order confirmation, payment confirmation, and dispatch are separate stages. We may contact you to clarify details or address an issue with an order.",
      "We may decline or cancel an order where reasonably necessary, including in cases of suspected fraud, unavailable products, material listing errors, payment problems, or delivery restrictions, subject to applicable law.",
    ],
  },
  {
    title: "Payment",
    paragraphs: [
      "Payments may be processed through Razorpay or another payment provider identified at checkout. Your payment may also be subject to the provider's terms and conditions.",
      "An order is not considered paid merely because a payment window was opened or a payment attempt was initiated. Payment status is confirmed through the applicable payment-verification process.",
      "If money is debited but your order does not show a confirmed payment, please do not repeatedly attempt payment. Contact customer support with your order number and available payment reference so the status can be checked.",
    ],
  },
  {
    title: "Shipping and Delivery",
    paragraphs: [
      "Delivery availability, shipping charges, estimated timelines, and fulfilment arrangements may depend on your location, product availability, and delivery partner.",
      "Any delivery estimate provided is an estimate rather than a guarantee unless expressly stated otherwise. We will communicate material delivery information through the channels available to us.",
      "Please provide a complete and accurate delivery address and reachable contact number. Delays caused by incorrect details, inaccessible locations, courier disruptions, or circumstances outside reasonable control may affect delivery.",
    ],
  },
  {
    title: "Cancellations, Returns and Refunds",
    paragraphs: [
      "Cancellation, return, replacement, and refund requests are handled according to the applicable store policy and mandatory consumer-protection law.",
      "Eligibility may depend on the product, order status, reason for the request, and applicable timelines. A refund, when approved, may take additional time to appear depending on the payment provider or bank.",
      "Please review the return, refund, and cancellation policy published by Palmyra before ordering. Nothing in these terms is intended to remove rights that cannot legally be excluded.",
    ],
  },
  {
    title: "Acceptable Use",
    paragraphs: [
      "You must not misuse the website, interfere with its operation, attempt unauthorised access, submit fraudulent orders, introduce malicious code, or use the website for unlawful purposes.",
      "We may take reasonable steps to protect the store, customers, and our systems from misuse.",
    ],
  },
  {
    title: "Intellectual Property",
    paragraphs: [
      "Unless otherwise stated, website content such as branding, text, graphics, designs, and other materials is owned by Palmyra or used with permission. You may not copy, reproduce, distribute, or commercially exploit such content without appropriate authorisation.",
      "Product names, marks, or materials belonging to third parties remain the property of their respective owners.",
    ],
  },
  {
    title: "Third-Party Services",
    paragraphs: [
      "The website may rely on third-party services for payment processing, hosting, order management, fulfilment, and delivery. Those services may have their own terms, privacy policies, and operational requirements.",
      "We are not responsible for independent third-party websites or services to the extent permitted by applicable law. This does not limit any responsibility that the law requires us to retain.",
    ],
  },
  {
    title: "Liability and Applicable Law",
    paragraphs: [
      "We take reasonable care to operate the store, but we cannot guarantee uninterrupted or error-free access at all times. To the extent permitted by law, Palmyra is not responsible for losses arising from events outside our reasonable control.",
      "These terms are subject to the laws applicable in India. Any dispute will be handled by a competent forum as determined under applicable law. Nothing in these terms limits statutory consumer rights.",
    ],
  },
  {
    title: "Updates to These Terms",
    paragraphs: [
      "We may update these terms as our store or legal requirements change. The current version will be published on this page with its updated date. Changes will apply as permitted by law.",
    ],
  },
];

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-sm text-white/55 transition hover:text-white">
            ← Back to home
          </Link>
          <span className="rounded-full border border-white/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
            Palmyra · Legal
          </span>
        </div>

        <header className="relative mt-12 overflow-hidden rounded-3xl border border-white/10 bg-[#101116] p-7 sm:mt-16 sm:p-12 lg:p-16">
          <div className="pointer-events-none absolute -right-16 -top-28 h-80 w-80 rounded-full bg-red-600/10 blur-[100px]" />
          <div className="relative max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-400">
              Clear expectations
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-[-0.04em] sm:text-6xl">
              Terms &amp; Conditions<span className="text-red-500">.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">
              The key information about using our store, placing orders,
              making payments, and getting assistance.
            </p>
            <p className="mt-7 text-xs text-white/35">
              Last updated: October 26, 2026
            </p>
          </div>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-12">
          <aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.025] p-5 lg:sticky lg:top-24">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
              On this page
            </p>
            <nav aria-label="Terms sections" className="space-y-1">
              {sections.map((section, index) => (
                <a
                  key={section.title}
                  href={`#terms-${index + 1}`}
                  className="block rounded-lg px-3 py-2 text-xs leading-5 text-white/55 transition hover:bg-white/[0.05] hover:text-white"
                >
                  <span className="mr-2 text-red-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          <div className="min-w-0">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-5 sm:p-6">
              <p className="text-sm leading-7 text-white/70">
                Please review these terms before placing an order.
                They should be read alongside the Privacy Policy and
                any applicable shipping, cancellation, return, and
                refund policies published by Palmyra.
              </p>
            </div>

            <div className="mt-5 divide-y divide-white/10 rounded-2xl border border-white/10 px-5 sm:px-8">
              {sections.map((section, index) => (
                <section
                  key={section.title}
                  id={`terms-${index + 1}`}
                  className="scroll-mt-28 py-8 sm:py-10"
                >
                  <div className="flex items-start gap-4">
                    <span className="mt-1 text-xs font-semibold tracking-widest text-red-400">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                        {section.title}
                      </h2>
                      <div className="mt-4 space-y-4">
                        {section.paragraphs.map((paragraph) => (
                          <p
                            key={paragraph}
                            className="text-sm leading-7 text-white/60 sm:text-base"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              ))}
            </div>

            <section className="mt-8 rounded-2xl border border-white/10 bg-[#101116] p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
                Customer support
              </p>
              <h2 className="mt-3 text-xl font-semibold">
                Need help with an order?
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/55">
                Contact us through our official Instagram account.
                Include your order number when asking about an existing
                order. Never send passwords, card PINs, CVV codes, or
                one-time passwords.
              </p>
              <a
                href="https://www.instagram.com/palmyraofficial/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex rounded-full border border-white/15 px-5 py-3 text-sm font-medium transition hover:border-red-500/50 hover:bg-white/[0.04]"
              >
                Contact Palmyra ↗
              </a>
            </section>
          </div>
        </div>

        <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/40">
          <span>© {new Date().getFullYear()} Palmyra</span>
          <nav aria-label="Other pages" className="flex flex-wrap gap-5">
            <Link className="hover:text-white" href="/about">About</Link>
            <Link className="hover:text-white" href="/privacy-policy">Privacy Policy</Link>
            <Link className="hover:text-white" href="/">Home</Link>
          </nav>
        </footer>
      </section>
    </main>
  );
}
