
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
};

const emptyAddress = {
  full_name: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState(emptyAddress);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadAddresses() {
    const supabase = createClient();
    const { data: { user }, error: authError } =
      await supabase.auth.getUser();

    if (authError || !user) {
      setMessage("Please sign in to manage your saved addresses.");
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
      setMessage("Unable to load addresses. Please try again.");
    } else {
      setAddresses((data ?? []) as Address[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    void loadAddresses();
  }, []);

  async function saveAddress(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!userId) {
      setMessage("Please sign in before saving an address.");
      return;
    }

    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("customer_addresses")
      .insert({ ...form, user_id: userId });

    if (error) {
      setMessage("Unable to save address. Please check your details and try again.");
    } else {
      setForm(emptyAddress);
      setMessage("Address saved successfully.");
      await loadAddresses();
    }

    setSaving(false);
  }

  async function deleteAddress(id: number) {
    if (!window.confirm("Delete this saved address?")) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("customer_addresses")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      setMessage("Unable to delete this address.");
    } else {
      setAddresses((current) =>
        current.filter((item) => item.id !== id)
      );
      setMessage("Address deleted.");
    }
  }

  const fieldClass =
    "w-full rounded-lg border border-white/10 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-500";

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/profile" className="text-sm text-gray-400 hover:text-white">
          ← Back to Profile
        </Link>

        <h1 className="mt-6 text-3xl font-bold">Saved Addresses</h1>
        <p className="mt-2 text-gray-400">
          Save and manage your Palmyra delivery addresses.
        </p>

        {loading ? (
          <p className="mt-8 text-gray-400">Loading addresses...</p>
        ) : !userId ? (
          <section className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
            <p>{message}</p>
            <Link href="/login" className="mt-4 inline-block rounded-lg bg-red-600 px-5 py-3 font-semibold">
              Sign In
            </Link>
          </section>
        ) : (
          <>
            <form onSubmit={saveAddress} className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-7">
              <h2 className="text-xl font-semibold">Add a new address</h2>

              <input required maxLength={100} placeholder="Full name" className={fieldClass} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              <input required type="tel" maxLength={20} placeholder="Phone number" className={fieldClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <textarea required maxLength={300} placeholder="House number, street, area" className={fieldClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />

              <div className="grid gap-4 sm:grid-cols-2">
                <input required maxLength={100} placeholder="City" className={fieldClass} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                <input required maxLength={100} placeholder="State" className={fieldClass} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                <input required maxLength={10} placeholder="PIN code" className={fieldClass} value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
                <input required maxLength={100} placeholder="Country" className={fieldClass} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </div>

              <button disabled={saving} className="w-full rounded-lg bg-red-600 px-5 py-3 font-semibold hover:bg-red-700 disabled:opacity-50">
                {saving ? "Saving..." : "Save Address"}
              </button>
            </form>

            {addresses.length > 0 && (
              <section className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold">Your addresses</h2>
                {addresses.map((item) => (
                  <article key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-5">
                    <h3 className="font-semibold">{item.full_name}</h3>
                    <p className="mt-2 text-gray-300">{item.address}</p>
                    <p className="text-gray-300">
                      {item.city}, {item.state} {item.pincode}
                    </p>
                    <p className="text-gray-400">{item.country} · {item.phone}</p>
                    <button type="button" onClick={() => deleteAddress(item.id)} className="mt-4 text-sm text-red-400 hover:text-red-300">
                      Delete address
                    </button>
                  </article>
                ))}
              </section>
            )}
          </>
        )}

        {message && userId && (
          <p role="status" className="mt-4 text-sm text-gray-300">{message}</p>
        )}
      </div>
    </main>
  );
}
