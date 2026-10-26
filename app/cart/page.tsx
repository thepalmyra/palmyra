
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
  is_out_of_stock: boolean;
};

type ProductRow = {
  id: string;
  name: string;
  price: number | string;
  original_price: number | string | null;
  image: string | null;
  is_out_of_stock: boolean | null;
};

const formatPrice = (price: number) =>
  `₹${price.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

function DiscountBadge({
  percentage,
}: {
  percentage: number;
}) {
  return (
    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold tracking-wide text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
      {percentage}% OFF
    </span>
  );
}

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-4 w-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 6h18M9 6V4h6v2m-9 0 1 14h8l1-14M10 10v6m4-6v6"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m9 12 2 2 4-4"
      />
    </svg>
  );
}

export default function CartPage() {
  const { items, ready, updateQuantity, removeItem } = useCart();
  const supabase = useMemo(() => createClient(), []);

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [showClearConfirmation, setShowClearConfirmation] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setProductsLoading(true);
      setProductsError("");

      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, price, original_price, image, is_out_of_stock"
        )
        .eq("is_active", true);

      if (cancelled) return;

      if (error) {
        console.error("Cart product loading failed:", error);
        setProducts([]);
        setProductsError(
          "We couldn't verify the latest prices. Please try again before checkout."
        );
      } else {
        const rows = (data ?? []) as ProductRow[];

        const normalizedProducts: Product[] = rows.map((row) => ({
          id: row.id,
          name: row.name,
          price: Number(row.price),
          original_price:
            row.original_price === null
              ? null
              : Number(row.original_price),
          image: row.image ?? "",
          is_out_of_stock: row.is_out_of_stock === true,
        }));

        const hasInvalidPrice = normalizedProducts.some(
          (product) =>
            !Number.isFinite(product.price) ||
            product.price <= 0 ||
            (product.original_price !== null &&
              (!Number.isFinite(product.original_price) ||
                product.original_price < 0))
        );

        if (hasInvalidPrice) {
          setProducts([]);
          setProductsError(
            "Some product prices couldn't be verified. Please try again later."
          );
        } else {
          setProducts(normalizedProducts);
        }
      }

      setProductsLoading(false);
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [supabase, refreshKey]);

  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products]
  );

  const totalQuantity = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  const unavailableItems = useMemo(
    () => items.filter((item) => !productMap.has(item.id)),
    [items, productMap]
  );

  const outOfStockItems = useMemo(
    () =>
      items.filter(
        (item) => productMap.get(item.id)?.is_out_of_stock === true
      ),
    [items, productMap]
  );

  const pricingReady =
    ready &&
    !productsLoading &&
    !productsError &&
    unavailableItems.length === 0;

  const subtotal = useMemo(
    () =>
      items.reduce((total, item) => {
        const product = productMap.get(item.id);

        if (!product) return total;

        return total + product.price * item.quantity;
      }, 0),
    [items, productMap]
  );

  const savings = useMemo(
    () =>
      items.reduce((total, item) => {
        const product = productMap.get(item.id);

        if (!product || product.original_price === null) {
          return total;
        }

        const discount = Math.max(
          0,
          product.original_price - product.price
        );

        return total + discount * item.quantity;
      }, 0),
    [items, productMap]
  );

  const canCheckout =
    pricingReady && outOfStockItems.length === 0 && items.length > 0;

  function clearCart() {
    items.forEach((item) => removeItem(cartItemKey(item)));
    setShowClearConfirmation(false);
  }

  if (!ready) {
    return (
      <main className="flex min-h-[75vh] items-center justify-center bg-[#080808] px-5 text-white">
        <div className="text-center">
          <div className="mx-auto mb-5 h-11 w-11 animate-spin rounded-full border-2 border-white/10 border-t-red-500" />
          <p className="text-sm font-medium text-gray-300">
            Preparing your Palmyra cart
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Just a moment...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#080808] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 right-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top_left,rgba(220,38,38,0.12),transparent_60%)]"
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            href="/store"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition hover:text-white"
          >
            <span aria-hidden="true" className="text-lg">
              ←
            </span>
            Continue shopping
          </Link>

          <Link
            href="/store"
            aria-label="Palmyra Store home"
            className="text-lg font-black tracking-[0.18em] sm:text-xl"
          >
            PALMYRA<span className="text-red-500">.</span>
          </Link>
        </div>

        {/* Page introduction */}
        <section className="mb-8 border-b border-white/10 pb-7 sm:mb-10 sm:pb-9">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.32em] text-red-400 sm:text-xs">
                YOUR COLLECTION STARTS HERE
              </p>
              <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
                Your Cart<span className="text-red-500">.</span>
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-6 text-gray-400 sm:text-base">
                Your style. Your game. Your Palmyra. Review your picks
                before making them yours.
              </p>
            </div>

            {items.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3">
                <p className="text-xs text-gray-500">YOUR SELECTION</p>
                <p className="mt-1 text-xl font-bold">
                  {totalQuantity}{" "}
                  <span className="text-sm font-normal text-gray-400">
                    {totalQuantity === 1 ? "item" : "items"}
                  </span>
                </p>
              </div>
            )}
          </div>

          <div className="mt-7 flex max-w-xl items-center gap-2 sm:mt-8 sm:gap-3">
            {[
              { number: "01", label: "Cart", active: true },
              { number: "02", label: "Checkout", active: false },
              { number: "03", label: "Payment", active: false },
            ].map((step, index) => (
              <div
                key={step.number}
                className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                      step.active
                        ? "bg-red-600 text-white"
                        : "border border-white/15 bg-white/[0.03] text-gray-500"
                    }`}
                  >
                    {step.number}
                  </span>
                  <span
                    className={`text-xs font-semibold sm:text-sm ${
                      step.active ? "text-white" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < 2 && (
                  <div className="h-px min-w-2 flex-1 bg-white/10" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Price verification status */}
        {productsLoading && items.length > 0 && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/20 border-t-red-500" />
            <p className="text-sm text-gray-300">
              Verifying current product prices and availability...
            </p>
          </div>
        )}

        {productsError && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/[0.07] p-5"
          >
            <p className="font-semibold text-red-300">
              Price verification unavailable
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              {productsError}
            </p>
            <button
              type="button"
              onClick={() => setRefreshKey((value) => value + 1)}
              className="mt-4 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold transition hover:bg-red-500"
            >
              Retry verification
            </button>
          </div>
        )}

        {/* Empty cart */}
        {items.length === 0 ? (
          <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#181818] via-[#101010] to-[#0b0b0b] px-5 py-16 text-center sm:py-24">
            <div
              aria-hidden="true"
              className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-red-600/10 blur-3xl"
            />
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-red-500/25 bg-red-500/10">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                className="h-9 w-9 text-red-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l2.2 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 7H6"
                />
                <circle cx="10" cy="20" r="1" />
                <circle cx="18" cy="20" r="1" />
              </svg>
            </div>

            <p className="relative mt-7 text-xs font-bold uppercase tracking-[0.3em] text-red-400">
              ROOM FOR SOMETHING GREAT
            </p>
            <h2 className="relative mt-3 text-2xl font-black sm:text-4xl">
              Your cart is looking empty.
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-sm leading-6 text-gray-400 sm:text-base">
              Explore the Palmyra collection and find gear that matches
              your passion.
            </p>

            <Link
              href="/store"
              className="relative mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-7 py-4 text-sm font-bold transition hover:bg-red-500"
            >
              Explore the collection
              <span aria-hidden="true">→</span>
            </Link>
          </section>
        ) : (
          <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-9">
            {/* Cart items */}
            <section className="min-w-0">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold sm:text-2xl">
                    Selected products
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    {totalQuantity}{" "}
                    {totalQuantity === 1 ? "item" : "items"} in your cart
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowClearConfirmation(true)}
                  className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-500 transition hover:bg-red-500/10 hover:text-red-400"
                >
                  Clear cart
                </button>
              </div>

              {showClearConfirmation && (
                <div
                  role="alertdialog"
                  aria-modal="true"
                  aria-labelledby="clear-cart-title"
                  className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/[0.06] p-5"
                >
                  <h3 id="clear-cart-title" className="font-bold">
                    Remove everything?
                  </h3>
                  <p className="mt-2 text-sm text-gray-400">
                    This will remove all {totalQuantity}{" "}
                    {totalQuantity === 1 ? "item" : "items"} from your cart.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={clearCart}
                      className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold hover:bg-red-500"
                    >
                      Clear everything
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowClearConfirmation(false)}
                      className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-gray-300 hover:bg-white/5"
                    >
                      Keep my items
                    </button>
                  </div>
                </div>
              )}

              {unavailableItems.length > 0 && !productsLoading && !productsError && (
                <div
                  role="alert"
                  className="mb-5 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] p-4"
                >
                  <p className="text-sm font-semibold text-amber-300">
                    Some products are no longer available
                  </p>
                  <p className="mt-1 text-sm leading-6 text-gray-400">
                    Remove unavailable products from your cart before
                    continuing to checkout.
                  </p>
                </div>
              )}

              {outOfStockItems.length > 0 && (
                <div
                  role="alert"
                  className="mb-5 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] p-4"
                >
                  <p className="text-sm font-semibold text-amber-300">
                    One or more products are out of stock
                  </p>
                  <p className="mt-1 text-sm leading-6 text-gray-400">
                    You can remove unavailable items or continue shopping.
                    Checkout is disabled until stock is available.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {items.map((item) => {
                  const key = cartItemKey(item);
                  const product = productMap.get(item.id);
                  const currentPrice = product?.price ?? null;
                  const originalPrice = product?.original_price ?? null;
                  const hasDiscount =
                    currentPrice !== null &&
                    originalPrice !== null &&
                    originalPrice > currentPrice;

                  const discountPercentage =
                    hasDiscount && originalPrice !== null && currentPrice !== null
                      ? Math.round(
                          ((originalPrice - currentPrice) / originalPrice) *
                            100
                        )
                      : 0;

                  const itemSavings =
                    hasDiscount && currentPrice !== null && originalPrice !== null
                      ? (originalPrice - currentPrice) * item.quantity
                      : 0;

                  const outOfStock = product?.is_out_of_stock === true;

                  return (
                    <article
                      key={key}
                      className={`group rounded-2xl border bg-[#111111] p-4 transition duration-200 sm:p-5 ${
                        outOfStock
                          ? "border-amber-500/20"
                          : "border-white/[0.08] hover:border-white/20"
                      }`}
                    >
                      <div className="flex gap-4 sm:gap-5">
                        <Link
                          href="/store"
                          aria-label={`Browse ${product?.name ?? item.name} in the store`}
                          className="relative flex h-28 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white sm:h-36 sm:w-32"
                        >
                          <img
                            src={product?.image || item.image}
                            alt={product?.name || item.name}
                            className={`h-full w-full object-contain p-1 transition duration-300 group-hover:scale-105 ${
                              outOfStock ? "opacity-50" : ""
                            }`}
                          />
                          {outOfStock && (
                            <span className="absolute inset-x-1 bottom-2 rounded-md bg-black/85 px-1 py-1 text-center text-[9px] font-bold uppercase tracking-wide text-amber-300">
                              Out of stock
                            </span>
                          )}
                        </Link>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500 sm:text-[10px]">
                                PALMYRA COLLECTION
                              </p>
                              <h3 className="mt-1 break-words text-sm font-bold leading-snug sm:text-lg">
                                {product?.name || item.name}
                              </h3>

                              {hasDiscount && (
                                <div className="mt-2">
                                  <DiscountBadge
                                    percentage={discountPercentage}
                                  />
                                </div>
                              )}

                              <div className="mt-2 space-y-1 text-xs text-gray-400">
                                <p>Colour: {item.color}</p>
                                <p>Size: {item.size}</p>
                              </div>

                              {!product && !productsLoading && !productsError && (
                                <p className="mt-2 text-xs font-semibold text-amber-300">
                                  Unavailable — remove this item
                                </p>
                              )}

                              {outOfStock && (
                                <p className="mt-2 text-xs font-semibold text-amber-300">
                                  Currently unavailable
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(key)}
                              aria-label={`Remove ${item.name} from cart`}
                              title="Remove item"
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] text-gray-500 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                            >
                              <TrashIcon />
                            </button>
                          </div>

                          <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-5">
                            <div>
                              <label
                                htmlFor={`quantity-${key}`}
                                className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500"
                              >
                                Quantity
                              </label>
                              <select
                                id={`quantity-${key}`}
                                value={item.quantity}
                                onChange={(event) =>
                                  updateQuantity(
                                    key,
                                    Number(event.target.value)
                                  )
                                }
                                className="mt-2 rounded-xl border border-white/10 bg-[#080808] px-3 py-2.5 text-sm text-white outline-none transition focus:border-red-500"
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
                            </div>

                            <div className="text-right">
                              <p className="text-base font-black sm:text-xl">
                                {currentPrice !== null
                                  ? formatPrice(currentPrice * item.quantity)
                                  : "Price unavailable"}
                              </p>

                              {currentPrice !== null && item.quantity > 1 && (
                                <p className="mt-1 text-xs text-gray-500">
                                  {formatPrice(currentPrice)} each
                                </p>
                              )}

                              {hasDiscount && originalPrice !== null && (
                                <p className="mt-1 text-xs text-gray-500 line-through">
                                  {formatPrice(originalPrice * item.quantity)}
                                </p>
                              )}

                              {itemSavings > 0 && (
                                <p className="mt-1 text-xs font-semibold text-emerald-400">
                                  You save {formatPrice(itemSavings)}
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

              {/* Store benefits */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="flex gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-gray-300">
                    <ShieldIcon />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      Secure checkout
                    </p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Payment is processed through the checkout payment
                      provider.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-gray-300">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 7h11v11H3zM14 11h4l3 3v4h-7z"
                      />
                      <circle cx="7.5" cy="19" r="1.5" />
                      <circle cx="17.5" cy="19" r="1.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      Delivery details at checkout
                    </p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Review your delivery information before paying.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/store"
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-gray-300 transition hover:border-white/25 hover:text-white"
              >
                <span aria-hidden="true">←</span>
                Continue exploring
              </Link>
            </section>

            {/* Order summary */}
            <aside className="lg:sticky lg:top-6">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
                <div className="border-b border-white/10 bg-gradient-to-r from-red-600/[0.12] to-transparent p-5 sm:p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-red-400">
                    YOUR ORDER
                  </p>
                  <h2 className="mt-2 text-2xl font-black">
                    Order summary
                  </h2>
                  <p className="mt-2 text-xs text-gray-500">
                    Review your selection before checkout.
                  </p>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="space-y-4 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-gray-400">
                        Items ({totalQuantity})
                      </span>
                      <span className="font-semibold text-white">
                        {pricingReady ? formatPrice(subtotal) : "—"}
                      </span>
                    </div>

                    {savings > 0 && (
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-emerald-400">
                          Total product savings
                        </span>
                        <span className="font-semibold text-emerald-400">
                          −{formatPrice(savings)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-4">
                      <span className="text-gray-400">Delivery</span>
                      <span className="max-w-[170px] text-right text-xs leading-5 text-gray-500">
                        Calculated at checkout
                      </span>
                    </div>
                  </div>

                  <div className="my-5 border-t border-dashed border-white/15" />

                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="font-bold">Subtotal</p>
                      <p className="mt-1 text-xs text-gray-500">
                        Before checkout fees
                      </p>
                    </div>
                    <p className="text-2xl font-black tracking-tight">
                      {pricingReady ? formatPrice(subtotal) : "—"}
                    </p>
                  </div>

                  <p className="mt-4 text-xs leading-5 text-gray-500">
                    The final payable amount, including applicable fees,
                    will be confirmed at checkout.
                  </p>

                  <Link
                    href={canCheckout ? "/checkout" : "#cart-items"}
                    aria-disabled={!canCheckout}
                    onClick={(event) => {
                      if (!canCheckout) {
                        event.preventDefault();
                      }
                    }}
                    className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 text-sm font-bold transition ${
                      canCheckout
                        ? "bg-red-600 text-white shadow-lg shadow-red-950/20 hover:bg-red-500"
                        : "cursor-not-allowed bg-white/[0.07] text-gray-500"
                    }`}
                  >
                    {productsLoading
                      ? "Verifying prices..."
                      : productsError
                        ? "Prices not verified"
                        : unavailableItems.length > 0
                          ? "Review unavailable items"
                          : outOfStockItems.length > 0
                            ? "Item out of stock"
                            : "Proceed to checkout"}
                    {canCheckout && (
                      <span aria-hidden="true">→</span>
                    )}
                  </Link>

                  {!canCheckout && !productsLoading && !productsError && (
                    <p className="mt-3 text-center text-xs leading-5 text-amber-300">
                      Resolve unavailable or out-of-stock items to continue.
                    </p>
                  )}

                  <div className="mt-5 flex items-start gap-2 border-t border-white/[0.08] pt-5">
                    <div className="mt-0.5 text-emerald-400">
                      <ShieldIcon />
                    </div>
                    <p className="text-xs leading-5 text-gray-500">
                      Your final payment amount is calculated and validated
                      by the server during checkout.
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-center text-xs leading-5 text-gray-600">
                Thanks for choosing Palmyra.
                <br />
                Wear your passion.
              </p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
