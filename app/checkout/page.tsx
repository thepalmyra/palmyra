
"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useCart } from "@/components/CartContext";
import { createClient } from "@/lib/supabase/client";

export default function CheckoutPage() {
  const { items, ready } = useCart();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<string | number | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [addressLoading, setAddressLoading] = useState(true);

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

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  function updateField(field: keyof typeof formValues, value: string) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting || orderId !== null) return;

    if (items.length === 0) {
      setError("Your cart is empty.");
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
          customer,
          items: orderItems,
          paymentMethod,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to save your order. Please try again."
        );
      }

      if (!result.success || result.orderId == null) {
        throw new Error(
          "Order confirmation was not received. Check your orders before trying again."
        );
      }

      setOrderId(result.orderId);
      setOrderNumber(
        typeof result.orderNumber === "string"
          ? result.orderNumber
          : null
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
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
              Order saved successfully!
            </h2>

            <p className="mt-2 text-gray-200">
              Your Palmyra order number is:
            </p>

            <p className="mt-1 text-3xl font-extrabold tracking-wide text-red-500">
              {orderNumber ?? "Order received"}
            </p>

            <p className="mt-3 text-sm text-gray-300">
              Your order details have been saved. No payment has been
              taken. Payment and delivery arrangements are not yet
              enabled.
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
              Could not save your order
            </h2>

            <p className="mt-2 text-sm text-gray-200">{error}</p>
          </div>
        )}

        {orderId === null && (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <form
              onSubmit={handleSubmit}
              onChange={() => setError("")}
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

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/20 bg-black p-4">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(event) =>
                      setPaymentMethod(event.target.value)
                    }
                    className="accent-red-600"
                  />

                  <span>
                    <span className="block font-medium">
                      Cash on Delivery
                    </span>

                    <span className="mt-1 block text-sm text-gray-400">
                      Payment arrangements are not active yet.
                    </span>
                  </span>
                </label>
              </section>

              <button
                type="submit"
                disabled={submitting || addressLoading}
                className="w-full rounded-lg bg-red-600 px-5 py-4 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Saving Your Order..."
                  : addressLoading
                    ? "Loading Your Details..."
                    : "Place Order"}
              </button>

              <p className="text-xs leading-5 text-gray-500">
                Your order will be saved when the request succeeds.
                No payment will be collected by this checkout.
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

                <div className="flex justify-between gap-3 text-gray-400">
                  <span>Delivery</span>
                  <span>Calculated later</span>
                </div>

                <div className="flex justify-between gap-3 border-t border-white/10 pt-4 text-lg font-bold">
                  <span>Total before delivery</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
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
