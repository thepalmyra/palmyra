
import { videos } from "@/lib/videos";

export default async function VideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const video = videos.find((item) => item.id === id);

  if (!video) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black p-6 text-white">
        Video not found.
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="aspect-video w-full max-w-7xl">
        {video.type === "local" ? (
          <video
            className="h-full w-full rounded-xl object-contain"
            src={`/videos/${video.id}.mp4`}
            controls
            autoPlay
            playsInline
          />
        ) : (
          <iframe
            className="h-full w-full rounded-xl"
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
            title={video.title}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    </main>
  );
}