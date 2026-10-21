
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createHmac, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!supabaseUrl || !supabaseSecretKey || !keyId || !keySecret) {
      return NextResponse.json(
        { error: "Payment verification is not configured." },
        { status: 500 }
      );
    }

    if (!keyId.startsWith("rzp_test_")) {
      return NextResponse.json(
        { error: "Test Mode keys are required during development." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const orderId = body.orderId;
    const razorpayOrderId = body.razorpay_order_id;
    const razorpayPaymentId = body.razorpay_payment_id;
    const razorpaySignature = body.razorpay_signature;

    if (
      (typeof orderId !== "string" &&
        typeof orderId !== "number") ||
      !/^\d+$/.test(String(orderId)) ||
      typeof razorpayOrderId !== "string" ||
      typeof razorpayPaymentId !== "string" ||
      typeof razorpaySignature !== "string" ||
      !/^[a-f0-9]{64}$/i.test(razorpaySignature)
    ) {
      return NextResponse.json(
        { error: "Invalid payment verification details." },
        { status: 400 }
      );
    }

    const expectedSignature = createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest();

    const receivedSignature = Buffer.from(razorpaySignature, "hex");

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

    if (orderError || !order) {
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

    let payment = await razorpay.payments.fetch(razorpayPaymentId);

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

    if (order.payment_status === "paid") {
      return NextResponse.json({
        success: true,
        orderNumber: order.order_number,
        paymentStatus: "paid",
      });
    }

    // Capture an authorized payment before confirming the order.
    if (payment.status === "authorized") {
      try {
        await razorpay.payments.capture(
          razorpayPaymentId,
          expectedAmount,
          "INR"
        );
      } catch (captureError) {
        console.error("Payment capture request failed:", captureError);
        // Fetch again below in case the payment was captured already.
      }

      payment = await razorpay.payments.fetch(razorpayPaymentId);
    }

    if (payment.status !== "captured" || payment.captured !== true) {
      return NextResponse.json(
        {
          error:
            "Payment has not been captured yet. Please check the payment status before retrying.",
          paymentStatus: payment.status,
        },
        { status: 409 }
      );
    }

    const { data: updatedOrder, error: updateError } = await supabase
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
      console.error("Failed to save payment status:", updateError);

      return NextResponse.json(
        {
          error:
            "Payment was captured, but Palmyra could not update the order. Contact support before attempting another payment.",
        },
        { status: 500 }
      );
    }

    if (!updatedOrder) {
      // A previous request may have completed the update.
      const { data: currentOrder } = await supabase
        .from("orders")
        .select("payment_status, order_number")
        .eq("id", String(orderId))
        .eq("razorpay_order_id", razorpayOrderId)
        .maybeSingle();

      if (currentOrder?.payment_status === "paid") {
        return NextResponse.json({
          success: true,
          orderNumber: currentOrder.order_number,
          paymentStatus: "paid",
        });
      }

      return NextResponse.json(
        {
          error:
            "Payment was captured, but the order status needs support review.",
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
    console.error("Payment verification error:", error);

    return NextResponse.json(
      {
        error:
          "Unable to verify payment right now. Do not pay again until the payment status has been checked.",
      },
      { status: 500 }
    );
  }
}
