
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY?.trim();
    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    const publicKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim();

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
      return errorResponse("Razorpay Live Mode keys are required.", 500);
    }

    let body: Record<string, unknown>;

    try {
      const parsedBody: unknown = await request.json();

      if (
        !parsedBody ||
        typeof parsedBody !== "object" ||
        Array.isArray(parsedBody)
      ) {
        return errorResponse("Invalid payment verification request.", 400);
      }

      body = parsedBody as Record<string, unknown>;
    } catch {
      return errorResponse("Invalid payment verification request.", 400);
    }

    const checkoutSessionId = body.orderId;
    const razorpayOrderId = body.razorpay_order_id;
    const razorpayPaymentId = body.razorpay_payment_id;
    const razorpaySignature = body.razorpay_signature;

    if (
      typeof checkoutSessionId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        checkoutSessionId
      ) ||
      typeof razorpayOrderId !== "string" ||
      !razorpayOrderId.trim() ||
      typeof razorpayPaymentId !== "string" ||
      !razorpayPaymentId.trim() ||
      typeof razorpaySignature !== "string" ||
      !/^[a-f0-9]{64}$/i.test(razorpaySignature)
    ) {
      return errorResponse("Invalid payment verification details.", 400);
    }

    // Verify Razorpay's checkout signature using a constant-time comparison.
    const expectedSignature = createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest();

    const receivedSignature = Buffer.from(razorpaySignature, "hex");

    if (
      expectedSignature.length !== receivedSignature.length ||
      !timingSafeEqual(expectedSignature, receivedSignature)
    ) {
      return errorResponse("Payment signature verification failed.", 400);
    }

    const supabase = createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // The supplied orderId is the checkout-session UUID, not orders.id.
    const { data: checkout, error: checkoutError } = await supabase
      .from("checkout_sessions")
      .select(
        "id, total_amount, status, razorpay_order_id, razorpay_payment_id, order_id"
      )
      .eq("id", checkoutSessionId)
      .eq("razorpay_order_id", razorpayOrderId)
      .maybeSingle();

    if (checkoutError) {
      console.error("Could not read checkout session:", checkoutError);
      return errorResponse("Could not check checkout status.", 500);
    }

    if (!checkout) {
      return errorResponse("The matching checkout session was not found.", 404);
    }

    if (
      checkout.razorpay_payment_id &&
      checkout.razorpay_payment_id !== razorpayPaymentId
    ) {
      return errorResponse(
        "A different payment is already associated with this checkout. Please contact support.",
        409
      );
    }

    const expectedAmount = Number(checkout.total_amount) * 100;

    if (!Number.isSafeInteger(expectedAmount) || expectedAmount <= 0) {
      return errorResponse("The saved checkout amount is invalid.", 500);
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Verify the payment directly against Razorpay's API.
    let payment = await razorpay.payments.fetch(razorpayPaymentId);

    if (
      payment.order_id !== razorpayOrderId ||
      payment.amount !== expectedAmount ||
      payment.currency !== "INR"
    ) {
      return errorResponse(
        "The payment does not match this checkout's amount.",
        400
      );
    }

    // Capture authorized payments, then fetch the final payment state again.
    if (payment.status === "authorized") {
      try {
        await razorpay.payments.capture(
          razorpayPaymentId,
          expectedAmount,
          "INR"
        );
      } catch (captureError) {
        // A capture request can report an error even if capture succeeded.
        // Always re-fetch before deciding the payment outcome.
        console.error(
          "Payment capture request returned an error:",
          captureError instanceof Error
            ? captureError.message
            : "Unknown error"
        );
      }

      payment = await razorpay.payments.fetch(razorpayPaymentId);
    }

    if (
      payment.order_id !== razorpayOrderId ||
      payment.amount !== expectedAmount ||
      payment.currency !== "INR"
    ) {
      return errorResponse(
        "The payment does not match this checkout's amount.",
        400
      );
    }

    if (payment.status !== "captured" || payment.captured !== true) {
      return NextResponse.json(
        {
          error:
            "Payment has not been confirmed as captured. Do not pay again; check the payment status before retrying.",
          paymentStatus: payment.status,
        },
        { status: 409 }
      );
    }

    // The database function atomically creates or returns the paid order.
    // It also handles a concurrent webhook or duplicate verification request.
    const { data: result, error: createOrderError } = await supabase.rpc(
      "create_paid_palmyra_order",
      {
        p_razorpay_order_id: razorpayOrderId,
        p_razorpay_payment_id: razorpayPaymentId,
      }
    );

    if (createOrderError) {
      console.error(
        "Captured payment could not be reconciled to a Palmyra order:",
        createOrderError
      );

      return NextResponse.json(
        {
          error:
            "Payment was captured, but Palmyra could not confirm the order yet. Do not pay again; contact support if the order does not appear.",
          paymentStatus: "captured",
        },
        { status: 500 }
      );
    }

    if (
      !result ||
      typeof result !== "object" ||
      result.success !== true ||
      (typeof result.orderId !== "number" &&
        typeof result.orderId !== "string") ||
      typeof result.orderNumber !== "string" ||
      result.paymentStatus !== "paid"
    ) {
      console.error("Unexpected paid-order function response:", result);

      return NextResponse.json(
        {
          error:
            "Payment was captured, but Palmyra could not confirm the order yet. Do not pay again; contact support if the order does not appear.",
          paymentStatus: "captured",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      paymentStatus: "paid",
    });
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
