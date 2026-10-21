
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
  const [notice, setNotice] = useState("");
  const [orderId, setOrderId] = useState<string | number | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const [addressLoading, setAddressLoading] = useState(true);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [razorpayLoadError, setRazorpayLoadError] = useState(false);
  const [paymentNeedsReview, setPaymentNeedsReview] = useState(false);

  const [signedInUserId, setSignedInUserId] = useState<string | null>(null);
  const [saveAddress, setSaveAddress] = useState(false);

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
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Could not get signed-in user:", userError);
          return;
        }

        if (!user) return;

        setSignedInUserId(user.id);

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

        // A default address is already saved, so offer to update it.
        setSaveAddress(true);
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

  async function saveCustomerAddress(
    userId: string,
    customer: typeof formValues
  ) {
    const supabase = createClient();

    const addressData = {
      user_id: userId,
      full_name: customer.fullName,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      pincode: customer.pincode,
      country: customer.country,
      is_default: true,
    };

    // Update the existing default address if one exists.
    const { data: existingAddress, error: lookupError } = await supabase
      .from("customer_addresses")
      .select("user_id")
      .eq("user_id", userId)
      .eq("is_default", true)
      .maybeSingle();

    if (lookupError) {
      throw new Error(
        "Could not check your saved address. Please try again."
      );
    }

    if (existingAddress) {
      const { error: updateError } = await supabase
        .from("customer_addresses")
        .update({
          full_name: addressData.full_name,
          phone: addressData.phone,
          address: addressData.address,
          city: addressData.city,
          state: addressData.state,
          pincode: addressData.pincode,
          country: addressData.country,
          is_default: true,
        })
        .eq("user_id", userId)
        .eq("is_default", true);

      if (updateError) {
        console.error("Could not update saved address:", updateError);
        throw new Error(
          "Your address could not be saved. Check your account permissions and try again."
        );
      }
    } else {
      const { error: insertError } = await supabase
        .from("customer_addresses")
        .insert(addressData);

      if (insertError) {
        console.error("Could not save new address:", insertError);
        throw new Error(
          "Your address could not be saved. Check your account permissions and try again."
        );
      }
    }
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
    setNotice("");

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

      const userId = session?.user?.id ?? null;

      // Save the address only when the customer requests it.
      // Guest checkout remains available without address saving.
      if (saveAddress) {
        if (!userId) {
          throw new Error(
            "Sign in to save your address for future orders. You can uncheck the save-address option to continue as a guest."
          );
        }

        await saveCustomerAddress(userId, customer);
        setNotice("Your address has been saved for future orders.");
      }

      // Customer fields must be top-level to match /api/orders.
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

            // The server has confirmed payment.
            setOrderNumber(
              typeof verificationResult.orderNumber === "string"
                ? verificationResult.orderNumber
                : typeof result.orderNumber === "string"
                  ? result.orderNumber
                  : null
            );
            setOrderId(result.orderId);
            setError("");
            setNotice("Your payment has been verified successfully.");

            // Cart clearing is separate from payment verification.
            // If clearing fails, don't incorrectly mark the payment as failed.
            try {
              await clearCart();
            } catch (clearError) {
              console.error("Could not clear the cart:", clearError);
              setNotice(
                "Payment verified successfully. If your cart still shows items, remove them before your next order."
              );
            }
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
        setSubmitting(false);
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
    <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-8 sm:py-12">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => setRazorpayLoadError(true)}
      />

      <div className="mx-auto max-w-6xl">
        <Link
          href="/cart"
          className="text-sm text-gray-400 transition hover:text-white"
        >
          ← Back to Cart
        </Link>

        {/* Checkout progress indicator */}
        <nav
          aria-label="Checkout progress"
          className="mx-auto mt-8 mb-8 max-w-2xl"
        >
          <ol className="flex items-center justify-between gap-2">
            <li className="flex items-center gap-2">
              <Link
                href="/cart"
                className="flex items-center gap-2 text-sm text-gray-400 transition hover:text-white sm:text-base"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                  1
                </span>
                <span>Cart</span>
              </Link>
            </li>

            <li
              aria-hidden="true"
              className="h-px min-w-3 flex-1 bg-white/20"
            />

            <li
              aria-current="step"
              className="flex items-center gap-2 text-sm font-semibold text-red-500 sm:text-base"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-600/20">
                2
              </span>
              <span>Checkout</span>
            </li>

            <li
              aria-hidden="true"
              className="h-px min-w-3 flex-1 bg-white/20"
            />

            <li className="flex items-center gap-2 text-sm text-gray-500 sm:text-base">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                3
              </span>
              <span>Payment</span>
            </li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Checkout
        </h1>

        <p className="mt-2 text-gray-400">
          Confirm your delivery details and pay securely.
        </p>

        {notice && (
          <div
            role="status"
            className="mt-5 rounded-xl border border-green-600/40 bg-green-600/10 p-4 text-sm text-green-300"
          >
            {notice}
          </div>
        )}

        {orderId !== null && (
          <div
            role="status"
            className="mt-6 rounded-2xl border border-green-600/50 bg-green-600/10 p-6"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-500/15 text-2xl text-green-400">
                ✓
              </span>
              <div>
                <h2 className="text-xl font-semibold text-green-400">
                  Payment successful!
                </h2>
                <p className="mt-1 text-sm text-gray-300">
                  Your payment has been verified by Palmyra.
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm text-gray-300">
              Your order number
            </p>
            <p className="mt-1 break-words text-3xl font-extrabold tracking-wide text-red-500">
              {orderNumber ?? "Order confirmed"}
            </p>

            <p className="mt-3 text-sm text-gray-300">
              Delivery is free. Thank you for shopping with Palmyra!
            </p>

            <Link
              href="/store"
              className="mt-5 inline-block rounded-lg bg-red-600 px-5 py-3 font-semibold transition hover:bg-red-700"
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
            <p className="mt-2 break-words text-sm leading-6 text-gray-200">
              {error}
            </p>
          </div>
        )}

        {orderId === null && (
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <form
              onSubmit={handleSubmit}
              onChange={() => {
                if (!paymentNeedsReview) setError("");
              }}
              className="space-y-7 rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/20 sm:p-8"
            >
              {addressLoading && (
                <p className="text-sm text-gray-400">
                  Loading your saved delivery details...
                </p>
              )}

              <section>
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
                    Step 1
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">
                    Customer Information
                  </h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="fullName" className="mb-2 block text-sm">
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
                      className="w-full rounded-lg border border-white/15 bg-black px-4 py-3 text-white outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="mb-2 block text-sm">
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
                      className="w-full rounded-lg border border-white/15 bg-black px-4 py-3 text-white outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      placeholder="Your phone number"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="email" className="mb-2 block text-sm">
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
                      className="w-full rounded-lg border border-white/15 bg-black px-4 py-3 text-white outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
              </section>

              <div className="h-px bg-white/10" />

              <section>
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
                    Step 2
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">
                    Delivery Address
                  </h2>
                  <p className="mt-1 text-sm text-gray-400">
                    Enter the address where you want your order delivered.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="address" className="mb-2 block text-sm">
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
                      className="w-full resize-y rounded-lg border border-white/15 bg-black px-4 py-3 text-white outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      placeholder="House number, street, area, landmark"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="city" className="mb-2 block text-sm">
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
                        className="w-full rounded-lg border border-white/15 bg-black px-4 py-3 text-white outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        placeholder="City"
                      />
                    </div>

                    <div>
                      <label htmlFor="state" className="mb-2 block text-sm">
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
                        className="w-full rounded-lg border border-white/15 bg-black px-4 py-3 text-white outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        placeholder="State"
                      />
                    </div>

                    <div>
                      <label htmlFor="pincode" className="mb-2 block text-sm">
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
                        className="w-full rounded-lg border border-white/15 bg-black px-4 py-3 text-white outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        placeholder="6-digit PIN code"
                      />
                    </div>

                    <div>
                      <label htmlFor="country" className="mb-2 block text-sm">
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
                        className="w-full rounded-lg border border-white/15 bg-black px-4 py-3 text-white outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>

                <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/50 p-4 transition hover:border-red-500/50">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(event) => setSaveAddress(event.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 accent-red-600"
                  />
                  <span>
                    <span className="block text-sm font-medium text-white">
                      Save this address for future orders
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-gray-400">
                      {signedInUserId
                        ? "Your default delivery address will be saved to your Palmyra account."
                        : "Sign in to save this address to your account. Guest checkout is still available if you leave this unchecked."}
                    </span>
                  </span>
                </label>
              </section>

              <div className="h-px bg-white/10" />

              <section>
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
                    Step 3
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">
                    Secure Payment
                  </h2>
                </div>

                <div className="rounded-xl border border-red-500/30 bg-red-500/[0.06] p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-600/15 text-red-400">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                      >
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <path d="M3 10h18M7 15h3" />
                      </svg>
                    </span>
                    <div>
                      <p className="font-medium">Prepaid Online Payment</p>
                      <p className="mt-1 text-sm leading-5 text-gray-400">
                        Complete payment through Razorpay. Cash on Delivery
                        is not available.
                      </p>
                      <p className="mt-2 text-xs text-gray-500">
                        Your order is confirmed after the payment is verified.
                      </p>
                    </div>
                  </div>
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
                className="w-full rounded-xl bg-red-600 px-5 py-4 font-semibold text-white shadow-lg shadow-red-950/30 transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {paymentNeedsReview
                  ? "Payment Status Needs Checking"
                  : submitting
                    ? "Preparing Secure Payment..."
                    : addressLoading
                      ? "Loading Your Details..."
                      : razorpayLoadError
                        ? "Payment Service Unavailable"
                        : !razorpayLoaded
                          ? "Loading Payment..."
                          : `Pay ₹${totalAmount.toLocaleString("en-IN")}`}
              </button>

              <p className="text-center text-xs leading-5 text-gray-500">
                Secure checkout · Free delivery · ₹15 platform fee
              </p>
            </form>

            <aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/20 sm:p-6 lg:sticky lg:top-6">
              <h2 className="text-xl font-bold">Order Summary</h2>
              <p className="mt-1 text-sm text-gray-400">
                {items.length} {items.length === 1 ? "item" : "items"} in your cart
              </p>

              <div className="mt-5 space-y-5">
                {items.map((item, index) => (
                  <div
                    key={`${item.id}-${item.color}-${item.size}-${index}`}
                    className="flex gap-3"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-20 w-20 shrink-0 rounded-xl bg-white object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-medium">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        Color: {item.color}
                      </p>
                      <p className="text-xs text-gray-400">
                        Size: {item.size} · Qty: {item.quantity}
                      </p>
                      <p className="mt-2 font-semibold">
                        ₹
                        {(item.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm">
                <div className="flex justify-between gap-3 text-gray-300">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-between gap-3 text-gray-300">
                  <span>Delivery</span>
                  <span className="font-medium text-green-400">FREE</span>
                </div>

                <div className="flex justify-between gap-3 text-gray-300">
                  <span>Platform fee</span>
                  <span>₹{platformFee.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-between gap-3 border-t border-white/10 pt-4 text-base font-bold">
                  <span>Total payable</span>
                  <span className="text-white">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-white/[0.04] p-3">
                <p className="text-xs leading-5 text-gray-400">
                  The final amount includes your products and the ₹15 platform
                  fee. Delivery costs ₹0.
                </p>
              </div>

              <Link
                href="/store"
                className="mt-5 block text-center text-sm text-gray-300 transition hover:text-white"
              >
                ← Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
