export type VideoItem = {
  id: string;
  type: "youtube" | "local";
  title: string;
  name?: string;
  description?: string;
  category?: string;
  thumbnail?: string;
  featured?: boolean;
  youtubeId?: string;
  youtubeUrl?: string;
  videoUrl?: string;
  url?: string;
};

/**
 * HOME PAGE CATEGORIES
 *
 * Choose up to 3 categories for the Home page here.
 * A category appears only when it has regular videos.
 *
 * Watch page categories are generated automatically from videos below.
 */
export const homeCategories = [
  {
    category: "Live Now",
    subtitle: "Watch live events and streams as they happen.",
    liveOnly: true,
  },
  {
    category: "LevelUp",
    subtitle: "The game, the energy and the moments that matter.",
  },
  {
    category: "Movies",
    subtitle: "Stories, trailers and films worth discovering.",
  },
] as const;

/**
 * VIDEO LIBRARY
 *
 * Keep the 3 permanent local intro videos at the top.
 * They are used only for the Home and Watch autoplay banners.
 *
 * Add regular videos underneath.
 * Regular YouTube videos appear automatically in their categories.
 */
export const videos: VideoItem[] = [
  // PERMANENT PALMYRA INTRO VIDEOS — BANNERS ONLY
  {
    id: "palmyraintro1",
    type: "local",
    title: "Welcome to Palmyra",
    description: "Palmyra Brand",
    thumbnail: "/thumbnails/trending1.jpg",
    featured: true,
  },

  {
    id: "palmyraintro2",
    type: "local",
    title: "Welcome to Palmyra",
    description: "Palmyra Brand",
    thumbnail: "/thumbnails/trending2.jpg",
    featured: true,
  },

  {
    id: "palmyraintro3",
    type: "local",
    title: "Welcome to Palmyra",
    description: "Palmyra Brand",
    thumbnail: "/thumbnails/trending3.jpg",
    featured: true,
  },

  // FOOTBALL VIDEOS
  {
    id: "7oGGGR7fsF0",
    type: "youtube",
    title: "10 Stupidest Mistakes in Soccer",
    description: "AllAttack",
    category: "LevelUp",
  },

  {
    id: "pCXNfq8H3Tg",
    type: "youtube",
    title: "20 BEST WAYS TO SHOOT A BALL",
    description: "AllAttack",
    category: "LevelUp",
  },

  {
    id: "L8taGwfp2sU",
    type: "youtube",
    title: "15 BEST Skill Moves to Beat Defenders in REAL GAMES",
    description: "AllAttack",
    category: "LevelUp",
  },

  // LIVE STREAM

  {
    id: "Ay1gYmJoFMk",
    type: "youtube",
    title: "LIVE: FC Goa vs Sporting Club Delhi | MG ISL 2026-27",
    description: "MG Indian Super League",
    category: "Live Now",
  }
  
  // ADD FUTURE VIDEOS BELOW
  //
  // YouTube video or live stream example:
  //
  // {
  //   id: "YOUR_YOUTUBE_VIDEO_ID",
  //   type: "youtube",
  //   title: "Your video title",
  //   description: "Channel or creator name",
  //   category: "Football",
  // },
];