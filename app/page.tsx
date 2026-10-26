
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

type VideoItem = {
  id: string;
  title?: string;
  name?: string;
  category?: string;
  thumbnail?: string;
  youtubeId?: string;
  youtubeUrl?: string;
  videoUrl?: string;
  url?: string;
  description?: string;
};

const videoLibrary = videos as VideoItem[];

function getYoutubeId(video: VideoItem): string | undefined {
  return (
    video.youtubeId ||
    video.youtubeUrl?.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&/]+)/
    )?.[1] ||
    video.url?.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&/]+)/
    )?.[1]
  );
}

function thumbnail(video: VideoItem): string {
  const youtubeId = getYoutubeId(video);

  if (youtubeId) {
    return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  }

  return video.thumbnail || "/images/video-placeholder.jpg";
}

function productImage(name: string): string {
  const product = name.toLowerCase();

  if (product.includes("cap")) {
    return "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=900&q=85";
  }

  if (product.includes("bag")) {
    return "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85";
  }

  if (product.includes("tee") || product.includes("shirt")) {
    return "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85";
  }

  if (product.includes("headband")) {
    return "https://images.unsplash.com/photo-1506629905607-d9c297d0f4a1?auto=format&fit=crop&w=900&q=85";
  }

  return "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=85";
}

function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

