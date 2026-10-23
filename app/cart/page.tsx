
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart, cartItemKey } from "@/components/CartContext";
import { createClient } from "@/lib/supabase/client";

type Product = {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  image: string;
};

const formatPrice = (price: number) =>
  `₹${price.toLocaleString("en-IN")}`;

export default function CartPage() {
  const { items, ready, updateQuantity, removeItem } = useCart();
  const supabase = useMemo(() => createClient(), []);

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setProductsLoading(true);
      setProductsError("");

      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, original_price, image")
        .eq("is_active", true);

      if (cancelled) return;

      if (error) {
        console.error("Cart product loading failed:", error);
        setProductsError(
          "We couldn't verify the latest product prices. Please try again."
        );
      } else {
        setProducts((data ?? []) as Product[]);
      }

      setProductsLoading(false);
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products]
  );

  const subtotal = useMemo(
    () =>
      items.reduce((total, item) => {
        const product = productMap.get(item.id);
        return total + (product?.price ?? item.price) * item.quantity;
      }, 0),
    [items, productMap]
  );

  const totalQuantity = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  const savings = useMemo(
    () =>
      items.reduce((total, item) => {
        const product = productMap.get(item.id);
        const currentPrice = product?.price ?? item.price;
        const originalPrice = product?.original_price ?? currentPrice;

        return (
          total +
          Math.max(0, originalPrice - currentPrice) * item.quantity
        );
      }, 0),
    [items, productMap]
  );

  const unavailableItems = items.filter(
    (item) => !productMap.has(item.id)
  );

  if (!ready) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#080808] px-5 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-red-500" />
          <p className="text-sm text-gray-400">
            Loading your Palmyra cart...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] px-4 py-8 text-white sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 border-b border-white/10 pb-6 sm:mb-10">
          <Link
            href="/store"
            className="mb-5 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >
            <span aria-hidden="true">←</span>
            Continue shopping
          </Link>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-red-500">
                PALMYRA STORE
              </p>
              <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                Your Cart<span className="text-red-500">.</span>
              </h1>
              <p className="mt-3 text-sm text-gray-400 sm:text-base">
                Your style. Your game. Your Palmyra.
              </p>
            </div>

            {items.length > 0 && (
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gray-300">
                {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="mt-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-gray-400 sm:text-sm">
              <span className="flex items-center gap-2 text-white">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white">
                  1
                </span>
                Cart
              </span>
              <span className="h-px flex-1 bg-white/10" />
              <span className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/20">
                  2
                </span>
                Checkout
              </span>
              <span className="h-px flex-1 bg-white/10" />
              <span className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/20">
                  3
                </span>
                Payment
              </span>
            </div>
          )}
        </div>

        {productsError && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
          >
            <p>{productsError}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-2 font-semibold underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {items.length === 0 ? (
          <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#171717] to-[#0c0c0c] px-5 py-16 text-center sm:py-24">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-3xl text-red-400">
              ♧
            </div>
            <p className="mt-7 text-xs font-bold uppercase tracking-[0.3em] text-red-500">
              READY WHEN YOU ARE
            </p>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
              Your cart is waiting for something great.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-400 sm:text-base">
              Discover Palmyra gear and find your next favourite.
              Your selected products will appear here.
            </p>
            <Link
              href="/store"
              className="mt-8 inline-flex items-center justify-center rounded-xl bg-red-600 px-7 py-3.5 font-bold text-white transition hover:bg-red-700"
            >
              Explore the collection →
            </Link>
          </section>
        ) : (
          <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_350px]">
            <section className="min-w-0">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold sm:text-xl">
                  Selected products
                </h2>
                <span className="text-xs text-gray-500">
                  Prices in INR
                </span>
              </div>

              {unavailableItems.length > 0 && (
                <div
                  role="alert"
                  className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200"
                >
                  Some items are no longer available. Remove them from
                  your cart before proceeding to checkout.
                </div>
              )}

              {productsLoading && (
                <p className="mb-4 text-sm text-gray-400">
                  Checking current product prices...
                </p>
              )}

              <div className="space-y-4">
                {items.map((item) => {
                  const key = cartItemKey(item);
                  const product = productMap.get(item.id);
                  const currentPrice = product?.price ?? item.price;
                  const originalPrice =
                    product?.original_price ?? currentPrice;
                  const itemSavings =
                    Math.max(0, originalPrice - currentPrice) *
                    item.quantity;

                  return (
                    <article
                      key={key}
                      className="group rounded-2xl border border-white/10 bg-[#111111] p-4 transition hover:border-white/20 sm:p-5"
                    >
                      <div className="flex gap-4 sm:gap-5">
                        <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-white sm:h-36 sm:w-32">
                          <img
                            src={product?.image || item.image}
                            alt={product?.name || item.name}
                            className="h-full w-full object-contain p-1 transition duration-300 group-hover:scale-105"
                          />
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="break-words font-bold leading-snug sm:text-lg">
                                {product?.name || item.name}
                              </h3>
                              <p className="mt-2 text-xs text-gray-400 sm:text-sm">
                                Colour: {item.color}
                              </p>
                              <p className="mt-1 text-xs text-gray-400 sm:text-sm">
                                Size: {item.size}
                              </p>

                              {!product && !productsLoading && (
                                <p className="mt-2 text-xs font-medium text-amber-300">
                                  Unavailable — please remove this item
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(key)}
                              aria-label={`Remove ${item.name} from cart`}
                              className="shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-red-500/10 hover:text-red-400"
                              title="Remove item"
                            >
                              <svg
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                className="h-5 w-5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M3 6h18M9 6V4h6v2m-9 0 1 14h8l1-14M10 10v6m4-6v6"
                                />
                              </svg>
                            </button>
                          </div>

                          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
                            <label className="text-xs text-gray-400">
                              Quantity
                              <select
                                value={item.quantity}
                                onChange={(event) =>
                                  updateQuantity(
                                    key,
                                    Number(event.target.value)
                                  )
                                }
                                className="ml-2 rounded-lg border border-white/15 bg-[#080808] px-2 py-2 text-sm text-white outline-none focus:border-red-500"
                              >
                                {Array.from(
                                  { length: 10 },
                                  (_, index) => index + 1
                                ).map((quantity) => (
                                  <option key={quantity} value={quantity}>
                                    {quantity}
                                  </option>
                                ))}
                              </select>
                            </label>

                            <div className="text-right">
                              <p className="font-bold sm:text-lg">
                                {formatPrice(currentPrice * item.quantity)}
                              </p>
                              {item.quantity > 1 && (
                                <p className="mt-1 text-xs text-gray-500">
                                  {formatPrice(currentPrice)} each
                                </p>
                              )}
                              {itemSavings > 0 && (
                                <p className="mt-1 text-xs font-medium text-emerald-400">
                                  Save {formatPrice(itemSavings)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-[#111111] p-5">
                <h3 className="font-semibold">Still exploring?</h3>
                <p className="mt-1 text-sm leading-6 text-gray-400">
                  Browse the collection and come back whenever you are ready.
                </p>
                <Link
                  href="/store"
                  className="mt-3 inline-flex text-sm font-semibold text-red-400 hover:text-red-300"
                >
                  Discover more products →
                </Link>
              </div>
            </section>

            <aside className="lg:sticky lg:top-6">
              <div className="rounded-2xl border border-white/10 bg-[#111111] p-5 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
                  YOUR ORDER
                </p>
                <h2 className="mt-2 text-2xl font-bold">Order summary</h2>

                <div className="mt-6 space-y-4 text-sm">
                  <div className="flex justify-between gap-4 text-gray-300">
                    <span>Subtotal ({totalQuantity} items)</span>
                    <span className="font-medium text-white">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  {savings > 0 && (
                    <div className="flex justify-between gap-4 text-emerald-400">
                      <span>Product savings</span>
                      <span>-{formatPrice(savings)}</span>
                    </div>
                  )}

                  <div className="flex justify-between gap-4 text-gray-400">
                    <span>Delivery</span>
                    <span className="text-right">
                      Calculated at checkout
                    </span>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-semibold">Subtotal</span>
                      <span className="text-xl font-black">
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-gray-500">
                      The final payable amount is calculated at checkout.
                    </p>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  aria-disabled={
                    productsLoading ||
                    Boolean(productsError) ||
                    unavailableItems.length > 0
                  }
                  onClick={(event) => {
                    if (
                      productsLoading ||
                      productsError ||
                      unavailableItems.length > 0
                    ) {
                      event.preventDefault();
                    }
                  }}
                  className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 font-bold text-white transition ${
                    productsLoading ||
                    productsError ||
                    unavailableItems.length > 0
                      ? "cursor-not-allowed bg-red-900/60 opacity-60"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  Proceed to checkout →
                </Link>

                <Link
                  href="/store"
                  className="mt-3 flex w-full items-center justify-center rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-300 transition hover:border-white/25 hover:text-white"
                >
                  Continue shopping
                </Link>

                <div className="mt-6 border-t border-white/10 pt-5">
                  <p className="text-sm font-semibold">Checkout securely</p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Review your order and payment options at checkout.
                  </p>
                </div>
              </div>

              <p className="mt-4 text-center text-xs leading-5 text-gray-500">
                Thanks for choosing Palmyra. Wear your passion.
              </p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
