
import Link from "next/link";

const sections = [
  {
    title: "1. Information We Collect",
    paragraphs: [
      "When you place an order, we may collect your name, phone number, email address, delivery address, city, state, postal code, country, order items, and order-related information.",
      "If you sign in to your account, we may also process the account identifier needed to associate your order with your account.",
      "We do not ask you to send passwords, card numbers, CVV codes, or payment PINs to us through customer support.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    paragraphs: [
      "We use your information to process orders, arrange delivery, verify payments, provide order updates, respond to support requests, prevent fraud, maintain business records, and improve our store.",
      "We may use order information to handle returns, cancellations, refunds, disputes, and legal or accounting obligations where applicable.",
    ],
  },
  {
    title: "3. Payments",
    paragraphs: [
      "Payments on our store may be processed by Razorpay. Payment processing is subject to the payment provider's own terms and privacy practices.",
      "Our store may receive payment-related information such as a payment identifier, payment status, and order reference so we can verify and manage your order. Do not share your banking passwords, card PIN, CVV, or one-time passwords with anyone claiming to represent Palmyra.",
    ],
  },
  {
    title: "4. Service Providers",
    paragraphs: [
      "We use third-party services to operate our website, maintain order records, process payments, and support order fulfilment and delivery. These providers may process relevant information only as needed for their services and under their applicable terms.",
      "Our website infrastructure and database may be provided by services such as Vercel and Supabase. Payment processing may be provided by Razorpay. The providers involved can change as our operations develop.",
    ],
  },
  {
    title: "5. Sharing Information",
    paragraphs: [
      "We do not sell your personal information as a product. We may share relevant information with payment providers, fulfilment partners, delivery providers, technical service providers, or professional advisers when needed to operate our store.",
      "We may also disclose information when required by law, to respond to lawful requests, protect our rights, investigate suspected fraud, or protect customers and the public.",
    ],
  },
  {
    title: "6. Data Retention and Security",
    paragraphs: [
      "We retain information for as long as reasonably necessary to fulfil orders, maintain appropriate business and financial records, resolve disputes, enforce agreements, and meet legal obligations.",
      "We use reasonable technical and organisational measures to protect information. No website, database, or internet transmission can be guaranteed to be completely secure.",
    ],
  },
  {
    title: "7. Cookies and Website Technologies",
    paragraphs: [
      "Our website or its service providers may use essential browser storage, cookies, or similar technologies to support website functionality, security, sessions, and checkout. Additional analytics or advertising technologies, if introduced, should be disclosed as appropriate.",
      "You can manage cookies through your browser settings, although blocking essential technologies may affect some website features.",
    ],
  },
  {
    title: "8. Your Choices and Requests",
    paragraphs: [
      "You may contact us to request access to, correction of, or deletion of personal information, subject to applicable law and legitimate requirements to retain certain records.",
      "We may need to verify your identity before acting on a request. Some information may need to be retained for completed transactions, legal obligations, fraud prevention, or dispute resolution.",
    ],
  },
  {
    title: "9. Children's Privacy",
    paragraphs: [
      "Our store is not intended to collect personal information from children in violation of applicable law. If you believe a child has provided personal information improperly, contact us so we can review the request.",
    ],
  },
  {
    title: "10. Changes to This Policy",
    paragraphs: [
      "We may update this Privacy Policy when our services, practices, or legal obligations change. The latest version will be published on this page with its updated date.",
    ],
  },
];

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-white/65">
            This policy explains how Palmyra handles personal information
            when you visit our website or place an order.
          </p>
          <p className="mt-4 text-sm text-white/45">
            Last updated: October 26, 2026
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <p className="leading-7 text-white/70">
            We aim to collect only information needed to operate our store,
            process orders, arrange fulfilment, and provide customer support.
            Please read this policy to understand our practices.
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
          <h2 className="text-lg font-semibold">Privacy questions?</h2>
          <p className="mt-2 leading-7 text-white/65">
            Please contact Palmyra through the customer-support contact
            details published on our website. We will review privacy
            requests in accordance with applicable law.
          </p>
        </div>

        <footer className="mt-12 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-sm text-white/50">
          <Link className="hover:text-white" href="/terms-and-conditions">
            Terms & Conditions
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
