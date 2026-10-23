
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

  const authorization = request.headers.get("authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

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

    return NextResponse.json({ products: data ?? [] });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Admin API environment configuration is incomplete."
    ) {
      return serverError(error);
    }

    return serverError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await authorize(request);

    if (!supabase) {
      return responseError("Administrator access required.", 403);
    }

    const body = await request.json();

    const id = typeof body.id === "string" ? body.id.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const category =
      typeof body.category === "string" ? body.category.trim() : "";
    const description =
      typeof body.description === "string" ? body.description : "";
    const image = typeof body.image === "string" ? body.image.trim() : "";

    if (
      !id ||
      !/^[a-zA-Z0-9_-]+$/.test(id) ||
      !name ||
      !category ||
      !image
    ) {
      return responseError(
        "Provide a valid product ID, name, category and image URL.",
        400
      );
    }

    if (
      !Number.isSafeInteger(body.price) ||
      body.price < 0 ||
      (body.original_price != null &&
        (!Number.isSafeInteger(body.original_price) ||
          body.original_price < 0)) ||
      (body.stock != null &&
        (!Number.isSafeInteger(body.stock) || body.stock < 0))
    ) {
      return responseError("Price or stock value is invalid.", 400);
    }

    if (
      !Array.isArray(body.images ?? []) ||
      !Array.isArray(body.sizes ?? []) ||
      !Array.isArray(body.colors ?? []) ||
      typeof (body.color_images ?? {}) !== "object" ||
      (body.color_images != null && Array.isArray(body.color_images))
    ) {
      return responseError("Product images, sizes or colours are invalid.", 400);
    }

    if (
      !(body.images ?? []).every((v: unknown) => typeof v === "string") ||
      !(body.sizes ?? []).every((v: unknown) => typeof v === "string") ||
      !(body.colors ?? []).every((v: unknown) => typeof v === "string") ||
      !Object.values(body.color_images ?? {}).every(
        (v) => typeof v === "string"
      )
    ) {
      return responseError("Product options must contain text values.", 400);
    }

    const product = {
      id,
      name,
      price: body.price,
      original_price: body.original_price ?? null,
      category,
      description,
      image,
      images: body.images ?? [],
      sizes: body.sizes ?? [],
      colors: body.colors ?? [],
      color_images: body.color_images ?? {},
      is_active: body.is_active ?? true,
      stock: body.stock ?? 0,
      updated_at: new Date().toISOString(),
    };

    if (typeof product.is_active !== "boolean") {
      return responseError("Product activation status is invalid.", 400);
    }

    const { data, error } = await supabase
      .from("products")
      .insert(product)
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        return responseError("That product ID already exists.", 409);
      }
      throw error;
    }

    return NextResponse.json({ product: data }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return responseError("Invalid JSON request body.", 400);
    }

    return serverError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await authorize(request);

    if (!supabase) {
      return responseError("Administrator access required.", 403);
    }

    const body = await request.json();
    const id = typeof body.id === "string" ? body.id.trim() : "";

    if (!id) {
      return responseError("A product ID is required.", 400);
    }

    const allowedFields = [
      "name",
      "price",
      "original_price",
      "category",
      "description",
      "image",
      "images",
      "sizes",
      "colors",
      "color_images",
      "is_active",
      "stock",
    ] as const;

    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return responseError("No product changes were provided.", 400);
    }

    if (
      ("name" in updates &&
        (typeof updates.name !== "string" || !updates.name.trim())) ||
      ("category" in updates &&
        (typeof updates.category !== "string" ||
          !updates.category.trim())) ||
      ("description" in updates && typeof updates.description !== "string") ||
      ("image" in updates &&
        (typeof updates.image !== "string" || !updates.image.trim())) ||
      ("is_active" in updates && typeof updates.is_active !== "boolean") ||
      ("price" in updates &&
        (!Number.isSafeInteger(updates.price) ||
          (updates.price as number) < 0)) ||
      ("original_price" in updates &&
        updates.original_price !== null &&
        (!Number.isSafeInteger(updates.original_price) ||
          (updates.original_price as number) < 0)) ||
      ("stock" in updates &&
        (!Number.isSafeInteger(updates.stock) ||
          (updates.stock as number) < 0))
    ) {
      return responseError("One or more product fields are invalid.", 400);
    }

    for (const field of ["images", "sizes", "colors"] as const) {
      if (
        field in updates &&
        (!Array.isArray(updates[field]) ||
          !(updates[field] as unknown[]).every(
            (value) => typeof value === "string"
          ))
      ) {
        return responseError(`The ${field} field is invalid.`, 400);
      }
    }

    if ("color_images" in updates) {
      const value = updates.color_images;

      if (
        value === null ||
        typeof value !== "object" ||
        Array.isArray(value) ||
        !Object.values(value as Record<string, unknown>).every(
          (entry) => typeof entry === "string"
        )
      ) {
        return responseError("The color_images field is invalid.", 400);
      }
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select("*")
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
