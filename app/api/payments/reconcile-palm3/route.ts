
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY?.trim();
    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    const recoverySecret = process.env.PAYMENT_RECONCILE_SECRET?.trim();

    if (
      !supabaseUrl ||
      !supabaseSecretKey ||
      !keyId ||
      !keySecret ||
      !recoverySecret ||
      !keyId.startsWith("rzp_live_")
    ) {
      return NextResponse.json(
        { error: "Recovery is not configured correctly." },
        { status: 500 }
      );
    }

    // Require a separate secret for this one-time recovery.
    const authorization = request.headers.get("authorization");

    if (authorization !== `Bearer ${recoverySecret}`) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Fixed transaction details: this endpoint only handles PALM3.
    const orderNumber = "PALM3";
    const expectedRazorpayOrderId = "order_Tqv7WVsssIas4Q";
    const paymentId = "pay_Tqv8lmAJl8Z71p";
    const expectedAmountPaise = 26400;

    // Verify the captured payment directly with Razorpay.
    const payment = await razorpay.payments.fetch(paymentId);

    if (
      payment.order_id !== expectedRazorpayOrderId ||
      payment.amount !== expectedAmountPaise ||
      payment.currency !== "INR" ||
      payment.status !== "captured" ||
      payment.captured !== true
    ) {
      return NextResponse.json(
        {
          error:
            "Razorpay payment details do not match the expected captured transaction. No database changes were made.",
        },
        { status: 409 }
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

    const { data: order, error: readError } = await supabase
      .from("orders")
      .select(
        "id, order_number, total_amount, payment_status, razorpay_order_id, razorpay_payment_id"
      )
      .eq("order_number", orderNumber)
      .maybeSingle();

    if (readError) {
      console.error("PALM3 lookup failed:", readError.message);

      return NextResponse.json(
        { error: "Could not read the Palmyra order." },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        { error: "PALM3 was not found. No database changes were made." },
        { status: 404 }
      );
    }

    if (
      order.razorpay_order_id !== expectedRazorpayOrderId ||
      Math.round(Number(order.total_amount) * 100) !== expectedAmountPaise
    ) {
      return NextResponse.json(
        {
          error:
            "The saved order ID or amount does not match. No database changes were made.",
        },
        { status: 409 }
      );
    }

    if (
      order.razorpay_payment_id &&
      order.razorpay_payment_id !== paymentId
    ) {
      return NextResponse.json(
        {
          error:
            "A different payment ID is already saved for PALM3. Manual review is required.",
        },
        { status: 409 }
      );
    }

    if (order.payment_status === "paid") {
      return NextResponse.json({
        success: true,
        message: "PALM3 is already marked paid.",
        orderNumber,
        paymentStatus: "paid",
      });
    }

    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        razorpay_payment_id: paymentId,
      })
      .eq("id", order.id)
      .eq("order_number", orderNumber)
      .eq("razorpay_order_id", expectedRazorpayOrderId)
      .eq("payment_status", "pending")
      .select("order_number, payment_status, razorpay_payment_id")
      .maybeSingle();

    if (updateError) {
      console.error("PALM3 recovery update failed:", updateError.message);

      return NextResponse.json(
        {
          error:
            "Razorpay confirms the captured payment, but the database update failed. Do not pay again.",
        },
        { status: 500 }
      );
    }

    if (!updatedOrder) {
      return NextResponse.json(
        {
          error:
            "PALM3 was not updated. Its status may have changed; check Supabase before retrying.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Captured payment reconciled successfully.",
      orderNumber: updatedOrder.order_number,
      paymentStatus: updatedOrder.payment_status,
      paymentId: updatedOrder.razorpay_payment_id,
    });
  } catch (error) {
    console.error(
      "PALM3 reconciliation failed:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      {
        error:
          "Recovery failed. Check the server logs and Razorpay status. Do not pay again.",
      },
      { status: 500 }
    );
  }
}
