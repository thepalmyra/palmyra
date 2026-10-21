
"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState, type FormEvent } from "react";
import { useCart } from "@/components/CartContext";
import { createClient } from "@/lib/supabase/client";

type RazorpayPaymentResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayPaymentFailedResponse = {
  error?: {
    description?: string;
    reason?: string;
  };
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    order_number: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayPaymentResponse) => void;
  modal: {
    ondismiss: () => void;
  };
};

type RazorpayCheckoutInstance = {
  open: () => void;
  on: (
    event: "payment.failed",
    handler: (response: RazorpayPaymentFailedResponse) => void
  ) => void;
};

declare global {
  interface Window {
    Razorpay?: new (
      options: RazorpayCheckoutOptions
    ) => RazorpayCheckoutInstance;
  }
}

export default function CheckoutPage() {
  const { items, ready, clearCart } = useCart();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<string | number | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [addressLoading, setAddressLoading] = useState(true);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [razorpayLoadError, setRazorpayLoadError] = useState(false);
  const [paymentNeedsReview, setPaymentNeedsReview] = useState(false);

  const [formValues, setFormValues] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const platformFee = 15;
  const deliveryFee = 0;
  const totalAmount = subtotal + platformFee + deliveryFee;

  useEffect(() => {
    async function loadSavedAddress() {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        setFormValues((current) => ({
          ...current,
          email: user.email ?? "",
        }));

        const { data: address, error: addressError } = await supabase
          .from("customer_addresses")
          .select(
            "full_name, phone, address, city, state, pincode, country"
          )
          .eq("user_id", user.id)
          .eq("is_default", true)
          .maybeSingle();

        if (addressError) {
          console.error("Could not load saved address:", addressError);
          return;
        }

        if (!address) return;

        setFormValues((current) => ({
          ...current,
          fullName: address.full_name ?? "",
          phone: address.phone ?? "",
          address: address.address ?? "",
          city: address.city ?? "",
          state: address.state ?? "",
          pincode: address.pincode ?? "",
          country: address.country ?? "India",
        }));
      } catch (err) {
        console.error("Could not load checkout details:", err);
      } finally {
        setAddressLoading(false);
      }
    }

    loadSavedAddress();
  }, []);

  function updateField(field: keyof typeof formValues, value: string) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting || orderId !== null || paymentNeedsReview) return;

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!razorpayLoaded || !window.Razorpay) {
      setError(
        razorpayLoadError
          ? "Razorpay Checkout could not load. Check your internet connection and refresh the page."
          : "Razorpay Checkout is still loading. Please wait a moment and try again."
      );
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const customer = {
        fullName: formValues.fullName.trim(),
        phone: formValues.phone.trim(),
        email: formValues.email.trim(),
        address: formValues.address.trim(),
        city: formValues.city.trim(),
        state: formValues.state.trim(),
        pincode: formValues.pincode.trim(),
        country: formValues.country.trim(),
      };

      const orderItems = items.map((item) => ({
        id: item.id,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
      }));

      const supabase = createClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Prepare the order and Razorpay payment on the server.
      // Customer fields are sent at the top level because that is
      // what app/api/orders/route.ts validates.
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token
            ? {
                Authorization: `Bearer ${session.access_token}`,
              }
            : {}),
        },
        body: JSON.stringify({
          ...customer,
          items: orderItems,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to prepare your order. Please try again."
        );
      }

      if (
        !result.success ||
        result.orderId == null ||
        typeof result.razorpayOrderId !== "string" ||
        typeof result.keyId !== "string" ||
        !Number.isSafeInteger(result.amount) ||
        result.amount <= 0 ||
        result.currency !== "INR"
      ) {
        throw new Error(
          "The payment details were incomplete. Please refresh and try again."
        );
      }

      const checkout = new window.Razorpay({
        key: result.keyId,
        amount: result.amount,
        currency: result.currency,
        name: "Palmyra",
        description: `Order ${result.orderNumber ?? result.orderId}`,
        order_id: result.razorpayOrderId,
        prefill: {
          name: customer.fullName,
          email: customer.email,
          contact: customer.phone,
        },
        notes: {
          order_number: String(result.orderNumber ?? result.orderId),
        },
        theme: {
          color: "#dc2626",
        },

        handler: async (paymentResponse) => {
          // Do not mark the order as paid based only on the browser.
          // The server must verify the signature and captured payment.
          try {
            const verificationResponse = await fetch(
              "/api/payments/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  orderId: result.orderId,
                  razorpay_order_id: paymentResponse.razorpay_order_id,
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_signature: paymentResponse.razorpay_signature,
                }),
              }
            );

            const verificationResult = await verificationResponse.json();

            if (
              !verificationResponse.ok ||
              !verificationResult.success ||
              verificationResult.paymentStatus !== "paid"
            ) {
              throw new Error(
                verificationResult.error ||
                  "Palmyra could not confirm the payment."
              );
            }

            // Show confirmation only after server-side verification.
            setOrderNumber(
              typeof verificationResult.orderNumber === "string"
                ? verificationResult.orderNumber
                : typeof result.orderNumber === "string"
                  ? result.orderNumber
                  : null
            );
            setOrderId(result.orderId);

            // Clear the cart only after verified payment.
            await clearCart();
          } catch (verificationError) {
            console.error(
              "Payment verification needs review:",
              verificationError
            );

            setPaymentNeedsReview(true);
            setError(
              `Palmyra could not confirm the payment. Do not pay again until the payment status has been checked. Please contact support and provide order number ${result.orderNumber ?? result.orderId}. ${
                verificationError instanceof Error
                  ? verificationError.message
                  : ""
              }`
            );
          } finally {
            setSubmitting(false);
          }
        },

        modal: {
          ondismiss: () => {
            setSubmitting(false);
            setError(
              "Checkout was closed before Palmyra confirmed your payment. Your cart has not been cleared. If you completed payment just before closing checkout, check the payment status before trying again."
            );
          },
        },
      });

      checkout.on("payment.failed", (paymentFailure) => {
        setError(
          paymentFailure.error?.description ||
            "The payment did not complete. You can retry in Razorpay Checkout or close it and try again."
        );
      });

      checkout.open();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
      setSubmitting(false);
    }
  }

  if (!ready) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        Loading checkout...
      </main>
    );
  }

  if (items.length === 0 && orderId === null) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl font-bold">Your cart is empty</h1>

          <p className="mt-4 text-gray-400">
            Add a product before proceeding to checkout.
          </p>

          <Link
            href="/store"
            className="mt-6 inline-block rounded-lg bg-red-600 px-6 py-3 font-semibold hover:bg-red-700"
          >
            Explore the Store
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white sm:px-8">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => setRazorpayLoadError(true)}
      />

      <div className="mx-auto max-w-6xl">
        <Link
          href="/cart"
          className="text-sm text-gray-400 hover:text-white"
        >
          ← Back to Cart
        </Link>

        <h1 className="mt-6 text-3xl font-bold sm:text-4xl">
          Checkout
        </h1>

        <p className="mt-2 text-gray-400">
          Your saved delivery details will be filled in automatically.
        </p>

        {orderId !== null && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-green-600/50 bg-green-600/10 p-5"
          >
            <h2 className="text-xl font-semibold text-green-400">
              Payment successful!
            </h2>

            <p className="mt-2 text-gray-200">
              Your Palmyra order number is:
            </p>

            <p className="mt-1 text-3xl font-extrabold tracking-wide text-red-500">
              {orderNumber ?? "Order confirmed"}
            </p>

            <p className="mt-3 text-sm text-gray-300">
              Your payment has been verified and your order has been
              recorded. Delivery is free.
            </p>

            <Link
              href="/store"
              className="mt-5 inline-block rounded-lg bg-red-600 px-5 py-3 font-semibold hover:bg-red-700"
            >
              Continue Shopping
            </Link>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-500/50 bg-red-500/10 p-4"
          >
            <h2 className="font-semibold text-red-400">
              {paymentNeedsReview
                ? "Payment status needs checking"
                : "Checkout message"}
            </h2>

            <p className="mt-2 text-sm text-gray-200">{error}</p>
          </div>
        )}

        {orderId === null && (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <form
              onSubmit={handleSubmit}
              onChange={() => {
                if (!paymentNeedsReview) setError("");
              }}
              className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-8"
            >
              {addressLoading && (
                <p className="text-sm text-gray-400">
                  Loading your saved delivery details...
                </p>
              )}

              <section>
                <h2 className="mb-5 text-xl font-semibold">
                  Customer Information
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="fullName"
                      className="mb-2 block text-sm"
                    >
                      Full Name *
                    </label>

                    <input
                      id="fullName"
                      name="fullName"
                      autoComplete="name"
                      required
                      maxLength={100}
                      value={formValues.fullName}
                      onChange={(event) =>
                        updateField("fullName", event.target.value)
                      }
                      className="w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm"
                    >
                      Phone Number *
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      maxLength={20}
                      value={formValues.phone}
                      onChange={(event) =>
                        updateField("phone", event.target.value)
                      }
                      className="w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
                      placeholder="Your phone number"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm"
                    >
                      Email Address *
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      maxLength={254}
                      value={formValues.email}
                      onChange={(event) =>
                        updateField("email", event.target.value)
                      }
                      className="w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
              </section>

              <section>
                <h2 className="mb-5 text-xl font-semibold">
                  Delivery Address
                </h2>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="address"
                      className="mb-2 block text-sm"
                    >
                      House Number and Street *
                    </label>

                    <textarea
                      id="address"
                      name="address"
                      autoComplete="street-address"
                      required
                      maxLength={300}
                      rows={3}
                      value={formValues.address}
                      onChange={(event) =>
                        updateField("address", event.target.value)
                      }
                      className="w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
                      placeholder="Enter your full delivery address"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="city"
                        className="mb-2 block text-sm"
                      >
                        City *
                      </label>

                      <input
                        id="city"
                        name="city"
                        autoComplete="address-level2"
                        required
                        maxLength={100}
                        value={formValues.city}
                        onChange={(event) =>
                          updateField("city", event.target.value)
                        }
                        className="w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
                        placeholder="City"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="state"
                        className="mb-2 block text-sm"
                      >
                        State *
                      </label>

                      <input
                        id="state"
                        name="state"
                        autoComplete="address-level1"
                        required
                        maxLength={100}
                        value={formValues.state}
                        onChange={(event) =>
                          updateField("state", event.target.value)
                        }
                        className="w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
                        placeholder="State"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="pincode"
                        className="mb-2 block text-sm"
                      >
                        PIN Code *
                      </label>

                      <input
                        id="pincode"
                        name="pincode"
                        autoComplete="postal-code"
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        title="Enter a valid 6-digit Indian PIN code"
                        required
                        value={formValues.pincode}
                        onChange={(event) =>
                          updateField("pincode", event.target.value)
                        }
                        className="w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
                        placeholder="6-digit PIN code"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="country"
                        className="mb-2 block text-sm"
                      >
                        Country *
                      </label>

                      <input
                        id="country"
                        name="country"
                        autoComplete="country-name"
                        required
                        maxLength={100}
                        value={formValues.country}
                        onChange={(event) =>
                          updateField("country", event.target.value)
                        }
                        className="w-full rounded-lg border border-white/20 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-xl font-semibold">
                  Payment Method
                </h2>

                <div className="rounded-lg border border-red-500/50 bg-black p-4">
                  <p className="font-medium">Prepaid Online Payment</p>

                  <p className="mt-1 text-sm text-gray-400">
                    Pay securely using the Razorpay checkout window.
                    Cash on Delivery is not available.
                  </p>

                  <p className="mt-3 text-sm text-gray-300">
                    Delivery is free. A ₹15 platform fee applies to each
                    order.
                  </p>
                </div>
              </section>

              <button
                type="submit"
                disabled={
                  submitting ||
                  addressLoading ||
                  !razorpayLoaded ||
                  paymentNeedsReview
                }
                className="w-full rounded-lg bg-red-600 px-5 py-4 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {paymentNeedsReview
                  ? "Payment Status Needs Checking"
                  : submitting
                    ? "Preparing Secure Payment..."
                    : addressLoading
                      ? "Loading Your Details..."
                      : !razorpayLoaded
                        ? "Loading Payment..."
                        : `Pay ₹${totalAmount.toLocaleString("en-IN")}`}
              </button>

              <p className="text-xs leading-5 text-gray-500">
                Your order will be confirmed only after Palmyra verifies
                the payment. If payment status cannot be confirmed, do
                not pay again until it has been checked.
              </p>
            </form>

            <aside className="h-fit rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
              <h2 className="text-xl font-bold">Order Summary</h2>

              <div className="mt-5 space-y-4">
                {items.map((item, index) => (
                  <div
                    key={`${item.id}-${item.color}-${item.size}-${index}`}
                    className="flex gap-3"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-20 w-20 rounded-lg bg-white object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{item.name}</p>

                      <p className="mt-1 text-sm text-gray-400">
                        Color: {item.color}
                      </p>

                      <p className="text-sm text-gray-400">
                        Size: {item.size} · Qty: {item.quantity}
                      </p>

                      <p className="mt-1 font-semibold">
                        ₹
                        {(item.price * item.quantity).toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
                <div className="flex justify-between gap-3 text-gray-300">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-between gap-3 text-gray-300">
                  <span>Delivery</span>
                  <span>Free</span>
                </div>

                <div className="flex justify-between gap-3 text-gray-300">
                  <span>Platform fee</span>
                  <span>₹{platformFee.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-between gap-3 border-t border-white/10 pt-4 text-lg font-bold">
                  <span>Total payable</span>
                  <span>₹{totalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <Link
                href="/store"
                className="mt-6 block text-center text-sm text-gray-300 hover:text-white"
              >
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
