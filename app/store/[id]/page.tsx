import Link from "next/link";
import { notFound } from "next/navigation";
import { products } from "@/lib/products";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = products.find((item) => item.id === id);

  if (!product) {
    notFound();
  }

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
            src={product.image}
            alt={product.name}
            className="aspect-square w-full object-cover"
          />
        </div>

        <div className="py-2">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
            {product.category}
          </p>

          <h1 className="mt-3 text-3xl font-bold md:text-5xl">
            {product.name}
          </h1>

          <p className="mt-4 text-2xl font-bold text-red-500">
            ₹{product.price.toLocaleString("en-IN")}
          </p>

          <p className="mt-6 leading-7 text-gray-400">
            {product.description}
          </p>

          <div className="mt-8">
            <h2 className="font-semibold">Choose Color</h2>
            <div className="mt-3 flex flex-wrap gap-3">
              {product.colors.map((color) => (
                <span
                  key={color}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-sm"
                >
                  {color}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="font-semibold">Size</h2>
            <p className="mt-3 text-sm text-gray-400">
              {product.sizes.join(" / ")}
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled
              className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white opacity-60"
            >
              Add to Cart — Coming Next
            </button>

            <button
              type="button"
              disabled
              className="rounded-lg border border-zinc-700 px-5 py-3 font-semibold opacity-60"
            >
              Buy Now — Coming Next
            </button>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Product prices and images are temporary and can be updated.
          </p>
        </div>
      </div>
    </main>
  );
}