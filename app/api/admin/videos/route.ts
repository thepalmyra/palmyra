
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedCategories = [
  "Live Stream",
  "LevelUp",
  "Featured",
  "Football",
  "Movies",
];

type VideoInput = {
  youtubeUrl?: unknown;
  youtube_id?: unknown;
  title?: unknown;
  name?: unknown;
  description?: unknown;
  category?: unknown;
  featured?: unknown;
  is_hidden?: unknown;
};

function getYoutubeId(value: string): string | null {
  const input = value.trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input;
  }

  try {
    const url = new URL(input);
    let id: string | null = null;

    if (
      url.hostname === "youtu.be" ||
      url.hostname === "www.youtu.be"
    ) {
      id = url.pathname.split("/").filter(Boolean)[0] ?? null;
    } else if (
      [
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "youtube-nocookie.com",
        "www.youtube-nocookie.com",
      ].includes(url.hostname)
    ) {
      id =
        url.searchParams.get("v") ||
        url.pathname.match(
          /^\/(?:embed|shorts|live)\/([^/?#]+)/
        )?.[1] ||
        null;
    }

    return id && /^[a-zA-Z0-9_-]{11}$/.test(id)
      ? id
      : null;
  } catch {
    return null;
  }
}

async function authorizeAdmin(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publicKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!url || !publicKey || !secretKey || !adminEmail) {
    return {
      client: null,
      response: NextResponse.json(
        { error: "Admin environment variables are not configured." },
        { status: 503 }
      ),
    };
  }

  const token = request.headers
    .get("authorization")
    ?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!token) {
    return {
      client: null,
      response: NextResponse.json(
        { error: "Please sign in first." },
        { status: 401 }
      ),
    };
  }

  const authClient = createClient(url, publicKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser(token);

  if (authError || !user?.email) {
    return {
      client: null,
      response: NextResponse.json(
        { error: "Your session is invalid. Please sign in again." },
        { status: 401 }
      ),
    };
  }

  if (user.email.toLowerCase() !== adminEmail) {
    return {
      client: null,
      response: NextResponse.json(
        { error: "Administrator access only." },
        { status: 403 }
      ),
    };
  }

  const client = createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return { client, response: null };
}

