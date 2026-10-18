import Link from "next/link";
import { products } from "@/lib/products";

export default function StorePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* PRODUCT BANNER */}
      <section className="relative flex min-h-[340px] items-center overflow-hidden border-b border-zinc-800 md:min-h-[440px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #050505 0%, rgba(5,5,5,0.92) 38%, rgba(5,5,5,0.2) 100%), url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1800&q=85')",
          }}
        />

        <div className="relative z-10 max-w-2xl px-6 py-14 md:px-12">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-red-500">
            The Palmyra Collection
          </p>

          <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
            Gear Up Your
            <span className="block text-red-500">Passion.</span>
          </h1>

          <p className="mt-4 max-w-md text-sm leading-6 text-gray-300 md:text-base">
            Discover Palmyra sportswear and accessories made for
            your everyday style.
          </p>

          <a
            href="#products"
            className="mt-7 inline-block rounded-lg bg-red-600 px-6 py-3 text-sm font-bold transition hover:bg-red-700"
          >
            Shop All Products →
          </a>
        </div>
      </section>

      {/* PRODUCT COLLECTION */}
      <section id="products" className="px-5 py-10 md:px-10 md:py-14">
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-red-500">
            Shop Palmyra
          </p>
          <h2 className="text-3xl font-bold md:text-4xl">
            Our Collection
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Caps, bags, jerseys and accessories.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {products.map((product) => (
            <article
              key={product.id}
              className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950"
            >
              <Link href={`/store/${product.id}`} className="block">
                <div className="overflow-hidden bg-zinc-900">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
              </Link>

              <div className="p-3 sm:p-4">
                <p className="mb-1 text-[10px] uppercase tracking-wider text-gray-500">
                  {product.category}
                </p>

                <Link href={`/store/${product.id}`}>
                  <h3 className="font-semibold sm:text-lg">
                    {product.name}
                  </h3>
                </Link>

                <p className="mt-2 font-bold text-red-500">
                  ₹{product.price.toLocaleString("en-IN")}
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  {product.colors.length} color
                  {product.colors.length === 1 ? "" : "s"} available
                </p>

                <Link
                  href={`/store/${product.id}`}
                  className="mt-4 block rounded-lg bg-red-600 py-3 text-center text-xs font-bold transition hover:bg-red-700 sm:text-sm"
                >
                  View Details →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>


      
      {/* BRAND + INSTAGRAM */}

      <section className="px-6 py-16 text-center md:py-20">

        <p className="text-xs font-semibold tracking-[0.3em] text-red-500">
          JOIN THE PALMYRA COMMUNITY
        </p>

        <h2 className="mt-4 text-3xl font-bold md:text-4xl">
          Built around your passion.
        </h2>

        <p className="mx-auto mt-4 max-w-xl leading-7 text-gray-400">
          Discover our latest products, original videos and
          upcoming collections.
        </p>

        <Link
          href="/store"
          className="mt-7 inline-block rounded-lg border border-white px-7 py-4 font-semibold transition hover:bg-white hover:text-black"
        >
          DISCOVER PALMYRA →
        </Link>

      </section>
    </main>
  );
}