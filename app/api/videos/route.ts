
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();

    if (!url || !secretKey) {
      return NextResponse.json(
        { error: "Video service is not configured." },
        { status: 503 }
      );
    }

    const supabase = createClient(url, secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data, error } = await supabase
      .from("admin_youtube_videos")
      .select(
        "youtube_id, title, name, description, category, featured, is_hidden"
      )
      .eq("is_hidden", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Public videos query failed:", error.message);

      return NextResponse.json(
        { error: "Unable to load videos." },
        { status: 500 }
      );
    }

    const videos = (data ?? []).map((video) => ({
      id: video.youtube_id,
      type: "youtube" as const,
      title: video.title,
      name: video.name ?? undefined,
      description: video.description ?? undefined,
      category: video.category,
      featured: video.featured,
      youtubeId: video.youtube_id,
      youtubeUrl: `https://www.youtube.com/watch?v=${video.youtube_id}`,
    }));

    return NextResponse.json(
      { videos },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Public videos API error:", error);

    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
