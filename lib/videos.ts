
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
    category: "Live Stream",
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
 * Category names must match the categories assigned to videos
 * through the Admin page.
 */
export const watchCategories = [
  {
    category: "Live Stream",
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
 * Permanent Palmyra banner videos.
 * Managed only through VS Code.
 *
 * YOUTUBE VIDEOS:
 * Managed through the Admin page.
 * Stored in the Supabase admin_youtube_videos table.
 *
 * Do not add Admin-managed YouTube videos here.
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
];

/**
 * YOUTUBE VIDEO SAMPLE
 *
 * Reference only — do not uncomment or add this to the videos array.
 * Add YouTube videos through Admin instead.
 *
 * {
 *   youtube_id: "YOUR_YOUTUBE_VIDEO_ID",
 *   title: "Your video title",
 *   name: "Channel or creator name",
 *   description: "Your video description",
 *   category: "Football",
 *   featured: false,
 *   is_hidden: false,
 * }
 */
