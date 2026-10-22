
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createHmac, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

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
      return NextResponse.json(
        { error: "Payment verification is not configured correctly." },
        { status: 500 }
      );
    }

    // This endpoint must use the same Live Mode credentials
    // as the endpoint that creates the Razorpay order.
    if (!keyId.startsWith("rzp_live_")) {
      return NextResponse.json(
        { error: "Razorpay Live Mode keys are required." },
        { status: 500 }
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
        return NextResponse.json(
          { error: "Invalid payment verification request." },
          { status: 400 }
        );
      }

      body = parsedBody as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { error: "Invalid payment verification request." },
        { status: 400 }
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
      !razorpayOrderId ||
      typeof razorpayPaymentId !== "string" ||
      !razorpayPaymentId ||
      typeof razorpaySignature !== "string" ||
      !/^[a-f0-9]{64}$/i.test(razorpaySignature)
    ) {
      return NextResponse.json(
        { error: "Invalid payment verification details." },
        { status: 400 }
      );
    }

    // Verify Razorpay's payment signature.
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
      return NextResponse.json(
        { error: "Payment signature verification failed." },
        { status: 400 }
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

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        "id, order_number, total_amount, payment_status, razorpay_order_id"
      )
      .eq("id", String(orderId))
      .eq("razorpay_order_id", razorpayOrderId)
      .maybeSingle();

    if (orderError) {
      console.error("Could not read order:", orderError);

      return NextResponse.json(
        { error: "Could not check the Palmyra order status." },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        { error: "The matching Palmyra order could not be found." },
        { status: 404 }
      );
    }

    const expectedAmount = Number(order.total_amount) * 100;

    if (
      !Number.isSafeInteger(expectedAmount) ||
      expectedAmount <= 0
    ) {
      return NextResponse.json(
        { error: "The saved order amount is invalid." },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Check the actual payment status with Razorpay.
    let payment = await razorpay.payments.fetch(
      razorpayPaymentId
    );

    if (
      payment.order_id !== razorpayOrderId ||
      payment.amount !== expectedAmount ||
      payment.currency !== "INR"
    ) {
      return NextResponse.json(
        { error: "The payment does not match this order's amount." },
        { status: 400 }
      );
    }

    // If another request already marked this order paid,
    // confirm that Razorpay still reports a captured payment.
    if (order.payment_status === "paid") {
      if (
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

    // Capture an authorized payment if it has not been captured.
    if (payment.status === "authorized") {
      try {
        await razorpay.payments.capture(
          razorpayPaymentId,
          expectedAmount,
          "INR"
        );
      } catch (captureError) {
        console.error(
          "Payment capture request failed:",
          captureError instanceof Error
            ? captureError.message
            : "Unknown error"
        );
        // Fetch the payment again: capture might have succeeded.
      }

      payment = await razorpay.payments.fetch(
        razorpayPaymentId
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

    // Mark the order paid only after confirming capture.
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

    if (!updatedOrder) {
      // Handle a concurrent verification request safely.
      const { data: currentOrder, error: currentOrderError } =
        await supabase
          .from("orders")
          .select("payment_status, order_number")
          .eq("id", String(orderId))
          .eq("razorpay_order_id", razorpayOrderId)
          .maybeSingle();

      if (
        !currentOrderError &&
        currentOrder?.payment_status === "paid"
      ) {
        return NextResponse.json({
          success: true,
          orderNumber: currentOrder.order_number,
          paymentStatus: "paid",
        });
      }

      return NextResponse.json(
        {
          error:
            "Payment was captured, but the order status needs support review. Do not pay again.",
          orderNumber: order.order_number,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderNumber: updatedOrder.order_number,
      paymentStatus: "paid",
    });
  } catch (error) {
    console.error(
      "Payment verification error:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      {
        error:
          "Unable to verify payment right now. Do not pay again until the payment status has been checked.",
      },
      { status: 500 }
    );
  }
}
