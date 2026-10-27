
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { videos } from "@/lib/videos";
import { createClient } from "@/lib/supabase/client";

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
};

const suggestions = ["Football", "Movies", "Sports", "Palmyra"];

function SearchIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 4.5 4.5" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 5.8c0-.8.9-1.3 1.6-.9l10 6.2a1.1 1.1 0 0 1 0 1.8l-10 6.2c-.7.4-1.6-.1-1.6-.9V5.8Z" />
    </svg>
  );
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") || "").trim();
  const normalizedQuery = query.toLowerCase();

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // Keep the Supabase client stable between renders.
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setLoadingProducts(true);
      setProductError("");

      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, category, description, image")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (cancelled) return;

      if (error) {
        console.error("Search product loading failed:", error);
        setProductError("We couldn't load products right now.");
        setProducts([]);
      } else {
        setProducts((data ?? []) as Product[]);
      }

      setLoadingProducts(false);
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [supabase, retryCount]);

  const matchingVideos = videos.filter((video) =>
    [video.title, video.description, video.category].some((value) =>
      value?.toLowerCase().includes(normalizedQuery)
    )
  );

  const matchingProducts = products.filter((product) =>
    [product.name, product.category, product.description].some((value) =>
      value?.toLowerCase().includes(normalizedQuery)
    )
  );

  const totalResults =
    matchingVideos.length + matchingProducts.length;

  const noResults =
    normalizedQuery.length > 0 &&
    totalResults === 0 &&
    !loadingProducts &&
    !productError;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080808] text-white">
      {/* Ambient background */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(220,38,38,0.17),transparent_65%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-[-150px] top-[360px] h-80 w-80 rounded-full bg-red-600/[0.06] blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1440px] px-5 pb-20 pt-10 sm:px-8 md:pt-14 lg:px-12">
        {/* Header */}
        <header className="mb-10 border-b border-white/[0.09] pb-8 md:mb-14 md:pb-10">
          <div className="mb-7 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-red-400">
              Discover Palmyra
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
                Find your next
                <span className="mt-1 block bg-gradient-to-r from-red-400 via-red-500 to-orange-400 bg-clip-text text-transparent">
                  favourite.
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-400 sm:text-base">
                Explore videos, discover products, and find something worth
                watching or wearing.
              </p>
            </div>

            {/* Search form */}
            <form
              action="/search"
              method="GET"
              role="search"
              className="group relative"
            >
              <label
                htmlFor="palmyra-search"
                className="mb-3 block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400"
              >
                Search Palmyra
              </label>

              <div className="flex items-center gap-3 rounded-2xl border border-white/[0.12] bg-white/[0.045] p-2 pl-4 transition duration-300 focus-within:border-red-500/70 focus-within:bg-white/[0.07] focus-within:shadow-[0_0_35px_rgba(220,38,38,0.10)]">
                <SearchIcon className="h-5 w-5 shrink-0 text-zinc-400 transition group-focus-within:text-red-400" />

                <input
                  id="palmyra-search"
                  name="q"
                  type="search"
                  defaultValue={query}
                  placeholder="Search videos, sports, products..."
                  autoComplete="off"
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-zinc-500"
                />

                <button
                  type="submit"
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold transition hover:bg-red-500 active:scale-[0.97] sm:px-5"
                >
                  <span>Search</span>
                  <ArrowIcon />
                </button>
              </div>
              <p className="mt-3 text-xs text-zinc-500">
                Search across videos and the Palmyra store.
              </p>
            </form>
          </div>

          {/* Search suggestions */}
          <div className="mt-7 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs text-zinc-500">Explore:</span>
            {suggestions.map((suggestion) => (
              <Link
                key={suggestion}
                href={`/search?q=${encodeURIComponent(suggestion)}`}
                className="rounded-full border border-white/[0.10] bg-white/[0.035] px-3.5 py-2 text-xs font-medium text-zinc-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-white"
              >
                {suggestion}
              </Link>
            ))}
          </div>
        </header>

        {/* Search summary */}
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
              Your results
            </p>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {normalizedQuery ? (
                <>
                  Results for{" "}
                  <span className="text-red-400">
                    “{query}”
                  </span>
                </>
              ) : (
                "Explore everything"
              )}
            </h2>
          </div>

          {!loadingProducts && !productError && (
            <div className="rounded-full border border-white/[0.09] bg-white/[0.04] px-4 py-2 text-xs text-zinc-400">
              <span className="font-bold text-white">{totalResults}</span>{" "}
              {totalResults === 1 ? "result" : "results"} found
            </div>
          )}
        </div>

        {/* Empty state */}
        {noResults && (
          <section className="mb-14 rounded-3xl border border-white/[0.09] bg-gradient-to-br from-white/[0.055] to-transparent px-6 py-14 text-center sm:px-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-400">
              <SearchIcon className="h-7 w-7" />
            </div>
            <h3 className="mt-6 text-xl font-bold sm:text-2xl">
              Nothing found this time
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-400">
              We couldn't find videos or products matching “{query}”. Try
              another keyword or explore one of these topics.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {suggestions.map((suggestion) => (
                <Link
                  key={suggestion}
                  href={`/search?q=${encodeURIComponent(suggestion)}`}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:border-red-500/50 hover:text-white"
                >
                  {suggestion}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Videos */}
        {matchingVideos.length > 0 && (
          <section className="mb-16">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-5 w-1 rounded-full bg-red-500" />
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">
                    Watch something good
                  </p>
                </div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Videos
                  <span className="ml-3 align-middle text-sm font-medium text-zinc-500">
                    {matchingVideos.length}
                  </span>
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {matchingVideos.map((video) => (
                <Link
                  key={video.id}
                  href={`/watch/${video.id}`}
                  className="group min-w-0"
                >
                  <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900">
                    <img
                      src={
                        video.type === "youtube"
                          ? `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`
                          : video.thumbnail || "/thumbnails/trending1.jpg"
                      }
                      alt={video.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06] group-hover:opacity-75"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10 opacity-80" />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-12 w-12 translate-y-2 items-center justify-center rounded-full border border-white/30 bg-black/55 text-white opacity-0 backdrop-blur-sm transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <PlayIcon />
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="max-w-full truncate rounded-md border border-white/15 bg-black/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                        {video.category || "Palmyra"}
                      </span>
                      <span className="shrink-0 rounded-md bg-red-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                        Watch
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 font-semibold leading-6 text-zinc-100 transition group-hover:text-red-400">
                        {video.title}
                      </h3>
                      {video.description && (
                        <p className="mt-1 line-clamp-1 text-sm text-zinc-500">
                          {video.description}
                        </p>
                      )}
                    </div>
                    <span className="mt-1 shrink-0 text-zinc-600 transition group-hover:text-red-400">
                      <ArrowIcon />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Products */}
        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-red-500" />
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">
                  Shop the collection
                </p>
              </div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Products
                {!loadingProducts && !productError && (
                  <span className="ml-3 align-middle text-sm font-medium text-zinc-500">
                    {matchingProducts.length}
                  </span>
                )}
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                Discover the Palmyra collection.
              </p>
            </div>

            <Link
              href="/store"
              className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-zinc-300 transition hover:text-red-400"
            >
              Visit store <ArrowIcon />
            </Link>
          </div>

          {loadingProducts && (
            <div
              className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4"
              aria-label="Loading products"
            >
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="animate-pulse">
                  <div className="aspect-square rounded-2xl border border-white/[0.06] bg-white/[0.045]" />
                  <div className="mt-4 h-4 w-3/4 rounded bg-white/[0.07]" />
                  <div className="mt-3 h-3 w-1/3 rounded bg-white/[0.05]" />
                  <div className="mt-4 h-4 w-1/4 rounded bg-white/[0.07]" />
                </div>
              ))}
            </div>
          )}

          {!loadingProducts && productError && (
            <div
              className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-6 sm:p-8"
              role="alert"
            >
              <h3 className="font-semibold text-white">
                Products are temporarily unavailable
              </h3>
              <p className="mt-2 text-sm text-zinc-400">{productError}</p>
              <button
                type="button"
                onClick={() => setRetryCount((count) => count + 1)}
                className="mt-5 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold transition hover:bg-red-500"
              >
                Try again
              </button>
            </div>
          )}

          {!loadingProducts &&
            !productError &&
            matchingProducts.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                {matchingProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/store/${product.id}`}
                    className="group min-w-0"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-zinc-900 to-[#111]">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-contain p-4 transition duration-500 group-hover:scale-[1.06] sm:p-6"
                      />

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-white/[0.025]" />

                      <span className="absolute left-3 top-3 max-w-[80%] truncate rounded-md border border-white/10 bg-black/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-300 backdrop-blur-sm">
                        {product.category}
                      </span>

                      <span className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-red-600 text-white opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <ArrowIcon />
                      </span>
                    </div>

                    <div className="mt-3">
                      <h3 className="line-clamp-2 font-semibold leading-6 text-zinc-100 transition group-hover:text-red-400">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="mt-1 line-clamp-1 text-xs text-zinc-500">
                          {product.description}
                        </p>
                      )}
                      <p className="mt-3 text-base font-bold text-white">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

          {!loadingProducts &&
            !productError &&
            normalizedQuery.length > 0 &&
            matchingProducts.length === 0 &&
            !noResults && (
              <div className="rounded-2xl border border-dashed border-white/[0.12] px-5 py-8 text-center">
                <p className="font-medium text-zinc-300">
                  No matching products
                </p>
                <p className="mt-2 text-sm text-zinc-500">
                  Try a different keyword or browse the full collection.
                </p>
                <Link
                  href="/store"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-red-400 hover:text-red-300"
                >
                  Explore the store <ArrowIcon />
                </Link>
              </div>
            )}

          {!loadingProducts &&
            !productError &&
            normalizedQuery.length === 0 &&
            matchingProducts.length === 0 && (
              <p className="rounded-2xl border border-white/[0.08] p-6 text-sm text-zinc-400">
                No active products are available right now.
              </p>
            )}
        </section>

        {/* Footer note */}
        <div className="mt-16 border-t border-white/[0.08] pt-6">
          <p className="text-center text-xs tracking-wide text-zinc-600">
            PALMYRA · ENTERTAINMENT, CULTURE & STYLE
          </p>
        </div>
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#080808] px-5 py-12 text-white sm:px-8">
          <div className="mx-auto max-w-[1440px] animate-pulse">
            <div className="h-3 w-32 rounded bg-white/10" />
            <div className="mt-6 h-12 max-w-md rounded bg-white/[0.08]" />
            <div className="mt-4 h-4 max-w-lg rounded bg-white/[0.05]" />
            <div className="mt-10 h-14 rounded-2xl bg-white/[0.06]" />
            <div className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item}>
                  <div className="aspect-video rounded-2xl bg-white/[0.06]" />
                  <div className="mt-3 h-4 rounded bg-white/[0.06]" />
                </div>
              ))}
            </div>
          </div>
        </main>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
