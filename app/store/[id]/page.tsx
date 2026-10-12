"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { products } from "@/lib/products";
import { useCart } from "@/components/CartContext";

const colorStyles: Record<string, string> = {
  Black: "#171717",
  White: "#FFFFFF",
  Red: "#EF4444",
  Blue: "#3B82F6",
  Grey: "#808080",
  Gray: "#808080",
  Green: "#087443",
  Tan: "#C9955B",
  "Navy Blue": "#172D50",
  Maroon: "#702B3B",
};

export default function ProductPage() {
      const { addItem } = useCart();

  const params = useParams<{ id: string }>();
  const product = products.find((item) => item.id === params.id);

  const [selectedColor, setSelectedColor] = useState(
    product?.colors[0] ?? ""
  );
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        Product not found.
        <Link href="/store" className="ml-3 text-red-500">
          Back to Store
        </Link>
      </main>
    );
  }

  const selectedImage =
    product.colorImages?.[selectedColor] ?? product.image;

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white md:px-10">
      <Link
        href="/store"
        className="text-sm text-gray-400 hover:text-white"
      >
        ← Back to Store
      </Link>

      <div className="mx-auto mt-8 grid max-w-6xl gap-10 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
          <img
            src={selectedImage}
            alt={`${product.name} - ${selectedColor}`}
            className="aspect-square w-full object-contain"
          />
        </div>

        <div className="py-2">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
            {product.category}
          </p>

          <h1 className="mt-3 text-3xl font-bold md:text-5xl">
            {product.name}
          </h1>

<div className="mt-4 flex items-center gap-3">
  <span className="text-2xl font-bold text-red-500">
    ₹{product.price.toLocaleString("en-IN")}
  </span>

  {product.originalPrice && (
    <>
      <span className="text-gray-500 line-through">
        ₹{product.originalPrice.toLocaleString("en-IN")}
      </span>
      <span className="rounded bg-red-600 px-2 py-1 text-xs font-bold">
        SAVE ₹{(product.originalPrice - product.price).toLocaleString("en-IN")}
      </span>
    </>
  )}
</div>

          <p className="mt-6 leading-7 text-gray-400">
            {product.description}
          </p>

          <div className="mt-8">
            <h2 className="font-semibold">
              Choose Color: {selectedColor}
            </h2>

            <div className="mt-4 flex flex-wrap gap-4">
              {product.colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  aria-label={`Choose ${color}`}
                  aria-pressed={selectedColor === color}
                  className="flex flex-col items-center gap-2"
                >
                  <span
                    className={`h-10 w-10 rounded-full border-2 ${
                      selectedColor === color
                        ? "border-red-500 ring-2 ring-red-500 ring-offset-2 ring-offset-black"
                        : "border-zinc-500"
                    }`}
                    style={{
                      backgroundColor: colorStyles[color] ?? "#A1A1AA",
                    }}
                  />
                  <span className="text-xs text-gray-300">
                    {color}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="font-semibold">Size</h2>
            <p className="mt-2 text-sm text-gray-400">
              {product.sizes.join(" / ")}
            </p>
          </div>

          <div className="mt-8">
            <h2 className="font-semibold">Quantity</h2>
            <div className="mt-3 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="h-10 w-10 rounded-lg border border-zinc-700"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="h-10 w-10 rounded-lg border border-zinc-700"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-zinc-800 p-4">
            <p className="font-semibold">Your selection</p>
            <p className="mt-2 text-sm text-gray-400">
              Color: {selectedColor} · Quantity: {quantity}
            </p>
            <p className="mt-2 text-lg font-bold">
              Total: ₹{(product.price * quantity).toLocaleString("en-IN")}
            </p>
          </div>


          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                addItem({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: selectedImage,
                  color: selectedColor,
                  size: product.sizes[0] ?? "One Size",
                  quantity,
                });
                alert("Added to cart!");
              }}
              className="rounded-xl border border-white/20 px-5 py-3 font-semibold text-white hover:bg-white/10"
            >
              Add to Cart
            </button>

            <button
              type="button"
              onClick={() => {
                addItem({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: selectedImage,
                  color: selectedColor,
                  size: product.sizes[0] ?? "One Size",
                  quantity,
                });
                window.location.href = "/cart";
              }}
              className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
            >
              Buy Now
            </button>
          </div>
          <p className="mt-5 text-xs leading-5 text-gray-500">
            Product images show the available color options. Final
            pricing and delivery charges should be confirmed before launch.
          </p>
        </div>
      </div>
    </main>
  );
}