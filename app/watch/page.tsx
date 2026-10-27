"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { videos } from "@/lib/videos";

type VideoItem = {
  id: string;
  type: "youtube" | "local";
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

const FALLBACK_THUMBNAIL = "/images/video-placeholder.jpg";

function getThumbnail(video: VideoItem): string {
  if (video.type === "youtube") {
    return `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
  }

  return video.thumbnail || FALLBACK_THUMBNAIL;
}

function PlayIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 5.5a1 1 0 0 1 1.5-.86l10 6.5a1 1 0 0 1 0 1.72l-10 6.5A1 1 0 0 1 8 18.5z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

function VideoCard({ video }: { video: VideoItem }) {
  const title = video.title || video.name || "Palmyra Original";
  const isYouTube = video.type === "youtube";

  return (
    <Link
      href={`/watch/${video.id}`}
      aria-label={`Watch ${title}`}
      className="group block min-w-0"
    >
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/[0.09] bg-[#151515]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getThumbnail(video)}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(event) => {
            const image = event.currentTarget;

            if (isYouTube) {
              // Do not substitute a local image for a YouTube thumbnail.
              image.style.visibility = "hidden";
              return;
            }

            if (image.dataset.fallbackApplied !== "true") {
              image.dataset.fallbackApplied = "true";
              image.src = FALLBACK_THUMBNAIL;
            }
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />

        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/65 px-2.5 py-1.5 backdrop-blur-md">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isYouTube ? "bg-red-500" : "bg-amber-400"
            }`}
          />
          <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-white">
            {isYouTube ? "YouTube" : "Palmyra Original"}
          </span>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-12 w-12 translate-y-2 items-center justify-center rounded-full border border-white/50 bg-black/50 text-white opacity-0 backdrop-blur-md transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <PlayIcon size={22} />
          </span>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <span className="rounded-md border border-white/10 bg-black/50 px-2 py-1 text-[10px] font-semibold text-white/85 backdrop-blur">
            {video.category || "Videos"}
          </span>

          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-black transition group-hover:bg-red-500 group-hover:text-white">
            <PlayIcon size={15} />
          </span>
        </div>
      </div>

      <div className="px-0.5 pt-3">
        <h3 className="line-clamp-2 text-sm font-bold leading-5 text-white transition group-hover:text-red-400 sm:text-base">
          {title}
        </h3>

        {video.description && (
          <p className="mt-1.5 line-clamp-1 text-xs text-zinc-500">
            {video.description}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function WatchPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const categories = useMemo(() => {
    const allCategories = Array.from(
      new Set(
        videoLibrary
          .map((video) => video.category?.trim())
          .filter((category): category is string => Boolean(category))
      )
    );

    return allCategories.sort((a, b) => {
      if (a.toLowerCase() === "palmyra") return -1;
      if (b.toLowerCase() === "palmyra") return 1;
      if (a.toLowerCase() === "football") return -1;
      if (b.toLowerCase() === "football") return 1;
      return a.localeCompare(b);
    });
  }, []);

  const featuredVideos = useMemo(
    () =>
      videoLibrary.filter(
        (video) =>
          video.type === "local" &&
          video.category?.trim().toLowerCase() === "palmyra"
      ),
    []
  );

  const featuredVideo =
    featuredVideos.length > 0
      ? featuredVideos[featuredIndex % featuredVideos.length]
      : undefined;

  const filteredVideos = useMemo(() => {
    const query = search.trim().toLowerCase();

    return videoLibrary.filter((video) => {
      const matchesCategory =
        activeCategory === "All" || video.category === activeCategory;

      const matchesSearch =
        !query ||
        [video.title, video.name, video.description, video.category]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  const visibleCategories = useMemo(
    () =>
      categories.filter((category) =>
        filteredVideos.some((video) => video.category === category)
      ),
    [categories, filteredVideos]
  );

  function scrollCategory(category: string, direction: "left" | "right") {
    rowRefs.current[category]?.scrollBy({
      left:
        direction === "left"
          ? -(rowRefs.current[category]?.clientWidth ?? 0) * 0.8
          : (rowRefs.current[category]?.clientWidth ?? 0) * 0.8,
      behavior: "smooth",
    });
  }

  function selectFeatured(index: number) {
    setFeaturedIndex(index);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#080808] text-white">
      {/* CINEMATIC HERO */}
      <section className="relative isolate min-h-[600px] overflow-hidden bg-[#090909] sm:min-h-[690px] lg:min-h-[760px]">
        {featuredVideo && (
          <video
            key={featuredVideo.id}
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={() => {
              setFeaturedIndex((current) =>
                current >= featuredVideos.length - 1 ? 0 : current + 1
              );
            }}
            aria-label="Featured Palmyra video"
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source
              src={`/videos/${featuredVideo.id}.mp4`}
              type="video/mp4"
            />
          </video>
        )}

        {/* No poster or thumbnail is used for the featured video. */}
        <div className="absolute inset-0 -z-0 bg-gradient-to-r from-black via-black/75 to-black/20" />
        <div className="absolute inset-0 -z-0 bg-gradient-to-t from-[#080808] via-black/10 to-black/30" />

        <div className="relative z-10 mx-auto flex min-h-[600px] max-w-[1440px] items-end px-5 pb-16 pt-28 sm:min-h-[690px] sm:px-10 sm:pb-20 lg:min-h-[760px] lg:px-16 lg:pb-24">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3.5 py-2 backdrop-blur-md">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/90">
                The Palmyra streaming experience
              </span>
            </div>

            <h1 className="text-5xl font-black uppercase leading-[0.92] tracking-[-0.06em] sm:text-7xl lg:text-8xl">
              Your world.
              <br />
              Your <span className="text-red-500">game.</span>
              <br />
              Your stories.
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-zinc-300 sm:text-base sm:leading-8">
              From football skills to Palmyra originals, discover the videos
              that move your world.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {featuredVideo && (
                <Link
                  href={`/watch/${featuredVideo.id}`}
                  className="inline-flex min-h-12 items-center gap-2.5 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold transition hover:bg-red-500"
                >
                  <PlayIcon size={19} />
                  Watch featured
                </Link>
              )}

              <a
                href="#video-library"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/20 bg-white/[0.06] px-6 py-3 text-sm font-semibold transition hover:bg-white hover:text-black"
              >
                Explore library
                <span className="ml-2">↓</span>
              </a>
            </div>

            {featuredVideos.length > 1 && (
              <div className="mt-10 flex items-center gap-3">
                {featuredVideos.map((video, index) => (
                  <button
                    key={video.id}
                    type="button"
                    onClick={() => selectFeatured(index)}
                    aria-label={`Play featured video ${index + 1}`}
                    aria-pressed={index === featuredIndex}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === featuredIndex
                        ? "w-12 bg-red-500"
                        : "w-5 bg-white/40 hover:bg-white"
                    }`}
                  />
                ))}

                <span className="ml-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
                  {String(featuredIndex + 1).padStart(2, "0")} /{" "}
                  {String(featuredVideos.length).padStart(2, "0")}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-24 bg-gradient-to-t from-[#080808] to-transparent" />
      </section>

      {/* LIBRARY HEADER AND SEARCH */}
      <section
        id="video-library"
        className="mx-auto max-w-[1440px] scroll-mt-20 px-5 pb-16 pt-8 sm:px-10 sm:pb-20 lg:px-16"
      >
        <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-500">
              Made for your next watch
            </p>

            <h2 className="mt-3 text-3xl font-black uppercase tracking-tight sm:text-5xl">
              Discover <span className="text-red-500">more.</span>
            </h2>

            <p className="mt-3 text-sm text-zinc-400">
              Originals, football and everything worth watching.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 lg:w-[360px]">
            <span className="text-zinc-500">
              <SearchIcon />
            </span>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search videos, categories..."
              aria-label="Search videos"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="text-xs font-bold text-zinc-400 transition hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* CATEGORY FILTERS */}
        <div className="mb-9 flex gap-2 overflow-x-auto pb-2">
          {["All", ...categories].map((category) => {
            const isActive = activeCategory === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                aria-pressed={isActive}
                className={`shrink-0 rounded-full border px-5 py-2.5 text-xs font-bold transition ${
                  isActive
                    ? "border-red-500 bg-red-600 text-white"
                    : "border-white/10 bg-white/[0.025] text-zinc-400 hover:border-white/30 hover:text-white"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* LIBRARY STATS */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-5">
          <div>
            <h3 className="text-lg font-bold">
              {activeCategory === "All" ? "All videos" : activeCategory}
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              {filteredVideos.length}{" "}
              {filteredVideos.length === 1 ? "video" : "videos"} available
            </p>
          </div>

          <span className="rounded-lg border border-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
            {filteredVideos.filter((video) => video.type === "youtube").length}{" "}
            YouTube ·{" "}
            {filteredVideos.filter((video) => video.type === "local").length}{" "}
            Originals
          </span>
        </div>

        {/* FILTERED VIDEO COLLECTIONS */}
        {filteredVideos.length > 0 ? (
          visibleCategories.map((category) => {
            const categoryVideos = filteredVideos.filter(
              (video) => video.category === category
            );

            return (
              <section
                key={category}
                id={`category-${encodeURIComponent(category)}`}
                className="mb-14 scroll-mt-28 sm:mb-16"
              >
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-red-500">
                      Explore collection
                    </p>

                    <h3 className="mt-2 text-2xl font-black uppercase tracking-tight sm:text-3xl">
                      {category}
                    </h3>

                    <p className="mt-1.5 text-xs text-zinc-500">
                      {categoryVideos.length}{" "}
                      {categoryVideos.length === 1 ? "video" : "videos"}
                    </p>
                  </div>

                  {categoryVideos.length > 2 && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => scrollCategory(category, "left")}
                        aria-label={`Scroll ${category} videos left`}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white transition hover:border-red-500 hover:bg-red-600"
                      >
                        <span aria-hidden="true">←</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => scrollCategory(category, "right")}
                        aria-label={`Scroll ${category} videos right`}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white transition hover:border-red-500 hover:bg-red-600"
                      >
                        <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  )}
                </div>

                <div
                  ref={(element) => {
                    rowRefs.current[category] = element;
                  }}
                  className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-5 sm:gap-5"
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
          })
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] px-5 py-20 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-400">
              <SearchIcon />
            </div>

            <h3 className="mt-5 text-xl font-bold">No videos found</h3>

            <p className="mt-2 text-sm text-zinc-500">
              Try a different search or select another category.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
              }}
              className="mt-6 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold transition hover:bg-red-500"
            >
              Show all videos
            </button>
          </div>
        )}

        {/* BOTTOM DISCOVERY STRIP */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#171010] via-[#101010] to-[#080808] p-6 sm:p-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-500">
                Stay in the game
              </p>

              <h3 className="mt-3 text-2xl font-black uppercase tracking-tight sm:text-3xl">
                Watch it. Live it. Wear it.
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
                Discover the Palmyra collection and bring your passion beyond
                the screen.
              </p>
            </div>

            <Link
  href="/store"
  className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold !text-black transition hover:bg-red-500 hover:!text-white"
>
  Explore the store
  <span aria-hidden="true">↗</span>
</Link>
          </div>
        </div>
      </section>
    </main>
  );
}