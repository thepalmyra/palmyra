
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { videos } from "@/lib/videos";
import { products } from "@/lib/products";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") || "").trim().toLowerCase();

  const matchingVideos = videos.filter((video: any) =>
    [video.title, video.description, video.category]
      .some((value) => value?.toLowerCase().includes(query))
  );

  const matchingProducts = products.filter((product: any) =>
    [product.name, product.category, product.description]
      .some((value) => value?.toLowerCase().includes(query))
  );

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white md:px-10">
      <h1 className="text-3xl font-bold">
        Search Results
      </h1>

      <p className="mt-2 text-gray-400">
        Results for: <span className="text-white">{query || "All"}</span>
      </p>

      {query && matchingVideos.length === 0 && matchingProducts.length === 0 && (
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

      {matchingProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-5 text-2xl font-semibold">Products</h2>

          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {matchingProducts.map((product: any) => (
              <Link
                key={product.id}
                href={`/store/${product.id}`}
                className="group"
              >
                <h3 className="font-semibold transition group-hover:text-red-500">
                  {product.name}
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  {product.category}
                </p>
                <p className="mt-2">{product.price}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
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
