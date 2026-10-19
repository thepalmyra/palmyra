
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Address = {
  id: number;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default: boolean;
};

type AddressForm = Omit<Address, "id" | "is_default">;

const emptyAddress: AddressForm = {
  full_name: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-white placeholder:text-gray-500 outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState<AddressForm>(emptyAddress);
  const [userId, setUserId] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  function notify(text: string, type: "success" | "error" = "success") {
    setMessage(text);
    setMessageType(type);
  }

  async function loadAddresses() {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setUserId("");
      setLoading(false);
      return;
    }

    setUserId(user.id);

    const { data, error } = await supabase
      .from("customer_addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      notify("Unable to load addresses. Please try again.", "error");
    } else {
      setAddresses((data ?? []) as Address[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    void loadAddresses();
  }, []);

  function startEdit(item: Address) {
    setEditingId(item.id);
    setForm({
      full_name: item.full_name,
      phone: item.phone,
      address: item.address,
      city: item.city,
      state: item.state,
      pincode: item.pincode,
      country: item.country,
    });
    setMessage("");
    document.getElementById("address-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyAddress);
    setMessage("");
  }

  async function saveAddress(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!userId) {
      notify("Please sign in to save an address.", "error");
      return;
    }

    if (!/^[0-9]{6}$/.test(form.pincode.trim())) {
      notify("Enter a valid 6-digit Indian PIN code.", "error");
      return;
    }

    if (!/^[0-9+()\-\s]{7,20}$/.test(form.phone.trim())) {
      notify("Please enter a valid phone number.", "error");
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();
      const cleanForm = {
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        country: form.country.trim(),
      };

      const result = editingId !== null
        ? await supabase
            .from("customer_addresses")
            .update(cleanForm)
            .eq("id", editingId)
            .eq("user_id", userId)
        : await supabase
            .from("customer_addresses")
            .insert({ ...cleanForm, user_id: userId });

      if (result.error) {
        notify("Unable to save the address. Please try again.", "error");
        return;
      }

      setEditingId(null);
      setForm(emptyAddress);
      notify(
        editingId !== null
          ? "Address updated successfully."
          : "Address saved successfully."
      );

      await loadAddresses();
    } catch {
      notify("Something went wrong. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAddress(id: number) {
    if (!userId || !window.confirm("Delete this saved address?")) return;

    setBusyId(id);
    setMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("customer_addresses")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        notify("Unable to delete this address.", "error");
        return;
      }

      setAddresses((current) => current.filter((item) => item.id !== id));

      if (editingId === id) {
        cancelEdit();
      }

      notify("Address deleted.");
    } catch {
      notify("Something went wrong. Please try again.", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function setDefaultAddress(id: number) {
    if (!userId) return;

    setBusyId(id);
    setMessage("");

    try {
      const supabase = createClient();

      // Clear the current default for this customer only.
      const { error: clearError } = await supabase
        .from("customer_addresses")
        .update({ is_default: false })
        .eq("user_id", userId);

      if (clearError) {
        notify("Unable to update the default address.", "error");
        return;
      }

      const { error: setError } = await supabase
        .from("customer_addresses")
        .update({ is_default: true })
        .eq("id", id)
        .eq("user_id", userId);

      if (setError) {
        notify(
          "Unable to set the default address. Please try again.",
          "error"
        );
        await loadAddresses();
        return;
      }

      setAddresses((current) =>
        current.map((item) => ({
          ...item,
          is_default: item.id === id,
        }))
      );

      notify("Default delivery address updated.");
    } catch {
      notify("Something went wrong. Please try again.", "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-8 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
        >
          <span aria-hidden="true">←</span> Back to Profile
        </Link>

        <header className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">
              Palmyra Account
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Saved Addresses
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400 sm:text-base">
              Manage your delivery details for a smoother checkout.
            </p>
          </div>

          {userId && !loading && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold transition hover:bg-red-700"
            >
              + Add address
            </button>
          )}
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section
            id="address-form"
            className="scroll-mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-7"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600/15 text-xl text-red-400">
                {editingId !== null ? "✎" : "+"}
              </div>
              <div>
                <h2 className="text-lg font-semibold">
                  {editingId !== null ? "Edit address" : "Add a new address"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {editingId !== null
                    ? "Update your delivery information."
                    : "Enter your delivery information below."}
                </p>
              </div>
            </div>

            {loading ? (
              <p className="py-6 text-sm text-gray-400">Loading your account...</p>
            ) : !userId ? (
              <div className="rounded-xl border border-white/10 bg-black/30 p-5">
                <p className="text-sm text-gray-300">
                  Sign in to manage your saved addresses.
                </p>
                <Link
                  href="/login"
                  className="mt-4 inline-flex rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold hover:bg-red-700"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <form onSubmit={saveAddress} className="space-y-4">
                <div>
                  <label htmlFor="full_name" className="mb-2 block text-sm text-gray-300">
                    Full name
                  </label>
                  <input
                    id="full_name"
                    required
                    maxLength={100}
                    autoComplete="name"
                    placeholder="Enter full name"
                    className={fieldClass}
                    value={form.full_name}
                    onChange={(e) =>
                      setForm({ ...form, full_name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="mb-2 block text-sm text-gray-300">
                    Phone number
                  </label>
                  <input
                    id="phone"
                    required
                    type="tel"
                    maxLength={20}
                    autoComplete="tel"
                    placeholder="Enter phone number"
                    className={fieldClass}
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label htmlFor="address" className="mb-2 block text-sm text-gray-300">
                    House number, street and area
                  </label>
                  <textarea
                    id="address"
                    required
                    maxLength={300}
                    rows={3}
                    autoComplete="street-address"
                    placeholder="Enter your complete address"
                    className={fieldClass}
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="city" className="mb-2 block text-sm text-gray-300">
                      City
                    </label>
                    <input
                      id="city"
                      required
                      maxLength={100}
                      autoComplete="address-level2"
                      placeholder="City"
                      className={fieldClass}
                      value={form.city}
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="mb-2 block text-sm text-gray-300">
                      State
                    </label>
                    <input
                      id="state"
                      required
                      maxLength={100}
                      autoComplete="address-level1"
                      placeholder="State"
                      className={fieldClass}
                      value={form.state}
                      onChange={(e) =>
                        setForm({ ...form, state: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label htmlFor="pincode" className="mb-2 block text-sm text-gray-300">
                      PIN code
                    </label>
                    <input
                      id="pincode"
                      required
                      maxLength={6}
                      inputMode="numeric"
                      autoComplete="postal-code"
                      pattern="[0-9]{6}"
                      title="Enter a 6-digit Indian PIN code"
                      placeholder="6-digit PIN"
                      className={fieldClass}
                      value={form.pincode}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="mb-2 block text-sm text-gray-300">
                      Country
                    </label>
                    <input
                      id="country"
                      required
                      maxLength={100}
                      autoComplete="country-name"
                      placeholder="Country"
                      className={fieldClass}
                      value={form.country}
                      onChange={(e) =>
                        setForm({ ...form, country: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-semibold transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : editingId !== null
                        ? "Save Changes"
                        : "Save Address"}
                  </button>

                  {editingId !== null && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={saving}
                      className="rounded-xl border border-white/15 px-5 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/5"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your addresses</h2>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-400">
                {addresses.length} saved
              </span>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-white/10 p-6 text-sm text-gray-400">
                Loading addresses...
              </div>
            ) : !userId ? (
              <div className="rounded-2xl border border-white/10 p-6 text-sm text-gray-400">
                Sign in to view your addresses.
              </div>
            ) : addresses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-10 text-center">
                <div className="text-3xl">⌖</div>
                <h3 className="mt-4 font-semibold">No addresses saved</h3>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Add your first delivery address using the form.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map((item) => (
                  <article
                    key={item.id}
                    className={`rounded-2xl border p-5 transition ${
                      item.is_default
                        ? "border-red-500/50 bg-red-500/[0.06]"
                        : "border-white/10 bg-white/[0.04] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-lg">
                          ⌖
                        </div>
                        <div className="min-w-0">
                          <h3 className="break-words font-semibold">
                            {item.full_name}
                          </h3>
                          <p className="mt-1 text-xs text-gray-500">
                            {item.phone}
                          </p>
                        </div>
                      </div>

                      {item.is_default && (
                        <span className="shrink-0 rounded-full bg-red-500/15 px-3 py-1 text-xs font-medium text-red-300">
                          Default
                        </span>
                      )}
                    </div>

                    <div className="ml-1 mt-4 border-l border-white/10 pl-4 text-sm leading-6 text-gray-300">
                      <p>{item.address}</p>
                      <p>
                        {item.city}, {item.state} {item.pincode}
                      </p>
                      <p className="text-gray-400">{item.country}</p>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-white/10 pt-4">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="text-sm font-medium text-white transition hover:text-red-400"
                      >
                        ✎ Edit
                      </button>

                      {!item.is_default && (
                        <button
                          type="button"
                          disabled={busyId === item.id}
                          onClick={() => setDefaultAddress(item.id)}
                          className="text-sm text-gray-400 transition hover:text-white disabled:opacity-50"
                        >
                          {busyId === item.id ? "Updating..." : "Set as default"}
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={busyId === item.id}
                        onClick={() => deleteAddress(item.id)}
                        className="ml-auto text-sm text-red-400 transition hover:text-red-300 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        {message && (
          <div
            role="status"
            aria-live="polite"
            className={`mt-6 rounded-xl border p-4 text-sm ${
              messageType === "error"
                ? "border-red-500/30 bg-red-500/10 text-red-300"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
