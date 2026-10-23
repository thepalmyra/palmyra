
"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/components/CartContext";

type MessageType = "error" | "success";

type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  description: string;
  image: string;
  images: string[];
  sizes: string[];
  colors: string[];
  colorImages?: Record<string, string>;
};

type DatabaseProduct = {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  category: string;
  description: string;
  image: string;
  images: string[] | null;
  sizes: string[] | null;
  colors: string[] | null;
  color_images: Record<string, string> | null;
};

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const { addItem, ready } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState<MessageType>("error");

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setLoadError("");
      setProduct(null);

      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, price, original_price, category, description, image, images, sizes, colors, color_images"
        )
        .eq("id", params.id)
        .eq("is_active", true)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error("Product loading failed:", error);
        setLoadError(
          "We couldn't load this product. Please try again."
        );
        setLoading(false);
        return;
      }

      if (!data) {
        setProduct(null);
        setLoading(false);
        return;
      }

      const row = data as DatabaseProduct;

      const loadedProduct: Product = {
        id: row.id,
        name: row.name,
        price: row.price,
        originalPrice: row.original_price ?? undefined,
        category: row.category,
        description: row.description ?? "",
        image: row.image,
        images: Array.isArray(row.images) ? row.images : [],
        sizes: Array.isArray(row.sizes) ? row.sizes : [],
        colors: Array.isArray(row.colors) ? row.colors : [],
        colorImages: row.color_images ?? {},
      };

      setProduct(loadedProduct);
      setSelectedImage(loadedProduct.image);
      setLoading(false);
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [params.id, supabase]);

  const currentImage =
    product?.colorImages?.[selectedColor] ||
    selectedImage ||
    product?.image ||
    "";

  function clearMessage() {
    setMessage("");
  }

  function validateSelection(): boolean {
    if (!product) return false;

    if (!ready) {
      setMessage("Your cart is loading. Please try again shortly.");
      setMessageType("error");
      return false;
    }

    if (
      product.colors.length > 0 &&
      (!selectedColor || !product.colors.includes(selectedColor))
    ) {
      setMessage("Please select a color before continuing.");
      setMessageType("error");
      return false;
    }

    if (
      product.sizes.length > 0 &&
      (!selectedSize || !product.sizes.includes(selectedSize))
    ) {
      setMessage("Please select a size before continuing.");
      setMessageType("error");
      return false;
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      setMessage("Please select a valid quantity.");
      setMessageType("error");
      return false;
    }

    return true;
  }

  function addSelectedProductToCart(): boolean {
    if (!product || !validateSelection()) return false;

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: currentImage,
      color: product.colors.length > 0 ? selectedColor : "Default",
      size: product.sizes.length > 0 ? selectedSize : "One Size",
      quantity,
    });

    return true;
  }

  function handleAddToCart() {
    if (!addSelectedProductToCart()) return;

    setMessage("Added to your cart successfully!");
    setMessageType("success");
  }

  function handleBuyNow() {
    if (!addSelectedProductToCart()) return;

    router.push("/checkout");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <p className="text-sm text-gray-400">Loading product...</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="min-h-screen bg-black px-6 py-24 text-center text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-500">
          PALMYRA STORE
        </p>
        <h1 className="mt-4 text-2xl font-bold">
          Unable to load product
        </h1>
        <p className="mt-3 text-gray-400">{loadError}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
        >
          Try Again
        </button>
        <div>
          <Link
            href="/store"
            className="mt-5 inline-block text-sm text-gray-400 hover:text-white"
          >
            Back to Store
          </Link>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-black px-6 py-24 text-center text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-500">
          PALMYRA STORE
        </p>
        <h1 className="mt-4 text-2xl font-bold">Product not found</h1>
        <p className="mt-3 text-gray-400">
          This product may no longer be available.
        </p>
        <Link
          href="/store"
          className="mt-6 inline-block rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
        >
          Back to Store
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="transition hover:text-white">
            Home
          </Link>
          <span>/</span>
          <Link href="/store" className="transition hover:text-white">
            Store
          </Link>
          <span>/</span>
          <span className="max-w-[220px] truncate text-white">
            {product.name}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14">
          <section>
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
              <div className="absolute left-4 top-4 z-10 rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-200">
                Palmyra Collection
              </div>
              <img
                src={currentImage}
                alt={product.name}
                className="aspect-square w-full object-contain p-5 transition duration-500 group-hover:scale-[1.03] sm:p-8"
              />
            </div>

            <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
              {Array.from(
                new Set([...product.images, product.image])
              ).map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => {
                    setSelectedImage(image);
                    setSelectedColor("");
                    clearMessage();
                  }}
                  aria-label={`View product image ${index + 1}`}
                  aria-pressed={
                    selectedImage === image && !selectedColor
                  }
                  className={`overflow-hidden rounded-xl border bg-zinc-900 transition ${
                    selectedImage === image && !selectedColor
                      ? "border-red-500 ring-1 ring-red-500/40"
                      : "border-white/10 hover:border-white/50"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="aspect-square w-full object-contain p-2"
                  />
                </button>
              ))}
            </div>
          </section>

          <section className="flex flex-col">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
              {product.category}
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {product.name}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="text-3xl font-bold">
                ₹{product.price.toLocaleString("en-IN")}
              </span>

              {product.originalPrice !== undefined &&
                product.originalPrice > product.price && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      ₹{product.originalPrice.toLocaleString("en-IN")}
                    </span>
                    <span className="rounded-md bg-red-600/15 px-2.5 py-1.5 text-xs font-bold text-red-400">
                      {Math.round(
                        ((product.originalPrice - product.price) /
                          product.originalPrice) *
                          100
                      )}
                      % OFF
                    </span>
                  </>
                )}
            </div>

            <div className="my-6 h-px bg-white/10" />

            <p className="leading-7 text-gray-400">
              {product.description}
            </p>

            {product.colors.length > 0 && (
              <div className="mt-8">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold">
                    Choose Color
                  </span>
                  <span className="text-sm text-gray-400">
                    {selectedColor || "Select a color"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => {
                    const colorImage =
                      product.colorImages?.[color] || product.image;

                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          setSelectedColor(color);
                          setSelectedImage(colorImage);
                          clearMessage();
                        }}
                        aria-pressed={selectedColor === color}
                        aria-label={`Choose color ${color}`}
                        title={color}
                        className={`rounded-xl border-2 p-1 transition ${
                          selectedColor === color
                            ? "border-red-500 ring-1 ring-red-500/30"
                            : "border-white/15 hover:border-white/50"
                        }`}
                      >
                        <img
                          src={colorImage}
                          alt={color}
                          className="h-14 w-14 rounded-lg bg-zinc-900 object-contain p-1 sm:h-16 sm:w-16"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {product.sizes.length > 0 && (
              <div className="mt-7">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold">
                    Choose Size
                  </span>
                  <span className="text-sm text-gray-400">
                    {selectedSize || "Select a size"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setSelectedSize(size);
                        clearMessage();
                      }}
                      aria-pressed={selectedSize === size}
                      className={`min-w-14 rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                        selectedSize === size
                          ? "border-red-500 bg-red-600 text-white"
                          : "border-white/15 bg-zinc-900 text-gray-300 hover:border-white/60"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-7">
              <p className="mb-3 text-sm font-semibold">Quantity</p>
              <div className="inline-flex items-center overflow-hidden rounded-xl border border-white/15 bg-zinc-900">
                <button
                  type="button"
                  onClick={() => {
                    setQuantity((current) => Math.max(1, current - 1));
                    clearMessage();
                  }}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="px-4 py-3 text-lg transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  −
                </button>
                <span
                  aria-live="polite"
                  className="min-w-12 text-center text-sm font-semibold"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setQuantity((current) => Math.min(99, current + 1));
                    clearMessage();
                  }}
                  disabled={quantity >= 99}
                  aria-label="Increase quantity"
                  className="px-4 py-3 text-lg transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-7 rounded-xl border border-white/10 bg-zinc-900/60 p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-400">
                  Subtotal ({quantity} {quantity === 1 ? "item" : "items"})
                </span>
                <span className="text-xl font-bold">
                  ₹{(product.price * quantity).toLocaleString("en-IN")}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-gray-500">
                Shipping and any applicable charges are calculated at
                checkout.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!ready}
                className="rounded-xl border border-white/25 px-5 py-4 font-semibold transition hover:border-white hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add to Cart
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!ready}
                className="rounded-xl bg-red-600 px-5 py-4 font-bold transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {ready ? "Buy Now →" : "Loading Cart..."}
              </button>
            </div>

            {message && (
              <div
                role={messageType === "error" ? "alert" : "status"}
                className={`mt-4 rounded-xl border p-4 text-sm ${
                  messageType === "error"
                    ? "border-red-500/30 bg-red-500/10 text-red-300"
                    : "border-green-500/30 bg-green-500/10 text-green-400"
                }`}
              >
                <p className="font-medium">{message}</p>
                {messageType === "success" && (
                  <Link
                    href="/cart"
                    className="mt-2 inline-block font-semibold underline underline-offset-4"
                  >
                    View Cart →
                  </Link>
                )}
              </div>
            )}

            <div className="mt-7 grid grid-cols-1 gap-3 rounded-xl border border-white/10 bg-zinc-900/50 p-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <span className="text-lg" aria-hidden="true">✓</span>
                <div>
                  <p className="text-sm font-semibold">Carefully Selected</p>
                  <p className="mt-1 text-xs leading-5 text-gray-400">
                    Explore the Palmyra collection.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg" aria-hidden="true">↗</span>
                <div>
                  <p className="text-sm font-semibold">Secure Checkout</p>
                  <p className="mt-1 text-xs leading-5 text-gray-400">
                    Review your order before placing it.
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/store"
              className="mt-6 text-center text-sm text-gray-400 transition hover:text-white"
            >
              ← Continue Shopping
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
