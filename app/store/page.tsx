
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { products } from "@/lib/products";

const formatPrice = (price: number) =>
  `₹${price.toLocaleString("en-IN")}`;

export default function StorePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(new Set(products.map((product) => product.category))),
    ],
    []
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = products.filter((product) => {
      const matchesCategory =
        activeCategory === "All" ||
        product.category === activeCategory;

      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [search, activeCategory, sortBy]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#080808] text-white">
      {/* PREMIUM HERO */}
      <section className="relative isolate flex min-h-[540px] items-center overflow-hidden border-b border-white/10 bg-black sm:min-h-[600px] lg:min-h-[690px]">
        <img
          src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=2000&q=85"
          alt="Athlete training"
          fetchPriority="high"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/80 to-black/20" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#080808] via-transparent to-black/20" />

        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 md:px-12 md:py-28">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-red-400">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              The Palmyra Collection
            </div>

            <h1 className="text-5xl font-black leading-[1.04] tracking-tight sm:text-6xl md:text-8xl">
              Gear up your
              <br />
              <span className="text-red-500">passion.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-gray-300 sm:text-lg sm:leading-8">
              Everyday essentials. Sport-inspired style.
              Discover Palmyra accessories and apparel designed
              to be part of your everyday journey.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#products"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-4 font-bold transition hover:-translate-y-0.5 hover:bg-red-700"
              >
                Shop the collection <span>→</span>
              </a>

              <Link
                href="/watch"
                className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/5 px-6 py-4 font-bold backdrop-blur-sm transition hover:bg-white hover:text-black"
              >
                Explore Palmyra
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/15 pt-6">
              <div>
                <p className="text-2xl font-black">
                  {products.length.toString().padStart(2, "0")}
                  <span className="text-red-500">+</span>
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Store essentials
                </p>
              </div>

              <div className="h-12 w-px bg-white/15" />

              <div>
                <p className="text-2xl font-black">PALMYRA</p>
                <p className="mt-1 text-xs text-gray-400">
                  Made for your passion
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COLLECTION INTRO */}
      <section
        id="products"
        className="scroll-mt-20 px-5 pb-6 pt-12 sm:px-8 md:px-12 md:pt-16"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-red-500">
                Find your essentials
              </p>

              <h2 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
                The Collection<span className="text-red-500">.</span>
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400 sm:text-base">
                From everyday accessories to sport-inspired apparel,
                find your next Palmyra favourite.
              </p>
            </div>

            <p className="text-sm text-gray-400">
              <span className="font-bold text-white">
                {filteredProducts.length}
              </span>{" "}
              {filteredProducts.length === 1 ? "product" : "products"} found
            </p>
          </div>
        </div>
      </section>

      {/* SEARCH, FILTERS AND SORT */}
      <section className="px-5 py-5 sm:px-8 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-white/10 bg-[#111111] p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-sm">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m16 16 4 4" />
                </svg>

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search products..."
                  aria-label="Search products"
                  className="w-full rounded-xl border border-white/10 bg-black py-3.5 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-red-500"
                />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label
                  htmlFor="store-sort"
                  className="text-xs font-medium text-gray-400"
                >
                  Sort by
                </label>

                <select
                  id="store-sort"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-red-500"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="price-high">Price: high to low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  aria-pressed={activeCategory === category}
                  className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                    activeCategory === category
                      ? "border-red-600 bg-red-600 text-white"
                      : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section className="px-5 pb-16 pt-4 sm:px-8 md:px-12 md:pb-24">
        <div className="mx-auto max-w-7xl">
          {filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center">
              <div className="text-4xl">⌕</div>
              <h3 className="mt-4 text-xl font-bold">
                No products found
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                Try another search or select a different category.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveCategory("All");
                  setSortBy("featured");
                }}
                className="mt-6 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold transition hover:bg-red-700"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => {
                const originalPrice = product.originalPrice;
                const hasDiscount =
                  typeof originalPrice === "number" &&
                  originalPrice > product.price;

                const discount = hasDiscount
                  ? Math.round(
                      ((originalPrice - product.price) / originalPrice) *
                        100
                    )
                  : 0;

                return (
                  <article
                    key={product.id}
                    className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111111] transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:shadow-2xl hover:shadow-black/40"
                  >
                    <Link
                      href={`/store/${product.id}`}
                      className="block"
                      aria-label={`View ${product.name}`}
                    >
                      <div className="relative overflow-hidden bg-[#191919]">
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                          className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/5" />

                        <span className="absolute left-3 top-3 max-w-[80%] truncate rounded-full border border-white/15 bg-black/65 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-white backdrop-blur-md sm:text-[10px]">
                          {product.category}
                        </span>

                        {hasDiscount && (
                          <span className="absolute right-3 top-3 rounded-full bg-red-600 px-2.5 py-1.5 text-[10px] font-black text-white sm:text-xs">
                            {discount}% OFF
                          </span>
                        )}

                        <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg text-black transition duration-300 group-hover:bg-red-600 group-hover:text-white">
                          ↗
                        </span>
                      </div>
                    </Link>

                    <div className="flex flex-1 flex-col p-3 sm:p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500 sm:text-xs">
                        {product.category}
                      </p>

                      <Link href={`/store/${product.id}`}>
                        <h3 className="mt-2 min-h-[2.75rem] text-sm font-bold leading-5 transition group-hover:text-red-400 sm:text-base sm:leading-6">
                          {product.name}
                        </h3>
                      </Link>

                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-400 sm:text-sm">
                        {product.description}
                      </p>

                      <div className="mt-4 flex flex-wrap items-baseline gap-2">
                        <span className="text-base font-black sm:text-xl">
                          {formatPrice(product.price)}
                        </span>

                        {hasDiscount && (
                          <span className="text-xs text-gray-500 line-through sm:text-sm">
                            {formatPrice(originalPrice)}
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-[11px] text-gray-400 sm:text-xs">
                        {product.colors.length > 0
                          ? `${product.colors.length} colour${product.colors.length === 1 ? "" : "s"} available`
                          : "Explore product details"}
                      </p>

                      <Link
                        href={`/store/${product.id}`}
                        className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-3 text-xs font-bold transition hover:bg-red-700 sm:text-sm"
                      >
                        View product <span>→</span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* BRAND STORY */}
      <section className="px-5 pb-16 sm:px-8 md:px-12 md:pb-24">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-[#111111] md:grid-cols-2">
          <div className="relative min-h-[280px] overflow-hidden bg-zinc-900 sm:min-h-[360px]">
            <img
              src="https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=85"
              alt="Active lifestyle and training"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <span className="absolute bottom-5 left-5 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-xs font-bold uppercase tracking-widest backdrop-blur">
              Move with passion
            </span>
          </div>

          <div className="flex flex-col justify-center p-6 sm:p-10 md:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-500">
              The Palmyra mindset
            </p>

            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
              More than products.
              <br />
              <span className="text-red-500">A passion.</span>
            </h2>

            <p className="mt-5 text-sm leading-7 text-gray-400 sm:text-base">
              Palmyra brings together sport, everyday style and
              original content. Discover the collection and make
              it part of your journey.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/watch"
                className="rounded-xl bg-red-600 px-5 py-3.5 text-sm font-bold transition hover:bg-red-700"
              >
                Watch Palmyra →
              </Link>

              <a
                href="#products"
                className="rounded-xl border border-white/15 px-5 py-3.5 text-sm font-bold transition hover:border-white/40 hover:bg-white/5"
              >
                Browse collection
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST / BRAND FOOTER */}
      <section className="border-t border-white/10 px-5 py-10 sm:px-8 md:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-xl font-black tracking-[0.2em]">
              PALMYRA<span className="text-red-500">.</span>
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Wear your passion. Live your style.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-5 text-sm text-gray-400">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <Link href="/watch" className="transition hover:text-white">
              Watch
            </Link>
            <Link href="/cart" className="transition hover:text-white">
              Shopping cart
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
