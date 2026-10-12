
"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useCart } from "@/components/CartContext";

export default function CheckoutPage() {
  const { items, ready } = useCart();
  const [submitted, setSubmitted] = useState(false);

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (!ready) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        Loading checkout...
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl font-bold">
            Your cart is empty
          </h1>
          <p className="mt-4 text-gray-400">
            Add a product before proceeding to checkout.
          </p>
          <Link
            href="/store"
            className="mt-6 inline-block rounded-lg bg-red-600 px-6 py-3 font-semibold hover:bg-red-700"
          >
            Explore the Store
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/cart"
          className="text-sm text-gray-400 hover:text-white"
        >
          ← Back to Cart
        </Link>

        <h1 className="mt-6 text-3xl font-bold sm:text-4xl">
          Checkout
        </h1>
        <p className="mt-2 text-gray-400">
          Enter your details for delivery.
        </p>

        {submitted && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-yellow-600/50 bg-yellow-600/10 p-4"
          >
            <h2 className="font-semibold text-yellow-400">
              Details validated
            </h2>
            <p className="mt-2 text-sm text-gray-300">
              Your form is complete. No order has been placed,
              and no payment has been taken. Order saving and
              payment will be connected in a later step.
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <form
            onSubmit={handleSubmit}
            onChange={() => setSubmitted(false)}
            className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-8"
          >
            <section>
              <h2 className="mb-5 text-xl font-semibold">
                Customer Information
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="fullName" className="mb-2 block text-sm">
                    Full Name *
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    autoComplete="name"
                    required
                    maxLength={100}
                    className="w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="mb-2 block text-sm">
                    Phone Number *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    maxLength={20}
                    className="w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
                    placeholder="Your phone number"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="email" className="mb-2 block text-sm">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    className="w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-5 text-xl font-semibold">
                Delivery Address
              </h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="address" className="mb-2 block text-sm">
                    House Number and Street *
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    autoComplete="street-address"
                    required
                    maxLength={300}
                    rows={3}
                    className="w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
                    placeholder="Enter your full delivery address"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="city" className="mb-2 block text-sm">
                      City *
                    </label>
                    <input
                      id="city"
                      name="city"
                      autoComplete="address-level2"
                      required
                      maxLength={100}
                      className="w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="mb-2 block text-sm">
                      State *
                    </label>
                    <input
                      id="state"
                      name="state"
                      autoComplete="address-level1"
                      required
                      maxLength={100}
                      className="w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
                      placeholder="State"
                    />
                  </div>

                  <div>
                    <label htmlFor="pincode" className="mb-2 block text-sm">
                      PIN Code *
                    </label>
                    <input
                      id="pincode"
                      name="pincode"
                      autoComplete="postal-code"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      title="Enter a valid 6-digit Indian PIN code"
                      required
                      className="w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
                      placeholder="6-digit PIN code"
                    />
                  </div>

                  <div>
                    <label htmlFor="country" className="mb-2 block text-sm">
                      Country *
                    </label>
                    <input
                      id="country"
                      name="country"
                      autoComplete="country-name"
                      defaultValue="India"
                      required
                      maxLength={100}
                      className="w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>
            </section>

            <button
              type="submit"
              className="w-full rounded-lg bg-red-600 px-5 py-4 font-semibold text-white transition hover:bg-red-700"
            >
              Review Delivery Details
            </button>

            <p className="text-xs leading-5 text-gray-500">
              This is a checkout prototype. Your details are not
              saved or sent to a server, and payment is not enabled.
            </p>
          </form>

          <aside className="h-fit rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
            <h2 className="text-xl font-bold">Order Summary</h2>

            <div className="mt-5 space-y-4">
              {items.map((item, index) => (
                <div
                  key={`${item.id}-${item.color}-${item.size}-${index}`}
                  className="flex gap-3"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-20 rounded-lg bg-white object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="mt-1 text-sm text-gray-400">
                      Color: {item.color}
                    </p>
                    <p className="text-sm text-gray-400">
                      Size: {item.size} · Qty: {item.quantity}
                    </p>
                    <p className="mt-1 font-semibold">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
              <div className="flex justify-between gap-3 text-gray-300">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between gap-3 text-gray-400">
                <span>Delivery</span>
                <span>Calculated later</span>
              </div>
              <div className="flex justify-between gap-3 border-t border-white/10 pt-4 text-lg font-bold">
                <span>Subtotal before delivery</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <Link
              href="/store"
              className="mt-6 block text-center text-sm text-gray-300 hover:text-white"
            >
              Continue Shopping
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}