function validText(
  value: unknown,
  maxLength: number,
  required = false
): value is string {
  return (
    typeof value === "string" &&
    value.trim().length <= maxLength &&
    (!required || value.trim().length > 0)
  );
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authorizeAdmin(request);

    if (auth.response) return auth.response;

    const { data, error } = await auth.client!
      .from("admin_youtube_videos")
      .select(
        "youtube_id, title, name, description, category, featured, is_hidden, created_at, updated_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin videos query failed:", error.message);

      return NextResponse.json(
        { error: "Unable to load YouTube videos." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { videos: data ?? [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Admin videos GET error:", error);

    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authorizeAdmin(request);

    if (auth.response) return auth.response;

    let body: VideoInput;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const source =
      typeof body.youtubeUrl === "string"
        ? body.youtubeUrl
        : typeof body.youtube_id === "string"
          ? body.youtube_id
          : "";

    const youtubeId = getYoutubeId(source);

    if (!youtubeId) {
      return NextResponse.json(
        { error: "Enter a valid YouTube URL or 11-character video ID." },
        { status: 400 }
      );
    }

    if (!validText(body.title, 180, true)) {
      return NextResponse.json(
        { error: "Enter a video title (maximum 180 characters)." },
        { status: 400 }
      );
    }

    if (!validText(body.name ?? "", 120)) {
      return NextResponse.json(
        { error: "Creator or channel name is too long." },
        { status: 400 }
      );
    }

    if (!validText(body.description ?? "", 500)) {
      return NextResponse.json(
        { error: "Description must be 500 characters or fewer." },
        { status: 400 }
      );
    }

    if (
      typeof body.category !== "string" ||
      !allowedCategories.includes(body.category.trim())
    ) {
      return NextResponse.json(
        { error: "Choose one of the available video categories." },
        { status: 400 }
      );
    }

    const { data, error } = await auth.client!
      .from("admin_youtube_videos")
      .insert({
        youtube_id: youtubeId,
        title: body.title.trim(),
        name:
          typeof body.name === "string" && body.name.trim()
            ? body.name.trim()
            : null,
        description:
          typeof body.description === "string" &&
          body.description.trim()
            ? body.description.trim()
            : null,
        category: body.category.trim(),
        featured: body.featured === true,
        is_hidden: false,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "This YouTube video has already been added." },
          { status: 409 }
        );
      }

      console.error("Admin video insert failed:", error.message);

      return NextResponse.json(
        { error: "Unable to add this YouTube video." },
        { status: 500 }
      );
    }

    return NextResponse.json({ video: data }, { status: 201 });
  } catch (error) {
    console.error("Admin videos POST error:", error);

    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await authorizeAdmin(request);

    if (auth.response) return auth.response;

    let body: VideoInput;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const youtubeId =
      typeof body.youtube_id === "string"
        ? body.youtube_id.trim()
        : "";

    if (!/^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) {
      return NextResponse.json(
        { error: "Invalid YouTube video ID." },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};

    if (body.title !== undefined) {
      if (!validText(body.title, 180, true)) {
        return NextResponse.json(
          { error: "Enter a valid video title." },
          { status: 400 }
        );
      }
      updates.title = body.title.trim();
    }

    if (body.name !== undefined) {
      if (!validText(body.name, 120)) {
        return NextResponse.json(
          { error: "Creator or channel name is too long." },
          { status: 400 }
        );
      }
      updates.name = body.name.trim() || null;
    }

    if (body.description !== undefined) {
      if (!validText(body.description, 500)) {
        return NextResponse.json(
          { error: "Description must be 500 characters or fewer." },
          { status: 400 }
        );
      }
      updates.description = body.description.trim() || null;
    }

    if (body.category !== undefined) {
      if (
        typeof body.category !== "string" ||
        !allowedCategories.includes(body.category.trim())
      ) {
        return NextResponse.json(
          { error: "Choose a valid video category." },
          { status: 400 }
        );
      }
      updates.category = body.category.trim();
    }

    if (body.featured !== undefined) {
      if (typeof body.featured !== "boolean") {
        return NextResponse.json(
          { error: "Invalid featured setting." },
          { status: 400 }
        );
      }
      updates.featured = body.featured;
    }

    if (body.is_hidden !== undefined) {
      if (typeof body.is_hidden !== "boolean") {
        return NextResponse.json(
          { error: "Invalid visibility setting." },
          { status: 400 }
        );
      }
      updates.is_hidden = body.is_hidden;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No changes were provided." },
        { status: 400 }
      );
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await auth.client!
      .from("admin_youtube_videos")
      .update(updates)
      .eq("youtube_id", youtubeId)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Admin video update failed:", error.message);

      return NextResponse.json(
        { error: "Unable to update this video." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Video not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ video: data });
  } catch (error) {
    console.error("Admin videos PATCH error:", error);

    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await authorizeAdmin(request);

    if (auth.response) return auth.response;

    let body: { youtube_id?: unknown };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const youtubeId =
      typeof body.youtube_id === "string"
        ? body.youtube_id.trim()
        : "";

    if (!/^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) {
      return NextResponse.json(
        { error: "Invalid YouTube video ID." },
        { status: 400 }
      );
    }

    const { data, error } = await auth.client!
      .from("admin_youtube_videos")
      .delete()
      .eq("youtube_id", youtubeId)
      .select("youtube_id")
      .maybeSingle();

    if (error) {
      console.error("Admin video delete failed:", error.message);

      return NextResponse.json(
        { error: "Unable to delete this video." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Video not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin videos DELETE error:", error);

    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
