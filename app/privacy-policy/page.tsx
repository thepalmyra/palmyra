
import Link from "next/link";

const sections = [
  {
    title: "Information We Collect",
    paragraphs: [
      "When you place an order, we may collect your name, phone number, email address, delivery address, city, state, postal code, country, order items, and order-related information.",
      "If you sign in to your account, we may also process the account identifier needed to associate your order with your account.",
      "We do not ask you to send passwords, card numbers, CVV codes, or payment PINs to us through customer support.",
    ],
  },
  {
    title: "How We Use Your Information",
    paragraphs: [
      "We use your information to process orders, arrange delivery, verify payments, provide order updates, respond to support requests, prevent fraud, maintain business records, and improve our store.",
      "We may use order information to handle returns, cancellations, refunds, disputes, and legal or accounting obligations where applicable.",
    ],
  },
  {
    title: "Payments",
    paragraphs: [
      "Payments on our store may be processed by Razorpay. Payment processing is subject to the payment provider's own terms and privacy practices.",
      "Our store may receive payment-related information such as a payment identifier, payment status, and order reference so we can verify and manage your order. Do not share banking passwords, card PINs, CVV codes, or one-time passwords with anyone claiming to represent Palmyra.",
    ],
  },
  {
    title: "Service Providers",
    paragraphs: [
      "We use third-party services to operate our website, maintain order records, process payments, and support order fulfilment and delivery. These providers may process relevant information as needed to provide their services and under their applicable terms.",
      "Our website infrastructure and database may be provided by services such as Vercel and Supabase. Payment processing may be provided by Razorpay. The providers involved can change as our operations develop.",
    ],
  },
  {
    title: "Sharing Information",
    paragraphs: [
      "We do not sell your personal information as a product. We may share relevant information with payment providers, fulfilment partners, delivery providers, technical service providers, or professional advisers when needed to operate our store.",
      "We may also disclose information when required by law, to respond to lawful requests, protect our rights, investigate suspected fraud, or protect customers and the public.",
    ],
  },
  {
    title: "Data Retention and Security",
    paragraphs: [
      "We retain information for as long as reasonably necessary to fulfil orders, maintain appropriate business and financial records, resolve disputes, enforce agreements, and meet legal obligations.",
      "We use reasonable technical and organisational measures to protect information. No website, database, or internet transmission can be guaranteed to be completely secure.",
    ],
  },
  {
    title: "Cookies and Website Technologies",
    paragraphs: [
      "Our website or its service providers may use essential browser storage, cookies, or similar technologies to support website functionality, security, sessions, and checkout. Additional analytics or advertising technologies, if introduced, should be disclosed as appropriate.",
      "You can manage cookies through your browser settings, although blocking essential technologies may affect some website features.",
    ],
  },
  {
    title: "Your Choices and Requests",
    paragraphs: [
      "You may contact us to request access to, correction of, or deletion of personal information, subject to applicable law and legitimate requirements to retain certain records.",
      "We may need to verify your identity before acting on a request. Some information may need to be retained for completed transactions, legal obligations, fraud prevention, or dispute resolution.",
    ],
  },
  {
    title: "Children's Privacy",
    paragraphs: [
      "Our store is not intended to collect personal information from children in violation of applicable law. If you believe a child has provided personal information improperly, contact us so we can review the request.",
    ],
  },
  {
    title: "Changes to This Policy",
    paragraphs: [
      "We may update this Privacy Policy when our services, practices, or legal obligations change. The latest version will be published on this page with its updated date.",
    ],
  },
];

export default function PrivacyPolicyPage() {
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
              Your information matters
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-[-0.04em] sm:text-6xl">
              Privacy Policy<span className="text-red-500">.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">
              A clear explanation of how information is handled when you
              browse Palmyra, use our store, or place an order.
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
            <nav aria-label="Privacy policy sections" className="space-y-1">
              {sections.map((section, index) => (
                <a
                  key={section.title}
                  href={`#privacy-${index + 1}`}
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
                We aim to collect and use information responsibly to
                operate our store, process orders, arrange fulfilment,
                and provide customer support. This policy describes our
                intended practices; it should be read alongside
                applicable law and the actual services used by our store.
              </p>
            </div>

            <div className="mt-5 divide-y divide-white/10 rounded-2xl border border-white/10 px-5 sm:px-8">
              {sections.map((section, index) => (
                <section
                  key={section.title}
                  id={`privacy-${index + 1}`}
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
                Need assistance?
              </p>
              <h2 className="mt-3 text-xl font-semibold">Privacy questions?</h2>
              <p className="mt-3 text-sm leading-7 text-white/55">
                Contact Palmyra through our official Instagram account.
                Please do not send passwords, payment PINs, CVV codes,
                or one-time passwords.
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
            <Link className="hover:text-white" href="/terms-and-conditions">Terms &amp; Conditions</Link>
            <Link className="hover:text-white" href="/">Home</Link>
          </nav>
        </footer>
      </section>
    </main>
  );
}
