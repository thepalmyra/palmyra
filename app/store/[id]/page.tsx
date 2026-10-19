
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { products } from "@/lib/products";
import { useCart } from "@/components/CartContext";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const product = products.find((item) => item.id === params.id);
  const { addItem } = useCart();

  const [selectedColor, setSelectedColor] = useState(
    product?.colors[0] ?? "Black"
  );
  const [selectedSize, setSelectedSize] = useState(
    product?.sizes[0] ?? "One Size"
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(
    product?.image ?? ""
  );
  const [message, setMessage] = useState("");

  if (!product) {
    return (
      <main className="min-h-screen bg-black px-6 py-24 text-center text-white">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p className="mt-3 text-gray-400">
          This product may no longer be available.
        </p>
        <Link
          href="/store"
          className="mt-6 inline-block rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700"
        >
          Back to Store
        </Link>
      </main>
    );
  }

  const currentImage =
    product.colorImages?.[selectedColor] || selectedImage || product.image;

  function handleColorChange(color: string) {
    setSelectedColor(color);
    setSelectedImage(
      product?.colorImages?.[color] ??
        product?.image ??
        ""
    );
  }

  function addProductToCart() {
    if (!product) return;

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: currentImage,
      color: selectedColor,
      size: selectedSize,
      quantity,
    });

    setMessage("Added to cart successfully!");
  }

  function buyNow() {
    if (!product) return;

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: currentImage,
      color: selectedColor,
      size: selectedSize,
      quantity,
    });

    window.location.href = "/cart";
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/store"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
        >
          <span aria-hidden="true">←</span>
          Back to Store
        </Link>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14">
          {/* Product images */}
          <section>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
              <img
                src={currentImage}
                alt={product.name}
                className="aspect-square w-full object-contain p-4"
              />
            </div>

            <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
              {Array.from(
                new Set([...(product.images ?? []), product.image])
              ).map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  aria-label={`View product image ${index + 1}`}
                  className={`overflow-hidden rounded-lg border bg-zinc-900 transition ${
                    selectedImage === image
                      ? "border-red-500"
                      : "border-white/10 hover:border-white/50"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="aspect-square w-full object-contain p-1"
                  />
                </button>
              ))}
            </div>
          </section>

          {/* Product details */}
          <section className="flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
              {product.category}
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="text-2xl font-bold">
                ₹{product.price.toLocaleString("en-IN")}
              </span>

              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <>
                    <span className="text-base text-gray-500 line-through">
                      ₹{product.originalPrice.toLocaleString("en-IN")}
                    </span>
                    <span className="rounded-md bg-red-600/15 px-2 py-1 text-xs font-semibold text-red-400">
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

            <p className="mt-5 leading-7 text-gray-400">
              {product.description}
            </p>

            {/* Color selection */}
            {product.colors.length > 0 && (
              <div className="mt-8">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-sm font-semibold">Color:</span>
                  <span className="text-sm text-gray-400">
                    {selectedColor}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => {
                    const colorImage =
                      product.colorImages?.[color] ?? product.image;

                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleColorChange(color)}
                        aria-pressed={selectedColor === color}
                        title={color}
                        className={`overflow-hidden rounded-xl border-2 transition ${
                          selectedColor === color
                            ? "border-red-500"
                            : "border-white/15 hover:border-white/50"
                        }`}
                      >
                        <img
                          src={colorImage}
                          alt={color}
                          className="h-14 w-14 object-contain bg-zinc-900 p-1 sm:h-16 sm:w-16"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size selection */}
            {product.sizes.length > 0 && (
              <div className="mt-7">
                <p className="mb-3 text-sm font-semibold">Size</p>

                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      aria-pressed={selectedSize === size}
                      className={`min-w-12 rounded-lg border px-4 py-3 text-sm font-medium transition ${
                        selectedSize === size
                          ? "border-red-500 bg-red-600 text-white"
                          : "border-white/20 bg-zinc-900 text-gray-300 hover:border-white/60"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-7">
              <p className="mb-3 text-sm font-semibold">Quantity</p>

              <div className="inline-flex items-center overflow-hidden rounded-lg border border-white/20">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) => Math.max(1, current - 1))
                  }
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="px-4 py-3 text-lg hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  −
                </button>

                <span className="min-w-12 text-center text-sm">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) => Math.min(99, current + 1))
                  }
                  disabled={quantity >= 99}
                  aria-label="Increase quantity"
                  className="px-4 py-3 text-lg hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            {/* Price summary */}
            <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-5">
              <span className="text-sm text-gray-400">Subtotal</span>
              <span className="text-xl font-bold">
                ₹{(product.price * quantity).toLocaleString("en-IN")}
              </span>
            </div>

            {/* Cart actions */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={addProductToCart}
                className="rounded-xl border border-white/25 px-5 py-4 font-semibold transition hover:border-white hover:bg-white/5"
              >
                Add to Cart
              </button>

              <button
                type="button"
                onClick={buyNow}
                className="rounded-xl bg-red-600 px-5 py-4 font-semibold transition hover:bg-red-700"
              >
                Buy Now
              </button>
            </div>

            {message && (
              <p
                role="status"
                className="mt-4 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400"
              >
                {message}{" "}
                <Link href="/cart" className="font-semibold underline">
                  View Cart
                </Link>
              </p>
            )}

            <div className="mt-8 rounded-xl border border-white/10 bg-zinc-900/60 p-4">
              <p className="text-sm font-semibold">Palmyra Store</p>
              <p className="mt-1 text-sm leading-6 text-gray-400">
                Review your selected color, size and quantity before
                proceeding to checkout.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
