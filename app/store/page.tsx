
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  images: string[];
  sizes: string[];
  colors: string[];
  colorImages?: Record<string, string>;
  isOnSale: boolean;
  isOutOfStock: boolean;
};

type DatabaseProduct = {
  id: string;
  name: string;
  price: number | string;
  category: string;
  description: string | null;
  image: string | null;
  images: string[] | null;
  sizes: string[] | null;
  colors: string[] | null;
  color_images: Record<string, string> | null;
  is_on_sale: boolean | null;
  is_out_of_stock: boolean | null;
};

const formatPrice = (price: number) =>
  `₹${price.toLocaleString("en-IN")}`;

function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [saleOnly, setSaleOnly] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setLoading(true);
      setLoadError("");

      try {
        const supabase = createClient();

        const { data, error } = await supabase
          .from("products")
          .select(
            "id, name, price, category, description, image, images, sizes, colors, color_images, is_on_sale, is_out_of_stock"
          )
          .eq("is_active", true)
          .order("created_at", { ascending: true });

        if (error) {
          throw error;
        }

        const mappedProducts: Product[] = (
          (data ?? []) as DatabaseProduct[]
        ).map((product) => ({
          id: product.id,
          name: product.name,
          price: Number(product.price),
          category: product.category ?? "Collection",
          description: product.description ?? "",
          image: product.image ?? "",
          images: Array.isArray(product.images) ? product.images : [],
          sizes: Array.isArray(product.sizes) ? product.sizes : [],
          colors: Array.isArray(product.colors) ? product.colors : [],
          colorImages: product.color_images ?? {},
          isOnSale: product.is_on_sale === true,
          isOutOfStock: product.is_out_of_stock === true,
        }));

        if (!cancelled) {
          setProducts(mappedProducts);
        }
      } catch (error) {
        console.error("Could not load store products:", error);

        if (!cancelled) {
          setLoadError(
            "We couldn't load the collection. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(products.map((product) => product.category).filter(Boolean))
      ),
    ],
    [products]
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

      const matchesSale = !saleOnly || product.isOnSale;

      return matchesCategory && matchesSearch && matchesSale;
    });

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, search, activeCategory, sortBy, saleOnly]);

  const activeFilterCount =
    (search.trim() ? 1 : 0) +
    (activeCategory !== "All" ? 1 : 0) +
    (saleOnly ? 1 : 0);

  function resetFilters() {
    setSearch("");
    setActiveCategory("All");
    setSortBy("featured");
    setSaleOnly(false);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#080808] text-white selection:bg-red-600 selection:text-white">
      {/* Announcement strip */}
      <div className="border-b border-white/[0.08] bg-[#0d0d0d]">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400 sm:text-xs sm:tracking-[0.24em]">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          The official Palmyra collection
        </div>
      </div>

      {/* Premium editorial hero */}
      <section className="relative isolate flex min-h-[540px] items-center overflow-hidden border-b border-white/10 bg-[#080808] sm:min-h-[620px] lg:min-h-[700px]">
        <img
          src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=2000&q=85"
          alt="Athlete training in a gym"
          fetchPriority="high"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/85 to-black/25" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#080808] via-transparent to-black/30" />

        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 md:px-12 md:py-28">
          <div className="max-w-3xl">
            <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-white/15 bg-black/35 px-4 py-2.5 backdrop-blur-md">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-xs font-black">
                P
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-white sm:text-xs">
                The Palmyra Collection
              </span>
            </div>

            <p className="mb-4 text-xs font-bold uppercase tracking-[0.32em] text-red-400 sm:text-sm">
              Built around your passion
            </p>

            <h1 className="text-5xl font-black leading-[0.98] tracking-[-0.055em] sm:text-7xl md:text-8xl lg:text-9xl">
              OWN
              <br />
              YOUR
              <br />
              <span className="text-red-500">MOMENT.</span>
            </h1>

            <p className="mt-7 max-w-lg text-sm leading-7 text-zinc-300 sm:text-base sm:leading-8">
              Sport-inspired essentials. Everyday versatility.
              Discover accessories and apparel made to move with
              your lifestyle.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#products"
                className="group inline-flex items-center gap-3 rounded-xl bg-red-600 px-6 py-4 text-sm font-bold transition duration-300 hover:-translate-y-0.5 hover:bg-red-700"
              >
                Discover the collection
                <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>

              <Link
                href="/watch"
                className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-black/20 px-6 py-4 text-sm font-bold backdrop-blur-sm transition hover:border-white/50 hover:bg-white/10"
              >
                Explore Palmyra
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-5 border-t border-white/20 pt-7 sm:gap-x-12">
              <div>
                <p className="text-2xl font-black sm:text-3xl">
                  {loading
                    ? "—"
                    : products.length.toString().padStart(2, "0")}
                  <span className="text-red-500">.</span>
                </p>
                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.17em] text-zinc-400 sm:text-xs">
                  Essentials
                </p>
              </div>

              <div className="h-12 w-px bg-white/15" />

              <div>
                <p className="text-2xl font-black sm:text-3xl">
                  EVERYDAY<span className="text-red-500">.</span>
                </p>
                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.17em] text-zinc-400 sm:text-xs">
                  Made for your journey
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 right-6 hidden -rotate-90 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/50 lg:block">
          Palmyra / Store
        </div>
      </section>

      {/* Collection heading */}
      <section
        id="products"
        className="scroll-mt-6 px-5 pb-7 pt-14 sm:px-8 sm:pt-20 md:px-12"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.32em] text-red-500 sm:text-xs">
                Find your essentials
              </p>
              <h2 className="text-4xl font-black tracking-[-0.04em] sm:text-5xl md:text-6xl">
                THE COLLECTION<span className="text-red-500">.</span>
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-400 sm:text-base">
                Considered essentials. Confident design. Find the
                pieces that fit your everyday.
              </p>
            </div>

            <div className="flex items-end gap-4 sm:text-right">
              <div>
                <p className="text-3xl font-black tabular-nums">
                  {loading
                    ? "—"
                    : String(filteredProducts.length).padStart(2, "0")}
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Products
                </p>
              </div>
              <div className="mb-1 h-9 w-px bg-white/15" />
              <p className="mb-1 max-w-[130px] text-xs leading-5 text-zinc-500">
                Designed for everyday movement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search, categories, sale filter and sorting */}
      <section className="px-5 pb-8 sm:px-8 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-white/10 bg-[#101010] p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                  <SearchIcon />
                </span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search the collection..."
                  aria-label="Search products"
                  className="w-full rounded-xl border border-white/10 bg-black py-3.5 pl-12 pr-11 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/10"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-lg text-zinc-400 transition hover:bg-white/10 hover:text-white"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSaleOnly((current) => !current)}
                  aria-pressed={saleOnly}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold transition ${
                    saleOnly
                      ? "border-amber-300 bg-amber-300 text-black"
                      : "border-white/10 bg-black text-zinc-300 hover:border-amber-300/50 hover:text-white"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      saleOnly ? "bg-black" : "bg-amber-300"
                    }`}
                  />
                  On Sale
                </button>

                <label
                  htmlFor="store-sort"
                  className="text-xs font-medium text-zinc-500"
                >
                  Sort
                </label>
                <select
                  id="store-sort"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="min-h-11 rounded-xl border border-white/10 bg-black px-3 py-3 text-xs text-white outline-none transition focus:border-red-500/70 sm:text-sm"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="price-high">Price: high to low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>

            <div className="mt-5 border-t border-white/[0.07] pt-4">
              <div className="flex flex-wrap items-center gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    aria-pressed={activeCategory === category}
                    className={`rounded-full border px-4 py-2.5 text-xs font-semibold transition duration-200 ${
                      activeCategory === category
                        ? "border-white bg-white text-black"
                        : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    {category}
                  </button>
                ))}

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="ml-auto rounded-full px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                  >
                    Clear filters ({activeFilterCount})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section className="px-5 pb-20 pt-2 sm:px-8 md:px-12 md:pb-28">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <div
              className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
              aria-label="Loading products"
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101010]"
                >
                  <div className="aspect-[4/5] animate-pulse bg-white/[0.05]" />
                  <div className="space-y-3 p-4">
                    <div className="h-3 w-1/3 animate-pulse rounded bg-white/[0.07]" />
                    <div className="h-4 w-4/5 animate-pulse rounded bg-white/[0.07]" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-white/[0.07]" />
                  </div>
                </div>
              ))}
            </div>
          ) : loadError ? (
            <div
              role="alert"
              className="rounded-3xl border border-red-500/20 bg-[#100c0c] px-6 py-16 text-center"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-2xl text-red-400">
                !
              </div>
              <h3 className="mt-5 text-xl font-bold">
                Unable to load the collection
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-400">
                {loadError}
              </p>
              <button
                type="button"
                onClick={() => setRetryCount((count) => count + 1)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold transition hover:bg-red-700"
              >
                Try again <ArrowIcon />
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.015] px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-2xl text-zinc-400">
                ⌕
              </div>
              <h3 className="mt-5 text-xl font-bold">
                {saleOnly
                  ? "No sale products right now"
                  : "Nothing matched your search"}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
                Try a different search or clear your filters to
                explore the full Palmyra collection.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200"
              >
                View all products
              </button>
            </div>
          ) : (
            <>
              <div className="mb-5 flex items-center justify-between">
                <p className="text-xs text-zinc-500">
                  Showing{" "}
                  <span className="font-semibold text-zinc-300">
                    {filteredProducts.length}
                  </span>{" "}
                  {filteredProducts.length === 1 ? "result" : "results"}
                </p>
                <p className="hidden text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-600 sm:block">
                  Palmyra / Essentials
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
                {filteredProducts.map((product, index) => (
                  <article
                    key={product.id}
                    className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101010] transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl hover:shadow-black/40 sm:rounded-3xl"
                  >
                    <Link
                      href={`/store/${product.id}`}
                      className="block"
                      aria-label={`View ${product.name}`}
                    >
                      <div className="relative isolate overflow-hidden bg-[#171717]">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                            className="aspect-[4/5] w-full object-cover transition duration-700 ease-out group-hover:scale-[1.045]"
                          />
                        ) : (
                          <div className="flex aspect-[4/5] items-center justify-center bg-gradient-to-br from-zinc-900 to-black text-sm text-zinc-600">
                            Palmyra
                          </div>
                        )}

                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15" />

                        {/* Product status badges */}
                        <div className="absolute left-2 top-2 z-10 flex max-w-[calc(100%-1rem)] flex-col items-start gap-2 sm:left-3 sm:top-3">
                          {product.isOutOfStock && (
                            <span className="inline-flex rounded-full border border-white/20 bg-black/90 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white shadow-lg backdrop-blur-md sm:px-3 sm:text-[10px]">
                              Out of Stock
                            </span>
                          )}

                          {product.isOnSale && (
                            <span className="inline-flex rounded-full bg-amber-300 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-black shadow-lg sm:px-3 sm:text-[10px]">
                              On Sale
                            </span>
                          )}
                        </div>

                        <span className="absolute bottom-3 left-3 max-w-[75%] truncate rounded-full border border-white/20 bg-black/45 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-white backdrop-blur-md sm:bottom-4 sm:left-4 sm:text-[10px]">
                          {product.category}
                        </span>

                        <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition duration-300 group-hover:bg-red-600 group-hover:text-white sm:bottom-4 sm:right-4 sm:h-10 sm:w-10">
                          <ArrowIcon className="h-4 w-4 -rotate-45 transition-transform group-hover:rotate-0 sm:h-5 sm:w-5" />
                        </span>
                      </div>
                    </Link>

                    <div className="flex flex-1 flex-col p-3 sm:p-5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-500 sm:text-[10px] sm:tracking-[0.2em]">
                          {product.category}
                        </p>
                        {product.isOnSale && (
                          <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-amber-300 sm:text-[10px]">
                            Special offer
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/store/${product.id}`}
                        className="mt-2"
                      >
                        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-5 transition group-hover:text-red-400 sm:min-h-[3rem] sm:text-base sm:leading-6">
                          {product.name}
                        </h3>
                      </Link>

                      <p className="mt-2 line-clamp-2 min-h-10 text-[11px] leading-5 text-zinc-500 sm:text-xs sm:leading-5">
                        {product.description}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] pt-4">
                        <span className="text-base font-black tracking-tight sm:text-xl">
                          {formatPrice(product.price)}
                        </span>

                        {product.colors.length > 0 && (
                          <span className="text-[10px] text-zinc-500 sm:text-xs">
                            {product.colors.length} colour
                            {product.colors.length === 1 ? "" : "s"}
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/store/${product.id}`}
                        className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-3 text-[11px] font-bold transition duration-300 hover:bg-red-700 sm:min-h-11 sm:text-xs"
                      >
                        View product
                        <ArrowIcon className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Brand statement */}
      <section className="px-5 pb-20 sm:px-8 md:px-12 md:pb-28">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-[#101010] md:grid-cols-2">
          <div className="relative min-h-[280px] overflow-hidden bg-zinc-900 sm:min-h-[390px]">
            <img
              src="https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=85"
              alt="Active lifestyle and training"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <span className="absolute bottom-5 left-5 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur sm:bottom-7 sm:left-7">
              Move with passion
            </span>
          </div>

          <div className="flex flex-col justify-center p-6 sm:p-10 md:p-12 lg:p-16">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-500 sm:text-xs">
              The Palmyra mindset
            </p>

            <h2 className="mt-5 text-3xl font-black leading-[1.08] tracking-tight sm:text-4xl md:text-5xl">
              MORE THAN
              <br />
              PRODUCTS.
              <br />
              <span className="text-red-500">A PASSION.</span>
            </h2>

            <p className="mt-5 text-sm leading-7 text-zinc-400 sm:text-base">
              Palmyra brings together sport, everyday style and
              original content. Discover the collection and make
              it part of your journey.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/watch"
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 text-sm font-bold transition hover:bg-red-700"
              >
                Watch Palmyra <ArrowIcon />
              </Link>

              <a
                href="#products"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3.5 text-sm font-bold transition hover:border-white/40 hover:bg-white/5"
              >
                Browse collection
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-5 py-9 sm:px-8 md:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="text-center sm:text-left">
            <Link
              href="/store"
              className="text-xl font-black tracking-[0.2em] transition hover:text-zinc-300"
            >
              PALMYRA<span className="text-red-500">.</span>
            </Link>
            <p className="mt-2 text-xs text-zinc-500">
              Wear your passion. Live your style.
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap justify-center gap-5 text-xs text-zinc-400 sm:gap-6 sm:text-sm"
          >
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <Link href="/watch" className="transition hover:text-white">
              Watch
            </Link>
            <Link href="/cart" className="transition hover:text-white">
              Shopping cart
            </Link>
          </nav>

          <p className="text-[10px] text-zinc-600">
            © {new Date().getFullYear()} Palmyra
          </p>
        </div>
      </footer>
    </main>
  );
}
