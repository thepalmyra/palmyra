
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY?.trim();
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

type RequestedItem = {
  id: string;
  color: string;
  size: string;
  quantity: number;
};

type CheckoutBody = {
  fullName?: unknown;
  phone?: unknown;
  email?: unknown;
  address?: unknown;
  city?: unknown;
  state?: unknown;
  pincode?: unknown;
  country?: unknown;
  items?: unknown;
};

type DatabaseProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
  colors: unknown;
  sizes: unknown;
  is_active: boolean;
  is_out_of_stock: boolean;
};

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export async function POST(request: Request) {
  try {
    // 1. Check Supabase configuration.
    if (!supabaseUrl || !supabaseSecretKey || !supabasePublishableKey) {
      console.error("Supabase environment variables are missing.");

      return errorResponse(
        "Supabase environment variables are missing.",
        500
      );
    }

    // 2. Read Razorpay credentials.
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID?.trim();
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
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
      liveModeKey: razorpayKeyId?.startsWith("rzp_live_") ?? false,
    };

    // Never log credentials themselves.
    console.info("Razorpay configuration check:", keyConfig);

    if (
      !razorpayKeyId ||
      !razorpayKeySecret ||
      !publicRazorpayKeyId ||
      razorpayKeyId !== publicRazorpayKeyId
    ) {
      return errorResponse(
        "Razorpay Live Mode key configuration is missing or inconsistent.",
        500
      );
    }

    // 3. Require Live Mode credentials.
    if (!razorpayKeyId.startsWith("rzp_live_")) {
      return errorResponse(
        "Razorpay Live Mode keys are required.",
        500
      );
    }

    // 4. Parse the checkout request.
    let body: CheckoutBody;

    try {
      body = (await request.json()) as CheckoutBody;
    } catch {
      return errorResponse("Invalid checkout request.", 400);
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return errorResponse("Invalid checkout request.", 400);
    }

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

    // 5. Validate customer and delivery information.
    if (
      !isNonEmptyString(fullName) ||
      !isNonEmptyString(phone) ||
      !isNonEmptyString(email) ||
      !isValidEmail(email) ||
      !isNonEmptyString(address) ||
      !isNonEmptyString(city) ||
      !isNonEmptyString(state) ||
      !isNonEmptyString(pincode) ||
      !isNonEmptyString(country)
    ) {
      return errorResponse(
        "Please provide valid customer and delivery details.",
        400
      );
    }

    // 6. Validate cart contents.
    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return errorResponse("Your cart is empty or invalid.", 400);
    }

    const requestedItems: RequestedItem[] = [];

    for (const item of items as unknown[]) {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return errorResponse("A cart item is invalid.", 400);
      }

      const candidate = item as Record<string, unknown>;

      if (
        typeof candidate.id !== "string" ||
        !candidate.id.trim() ||
        typeof candidate.color !== "string" ||
        typeof candidate.size !== "string" ||
        !Number.isSafeInteger(candidate.quantity) ||
        (candidate.quantity as number) < 1 ||
        (candidate.quantity as number) > 20
      ) {
        return errorResponse(
          "A cart item has invalid options or quantity.",
          400
        );
      }

      requestedItems.push({
        id: candidate.id.trim(),
        color: candidate.color,
        size: candidate.size,
        quantity: candidate.quantity as number,
      });
    }

    // 7. Initialize Supabase using the server-only secret key.
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

    // 8. Load active products, including their explicit availability status.
    // Browser-submitted prices are never trusted.
    const productIds = [
      ...new Set(requestedItems.map((item) => item.id)),
    ];

    const { data: databaseProducts, error: productsError } = await supabase
      .from("products")
      .select(
        "id, name, price, image, colors, sizes, is_active, is_out_of_stock"
      )
      .in("id", productIds)
      .eq("is_active", true);

    if (productsError || !databaseProducts) {
      console.error(
        "Could not load checkout products:",
        productsError
      );

      return errorResponse(
        "Products could not be verified. Please try again later.",
        500
      );
    }

    const productMap = new Map<string, DatabaseProduct>(
      (databaseProducts as DatabaseProduct[]).map((product) => [
        product.id,
        product,
      ])
    );

    // 9. Validate availability, product options and database prices.
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

    for (const item of requestedItems) {
      const product = productMap.get(item.id);

      if (!product || !product.is_active) {
        return errorResponse(
          "A product in your cart is unavailable. Please refresh your cart.",
          400
        );
      }

      // Stop checkout when admin has marked this product out of stock.
      // This check happens before the order or Razorpay order is created.
      if (product.is_out_of_stock) {
        return errorResponse(
          `${product.name} is currently out of stock. Please remove it from your cart to continue.`,
          409
        );
      }

      if (
        !Array.isArray(product.colors) ||
        !product.colors.every((value) => typeof value === "string") ||
        !product.colors.includes(item.color) ||
        !Array.isArray(product.sizes) ||
        !product.sizes.every((value) => typeof value === "string") ||
        !product.sizes.includes(item.size)
      ) {
        return errorResponse(
          `Invalid color or size for ${product.name}.`,
          400
        );
      }

      if (
        !Number.isSafeInteger(product.price) ||
        product.price <= 0 ||
        typeof product.name !== "string" ||
        !product.name.trim() ||
        typeof product.image !== "string" ||
        !product.image.trim()
      ) {
        console.error("Invalid product configuration:", product.id);

        return errorResponse(
          "A product is incorrectly configured. Please contact support.",
          500
        );
      }

      const lineTotal = product.price * item.quantity;

      if (!Number.isSafeInteger(lineTotal)) {
        return errorResponse("The order total is invalid.", 400);
      }

      subtotal += lineTotal;

      if (!Number.isSafeInteger(subtotal)) {
        return errorResponse("The order subtotal is invalid.", 400);
      }

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

    if (subtotal <= 0) {
      return errorResponse("The order subtotal is invalid.", 400);
    }

    // 10. Calculate the order total on the server.
    const platformFee = 15;
    const deliveryFee = 0;
    const totalAmount = subtotal + platformFee + deliveryFee;

    if (
      !Number.isSafeInteger(totalAmount) ||
      totalAmount <= 0 ||
      totalAmount * 100 > Number.MAX_SAFE_INTEGER
    ) {
      return errorResponse("The order total is invalid.", 400);
    }

    // 11. Identify the signed-in user, if a Bearer token is provided.
    let userId: string | null = null;

    const authorization = request.headers.get("authorization");
    const match = authorization?.match(/^Bearer\s+(.+)$/i);

    if (match) {
      const authClient = createClient(
        supabaseUrl,
        supabasePublishableKey,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        }
      );

      const {
        data: { user },
        error: authError,
      } = await authClient.auth.getUser(match[1]);

      if (authError || !user) {
        return errorResponse(
          "Your session has expired. Please sign in again.",
          401
        );
      }

      userId = user.id;
    }

    // 12. Save the pending order in Supabase.
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

      return errorResponse(
        "Could not save your order. Please try again.",
        500
      );
    }

    // 13. Create the Razorpay Live Mode order.
    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    let razorpayOrderId = "";

    try {
      const createdOrder = await razorpay.orders.create({
        amount: totalAmount * 100,
        currency: "INR",
        receipt: String(savedOrder.order_number || savedOrder.id),
        notes: {
          supabase_order_id: String(savedOrder.id),
          order_number: String(savedOrder.order_number || ""),
        },
      });

      if (
        !createdOrder ||
        typeof createdOrder.id !== "string" ||
        !createdOrder.id
      ) {
        throw new Error("Razorpay returned an invalid order.");
      }

      razorpayOrderId = createdOrder.id;
    } catch (error) {
      console.error(
        "Razorpay order creation failed:",
        error instanceof Error ? error.message : "Unknown error"
      );

      return errorResponse(
        "Payment setup failed. Your order is still pending. Please contact support before retrying.",
        502
      );
    }

    // 14. Save the Razorpay order ID in Supabase.
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        razorpay_order_id: razorpayOrderId,
      })
      .eq("id", savedOrder.id);

    if (updateError) {
      console.error(
        "Could not save Razorpay order ID:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            "Payment setup could not be completed. Please contact support before retrying.",
          orderNumber: savedOrder.order_number,
        },
        { status: 500 }
      );
    }

    // 15. Return checkout details.
    // Only the public Razorpay Key ID is sent to the browser.
    return NextResponse.json(
      {
        success: true,
        orderId: savedOrder.id,
        orderNumber: savedOrder.order_number,
        razorpayOrderId,
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
    console.error(
      "Order creation error:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return errorResponse(
      "Unable to prepare payment. Please try again.",
      500
    );
  }
}
