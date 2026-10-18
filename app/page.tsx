"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { videos } from "@/lib/videos";

const products = [
  {
    id: "cap",
    name: "Palmyra Sports Cap",
    price: "₹499",
    category: "ACCESSORIES",
    image:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "sports-bag",
    name: "Palmyra Sports Bag",
    price: "₹599",
    category: "SPORTS GEAR",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "jersey",
    name: "Palmyra Sports Jersey",
    price: "₹799",
    category: "SPORTSWEAR",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=85",
  },
  {
    id: "headband-scarf",
    name: "Palmyra Headband / Scarf",
    price: "₹299",
    category: "ACCESSORIES",
    image:
      "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=800&q=85",
  },
];

function thumbnail(video: any) {
  return video.type === "youtube"
    ? `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`
    : video.thumbnail;
}

export default function Home() {
  const palmyraVideos = videos.filter(
  (video: any) => video.category === "Palmyra" && video.type === "local"
);

const [currentVideo, setCurrentVideo] = useState(0);

  useEffect(() => {
  if (palmyraVideos.length <= 1) return;

  const timer = setInterval(() => {
    setCurrentVideo((prev) => (prev + 1) % palmyraVideos.length);
  }, 10000);

  return () => clearInterval(timer);
}, [palmyraVideos.length]);

  if (!palmyraVideos.length) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        Add videos to lib/videos.ts to display the homepage.
      </main>
    );
  }

  const featuredVideo = palmyraVideos[currentVideo];

  return (
    <main className="min-h-screen bg-black pb-24 text-white">

      {/* PALMYRA INTRO + FEATURED VIDEO */}

      <section className="relative flex min-h-[580px] items-center overflow-hidden md:min-h-[750px]">

        <img
          src={thumbnail(featuredVideo)}
          alt={featuredVideo.title}
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/20" />

        <div className="relative z-10 max-w-4xl px-6 py-24 md:px-16">

          <p className="mb-4 text-sm font-semibold tracking-[0.35em] text-red-500">
            INTRODUCING PALMYRA
          </p>

          <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            More than a brand.
            <br />
            A way of life.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-gray-300 md:text-lg">
            Discover Palmyra — sportswear, accessories, original
            content and a community built around your passion.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">

            <Link
              href={`/watch/${featuredVideo.id}`}
              className="rounded-lg bg-red-600 px-7 py-4 font-bold transition hover:bg-red-700"
            >
              ▶ Watch Featured Video
            </Link>

            <Link
              href="/store"
              className="rounded-lg border border-white px-7 py-4 font-bold transition hover:bg-white hover:text-black"
            >
              Shop Palmyra →
            </Link>

          </div>

          <p className="mt-6 text-sm text-gray-400">
            Featured: {featuredVideo.title}
          </p>

        </div>
      </section>


      {/* VIDEO CATEGORIES */}
{["Palmyra", "Football"].map((category) => {
  const categoryVideos = videos.filter(
    (video: any) => video.category === category
  );

  return (
    <section key={category} className="px-5 py-10 md:px-10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold md:text-3xl">
          {category === "Palmyra" ? "Palmyra" : "Football"}
        </h2>

        <Link
          href="/watch"
          className="text-sm text-gray-400 transition hover:text-white"
        >
          Explore All →
        </Link>
      </div>

      <div className="flex gap-5 overflow-x-auto pb-4">
        {categoryVideos.map((video: any) => (
          <Link
            key={video.id}
            href={`/watch/${video.id}`}
            className="w-[260px] flex-shrink-0 md:w-[320px]"
          >
            <div className="overflow-hidden rounded-xl bg-zinc-900">
              <img
                src={
                  video.type === "youtube"
                    ? `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`
                    : video.thumbnail
                }
                alt={video.title}
                className="aspect-video w-full object-cover transition duration-300 hover:scale-105"
              />
            </div>

            <h3 className="mt-3 font-semibold">{video.title}</h3>
            <p className="mt-1 text-sm text-gray-400">
              {video.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
})}

      {/* PALMYRA PRODUCT COLLECTION */}

      <section className="bg-zinc-950 px-5 py-12 md:px-10 md:py-16">

        <div className="mb-8 flex items-end justify-between gap-4">

          <div>
            <p className="mb-2 text-xs font-semibold tracking-[0.25em] text-red-500">
              THE PALMYRA COLLECTION
            </p>

            <h2 className="text-3xl font-bold md:text-4xl">
              Trending Products
            </h2>

            <p className="mt-3 text-sm text-gray-400">
              Gear up. Find your style. Make it yours.
            </p>
          </div>

          <Link
            href="/store"
            className="shrink-0 text-sm text-gray-300 transition hover:text-white"
          >
            Shop All →
          </Link>

        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-6">

          {products.map((product) => (
            <Link
              key={product.id}
              href={`/store/${product.id}`}
              className="group min-w-0"
            >

              <div className="overflow-hidden rounded-xl bg-zinc-900">
                <img
                  src={product.image}
                  alt={product.name}
                  className="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>

              <p className="mt-4 text-[10px] tracking-widest text-gray-500">
                {product.category}
              </p>

              <h3 className="mt-2 text-sm font-semibold md:text-base">
                {product.name}
              </h3>

              <p className="mt-2 text-sm text-gray-300">
                {product.price}
              </p>

              <p className="mt-3 text-xs text-gray-400 transition group-hover:text-white">
                View Product →
              </p>

            </Link>
          ))}

        </div>

        <div className="mt-12 text-center">
          <Link
            href="/store"
            className="inline-block rounded-lg bg-white px-8 py-4 font-bold text-black transition hover:bg-gray-200"
          >
            EXPLORE ALL PRODUCTS
          </Link>
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
