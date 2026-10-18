"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { videos } from "@/lib/videos";


function thumbnail(video: any) {
  return video.type === "youtube"
    ? `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`
    : video.thumbnail;
}

export default function Watch() {
  const [currentVideo, setCurrentVideo] = useState(0);

  useEffect(() => {
    if (videos.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentVideo((prev) => (prev + 1) % videos.length);
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  if (!videos.length) {
    return (
      <main className="min-h-screen bg-black text-white p-8">
        Add videos to lib/videos.ts to display the watchpage.
      </main>
    );
  }

  const featuredVideo = videos[currentVideo];

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




{/* ALL VIDEO CATEGORIES */}
{Array.from(
  new Set(videos.map((video: any) => video.category).filter(Boolean))
).map((category) => {
  const categoryVideos = videos.filter(
    (video: any) => video.category === category
  );

  return (
    <section key={category} className="px-5 py-10 md:px-10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold md:text-3xl">
          {category}
        </h2>
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
