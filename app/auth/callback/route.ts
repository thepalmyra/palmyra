
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");

  // Allow only safe, internal redirect destinations.
  const safeNext =
    next &&
    next.startsWith("/") &&
    !next.startsWith("//") &&
    !next.includes("\\")
      ? next
      : "/profile";

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=confirmation_failed", url.origin)
    );
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth callback exchange failed:", error.message);

      return NextResponse.redirect(
        new URL("/login?error=confirmation_failed", url.origin)
      );
    }

    return NextResponse.redirect(new URL(safeNext, url.origin));
  } catch (error) {
    console.error("Auth callback failed:", error);

    return NextResponse.redirect(
      new URL("/login?error=confirmation_failed", url.origin)
    );
  }
}
