"use client";

import Link from "next/link";
import { useCart, cartItemKey } from "@/components/CartContext";

export default function CartPage() {
  const { items, ready, updateQuantity, removeItem } = useCart();

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  if (!ready) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white">
        Loading your cart...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-3xl font-bold sm:text-4xl">
          Your Shopping Cart
        </h1>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="mb-4 text-lg text-gray-300">
              Your cart is empty.
            </p>
            <Link
              href="/store"
              className="inline-block rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700"
            >
              Explore the Store
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <section className="space-y-4">
              {items.map((item) => (
                <article
                  key={cartItemKey(item)}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-28 w-24 rounded-lg bg-white object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold">{item.name}</h2>
                    <p className="mt-1 text-sm text-gray-400">
                      Color: {item.color}
                    </p>
                    <p className="text-sm text-gray-400">
                      Size: {item.size}
                    </p>
                    <p className="mt-2 font-semibold">
                      ₹{item.price.toLocaleString("en-IN")}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <label className="text-sm text-gray-300">
                        Quantity
                        <select
                          value={item.quantity}
                          onChange={(event) =>
                            updateQuantity(
                              cartItemKey(item),
                              Number(event.target.value)
                            )
                          }
                          className="ml-2 rounded-md border border-white/20 bg-black px-2 py-1 text-white"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((quantity) => (
                            <option key={quantity} value={quantity}>
                              {quantity}
                            </option>
                          ))}
                        </select>
                      </label>

                      <button
                        type="button"
                        onClick={() => removeItem(cartItemKey(item))}
                        className="text-sm text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>

                    <p className="mt-2 text-sm text-gray-300">
                      Item total: ₹
                      {(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                </article>
              ))}
            </section>

            <aside className="h-fit rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-bold">Order Summary</h2>

              <div className="mt-5 flex justify-between gap-4 text-gray-300">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>

              <p className="mt-3 text-sm text-gray-400">
                Delivery charges will be calculated at checkout.
              </p>

              <div className="mt-5 border-t border-white/10 pt-4">
                <div className="flex justify-between gap-4 text-lg font-bold">
                  <span>Total</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="mt-6 block rounded-lg bg-red-600 px-5 py-3 text-center font-semibold text-white hover:bg-red-700"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/store"
                className="mt-4 block text-center text-sm text-gray-300 hover:text-white"
              >
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}