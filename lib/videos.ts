
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
 * Controls the categories displayed on the Home page.
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
];

/**
 * WATCH PAGE CATEGORY ORDER
 *
 * Move categories up or down to change their display order.
 * Categories with videos appear in this order.
 * New categories not listed here appear alphabetically afterward.
 *
 * Category names must match the category assigned to videos below.
 */
export const watchCategories = [
  {
    category: "Live Now",
    subtitle: "Watch live events and streams as they happen.",
    liveOnly: true,
  },
  {
    category: "LevelUp",
    subtitle: "Improve your game with training drills.",
  },
  {
    category: "Featured",
    subtitle: "Discover featured videos and highlights.",
  },
  {
    category: "Football",
    subtitle: "Watch football videos and highlights.",
  },
  {
    category: "Movies",
    subtitle: "Explore movies and entertainment.",
  },
];

/**
 * VIDEO LIBRARY
 *
 * LOCAL INTRO VIDEOS:
 * Used for the autoplaying Home and Watch banners.
 *
 * YOUTUBE VIDEOS:
 * Appear in the Watch library under their assigned category.
 *
 * To manage videos, add, edit, or remove entries below.
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

  // LIVE STREAM
  {
    id: "Ay1gYmJoFMk",
    type: "youtube",
    title: "LIVE: FC Goa vs Sporting Club Delhi | MG ISL 2026-27",
    description: "MG Indian Super League",
    category: "Live Now",
  },

  // LEVELUP VIDEOS
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

  // ADD FUTURE VIDEOS BELOW
  //
  // {
  //   id: "YOUR_YOUTUBE_VIDEO_ID",
  //   type: "youtube",
  //   title: "Your video title",
  //   description: "Channel or creator name",
  //   category: "Football",
  // },
];
