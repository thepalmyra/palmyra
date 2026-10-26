
import Link from "next/link";

const sections = [
  {
    title: "1. About These Terms",
    paragraphs: [
      "These Terms & Conditions apply to your access to and use of the Palmyra online store, including placing orders through the website.",
      "By using the store or placing an order, you agree to these terms and any applicable policies published on the website. If you do not agree, please do not use the store.",
    ],
  },
  {
    title: "2. Products and Availability",
    paragraphs: [
      "We aim to display product descriptions, images, colours, sizes, and availability accurately. Actual colours may vary depending on your display and device.",
      "Products are subject to availability. We may correct listing errors, update product information, or make products unavailable. A product in your cart is not guaranteed to remain available until your order is accepted.",
    ],
  },
  {
    title: "3. Prices and Charges",
    paragraphs: [
      "Prices are displayed in Indian rupees unless stated otherwise. The price and applicable charges shown at checkout are used to calculate the amount payable for an order.",
      "The website may display an original or reference price alongside a selling price where applicable. Any discount displayed should reflect the prices shown on the product page.",
      "We may correct pricing or calculation errors. If an error affects an order, we will take appropriate steps consistent with applicable law and communicate with the customer where necessary.",
    ],
  },
  {
    title: "4. Orders and Order Numbers",
    paragraphs: [
      "When you submit an order, you must provide accurate contact and delivery information. An order number helps identify and track the order; it does not, by itself, prove that payment has succeeded.",
      "Order confirmation, payment confirmation, and dispatch are separate stages. We may contact you to clarify details or address an issue with an order.",
      "We may decline or cancel an order where reasonably necessary, including in cases of suspected fraud, unavailable products, material listing errors, payment problems, or delivery restrictions, subject to applicable law.",
    ],
  },
  {
    title: "5. Payment",
    paragraphs: [
      "Payments may be processed through Razorpay or another payment provider identified at checkout. Your payment may also be subject to the provider's terms and conditions.",
      "An order is not considered paid merely because a payment window was opened or a payment attempt was initiated. Payment status is confirmed through the applicable payment-verification process.",
      "If money is debited but your order does not show a confirmed payment, please do not repeatedly attempt payment. Contact customer support with your order number and available payment reference so the status can be checked.",
    ],
  },
  {
    title: "6. Shipping and Delivery",
    paragraphs: [
      "Delivery availability, shipping charges, estimated timelines, and fulfilment arrangements may depend on your location, product availability, and delivery partner.",
      "Any delivery estimate provided is an estimate rather than a guarantee unless expressly stated otherwise. We will communicate material delivery information through the channels available to us.",
      "Please provide a complete and accurate delivery address and reachable contact number. Delays caused by incorrect details, inaccessible locations, courier disruptions, or circumstances outside reasonable control may affect delivery.",
    ],
  },
  {
    title: "7. Cancellations, Returns and Refunds",
    paragraphs: [
      "Cancellation, return, replacement, and refund requests are handled according to the applicable store policy and mandatory consumer-protection law.",
      "Eligibility may depend on the product, order status, reason for the request, and applicable timelines. A refund, when approved, may take additional time to appear depending on the payment provider or bank.",
      "Please review the return, refund, and cancellation policy published by Palmyra before ordering. Nothing in these terms is intended to remove rights that cannot legally be excluded.",
    ],
  },
  {
    title: "8. Acceptable Use",
    paragraphs: [
      "You must not misuse the website, interfere with its operation, attempt unauthorised access, submit fraudulent orders, introduce malicious code, or use the website for unlawful purposes.",
      "We may take reasonable steps to protect the store, customers, and our systems from misuse.",
    ],
  },
  {
    title: "9. Intellectual Property",
    paragraphs: [
      "Unless otherwise stated, website content such as branding, text, graphics, designs, and other materials is owned by Palmyra or used with permission. You may not copy, reproduce, distribute, or commercially exploit such content without appropriate authorisation.",
      "Product names, marks, or materials belonging to third parties remain the property of their respective owners.",
    ],
  },
  {
    title: "10. Third-Party Services",
    paragraphs: [
      "The website may rely on third-party services for payment processing, hosting, order management, fulfilment, and delivery. Those services may have their own terms, privacy policies, and operational requirements.",
      "We are not responsible for independent third-party websites or services to the extent permitted by applicable law. This does not limit any responsibility that the law requires us to retain.",
    ],
  },
  {
    title: "11. Liability and Applicable Law",
    paragraphs: [
      "We take reasonable care to operate the store, but we cannot guarantee uninterrupted or error-free access at all times. To the extent permitted by law, Palmyra is not responsible for losses arising from events outside our reasonable control.",
      "These terms are subject to the laws applicable in India. Any dispute will be handled by a competent forum as determined under applicable law. Nothing in these terms limits statutory consumer rights.",
    ],
  },
  {
    title: "12. Updates to These Terms",
    paragraphs: [
      "We may update these terms as our store or legal requirements change. The current version will be published on this page with its updated date. Changes will apply as permitted by law.",
    ],
  },
];

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24">
        <Link
          href="/"
          className="inline-flex text-sm text-white/60 transition hover:text-white"
        >
          ← Back to Home
        </Link>

        <div className="mt-10 border-b border-white/10 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
            PALMYRA · LEGAL
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Terms &amp; Conditions
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-white/65">
            Please read these terms before using the Palmyra store or
            placing an order.
          </p>
          <p className="mt-4 text-sm text-white/45">
            Last updated: October 26, 2026
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <p className="leading-7 text-white/70">
            These terms explain the general rules for using our store,
            placing orders, making payments, and requesting assistance.
            Please also read our Privacy Policy and the applicable
            delivery and returns policies.
          </p>
        </div>

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {section.title}
              </h2>
              <div className="mt-3 space-y-4">
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="leading-7 text-white/65"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg font-semibold">Need help with an order?</h2>
          <p className="mt-2 leading-7 text-white/65">
            Use the customer-support contact details published on the
            Palmyra website. Include your order number when asking about
            an existing order, but never send passwords, card PINs, or
            one-time passwords.
          </p>
        </div>

        <footer className="mt-12 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-sm text-white/50">
          <Link className="hover:text-white" href="/privacy-policy">
            Privacy Policy
          </Link>
          <Link className="hover:text-white" href="/about">
            About Palmyra
          </Link>
          <Link className="hover:text-white" href="/">
            Home
          </Link>
        </footer>
      </section>
    </main>
  );
}
