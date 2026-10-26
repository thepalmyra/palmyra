
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

function responseError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function authorize(request: NextRequest) {
  if (!supabaseUrl || !publishableKey || !secretKey || !adminEmail) {
    throw new Error("Admin API environment configuration is incomplete.");
  }

  const token = request.headers
    .get("authorization")
    ?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!token) {
    return null;
  }

  const authClient = createClient(supabaseUrl, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await authClient.auth.getUser(token);

  if (error || !data.user?.email) {
    return null;
  }

  if (data.user.email.trim().toLowerCase() !== adminEmail) {
    return null;
  }

  return createClient(supabaseUrl, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function serverError(error: unknown) {
  console.error(
    "Admin products API error:",
    error instanceof Error ? error.message : "Unknown error"
  );

  return responseError("The products request could not be completed.", 500);
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await authorize(request);

    if (!supabase) {
      return responseError("Administrator access required.", 403);
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(
      { products: data ?? [] },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    return serverError(error);
  }
}

// Product creation is intentionally disabled.
// Add new products directly through the development workflow.
export async function POST() {
  return responseError(
    "Product creation is disabled in the admin dashboard.",
    405
  );
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await authorize(request);

    if (!supabase) {
      return responseError("Administrator access required.", 403);
    }

    let body: {
      id?: unknown;
      price?: unknown;
      is_on_sale?: unknown;
      is_out_of_stock?: unknown;
      is_active?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return responseError("Invalid JSON request body.", 400);
    }

    const id = typeof body.id === "string" ? body.id.trim() : "";

    if (!id) {
      return responseError("A product ID is required.", 400);
    }

    const updates: Record<string, unknown> = {};

    if (Object.prototype.hasOwnProperty.call(body, "price")) {
      if (
        typeof body.price !== "number" ||
        !Number.isSafeInteger(body.price) ||
        body.price < 0
      ) {
        return responseError("Selling price must be a valid non-negative whole number.", 400);
      }

      updates.price = body.price;
    }

    if (Object.prototype.hasOwnProperty.call(body, "is_on_sale")) {
      if (typeof body.is_on_sale !== "boolean") {
        return responseError("Sale status must be true or false.", 400);
      }

      updates.is_on_sale = body.is_on_sale;
    }

    if (Object.prototype.hasOwnProperty.call(body, "is_out_of_stock")) {
      if (typeof body.is_out_of_stock !== "boolean") {
        return responseError("Availability status must be true or false.", 400);
      }

      updates.is_out_of_stock = body.is_out_of_stock;
    }

    if (Object.prototype.hasOwnProperty.call(body, "is_active")) {
      if (typeof body.is_active !== "boolean") {
        return responseError("Product visibility must be true or false.", 400);
      }

      updates.is_active = body.is_active;
    }

    if (Object.keys(updates).length === 0) {
      return responseError("No supported product changes were provided.", 400);
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select(
        "id, name, price, original_price, is_on_sale, is_out_of_stock, is_active, updated_at"
      )
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return responseError("Product not found.", 404);
    }

    return NextResponse.json({ product: data });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return responseError("Invalid JSON request body.", 400);
    }

    return serverError(error);
  }
}

// Product deletion is intentionally disabled.
export async function DELETE() {
  return responseError(
    "Product deletion is disabled in the admin dashboard.",
    405
  );
}
