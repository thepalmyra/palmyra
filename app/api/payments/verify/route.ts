
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createHmac, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabaseSecretKey =
      process.env.SUPABASE_SECRET_KEY?.trim();
    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    const publicKeyId =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim();

    if (
      !supabaseUrl ||
      !supabaseSecretKey ||
      !keyId ||
      !keySecret ||
      !publicKeyId ||
      keyId !== publicKeyId
    ) {
      return errorResponse(
        "Payment verification is not configured correctly.",
        500
      );
    }

    if (!keyId.startsWith("rzp_live_")) {
      return errorResponse(
        "Razorpay Live Mode keys are required.",
        500
      );
    }

    let body: Record<string, unknown>;

    try {
      const parsedBody: unknown = await request.json();

      if (
        !parsedBody ||
        typeof parsedBody !== "object" ||
        Array.isArray(parsedBody)
      ) {
        return errorResponse(
          "Invalid payment verification request.",
          400
        );
      }

      body = parsedBody as Record<string, unknown>;
    } catch {
      return errorResponse(
        "Invalid payment verification request.",
        400
      );
    }

    const orderId = body.orderId;
    const razorpayOrderId = body.razorpay_order_id;
    const razorpayPaymentId = body.razorpay_payment_id;
    const razorpaySignature = body.razorpay_signature;

    if (
      (typeof orderId !== "string" &&
        typeof orderId !== "number") ||
      !/^\d+$/.test(String(orderId)) ||
      typeof razorpayOrderId !== "string" ||
      !razorpayOrderId.trim() ||
      typeof razorpayPaymentId !== "string" ||
      !razorpayPaymentId.trim() ||
      typeof razorpaySignature !== "string" ||
      !/^[a-f0-9]{64}$/i.test(razorpaySignature)
    ) {
      return errorResponse(
        "Invalid payment verification details.",
        400
      );
    }

    // Verify Razorpay's signature using a constant-time comparison.
    const expectedSignature = createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest();

    const receivedSignature = Buffer.from(
      razorpaySignature,
      "hex"
    );

    if (
      expectedSignature.length !== receivedSignature.length ||
      !timingSafeEqual(expectedSignature, receivedSignature)
    ) {
      return errorResponse(
        "Payment signature verification failed.",
        400
      );
    }

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

    // Match both the database order ID and its Razorpay order ID.
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        "id, order_number, total_amount, payment_status, razorpay_order_id, razorpay_payment_id"
      )
      .eq("id", String(orderId))
      .eq("razorpay_order_id", razorpayOrderId)
      .maybeSingle();

    if (orderError) {
      console.error("Could not read order:", orderError);

      return errorResponse(
        "Could not check the Palmyra order status.",
        500
      );
    }

    if (!order) {
      return errorResponse(
        "The matching Palmyra order could not be found.",
        404
      );
    }

    // Never replace a payment ID already associated with this order.
    if (
      order.razorpay_payment_id &&
      order.razorpay_payment_id !== razorpayPaymentId
    ) {
      return errorResponse(
        "A different payment is already associated with this order. Please contact support.",
        409
      );
    }

    const expectedAmount = Number(order.total_amount) * 100;

    if (
      !Number.isSafeInteger(expectedAmount) ||
      expectedAmount <= 0
    ) {
      return errorResponse(
        "The saved order amount is invalid.",
        500
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Verify payment details directly with Razorpay.
    let payment = await razorpay.payments.fetch(
      razorpayPaymentId
    );

    if (
      payment.order_id !== razorpayOrderId ||
      payment.amount !== expectedAmount ||
      payment.currency !== "INR"
    ) {
      return errorResponse(
        "The payment does not match this order's amount.",
        400
      );
    }

    // An already-paid order is successful only for the same payment ID.
    if (order.payment_status === "paid") {
      if (
        order.razorpay_payment_id === razorpayPaymentId &&
        payment.status === "captured" &&
        payment.captured === true
      ) {
        return NextResponse.json({
          success: true,
          orderNumber: order.order_number,
          paymentStatus: "paid",
        });
      }

      return NextResponse.json(
        {
          error:
            "The saved order status needs review against Razorpay.",
          paymentStatus: payment.status,
        },
        { status: 409 }
      );
    }

    // Capture an authorized payment, then verify its final status again.
    if (payment.status === "authorized") {
      try {
        await razorpay.payments.capture(
          razorpayPaymentId,
          expectedAmount,
          "INR"
        );
      } catch (captureError) {
        // Capture may have succeeded despite a network/API error.
        // Fetch the payment again before deciding what happened.
        console.error(
          "Payment capture request failed:",
          captureError instanceof Error
            ? captureError.message
            : "Unknown error"
        );
      }

      payment = await razorpay.payments.fetch(
        razorpayPaymentId
      );
    }

    if (
      payment.order_id !== razorpayOrderId ||
      payment.amount !== expectedAmount ||
      payment.currency !== "INR"
    ) {
      return errorResponse(
        "The payment does not match this order's amount.",
        400
      );
    }

    if (
      payment.status !== "captured" ||
      payment.captured !== true
    ) {
      return NextResponse.json(
        {
          error:
            "Payment has not been confirmed as captured. Do not pay again; check the payment status before retrying.",
          paymentStatus: payment.status,
        },
        { status: 409 }
      );
    }

    // Update only an order that has not already been marked paid.
    const { data: updatedOrder, error: updateError } =
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          razorpay_payment_id: razorpayPaymentId,
        })
        .eq("id", String(orderId))
        .eq("razorpay_order_id", razorpayOrderId)
        .neq("payment_status", "paid")
        .select("id, order_number")
        .maybeSingle();

    if (updateError) {
      console.error(
        "Failed to save payment status:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            "Payment was captured, but Palmyra could not update the order. Do not pay again; contact support to reconcile the order.",
          orderNumber: order.order_number,
        },
        { status: 500 }
      );
    }

    if (updatedOrder) {
      return NextResponse.json({
        success: true,
        orderNumber: updatedOrder.order_number,
        paymentStatus: "paid",
      });
    }

    // Another verification request may have updated the order first.
    const {
      data: currentOrder,
      error: currentOrderError,
    } = await supabase
      .from("orders")
      .select(
        "payment_status, order_number, razorpay_payment_id"
      )
      .eq("id", String(orderId))
      .eq("razorpay_order_id", razorpayOrderId)
      .maybeSingle();

    if (currentOrderError) {
      console.error(
        "Could not recheck order after payment update:",
        currentOrderError
      );
    }

    if (
      currentOrder?.payment_status === "paid" &&
      currentOrder.razorpay_payment_id === razorpayPaymentId
    ) {
      return NextResponse.json({
        success: true,
        orderNumber: currentOrder.order_number,
        paymentStatus: "paid",
      });
    }

    if (
      currentOrder?.payment_status === "paid" &&
      currentOrder.razorpay_payment_id !== razorpayPaymentId
    ) {
      return errorResponse(
        "A different payment is already associated with this order. Please contact support.",
        409
      );
    }

    return NextResponse.json(
      {
        error:
          "Payment was captured, but the order status needs support review. Do not pay again.",
        orderNumber: order.order_number,
      },
      { status: 500 }
    );
  } catch (error) {
    console.error(
      "Payment verification error:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return errorResponse(
      "Unable to verify payment right now. Do not pay again until the payment status has been checked.",
      500
    );
  }
}
