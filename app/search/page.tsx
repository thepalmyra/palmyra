
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
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

function SearchResults() {
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") || "").trim().toLowerCase();

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState("");
  const supabase = createClient();

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
        setProductError("Products could not be loaded. Please try again.");
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
  }, [supabase]);

  const matchingVideos = videos.filter((video: any) =>
    [video.title, video.description, video.category].some(
      (value) => value?.toLowerCase().includes(query)
    )
  );

  const matchingProducts = products.filter((product) =>
    [product.name, product.category, product.description].some(
      (value) => value?.toLowerCase().includes(query)
    )
  );

  const noResults =
    query &&
    matchingVideos.length === 0 &&
    !loadingProducts &&
    matchingProducts.length === 0 &&
    !productError;

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white md:px-10">
      <h1 className="text-3xl font-bold">Search Results</h1>

      <p className="mt-2 text-gray-400">
        Results for:{" "}
        <span className="text-white">{query || "All"}</span>
      </p>

      {noResults && (
        <p className="mt-10 text-gray-400">
          No results found. Try another search.
        </p>
      )}

      {matchingVideos.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-5 text-2xl font-semibold">Videos</h2>

          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {matchingVideos.map((video: any) => (
              <Link
                key={video.id}
                href={`/watch/${video.id}`}
                className="group"
              >
                <img
                  src={
                    video.type === "youtube"
                      ? `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`
                      : video.thumbnail
                  }
                  alt={video.title}
                  className="aspect-video w-full rounded-xl object-cover transition group-hover:opacity-80"
                />
                <h3 className="mt-3 font-semibold">{video.title}</h3>
                <p className="mt-1 text-sm text-gray-400">
                  {video.category}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-12">
        <h2 className="mb-5 text-2xl font-semibold">Products</h2>

        {loadingProducts && (
          <p className="text-gray-400">Loading products...</p>
        )}

        {!loadingProducts && productError && (
          <div className="text-sm text-red-400" role="alert">
            <p>{productError}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-2 underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {!loadingProducts &&
          !productError &&
          matchingProducts.length > 0 && (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
              {matchingProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/store/${product.id}`}
                  className="group"
                >
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="aspect-square w-full object-contain p-4 transition group-hover:scale-[1.03]"
                    />
                  </div>
                  <h3 className="mt-3 font-semibold transition group-hover:text-red-500">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-400">
                    {product.category}
                  </p>
                  <p className="mt-2 font-semibold">
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>
                </Link>
              ))}
            </div>
          )}

        {!loadingProducts &&
          !productError &&
          query &&
          matchingProducts.length === 0 &&
          !noResults && (
            <p className="text-gray-400">
              No matching products found.
            </p>
          )}
      </section>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black p-10 text-white">
          Loading search...
        </main>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
