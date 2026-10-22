
import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RazorpayPayment = {
  id?: string;
  order_id?: string;
  amount?: number;
  currency?: string;
  status?: string;
  captured?: boolean;
};

type WebhookBody = {
  event?: string;
  payload?: {
    payment?: {
      entity?: RazorpayPayment;
    };
  };
};

export async function POST(request: Request) {
  try {
    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabaseSecretKey =
      process.env.SUPABASE_SECRET_KEY?.trim();

    if (!webhookSecret || !supabaseUrl || !supabaseSecretKey) {
      console.error("Payment webhook configuration is incomplete.");

      return NextResponse.json(
        { error: "Webhook configuration is incomplete." },
        { status: 500 }
      );
    }

    // Razorpay signatures must be checked against the original raw body.
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature || !/^[a-f0-9]{64}$/i.test(signature)) {
      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 400 }
      );
    }

    const expectedSignature = createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest();

    const receivedSignature = Buffer.from(signature, "hex");

    if (
      expectedSignature.length !== receivedSignature.length ||
      !timingSafeEqual(expectedSignature, receivedSignature)
    ) {
      return NextResponse.json(
        { error: "Webhook signature verification failed." },
        { status: 400 }
      );
    }

    let body: WebhookBody;

    try {
      body = JSON.parse(rawBody) as WebhookBody;
    } catch {
      return NextResponse.json(
        { error: "Invalid webhook payload." },
        { status: 400 }
      );
    }

    // Configure Razorpay to send payment.captured events.
    // Acknowledge unrelated events without changing any orders.
    if (body.event !== "payment.captured") {
      return NextResponse.json({ received: true });
    }

    const payment = body.payload?.payment?.entity;

    if (
      !payment?.id ||
      !payment.order_id ||
      payment.status !== "captured" ||
      payment.captured !== true ||
      !Number.isSafeInteger(payment.amount) ||
      payment.amount! <= 0 ||
      payment.currency !== "INR"
    ) {
      return NextResponse.json(
        { error: "Captured payment details are invalid." },
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

    // Match the payment to the existing Palmyra order.
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        "id, order_number, total_amount, payment_status, razorpay_order_id, razorpay_payment_id"
      )
      .eq("razorpay_order_id", payment.order_id)
      .maybeSingle();

    if (orderError) {
      console.error("Webhook order lookup failed:", orderError.message);

      return NextResponse.json(
        { error: "Could not look up the order." },
        { status: 500 }
      );
    }

    if (!order) {
      // Acknowledge an unrelated order so it does not cause
      // endless retries. Investigate unmatched orders separately.
      console.error(
        "Captured Razorpay payment has no matching Palmyra order:",
        payment.order_id
      );

      return NextResponse.json({
        received: true,
        matched: false,
      });
    }

    const expectedAmount = Math.round(Number(order.total_amount) * 100);

    if (
      !Number.isSafeInteger(expectedAmount) ||
      expectedAmount !== payment.amount
    ) {
      console.error(
        "Captured payment amount does not match Palmyra order:",
        order.order_number
      );

      return NextResponse.json(
        { error: "Payment amount does not match the order." },
        { status: 409 }
      );
    }

    // Webhook delivery can be repeated, so make processing idempotent.
    if (order.payment_status === "paid") {
      if (order.razorpay_payment_id === payment.id) {
        return NextResponse.json({
          received: true,
          orderNumber: order.order_number,
          paymentStatus: "paid",
        });
      }

      // Never silently replace a different saved payment ID.
      console.error(
        "Order is already paid with a different payment ID:",
        order.order_number
      );

      return NextResponse.json(
        { error: "Order requires payment reconciliation." },
        { status: 409 }
      );
    }

    if (
      order.razorpay_payment_id &&
      order.razorpay_payment_id !== payment.id
    ) {
      return NextResponse.json(
        { error: "Order has a different payment ID saved." },
        { status: 409 }
      );
    }

    const { data: updatedOrder, error: updateError } =
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          razorpay_payment_id: payment.id,
        })
        .eq("id", order.id)
        .eq("razorpay_order_id", payment.order_id)
        .eq("payment_status", "pending")
        .select("order_number, payment_status, razorpay_payment_id")
        .maybeSingle();

    if (updateError) {
      console.error(
        "Webhook order update failed:",
        updateError.message
      );

      return NextResponse.json(
        { error: "Could not update the order payment status." },
        { status: 500 }
      );
    }

    if (!updatedOrder) {
      // Another request may have updated the order concurrently.
      const { data: currentOrder, error: currentError } =
        await supabase
          .from("orders")
          .select("order_number, payment_status, razorpay_payment_id")
          .eq("id", order.id)
          .maybeSingle();

      if (
        !currentError &&
        currentOrder?.payment_status === "paid" &&
        currentOrder.razorpay_payment_id === payment.id
      ) {
        return NextResponse.json({
          received: true,
          orderNumber: currentOrder.order_number,
          paymentStatus: "paid",
        });
      }

      return NextResponse.json(
        { error: "Order status changed and needs review." },
        { status: 409 }
      );
    }

    return NextResponse.json({
      received: true,
      orderNumber: updatedOrder.order_number,
      paymentStatus: updatedOrder.payment_status,
    });
  } catch (error) {
    console.error(
      "Razorpay webhook error:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      { error: "Unable to process the payment webhook." },
      { status: 500 }
    );
  }
}
