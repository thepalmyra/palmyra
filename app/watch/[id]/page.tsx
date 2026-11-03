
import { videos } from "@/lib/videos";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function VideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Keep existing VS Code-managed local videos working.
  const localVideo = videos.find(
    (item) => item.id === id && item.type === "local"
  );

  if (localVideo) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black p-4">
        <div className="aspect-video w-full max-w-7xl">
          <video
            className="h-full w-full rounded-xl object-contain"
            src={`/videos/${localVideo.id}.mp4`}
            controls
            autoPlay
            playsInline
          />
        </div>
      </main>
    );
  }

  // Load Admin-managed YouTube videos from Supabase.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase server environment variables are missing.");
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: video, error } = await supabase
    .from("admin_youtube_videos")
    .select("youtube_id, title, is_hidden")
    .eq("youtube_id", id)
    .eq("is_hidden", false)
    .maybeSingle();

  if (error) {
    console.error("Unable to load video:", error);
    throw new Error("Unable to load this video.");
  }

  if (!video) {
    notFound();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="aspect-video w-full max-w-7xl">
        <iframe
          className="h-full w-full rounded-xl"
          src={`https://www.youtube.com/embed/${video.youtube_id}?autoplay=1`}
          title={video.title || "Palmyra video"}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </main>
  );
}
