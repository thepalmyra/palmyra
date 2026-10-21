
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { products } from "@/lib/products";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

type RequestedItem = {
  id: string;
  color: string;
  size: string;
  quantity: number;
};

export async function POST(request: Request) {
  try {
    if (
      !supabaseUrl ||
      !supabaseSecretKey ||
      !supabasePublishableKey
    ) {
      return NextResponse.json(
        { error: "Supabase environment variables are missing." },
        { status: 500 }
      );
    }

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID?.trim();
    const razorpayKeySecret =
      process.env.RAZORPAY_KEY_SECRET?.trim();
    const publicRazorpayKeyId =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim();

    const keyConfig = {
      serverKeyIdPresent: Boolean(razorpayKeyId),
      secretPresent: Boolean(razorpayKeySecret),
      publicKeyIdPresent: Boolean(publicRazorpayKeyId),
      keyIdsMatch:
        Boolean(razorpayKeyId) &&
        Boolean(publicRazorpayKeyId) &&
        razorpayKeyId === publicRazorpayKeyId,
      testModeKey: razorpayKeyId?.startsWith("rzp_test_") ?? false,
    };

    console.log("Razorpay configuration check:", keyConfig);

    if (
      !razorpayKeyId ||
      !razorpayKeySecret ||
      !publicRazorpayKeyId ||
      razorpayKeyId !== publicRazorpayKeyId
    ) {
      return NextResponse.json(
        {
          error:
            "Razorpay test key configuration is missing or inconsistent.",
        },
        { status: 500 }
      );
    }

    if (!razorpayKeyId.startsWith("rzp_test_")) {
      return NextResponse.json(
        { error: "Use Razorpay Test Mode keys during testing." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const {
      fullName,
      phone,
      email,
      address,
      city,
      state,
      pincode,
      country,
      items,
    } = body;

    if (
      typeof fullName !== "string" ||
      !fullName.trim() ||
      typeof phone !== "string" ||
      !phone.trim() ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof address !== "string" ||
      !address.trim() ||
      typeof city !== "string" ||
      !city.trim() ||
      typeof state !== "string" ||
      !state.trim() ||
      typeof pincode !== "string" ||
      !pincode.trim() ||
      typeof country !== "string" ||
      !country.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Please provide valid customer and delivery details.",
        },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      items.length > 50
    ) {
      return NextResponse.json(
        { error: "Your cart is empty or invalid." },
        { status: 400 }
      );
    }

    const validatedItems: {
      id: string;
      name: string;
      price: number;
      color: string;
      size: string;
      quantity: number;
      image: string;
    }[] = [];

    let subtotal = 0;

    for (const item of items as RequestedItem[]) {
      if (
        !item ||
        typeof item.id !== "string" ||
        typeof item.color !== "string" ||
        typeof item.size !== "string" ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 20
      ) {
        return NextResponse.json(
          { error: "A cart item has invalid options or quantity." },
          { status: 400 }
        );
      }

      const product = products.find(
        (product) => product.id === item.id
      );

      if (!product) {
        return NextResponse.json(
          { error: "A product in your cart could not be found." },
          { status: 400 }
        );
      }

      if (
        !Array.isArray(product.colors) ||
        !product.colors.includes(item.color) ||
        !Array.isArray(product.sizes) ||
        !product.sizes.includes(item.size)
      ) {
        return NextResponse.json(
          {
            error: `Invalid color or size for ${product.name}.`,
          },
          { status: 400 }
        );
      }

      if (
        !Number.isSafeInteger(product.price) ||
        product.price <= 0
      ) {
        return NextResponse.json(
          {
            error: `Invalid price configuration for ${product.name}.`,
          },
          { status: 500 }
        );
      }

      subtotal += product.price * item.quantity;

      validatedItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        image: product.image,
      });
    }

    if (!Number.isSafeInteger(subtotal) || subtotal <= 0) {
      return NextResponse.json(
        { error: "The order subtotal is invalid." },
        { status: 400 }
      );
    }

    const platformFee = 15;
    const deliveryFee = 0;
    const totalAmount = subtotal + platformFee + deliveryFee;

    const supabase = createClient(
      supabaseUrl,
      supabaseSecretKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    let userId: string | null = null;

    const authorization = request.headers.get("authorization");
    const match = authorization?.match(/^Bearer\s+(.+)$/i);

    if (match) {
      const authClient = createClient(
        supabaseUrl,
        supabasePublishableKey
      );

      const {
        data: { user },
        error: authError,
      } = await authClient.auth.getUser(match[1]);

      if (authError || !user) {
        return NextResponse.json(
          {
            error:
              "Your session has expired. Please sign in again.",
          },
          { status: 401 }
        );
      }

      userId = user.id;
    }

    const { data: savedOrder, error: saveError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        customer_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        country: country.trim(),
        items: validatedItems,
        subtotal,
        platform_fee: platformFee,
        delivery_fee: deliveryFee,
        total_amount: totalAmount,
        status: "pending",
        payment_status: "pending",
      })
      .select("id, order_number")
      .single();

    if (saveError || !savedOrder) {
      console.error("Supabase order creation failed:", saveError);

      return NextResponse.json(
        { error: "Could not save your order. Please try again." },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: "INR",
      receipt: String(savedOrder.order_number || savedOrder.id),
      notes: {
        supabase_order_id: String(savedOrder.id),
        order_number: String(savedOrder.order_number || ""),
      },
    });

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        razorpay_order_id: razorpayOrder.id,
      })
      .eq("id", savedOrder.id);

    if (updateError) {
      console.error("Could not save Razorpay order ID:", updateError);

      return NextResponse.json(
        {
          error:
            "Your order was created, but payment setup failed. Please contact support before retrying.",
          orderNumber: savedOrder.order_number,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        orderId: savedOrder.id,
        orderNumber: savedOrder.order_number,
        razorpayOrderId: razorpayOrder.id,
        keyId: razorpayKeyId,
        amount: totalAmount * 100,
        currency: "INR",
        subtotal,
        platformFee,
        deliveryFee,
        totalAmount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order creation error:", error);

    return NextResponse.json(
      { error: "Unable to prepare payment. Please try again." },
      { status: 500 }
    );
  }
}
