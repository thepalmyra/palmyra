
import Link from "next/link";
import { products } from "@/lib/products";

export default function StorePage() {
  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white md:px-10">

      {/* STORE HEADER */}
      <div className="mb-10">
        <p className="mb-3 text-sm font-semibold tracking-[0.25em] text-red-500">
          THE PALMYRA COLLECTION
        </p>

        <h1 className="text-4xl font-bold md:text-5xl">
          Palmyra Store
        </h1>

        <p className="mt-3 max-w-xl text-gray-400">
          Discover sportswear and accessories designed for your everyday style.
        </p>
      </div>

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">

        {products.map((product) => (
          <article
            key={product.id}
            className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950"
          >
            <Link href={`/store/${product.id}`} className="block">
              <div className="relative overflow-hidden bg-zinc-900">
                <img
                  src={product.image}
                  alt={product.name}
                  className="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-105"
                />

                <span className="absolute left-3 top-3 rounded-full bg-black/75 px-3 py-1 text-[10px] font-semibold tracking-wider">
                  {product.category}
                </span>

                <span className="absolute bottom-3 right-3 rounded-full bg-white px-3 py-2 text-xs font-semibold text-black">
                  View Product ↗
                </span>
              </div>
            </Link>

            <div className="p-3 sm:p-4">
              <Link href={`/store/${product.id}`}>
                <h2 className="font-semibold sm:text-lg">
                  {product.name}
                </h2>
              </Link>

              <p className="mt-2 font-bold text-red-500">
                ₹{product.price.toLocaleString("en-IN")}
              </p>

              <Link
                href={`/store/${product.id}`}
                className="mt-4 block rounded-lg bg-red-600 py-3 text-center text-sm font-semibold transition hover:bg-red-700"
              >
                View Details
              </Link>
            </div>
          </article>
        ))}

      </div>

      {/* STORE FOOTNOTE */}
      <p className="mt-10 text-center text-xs leading-6 text-gray-500">
        Palmyra products • New collection coming soon
      </p>

    </main>
  );
}
