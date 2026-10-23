
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedStatuses = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

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

export async function GET(request: NextRequest) {
  try {
    const auth = await authorizeAdmin(request);

    if (auth.response) {
      return auth.response;
    }

    const { data, error } = await auth.client!
      .from("orders")
      .select(
        [
          "id",
          "order_number",
          "created_at",
          "status",
          "payment_status",
          "subtotal",
          "platform_fee",
          "delivery_fee",
          "total_amount",
          "items",
          "customer_name",
          "phone",
          "email",
          "address",
          "city",
          "state",
          "pincode",
          "country",
        ].join(", ")
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Admin order query failed:", error.message);

      return NextResponse.json(
        { error: "Unable to load orders." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { orders: data ?? [] },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Admin GET error:", error);

    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await authorizeAdmin(request);

    if (auth.response) {
      return auth.response;
    }

    let body: { id?: unknown; status?: unknown };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const { id, status } = body;

    if (
      (typeof id !== "number" && typeof id !== "string") ||
      !String(id).trim() ||
      typeof status !== "string" ||
      !allowedStatuses.includes(
        status as (typeof allowedStatuses)[number]
      )
    ) {
      return NextResponse.json(
        { error: "Invalid order ID or fulfilment status." },
        { status: 400 }
      );
    }

    const { data, error } = await auth.client!
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select("id, order_number, status, payment_status")
      .maybeSingle();

    if (error) {
      console.error("Admin order update failed:", error.message);

      return NextResponse.json(
        { error: "Unable to update the order." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ order: data });
  } catch (error) {
    console.error("Admin PATCH error:", error);

    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
