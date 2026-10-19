
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { products } from "@/lib/products";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

type OrderRequest = {
  customer?: {
    fullName?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  items?: {
    id?: string;
    color?: string;
    size?: string;
    quantity?: number;
  }[];
};

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseSecretKey) {
    return NextResponse.json(
      { error: "Order service is not configured." },
      { status: 500 }
    );
  }

  try {
    const authorization = request.headers.get("authorization");
    let userId: string | null = null;

    if (authorization) {
      const match = authorization.match(/^Bearer\s+(.+)$/i);

      if (!match || !supabasePublishableKey) {
        return NextResponse.json(
          { error: "Invalid authentication." },
          { status: 401 }
        );
      }

      const authClient = createClient(
        supabaseUrl,
        supabasePublishableKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

      const { data, error } = await authClient.auth.getUser(match[1]);

      if (error || !data.user) {
        return NextResponse.json(
          { error: "Your session is invalid. Please sign in again." },
          { status: 401 }
        );
      }

      userId = data.user.id;
    }

    const body = (await request.json()) as OrderRequest;
    const customer = body.customer;
    const items = body.items;

    if (
      !customer ||
      !Array.isArray(items) ||
      items.length === 0 ||
      items.length > 50
    ) {
      return NextResponse.json(
        { error: "Invalid order details." },
        { status: 400 }
      );
    }

    const fields = [
      customer.fullName,
      customer.phone,
      customer.email,
      customer.address,
      customer.city,
      customer.state,
      customer.pincode,
      customer.country,
    ];

    if (
      fields.some(
        (value) =>
          typeof value !== "string" ||
          value.trim().length === 0 ||
          value.length > 300
      ) ||
      !/^[0-9]{6}$/.test(customer.pincode!) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email!)
    ) {
      return NextResponse.json(
        { error: "Please check your customer and delivery details." },
        { status: 400 }
      );
    }

    let subtotal = 0;

    const validatedItems: {
      id: string;
      name: string;
      color: string;
      size: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }[] = [];

    for (const item of items) {
      if (
        typeof item.id !== "string" ||
        typeof item.color !== "string" ||
        typeof item.size !== "string" ||
        !Number.isInteger(item.quantity) ||
        item.quantity! < 1 ||
        item.quantity! > 99
      ) {
        return NextResponse.json(
          { error: "Invalid product or quantity." },
          { status: 400 }
        );
      }

      const product = products.find((p) => p.id === item.id);

      if (
        !product ||
        !product.colors.includes(item.color) ||
        !product.sizes.includes(item.size)
      ) {
        return NextResponse.json(
          { error: "A product, color, or size is unavailable." },
          { status: 400 }
        );
      }

      const lineTotal = product.price * item.quantity!;
      subtotal += lineTotal;

      validatedItems.push({
        id: product.id,
        name: product.name,
        color: item.color,
        size: item.size,
        quantity: item.quantity!,
        unitPrice: product.price,
        lineTotal,
      });
    }

    const supabase = createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        customer_name: customer.fullName!.trim(),
        phone: customer.phone!.trim(),
        email: customer.email!.trim(),
        address: customer.address!.trim(),
        city: customer.city!.trim(),
        state: customer.state!.trim(),
        pincode: customer.pincode!.trim(),
        country: customer.country!.trim(),
        items: validatedItems,
        subtotal,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase order insert failed:", error.message);

      return NextResponse.json(
        { error: "Unable to save your order right now." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, orderId: data.id },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request. Please try again." },
      { status: 400 }
    );
  }
}
