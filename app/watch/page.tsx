
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { videos } from "@/lib/videos";

type VideoItem = {
  id: string;
  title?: string;
  name?: string;
  category?: string;
  thumbnail?: string;
  youtubeId?: string;
  youtubeUrl?: string;
  url?: string;
  description?: string;
};

const videoLibrary = videos as VideoItem[];

function getThumbnail(video: VideoItem): string {
  const youtubeId =
    video.youtubeId ||
    video.youtubeUrl?.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&/]+)/
    )?.[1] ||
    video.url?.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&/]+)/
    )?.[1];

  if (youtubeId) {
    return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  }

  return video.thumbnail || "/images/video-placeholder.jpg";
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
          src={getThumbnail(video)}
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
          Palmyra Play
        </span>
      </div>

      <h3 className="mt-3 line-clamp-2 text-sm font-bold text-white transition group-hover:text-red-400 sm:text-base">
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

export default function WatchPage() {
  const categories = Array.from(
    new Set(
      videoLibrary
        .map((video) => video.category?.trim())
        .filter((category): category is string => Boolean(category))
    )
  ).sort((a, b) => {
    if (a.toLowerCase() === "palmyra") return -1;
    if (b.toLowerCase() === "palmyra") return 1;
    if (a.toLowerCase() === "football") return -1;
    if (b.toLowerCase() === "football") return 1;
    return a.localeCompare(b);
  });

  const featuredVideos = videoLibrary.filter(
    (video) => video.category?.toLowerCase() === "palmyra"
  );

  const [featuredIndex, setFeaturedIndex] = useState(0);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const featuredVideo = featuredVideos[featuredIndex] || featuredVideos[0];

  useEffect(() => {
    if (featuredVideos.length < 2) return;

    const timer = window.setInterval(() => {
      setFeaturedIndex((current) => (current + 1) % featuredVideos.length);
    }, 10000);

    return () => window.clearInterval(timer);
  }, [featuredVideos.length]);

  function scrollCategory(category: string, direction: "left" | "right") {
    const row = rowRefs.current[category];
    if (!row) return;

    row.scrollBy({
      left: direction === "left" ? -row.clientWidth * 0.8 : row.clientWidth * 0.8,
      behavior: "smooth",
    });
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#080808] text-white">
      {/* CINEMATIC FEATURED BANNER */}
      <section className="relative isolate min-h-[540px] overflow-hidden sm:min-h-[620px] lg:min-h-[680px]">
        {featuredVideo ? (
          <video
            key={featuredVideo.id}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster={getThumbnail(featuredVideo)}
            aria-label="Featured Palmyra content"
          >
            <source
              src={`/videos/${featuredVideo.id}.mp4`}
              type="video/mp4"
            />
          </video>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=2000&q=90"
            alt="Football stadium under the lights"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-black/20" />

        <div className="relative mx-auto flex min-h-[540px] max-w-7xl items-center px-5 pb-16 pt-24 sm:min-h-[620px] sm:px-8 lg:min-h-[680px] lg:px-12">
          <div className="max-w-3xl">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-red-500" />
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-400">
                The Palmyra watch experience
              </p>
            </div>

            <h1 className="text-5xl font-black uppercase leading-[0.94] tracking-[-0.055em] sm:text-7xl lg:text-8xl">
              Stories
              <br />
              that <span className="text-red-500">move.</span>
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-zinc-300 sm:text-base sm:leading-8">
              Explore original content, football and the culture that brings
              the Palmyra community together.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {featuredVideo && (
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
              )}

              <a
                href="#video-library"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/30 bg-white/5 px-7 py-3 text-sm font-bold uppercase tracking-wider backdrop-blur transition hover:bg-white hover:text-black"
              >
                Browse library ↓
              </a>
            </div>

            {featuredVideos.length > 1 && (
              <div className="mt-9 flex items-center gap-2">
                {featuredVideos.map((video, index) => (
                  <button
                    key={video.id}
                    type="button"
                    onClick={() => setFeaturedIndex(index)}
                    aria-label={`Show featured video ${index + 1}`}
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
        </div>
      </section>

      {/* VIDEO LIBRARY */}
      <section
        id="video-library"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 py-12 sm:px-8 sm:py-16 lg:px-12"
      >
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
            Watch what you love
          </p>
          <h2 className="mt-3 text-3xl font-black uppercase tracking-tight sm:text-5xl">
            The video library.
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Browse every available category and discover your next favourite.
          </p>
        </div>

        {/* STICKY CATEGORY NAVIGATION */}
        {categories.length > 0 && (
          <nav
            aria-label="Video categories"
            className="sticky top-16 z-20 -mx-5 mb-10 overflow-x-auto border-y border-white/10 bg-[#080808]/95 px-5 py-3 backdrop-blur-xl scrollbar-hide sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12"
          >
            <div className="flex min-w-max items-center gap-2">
              {categories.map((category) => (
                <a
                  key={category}
                  href={`#category-${encodeURIComponent(category)}`}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-300 transition hover:border-red-500 hover:bg-red-600 hover:text-white"
                >
                  {category}
                </a>
              ))}
            </div>
          </nav>
        )}

        {categories.map((category) => {
          const categoryVideos = videoLibrary.filter(
            (video) => video.category?.trim() === category
          );

          return (
            <section
              key={category}
              id={`category-${encodeURIComponent(category)}`}
              className="mb-14 scroll-mt-36 sm:mb-20"
            >
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-500">
                    Palmyra collection
                  </p>
                  <h2 className="mt-2 text-xl font-black uppercase tracking-tight sm:text-3xl">
                    {category}
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
                    {categoryVideos.length}{" "}
                    {categoryVideos.length === 1 ? "video" : "videos"}
                  </p>
                </div>

                {categoryVideos.length > 2 && (
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => scrollCategory(category, "left")}
                      aria-label={`Scroll ${category} videos left`}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-red-500 hover:bg-red-600"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollCategory(category, "right")}
                      aria-label={`Scroll ${category} videos right`}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-red-500 hover:bg-red-600"
                    >
                      →
                    </button>
                  </div>
                )}
              </div>

              <div
                ref={(element) => {
                  rowRefs.current[category] = element;
                }}
                className="horizontal-scroll scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 sm:gap-5"
              >
                {categoryVideos.map((video) => (
                  <div
                    key={video.id}
                    className="w-[82%] min-w-[82%] snap-start sm:w-[48%] sm:min-w-[48%] lg:w-[32%] lg:min-w-[32%]"
                  >
                    <VideoCard video={video} />
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {videoLibrary.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
            <h2 className="text-xl font-bold">More stories are coming.</h2>
            <p className="mt-3 text-sm text-zinc-400">
              Check back soon for new Palmyra content.
            </p>
          </div>
        )}
      </section>

      {/* COMMUNITY BANNER */}
      <section className="relative isolate overflow-hidden border-t border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1800&q=85"
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-black/80" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/60 to-transparent" />

        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-400">
            Beyond the screen
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-black uppercase leading-tight sm:text-5xl">
            Watch it.
            <br />
            Live it.
            <br />
            <span className="text-red-500">Wear it.</span>
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-7 text-zinc-300">
            Explore the Palmyra collection and connect with the community.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/store"
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-red-600 px-7 py-3 text-sm font-bold uppercase tracking-wider transition hover:bg-red-500"
            >
              Shop Palmyra
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/30 px-7 py-3 text-sm font-bold uppercase tracking-wider transition hover:bg-white hover:text-black"
            >
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
