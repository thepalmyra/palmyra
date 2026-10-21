
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { videos } from "@/lib/videos";

function thumbnail(video: any) {
  return video.type === "youtube"
    ? `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`
    : video.thumbnail;
}

function getCategoryOrder(category: string) {
  if (category.toLowerCase() === "palmyra") return 0;
  if (category.toLowerCase() === "football") return 1;
  return 2;
}

export default function Watch() {
  const [currentVideo, setCurrentVideo] = useState(0);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const bannerVideos = videos.filter(
    (video: any) =>
      video.type === "local" &&
      video.category?.toLowerCase() === "palmyra"
  );

  useEffect(() => {
    if (bannerVideos.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentVideo((previous) => (previous + 1) % bannerVideos.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [bannerVideos.length]);

  const featuredVideo =
    bannerVideos.length > 0
      ? bannerVideos[currentVideo % bannerVideos.length]
      : null;

  const categories = Array.from(
    new Set(
      videos
        .map((video: any) => video.category)
        .filter(
          (category: any) =>
            typeof category === "string" && category.trim()
        )
    )
  ).sort(
    (a, b) => getCategoryOrder(a) - getCategoryOrder(b)
  );

  function scrollCategory(sectionId: string, direction: number) {
    const row = rowRefs.current[sectionId];

    if (row) {
      row.scrollBy({
        left: direction * row.clientWidth * 0.8,
        behavior: "smooth",
      });
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#080808] pb-16 text-white">
      {/* FEATURED HERO */}
      <section className="relative isolate flex min-h-[590px] items-center overflow-hidden bg-zinc-950 md:min-h-[720px]">
        {featuredVideo ? (
          <video
            key={featuredVideo.id}
            src={`/videos/${featuredVideo.id}.mp4`}
            className="absolute inset-0 -z-20 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : (
          <img
            src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=2000&q=85"
            alt="Athletes running on a track"
            className="absolute inset-0 -z-20 h-full w-full object-cover"
          />
        )}

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/80 to-black/30" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#080808] via-transparent to-black/20" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 md:px-12 md:py-32">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-red-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              The Palmyra experience
            </div>

            <h1 className="text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl md:text-8xl">
              Stories that
              <br />
              <span className="text-red-500">move you.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-gray-300 sm:text-lg sm:leading-8">
              Your destination for Palmyra originals, football and
              inspiring stories. Discover the videos, moments and
              passions that bring our community together.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {featuredVideo && (
                <Link
                  href={`/watch/${featuredVideo.id}`}
                  className="inline-flex items-center gap-3 rounded-xl bg-red-600 px-6 py-4 font-bold transition hover:-translate-y-0.5 hover:bg-red-700"
                >
                  <span aria-hidden="true">▶</span>
                  Watch featured
                </Link>
              )}

              <a
                href="#video-library"
                className="inline-flex items-center rounded-xl border border-white/25 bg-white/5 px-6 py-4 font-bold backdrop-blur-sm transition hover:border-white hover:bg-white hover:text-black"
              >
                Explore videos <span className="ml-2">↓</span>
              </a>
            </div>

            {featuredVideo && (
              <div className="mt-8 flex items-center gap-3">
                <div className="h-10 w-1 rounded-full bg-red-500" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Featured Palmyra original
                  </p>
                  <p className="mt-1 font-semibold">
                    {featuredVideo.title}
                  </p>
                </div>
              </div>
            )}

            {!featuredVideo && (
              <p className="mt-8 text-sm text-gray-400">
                Explore our available videos below. Add local Palmyra
                videos to lib/videos.ts to activate the featured banner.
              </p>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
      </section>

      {/* CATEGORY NAVIGATION */}
      {categories.length > 0 && (
        <nav
          aria-label="Video categories"
          className="sticky top-0 z-30 border-b border-white/10 bg-[#080808]/90 backdrop-blur-xl"
        >
          <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto px-5 py-4 sm:px-8 md:px-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((category: string, categoryIndex: number) => {
              const sectionId =
                category.toLowerCase() === "palmyra"
                  ? "palmyra"
                  : category.toLowerCase() === "football"
                    ? "football"
                    : `category-${categoryIndex}`;

              return (
                <a
                  key={category}
                  href={`#${sectionId}`}
                  className="shrink-0 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-red-500/60 hover:bg-red-500/10 hover:text-white"
                >
                  {category}
                </a>
              );
            })}
          </div>
        </nav>
      )}

      {/* HORIZONTAL VIDEO LIBRARY */}
      <div id="video-library" className="scroll-mt-24">
        {categories.map((category: string, categoryIndex: number) => {
          const categoryVideos = videos.filter(
            (video: any) => video.category === category
          );

          const sectionId =
            category.toLowerCase() === "palmyra"
              ? "palmyra"
              : category.toLowerCase() === "football"
                ? "football"
                : `category-${categoryIndex}`;

          const isPalmyra = category.toLowerCase() === "palmyra";
          const isFootball = category.toLowerCase() === "football";

          return (
            <section
              key={category}
              id={sectionId}
              className="scroll-mt-28 py-9 sm:py-11 md:py-14"
            >
              <div className="mx-auto max-w-[1600px]">
                {/* SECTION HEADING */}
                <div className="mb-6 flex items-end justify-between gap-4 px-5 sm:px-8 md:px-12">
                  <div className="min-w-0">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-red-500 sm:text-xs">
                      {isPalmyra
                        ? "ORIGINALS & EXCLUSIVES"
                        : isFootball
                          ? "THE BEAUTIFUL GAME"
                          : "EXPLORE MORE"}
                    </p>

                    <h2 className="text-2xl font-black tracking-tight sm:text-3xl md:text-4xl">
                      {category}
                      <span className="text-red-500">.</span>
                    </h2>

                    <p className="mt-2 text-sm text-gray-400 sm:text-base">
                      {isPalmyra
                        ? "Discover stories made for the Palmyra community."
                        : isFootball
                          ? "Football content, highlights and the moments that matter."
                          : `Discover the latest videos in ${category}.`}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-gray-400 sm:inline-flex">
                      {categoryVideos.length}{" "}
                      {categoryVideos.length === 1 ? "video" : "videos"}
                    </span>

                    {/* DESKTOP SCROLL CONTROLS */}
                    {categoryVideos.length > 1 && (
                      <div className="hidden items-center gap-2 sm:flex">
                        <button
                          type="button"
                          aria-label={`Scroll ${category} videos left`}
                          onClick={() => scrollCategory(sectionId, -1)}
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xl transition hover:border-red-500 hover:bg-red-600"
                        >
                          ‹
                        </button>

                        <button
                          type="button"
                          aria-label={`Scroll ${category} videos right`}
                          onClick={() => scrollCategory(sectionId, 1)}
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xl transition hover:border-red-500 hover:bg-red-600"
                        >
                          ›
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {categoryVideos.length === 0 ? (
                  <div className="mx-5 rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-gray-500 sm:mx-8 md:mx-12">
                    Videos in this category will appear here.
                  </div>
                ) : (
                  <>
                    {/* SIDE-SCROLLING VIDEO CARDS */}
                    <div
                      ref={(element) => {
                        rowRefs.current[sectionId] = element;
                      }}
                      className="flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden px-5 pb-5 sm:gap-5 sm:px-8 md:px-12 [scrollbar-width:thin] [scrollbar-color:#525252_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-600 [&::-webkit-scrollbar-track]:bg-transparent"
                    >
                      {categoryVideos.map((video: any, index: number) => (
                        <Link
                          key={video.id}
                          href={`/watch/${video.id}`}
                          className="group w-[82%] min-w-0 shrink-0 snap-start sm:w-[46%] lg:w-[31%] xl:w-[24%]"
                        >
                          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#151515] sm:rounded-2xl">
                            <img
                              src={thumbnail(video)}
                              alt={video.title}
                              loading={index > 2 ? "lazy" : "eager"}
                              className="aspect-video w-full object-cover transition duration-500 group-hover:scale-105 group-hover:opacity-75"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />

                            {/* PLAY ICON */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="flex h-11 w-11 translate-y-2 items-center justify-center rounded-full border border-white/40 bg-black/60 text-lg opacity-100 backdrop-blur-sm transition duration-300 sm:h-12 sm:w-12 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                                ▶
                              </span>
                            </div>

                            {/* CATEGORY LABEL */}
                            <span className="absolute left-3 top-3 max-w-[75%] truncate rounded-full border border-white/15 bg-black/65 px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                              {category}
                            </span>

                            {/* WATCH LABEL */}
                            <span className="absolute bottom-3 right-3 rounded-full bg-red-600 px-3 py-1 text-xs font-bold">
                              Watch →
                            </span>
                          </div>

                          <div className="px-1 pt-3 sm:pt-4">
                            <h3 className="line-clamp-2 text-base font-bold leading-6 transition group-hover:text-red-400 sm:text-lg">
                              {video.title}
                            </h3>

                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-400">
                              {video.description || "Watch more from Palmyra."}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* MOBILE SCROLL HINT */}
                    {categoryVideos.length > 1 && (
                      <p className="mt-1 px-5 text-xs text-gray-500 sm:hidden">
                        Swipe to explore more →
                      </p>
                    )}
                  </>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* EMPTY LIBRARY STATE */}
      {videos.length === 0 && (
        <section className="px-5 py-16 sm:px-8 md:px-12">
          <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center sm:px-12">
            <div className="text-4xl">▶</div>

            <h2 className="mt-5 text-2xl font-bold">
              Your next favourite starts here.
            </h2>

            <p className="mx-auto mt-3 max-w-lg leading-7 text-gray-400">
              Videos will appear here as you add them to your library.
              Check back for new Palmyra content.
            </p>
          </div>
        </section>
      )}

      {/* COMMUNITY BANNER */}
      <section className="px-5 py-12 sm:px-8 md:px-12 md:py-16">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-[#111111]">
          <img
            src="https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1800&q=85"
            alt="Athletes training and staying active"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/40" />

          <div className="relative z-10 max-w-3xl px-6 py-14 sm:px-10 sm:py-16 md:px-14 md:py-20">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-500">
              MORE THAN WATCHING
            </p>

            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">
              Be part of the
              <br />
              <span className="text-red-500">Palmyra story.</span>
            </h2>

            <p className="mt-5 max-w-xl leading-7 text-gray-300">
              Explore the collection, discover your style and stay
              connected with a brand built around passion.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/store"
                className="rounded-xl bg-red-600 px-6 py-3.5 font-bold transition hover:bg-red-700"
              >
                Shop the collection →
              </Link>

              <Link
                href="/"
                className="rounded-xl border border-white/25 px-6 py-3.5 font-bold transition hover:bg-white hover:text-black"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-5 py-8 text-center sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500">
          PALMYRA
        </p>

        <p className="mt-3 text-sm text-gray-500">
          Discover your passion. Make it yours.
        </p>
      </footer>
    </main>
  );
}
