
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { videos } from "@/lib/videos";
import { createClient } from "@/lib/supabase/client";

type HomepageProduct = {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  category: string;
  image: string;
};

function thumbnail(video: any): string {
  return video.type === "youtube"
    ? `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`
    : video.thumbnail;
}

// Fallback images are used only if a product has no saved image.
function getProductImage(name: string): string {
  const productName = name.toLowerCase();

  if (productName.includes("cap")) {
    return "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=900&q=85";
  }

  if (
    productName.includes("bag") ||
    productName.includes("drawstring")
  ) {
    return "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85";
  }

  if (
    productName.includes("raglan") ||
    productName.includes("tee") ||
    productName.includes("shirt")
  ) {
    return "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85";
  }

  if (productName.includes("headband")) {
    return "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=900&q=85";
  }

  return "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=85";
}

export default function Home() {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [storeProducts, setStoreProducts] = useState<HomepageProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const palmyraVideos = videos.filter(
    (video: any) =>
      video.category === "Palmyra" && video.type === "local"
  );

  useEffect(() => {
    if (palmyraVideos.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentVideo((previous) => (previous + 1) % palmyraVideos.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [palmyraVideos.length]);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const supabase = createClient();

        const { data, error } = await supabase
          .from("products")
          .select("id, name, price, original_price, category, image")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        if (!cancelled) {
          setStoreProducts((data ?? []) as HomepageProduct[]);
        }
      } catch (error) {
        console.error("Unable to load homepage products:", error);

        if (!cancelled) {
          setStoreProducts([]);
        }
      } finally {
        if (!cancelled) {
          setProductsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const featuredVideo = palmyraVideos[currentVideo];
  const videoCategories = ["Palmyra", "Football"];

  return (
    <main className="min-h-screen overflow-hidden bg-black pb-16 text-white">
      {/* HERO */}
      <section className="relative flex min-h-[600px] items-center overflow-hidden md:min-h-[760px]">
        {featuredVideo ? (
          <video
            key={featuredVideo.id}
            src={`/videos/${featuredVideo.id}.mp4`}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : (
          <img
            src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=2000&q=85"
            alt="Athletes training on a running track"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />

        <div className="relative z-10 max-w-5xl px-5 py-24 sm:px-8 md:px-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-xs font-semibold tracking-[0.2em] text-red-300">
              ENTER THE PALMYRA WORLD
            </span>
          </div>

          <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl md:text-8xl">
            More than a brand.
            <span className="mt-2 block text-red-500">
              A way of life.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-gray-300 md:text-lg">
            Discover sportswear, everyday accessories, original
            entertainment and a community driven by passion.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/store"
              className="rounded-xl bg-red-600 px-6 py-4 font-bold transition hover:bg-red-700"
            >
              Shop Palmyra <span aria-hidden="true">→</span>
            </Link>

            {featuredVideo && (
              <Link
                href={`/watch/${featuredVideo.id}`}
                className="rounded-xl border border-white/30 bg-black/30 px-6 py-4 font-bold backdrop-blur-sm transition hover:border-white hover:bg-white hover:text-black"
              >
                <span aria-hidden="true">▶ </span>
                Watch Featured Video
              </Link>
            )}

            {!featuredVideo && (
              <Link
                href="/watch"
                className="rounded-xl border border-white/30 bg-black/30 px-6 py-4 font-bold transition hover:bg-white hover:text-black"
              >
                Explore Videos <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>

          {featuredVideo && (
            <p className="mt-6 text-sm text-gray-400">
              Now featuring:{" "}
              <span className="font-semibold text-white">
                {featuredVideo.title}
              </span>
            </p>
          )}

          <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/15 pt-6 text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
            <span>Sportswear</span>
            <span>Accessories</span>
            <span>Entertainment</span>
            <span>Community</span>
          </div>
        </div>
      </section>

      {/* BRAND PILLARS */}
      <section className="border-y border-white/10 bg-zinc-950 px-5 py-8 md:px-10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 md:grid-cols-4">
          {[
            {
              number: "01",
              title: "Sportswear",
              description: "Made for your everyday movement.",
            },
            {
              number: "02",
              title: "Accessories",
              description: "The details that define your style.",
            },
            {
              number: "03",
              title: "Original Content",
              description: "Stories, sport and entertainment.",
            },
            {
              number: "04",
              title: "Community",
              description: "Connected by a shared passion.",
            },
          ].map((item) => (
            <div key={item.number} className="group">
              <p className="text-xs font-bold tracking-widest text-red-500">
                {item.number}
              </p>
              <h2 className="mt-2 text-base font-bold sm:text-lg">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* VIDEO COLLECTIONS */}
      {videoCategories.map((category) => {
        const categoryVideos = videos.filter(
          (video: any) => video.category === category
        );

        if (categoryVideos.length === 0) return null;

        return (
          <section
            key={category}
            className="px-5 py-12 md:px-10 md:py-14"
          >
            <div className="mx-auto max-w-7xl">
              <div className="mb-7 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold tracking-[0.22em] text-red-500">
                    WATCH ON PALMYRA
                  </p>
                  <h2 className="mt-2 text-2xl font-bold md:text-3xl">
                    {category}
                  </h2>
                  <p className="mt-2 text-sm text-gray-400">
                    {category === "Football"
                      ? "The game, the moments and the passion."
                      : "Discover stories from the Palmyra world."}
                  </p>
                </div>

                <Link
                  href="/watch"
                  className="shrink-0 text-sm font-semibold text-gray-300 transition hover:text-red-400"
                >
                  Explore All →
                </Link>
              </div>

              <div className="flex gap-5 overflow-x-auto pb-4">
                {categoryVideos.map((video: any) => (
                  <Link
                    key={video.id}
                    href={`/watch/${video.id}`}
                    className="group w-[260px] flex-shrink-0 sm:w-[300px] md:w-[340px]"
                  >
                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
                      <img
                        src={thumbnail(video)}
                        alt={video.title}
                        loading="lazy"
                        className="aspect-video w-full object-cover transition duration-500 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-black/60 opacity-90 transition group-hover:scale-110">
                          ▶
                        </span>
                      </div>
                    </div>

                    <h3 className="mt-4 font-semibold transition group-hover:text-red-400">
                      {video.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-400">
                      {video.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* PRODUCT COLLECTION */}
      <section className="bg-zinc-950 px-5 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-bold tracking-[0.25em] text-red-500">
                THE PALMYRA COLLECTION
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
                Find your style.
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-gray-400 md:text-base">
                Everyday essentials and sports-inspired gear for
                wherever your journey takes you.
              </p>
            </div>

            <Link
              href="/store"
              className="rounded-lg border border-white/20 px-5 py-3 text-sm font-semibold transition hover:border-white hover:bg-white hover:text-black"
            >
              Shop All Products →
            </Link>
          </div>

          {productsLoading ? (
            <div className="rounded-2xl border border-white/10 bg-black p-8 text-center">
              <p className="text-gray-400">Loading Palmyra products...</p>
            </div>
          ) : storeProducts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black p-8 text-center">
              <p className="text-gray-300">
                New Palmyra products are coming soon.
              </p>
              <Link
                href="/store"
                className="mt-4 inline-block text-sm font-semibold text-red-400 hover:text-red-300"
              >
                Visit Store →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
              {storeProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/store/${product.id}`}
                  className="group min-w-0"
                >
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
                    <img
                      src={product.image || getProductImage(product.name)}
                      alt={product.name}
                      loading="lazy"
                      className="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-12 sm:p-4 sm:pt-16">
                      <span className="inline-flex rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm sm:text-[10px]">
                        Palmyra Collection
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.18em] text-red-400 sm:text-[10px]">
                    {product.category}
                  </p>

                  <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-5 transition group-hover:text-red-400 sm:text-base">
                    {product.name}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="font-bold">
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </span>

                    {product.original_price !== null &&
                      product.original_price > product.price && (
                        <span className="text-xs text-gray-500 line-through">
                          ₹
                          {Number(product.original_price).toLocaleString("en-IN")}
                        </span>
                      )}
                  </div>

                  <p className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-gray-400 transition group-hover:text-white sm:text-sm">
                    View Product
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </p>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              href="/store"
              className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-sm font-bold tracking-wide text-black transition hover:bg-red-500 hover:text-white"
            >
              EXPLORE THE COLLECTION <span className="ml-2">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* COMMUNITY BANNER */}
      <section className="px-5 py-16 md:px-10 md:py-24">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-900">
          <img
            src="https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1800&q=85"
            alt="Athletic training and sports lifestyle"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/30" />

          <div className="relative z-10 max-w-3xl px-6 py-14 sm:px-10 md:px-14 md:py-20">
            <p className="text-xs font-bold tracking-[0.25em] text-red-400">
              THIS IS PALMYRA
            </p>

            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
              Built around
              <span className="block text-red-500">
                your passion.
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-gray-300 md:text-base">
              Discover new products, watch original content and
              become part of a community inspired by sport, style
              and entertainment.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/store"
                className="rounded-xl bg-red-600 px-6 py-4 font-bold transition hover:bg-red-700"
              >
                Discover the Store →
              </Link>

              <Link
                href="/watch"
                className="rounded-xl border border-white/30 px-6 py-4 font-bold transition hover:bg-white hover:text-black"
              >
                Explore Videos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="border-t border-white/10 px-5 py-8 text-center">
        <p className="text-xs tracking-wide text-gray-500">
          PALMYRA · SPORTS · STYLE · ENTERTAINMENT
        </p>
      </section>
    </main>
  );
}