function VideoCard({ video }: { video: VideoItem }) {
  return (
    <Link
      href={`/watch/${video.id}`}
      className="group block min-w-0"
      aria-label={`Watch ${video.title || video.name || "video"}`}
    >
      <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnail(video)}
          alt={video.title || video.name || "Palmyra video"}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105 group-hover:opacity-80"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        <div className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-black/50 text-white backdrop-blur transition group-hover:border-red-500 group-hover:bg-red-600">
          <svg
            viewBox="0 0 24 24"
            className="ml-0.5 h-4 w-4 fill-current"
            aria-hidden="true"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>

        <span className="absolute right-3 top-3 rounded-full border border-white/20 bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
          Watch
        </span>
      </div>

      <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-white transition group-hover:text-red-400 sm:text-base">
        {video.title || video.name || "Palmyra Original"}
      </h3>

      {video.description && (
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500 sm:text-sm">
          {video.description}
        </p>
      )}
    </Link>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState<HomepageProduct[]>([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // Use the first three Palmyra videos for the local banner.
  const featuredVideos = videoLibrary
    .filter((video) => video.category?.toLowerCase() === "palmyra")
    .slice(0, 3);

  const featuredVideo = featuredVideos[featuredIndex];

  const categories = [
    {
      name: "Palmyra Originals",
      subtitle: "Stories, culture and the Palmyra identity.",
      category: "Palmyra",
    },
    {
      name: "Football",
      subtitle: "The game, the energy and the moments that matter.",
      category: "Football",
    },
  ];

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function loadProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, original_price, category, image")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (!cancelled && !error && data) {
        setProducts(data as HomepageProduct[]);
      }
    }

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  function playNextFeaturedVideo() {
    setFeaturedIndex((current) =>
      current >= featuredVideos.length - 1 ? 0 : current + 1
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#080808] text-white">
      {/* CINEMATIC HERO — LOCAL VIDEO ONLY, MUTED, NO POSTER */}
      <section className="relative isolate min-h-[620px] overflow-hidden bg-black sm:min-h-[700px] lg:min-h-[760px]">
        {featuredVideo && (
          <video
            key={featuredVideo.id}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={playNextFeaturedVideo}
            aria-label="Featured Palmyra local video"
          >
            <source
              src={`/videos/${featuredVideo.id}.mp4`}
              type="video/mp4"
            />
          </video>
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-black/25" />

        <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-center px-5 pb-20 pt-24 sm:min-h-[700px] sm:px-8 lg:min-h-[760px] lg:px-12">
          <div className="max-w-3xl">
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-10 bg-red-500" />

              <span className="text-xs font-bold uppercase tracking-[0.3em] text-red-400">
                Culture. Sport. Identity.
              </span>
            </div>

            <h1 className="max-w-3xl text-5xl font-black uppercase leading-[0.94] tracking-[-0.055em] sm:text-7xl lg:text-8xl">
              More than
              <br />
              a brand.
              <br />
              <span className="text-red-500">A way of life.</span>
            </h1>

            <p className="mt-7 max-w-xl text-sm leading-7 text-zinc-300 sm:text-base sm:leading-8">
              Discover the Palmyra world — original videos, football culture
              and sportswear made for the way you live.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {featuredVideo ? (
                <Link
                  href={`/watch/${featuredVideo.id}`}
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-red-600 px-7 py-3 text-sm font-bold uppercase tracking-wider transition hover:bg-red-500"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 fill-current"
                    aria-hidden="true"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch featured
                </Link>
              ) : (
                <Link
                  href="/watch"
                  className="inline-flex min-h-12 items-center justify-center rounded-md bg-red-600 px-7 py-3 text-sm font-bold uppercase tracking-wider transition hover:bg-red-500"
                >
                  Explore videos
                </Link>
              )}

              <Link
                href="/store"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/30 bg-white/5 px-7 py-3 text-sm font-bold uppercase tracking-wider backdrop-blur transition hover:border-white hover:bg-white hover:text-black"
              >
                Shop Palmyra <span aria-hidden="true">↗</span>
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400 sm:text-xs">
              <span>Original content</span>
              <span className="h-1 w-1 rounded-full bg-red-500" />
              <span>Sportswear</span>
              <span className="h-1 w-1 rounded-full bg-red-500" />
              <span>Community</span>
            </div>
          </div>

          {featuredVideos.length > 1 && (
            <div className="absolute bottom-8 right-5 flex items-center gap-2 sm:right-8 lg:right-12">
              {featuredVideos.map((video, index) => (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => setFeaturedIndex(index)}
                  aria-label={`Play featured video ${index + 1}`}
                  aria-current={index === featuredIndex ? "true" : undefined}
                  className={`h-1.5 rounded-full transition-all ${
                    index === featuredIndex
                      ? "w-10 bg-red-500"
                      : "w-4 bg-white/40 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* BRAND PILLARS */}
      <section className="border-y border-white/10 bg-[#0c0c0c]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-white/10 sm:grid-cols-4 sm:divide-y-0">
          {[
            {
              number: "01",
              title: "Sportswear",
              detail: "Made for everyday movement",
            },
            {
              number: "02",
              title: "Accessories",
              detail: "The finishing details",
            },
            {
              number: "03",
              title: "Originals",
              detail: "Stories worth watching",
            },
            {
              number: "04",
              title: "Community",
              detail: "Connected by culture",
            },
          ].map((pillar) => (
            <div key={pillar.number} className="p-5 sm:p-7 lg:p-9">
              <span className="text-xs font-bold tracking-widest text-red-500">
                {pillar.number}
              </span>

              <h2 className="mt-4 text-base font-extrabold uppercase tracking-wide sm:text-lg">
                {pillar.title}
              </h2>

              <p className="mt-2 text-xs leading-5 text-zinc-500 sm:text-sm">
                {pillar.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCT COLLECTION */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
              The Palmyra collection
            </p>

            <h2 className="mt-3 text-3xl font-black uppercase tracking-tight sm:text-5xl">
              Wear the identity.
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-6 text-zinc-400">
              Everyday essentials. A distinct point of view. Discover the
              collection.
            </p>
          </div>

          <Link
            href="/store"
            className="inline-flex w-fit items-center gap-2 border-b border-red-500 pb-2 text-xs font-bold uppercase tracking-[0.15em] transition hover:text-red-400"
          >
            Explore the store <span aria-hidden="true">↗</span>
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {products.map((product) => {
              const hasDiscount =
                product.original_price !== null &&
                product.original_price > product.price;

              const discount = hasDiscount
                ? Math.round(
                    ((product.original_price! - product.price) /
                      product.original_price!) *
                      100
                  )
                : 0;

              return (
                <Link
                  key={product.id}
                  href={`/store/${product.id}`}
                  className="group min-w-0"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image || productImage(product.name)}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-70" />

                    {hasDiscount && (
                      <span className="absolute left-3 top-3 rounded bg-red-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
                        {discount}% off
                      </span>
                    )}

                    <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg text-black transition group-hover:bg-red-600 group-hover:text-white">
                      +
                    </span>
                  </div>

                  <div className="pt-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      {product.category || "Palmyra"}
                    </p>

                    <h3 className="mt-1.5 line-clamp-2 text-sm font-bold text-white transition group-hover:text-red-400 sm:text-base">
                      {product.name}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold">
                        {formatPrice(product.price)}
                      </span>

                      {hasDiscount && (
                        <span className="text-xs text-zinc-500 line-through">
                          {formatPrice(product.original_price!)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center">
            <p className="text-sm text-zinc-400">
              The collection is being prepared.
            </p>

            <Link
              href="/store"
              className="mt-4 inline-flex text-sm font-semibold text-red-400 hover:text-red-300"
            >
              Visit the store →
            </Link>
          </div>
        )}
      </section>

      {/* VIDEO COLLECTIONS */}
      {categories.map((collection) => {
        const collectionVideos = videoLibrary.filter(
          (video) =>
            video.category?.toLowerCase() ===
            collection.category.toLowerCase()
        );

        if (collectionVideos.length === 0) {
          return null;
        }

        return (
          <section
            key={collection.category}
            className="border-t border-white/10 bg-[#0b0b0b] py-16 sm:py-20"
          >
            <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
                    Discover Palmyra
                  </p>

                  <h2 className="mt-3 text-2xl font-black uppercase tracking-tight sm:text-4xl">
                    {collection.name}
                  </h2>

                  <p className="mt-2 text-sm text-zinc-400">
                    {collection.subtitle}
                  </p>
                </div>

                <Link
                  href="/watch"
                  className="shrink-0 text-xs font-bold uppercase tracking-wider text-white transition hover:text-red-400 sm:text-sm"
                >
                  View all <span aria-hidden="true">↗</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {collectionVideos.slice(0, 3).map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* COMMUNITY CAMPAIGN */}
      <section className="relative isolate overflow-hidden border-t border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=2000&q=90"
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />

        <div className="absolute inset-0 -z-10 bg-black/75" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/65 to-transparent" />

        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-400">
            This is Palmyra
          </p>

          <h2 className="mt-4 max-w-3xl text-4xl font-black uppercase leading-tight tracking-tight sm:text-6xl">
            Built around
            <br />
            <span className="text-red-500">what moves us.</span>
          </h2>

          <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-300 sm:text-base">
            From the things we wear to the stories we share, Palmyra brings
            sport, style and culture into one place.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/watch"
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-red-600 px-7 py-3 text-sm font-bold uppercase tracking-wider transition hover:bg-red-500"
            >
              Explore Palmyra
            </Link>

            <a
              href="https://www.instagram.com/palmyraofficial/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/30 px-7 py-3 text-sm font-bold uppercase tracking-wider transition hover:bg-white hover:text-black"
            >
              Join the community ↗
            </a>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="flex flex-col justify-between gap-7 rounded-2xl border border-white/10 bg-white/[0.035] p-7 sm:p-10 lg:flex-row lg:items-center lg:p-14">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
              Your next discovery starts here
            </p>

            <h2 className="mt-3 text-3xl font-black uppercase tracking-tight sm:text-4xl">
              Welcome to Palmyra.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
              Watch the stories. Explore the collection. Be part of the
              culture.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/watch"
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-white px-6 py-3 text-sm font-bold uppercase tracking-wider !text-black transition hover:bg-zinc-200"
            >
              Start watching
            </Link>

            <Link
              href="/store"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/20 px-6 py-3 text-sm font-bold uppercase tracking-wider !text-white transition hover:border-red-500 hover:!text-red-400"
            >
              Shop now
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
