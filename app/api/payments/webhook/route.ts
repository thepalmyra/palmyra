
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
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
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();

    if (!supabaseUrl || !supabaseSecretKey || !webhookSecret) {
      console.error("Webhook environment configuration is incomplete.");
      return errorResponse("Webhook is not configured correctly.", 500);
    }

    // Verify the signature against the exact raw request body.
    const rawBody = await request.text();
    const receivedSignature = request.headers.get("x-razorpay-signature");

    if (
      !receivedSignature ||
      !/^[a-f0-9]{64}$/i.test(receivedSignature)
    ) {
      return errorResponse("Invalid webhook signature.", 400);
    }

    const expectedSignature = createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest();

    const signatureBuffer = Buffer.from(receivedSignature, "hex");

    if (
      expectedSignature.length !== signatureBuffer.length ||
      !timingSafeEqual(expectedSignature, signatureBuffer)
    ) {
      return errorResponse("Webhook signature verification failed.", 400);
    }

    let event: Record<string, unknown>;

    try {
      const parsed: unknown = JSON.parse(rawBody);

      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return errorResponse("Invalid webhook payload.", 400);
      }

      event = parsed as Record<string, unknown>;
    } catch {
      return errorResponse("Invalid webhook payload.", 400);
    }

    // Other valid Razorpay events do not create Palmyra orders.
    if (event.event !== "payment.captured") {
      return NextResponse.json({
        received: true,
        ignored: true,
      });
    }

    const payload = event.payload as
      | Record<string, unknown>
      | undefined;
    const paymentEntity = payload?.payment as
      | Record<string, unknown>
      | undefined;
    const payment = paymentEntity?.entity as
      | Record<string, unknown>
      | undefined;

    if (!payment || typeof payment !== "object") {
      return errorResponse("Invalid captured-payment payload.", 400);
    }

    const paymentId = payment.id;
    const razorpayOrderId = payment.order_id;
    const amount = payment.amount;
    const currency = payment.currency;
    const status = payment.status;
    const captured = payment.captured;

    if (
      typeof paymentId !== "string" ||
      !paymentId.trim() ||
      typeof razorpayOrderId !== "string" ||
      !razorpayOrderId.trim() ||
      !Number.isSafeInteger(amount) ||
      (amount as number) <= 0 ||
      currency !== "INR" ||
      status !== "captured" ||
      captured !== true
    ) {
      return errorResponse("Invalid captured-payment details.", 400);
    }

    const supabase = createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Find the checkout session, not a pre-created Palmyra order.
    const { data: checkout, error: checkoutError } = await supabase
      .from("checkout_sessions")
      .select("id, total_amount, razorpay_order_id, razorpay_payment_id")
      .eq("razorpay_order_id", razorpayOrderId)
      .maybeSingle();

    if (checkoutError) {
      console.error("Could not read checkout session:", checkoutError);
      return errorResponse("Could not read checkout session.", 500);
    }

    if (!checkout) {
      // Return a non-2xx response so Razorpay can retry delivery.
      console.error("Captured payment has no matching checkout session.", {
        razorpayOrderId,
        paymentId,
      });

      return errorResponse(
        "Matching checkout session not found; reconciliation is required.",
        500
      );
    }

    const expectedAmount = Number(checkout.total_amount) * 100;

    if (
      !Number.isSafeInteger(expectedAmount) ||
      expectedAmount <= 0 ||
      amount !== expectedAmount
    ) {
      console.error("Captured payment amount mismatch.", {
        razorpayOrderId,
        paymentId,
      });

      return errorResponse("Captured payment amount mismatch.", 400);
    }

    if (
      checkout.razorpay_payment_id &&
      checkout.razorpay_payment_id !== paymentId
    ) {
      console.error("Checkout already references a different payment.", {
        razorpayOrderId,
        paymentId,
      });

      return errorResponse(
        "Checkout payment mismatch; reconciliation is required.",
        409
      );
    }

    // The RPC is transactional and safe if verification processed this
    // same payment first. It returns the existing order on a valid retry.
    const { data: result, error: rpcError } = await supabase.rpc(
      "create_paid_palmyra_order",
      {
        p_razorpay_order_id: razorpayOrderId,
        p_razorpay_payment_id: paymentId,
      }
    );

    if (rpcError) {
      console.error("Could not create/reconcile paid order:", rpcError);
      return errorResponse(
        "Captured payment could not yet be reconciled to an order.",
        500
      );
    }

    if (
      !result ||
      typeof result !== "object" ||
      result.success !== true ||
      result.paymentStatus !== "paid"
    ) {
      console.error("Unexpected paid-order function response:", result);
      return errorResponse(
        "Captured payment could not yet be reconciled to an order.",
        500
      );
    }

    return NextResponse.json({
      received: true,
      matched: true,
      processed: true,
    });
  } catch (error) {
    console.error(
      "Payment webhook error:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return errorResponse("Webhook processing failed.", 500);
  }
}
