
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Product = {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  image: string;
  category: string;
  is_on_sale: boolean;
  is_out_of_stock: boolean;
};

type ProductDraft = {
  price: string;
  is_on_sale: boolean;
  is_out_of_stock: boolean;
};

const money = (value: number | null | undefined) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));

export default function AdminProductsPage() {
  const supabase = useMemo(() => createClient(), []);

  const [products, setProducts] = useState<Product[]>([]);
  const [drafts, setDrafts] = useState<Record<string, ProductDraft>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [signedOut, setSignedOut] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");
    setSignedOut(false);
    setForbidden(false);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        setSignedOut(true);
        setProducts([]);
        setDrafts({});
        return;
      }

      const response = await fetch("/api/admin/products", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
      });

      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        setSignedOut(true);
        setProducts([]);
        setDrafts({});
        return;
      }

      if (response.status === 403) {
        setForbidden(true);
        setProducts([]);
        setDrafts({});
        return;
      }

      if (!response.ok) {
        throw new Error(
          result.error || `Unable to load products (${response.status}).`,
        );
      }

      if (!Array.isArray(result.products)) {
        throw new Error("The products API returned an unexpected response.");
      }

      const received: Product[] = result.products.map(
        (product: Record<string, unknown>) => ({
          id: String(product.id ?? ""),
          name: String(product.name ?? "Unnamed product"),
          price: Number(product.price ?? 0),
          original_price:
            product.original_price == null
              ? null
              : Number(product.original_price),
          image: String(product.image ?? ""),
          category: String(product.category ?? ""),
          is_on_sale: product.is_on_sale === true,
          is_out_of_stock: product.is_out_of_stock === true,
        }),
      );

      setProducts(received);

      const nextDrafts: Record<string, ProductDraft> = {};

      for (const product of received) {
        nextDrafts[product.id] = {
          price: String(product.price),
          is_on_sale: product.is_on_sale,
          is_out_of_stock: product.is_out_of_stock,
        };
      }

      setDrafts(nextDrafts);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load products.",
      );
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadProducts();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setSignedOut(true);
        setProducts([]);
        setDrafts({});
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        void loadProducts();
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProducts, supabase]);

  const updateDraft = (
    id: string,
    changes: Partial<ProductDraft>,
  ) => {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        ...changes,
      },
    }));

    setNotice("");
    setError("");
  };

  const hasChanges = (product: Product) => {
    const draft = drafts[product.id];

    if (!draft) return false;

    return (
      draft.price !== String(product.price) ||
      draft.is_on_sale !== product.is_on_sale ||
      draft.is_out_of_stock !== product.is_out_of_stock
    );
  };

  const saveProduct = async (product: Product) => {
    const draft = drafts[product.id];

    if (!draft) return;

    const trimmedPrice = draft.price.trim();
    const price = Number(trimmedPrice);

    if (
      trimmedPrice === "" ||
      !Number.isSafeInteger(price) ||
      price <= 0
    ) {
      setError(
        `Enter a valid selling price greater than zero for ${product.name}.`,
      );
      setNotice("");
      return;
    }

    if (!hasChanges(product)) {
      setNotice(`No changes to save for ${product.name}.`);
      setError("");
      return;
    }

    setSavingId(product.id);
    setError("");
    setNotice("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        setSignedOut(true);
        return;
      }

      const response = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: product.id,
          price,
          is_on_sale: draft.is_on_sale,
          is_out_of_stock: draft.is_out_of_stock,
        }),
        cache: "no-store",
      });

      const result = await response.json().catch(() => ({}));

      if (response.status === 401) {
        setSignedOut(true);
        return;
      }

      if (response.status === 403) {
        setForbidden(true);
        return;
      }

      if (!response.ok) {
        throw new Error(
          result.error || `Unable to save changes (${response.status}).`,
        );
      }

      const updated = result.product as Partial<Product>;

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                price: Number(updated.price ?? price),
                is_on_sale:
                  updated.is_on_sale ?? draft.is_on_sale,
                is_out_of_stock:
                  updated.is_out_of_stock ?? draft.is_out_of_stock,
              }
            : item,
        ),
      );

      setDrafts((current) => ({
        ...current,
        [product.id]: {
          price: String(updated.price ?? price),
          is_on_sale: updated.is_on_sale ?? draft.is_on_sale,
          is_out_of_stock:
            updated.is_out_of_stock ?? draft.is_out_of_stock,
        },
      }));

      setNotice(`${product.name} settings saved successfully.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save product settings.",
      );
    } finally {
      setSavingId(null);
    }
  };

  if (signedOut || forbidden) {
    return (
      <main className="page">
        <section className="message-card">
          <div className="brand">
            PALMYRA<span>.</span>
          </div>
          <h1>
            {signedOut
              ? "Sign-in required"
              : "Administrator access only"}
          </h1>
          <p>
            {signedOut
              ? "Sign in with your administrator account to manage product settings."
              : "Your signed-in account is not authorized to manage products."}
          </p>
          <Link href="/login?next=/admin/products" className="button primary">
            Go to sign in →
          </Link>
          <Link href="/admin" className="back-link">
            Return to Orders Dashboard
          </Link>
        </section>
        <style jsx>{styles}</style>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="container">
        <header className="topbar">
          <div>
            <div className="brand">
              PALMYRA<span>.</span>
            </div>
            <div className="subtitle">Store administration</div>
          </div>

          <div className="header-actions">
            <Link href="/admin" className="button">
              Orders Dashboard
            </Link>
            <Link href="/" className="button">
              View website
            </Link>
            <button
              type="button"
              className="button primary"
              onClick={() => void loadProducts()}
              disabled={loading}
            >
              {loading ? "Loading..." : "↻ Refresh"}
            </button>
          </div>
        </header>

        <section className="heading">
          <h1>Product settings</h1>
          <p>
            Manage the selling price, sale label and availability of your
            existing products. Product creation, deletion, images and MRP
            remain outside this dashboard.
          </p>
        </section>

        <div className="notice-box">
          <strong>How availability works</strong>
          <p>
            Mark a product out of stock to prevent checkout. Sale status is
            separate: enabling a sale displays the “On Sale” label, but does
            not automatically calculate a discount.
          </p>
        </div>

        {error && (
          <div className="alert error" role="alert">
            {error}
          </div>
        )}

        {notice && (
          <div className="alert success" role="status">
            {notice}
          </div>
        )}

        {loading ? (
          <div className="empty">Loading existing products...</div>
        ) : products.length === 0 ? (
          <div className="empty">
            No products were returned by the API.
          </div>
        ) : (
          <section className="products">
            {products.map((product) => {
              const draft = drafts[product.id];
              if (!draft) return null;

              const changed = hasChanges(product);
              const saving = savingId === product.id;

              return (
                <article className="product-card" key={product.id}>
                  <div className="product-heading">
                    <div className="product-image">
                      {product.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.image} alt={product.name} />
                      ) : (
                        <span>No image</span>
                      )}
                    </div>

                    <div className="product-info">
                      <div className="category">{product.category}</div>
                      <h2>{product.name}</h2>
                      <div className="product-id">
                        Product ID: {product.id}
                      </div>
                      <div className="price-info">
                        <span>
                          Current selling price: <strong>{money(product.price)}</strong>
                        </span>
                        <span>
                          MRP:{" "}
                          <strong>
                            {product.original_price == null
                              ? "Not set"
                              : money(product.original_price)}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="editor">
                    <label className="field">
                      <span>Current selling price (₹)</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        inputMode="numeric"
                        value={draft.price}
                        onChange={(event) =>
                          updateDraft(product.id, {
                            price: event.target.value,
                          })
                        }
                        aria-label={`Selling price for ${product.name}`}
                      />
                      <small>
                        This is the price used for new orders. MRP is not
                        changed here.
                      </small>
                    </label>

                    <div className="toggle-list">
                      <label className="toggle-row">
                        <span>
                          <strong>On Sale</strong>
                          <small>
                            Show the sale label on the customer-facing store.
                          </small>
                        </span>
                        <input
                          type="checkbox"
                          checked={draft.is_on_sale}
                          onChange={(event) =>
                            updateDraft(product.id, {
                              is_on_sale: event.target.checked,
                            })
                          }
                        />
                      </label>

                      <label className="toggle-row">
                        <span>
                          <strong>Out of Stock</strong>
                          <small>
                            Mark unavailable and block checkout for this product.
                          </small>
                        </span>
                        <input
                          type="checkbox"
                          checked={draft.is_out_of_stock}
                          onChange={(event) =>
                            updateDraft(product.id, {
                              is_out_of_stock: event.target.checked,
                            })
                          }
                        />
                      </label>
                    </div>
                  </div>

                  <div className="card-footer">
                    <span className={changed ? "changed" : "unchanged"}>
                      {changed ? "Unsaved changes" : "All changes saved"}
                    </span>
                    <button
                      type="button"
                      className="button primary save-button"
                      disabled={saving || !changed}
                      onClick={() => void saveProduct(product)}
                    >
                      {saving ? "Saving..." : "Save settings"}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        <footer>
          <Link href="/admin">← Back to Orders Dashboard</Link>
        </footer>
      </div>

      <style jsx>{styles}</style>
    </main>
  );
}

const styles = `
  .page {
    min-height: 100vh;
    box-sizing: border-box;
    padding: 30px;
    background: #090909;
    color: #f5f5f5;
    font-family: Arial, Helvetica, sans-serif;
  }

  .container {
    width: 100%;
    max-width: 1180px;
    margin: 0 auto;
  }

  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 18px;
    margin-bottom: 42px;
  }

  .brand {
    color: #fff;
    font-size: 25px;
    font-weight: 900;
    letter-spacing: 2px;
  }

  .brand span {
    color: #e11d2e;
  }

  .subtitle {
    margin-top: 7px;
    color: #888;
    font-size: 13px;
  }

  .header-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 9px;
  }

  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 42px;
    box-sizing: border-box;
    padding: 10px 14px;
    border: 1px solid #353535;
    border-radius: 9px;
    background: #171717;
    color: #fff;
    font-family: inherit;
    font-size: 13px;
    font-weight: 700;
    text-decoration: none;
    cursor: pointer;
  }

  .button:hover {
    border-color: #777;
  }

  .button.primary {
    border-color: #e11d2e;
    background: #e11d2e;
  }

  .button.primary:hover {
    background: #c91626;
  }

  .button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .heading {
    margin-bottom: 24px;
  }

  .heading h1 {
    margin: 0;
    font-size: clamp(29px, 5vw, 40px);
    letter-spacing: -1px;
  }

  .heading p {
    max-width: 760px;
    margin: 12px 0 0;
    color: #aaa;
    font-size: 14px;
    line-height: 1.8;
  }

  .notice-box {
    margin-bottom: 22px;
    padding: 18px 20px;
    border: 1px solid #343434;
    border-radius: 12px;
    background: #131313;
    line-height: 1.7;
  }

  .notice-box strong {
    font-size: 13px;
  }

  .notice-box p {
    margin: 6px 0 0;
    color: #aaa;
    font-size: 13px;
  }

  .alert {
    margin: 16px 0;
    padding: 14px 16px;
    border: 1px solid #444;
    border-radius: 9px;
    font-size: 13px;
    line-height: 1.7;
    overflow-wrap: anywhere;
  }

  .error {
    border-color: #71313a;
    background: #241114;
    color: #ffb8bf;
  }

  .success {
    border-color: #285c3c;
    background: #102117;
    color: #a9edc0;
  }

  .products {
    display: grid;
    gap: 18px;
  }

  .product-card {
    min-width: 0;
    padding: 22px;
    border: 1px solid #2c2c2c;
    border-radius: 15px;
    background: #111;
  }

  .product-heading {
    display: flex;
    align-items: flex-start;
    gap: 18px;
  }

  .product-image {
    display: grid;
    flex: 0 0 105px;
    width: 105px;
    height: 105px;
    place-items: center;
    overflow: hidden;
    border: 1px solid #303030;
    border-radius: 11px;
    background: #1a1a1a;
    color: #777;
    font-size: 12px;
  }

  .product-image img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .product-info {
    min-width: 0;
    flex: 1;
  }

  .category {
    color: #aaa;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
  }

  .product-info h2 {
    margin: 7px 0;
    font-size: 20px;
    line-height: 1.4;
    overflow-wrap: anywhere;
  }

  .product-id {
    color: #777;
    font-size: 11px;
    overflow-wrap: anywhere;
  }

  .price-info {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 20px;
    margin-top: 12px;
    color: #aaa;
    font-size: 12px;
    line-height: 1.6;
  }

  .price-info strong {
    color: #f5f5f5;
  }

  .editor {
    display: grid;
    grid-template-columns: minmax(220px, 0.8fr) minmax(260px, 1.2fr);
    gap: 24px;
    margin-top: 24px;
    padding-top: 22px;
    border-top: 1px solid #292929;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 9px;
    color: #ddd;
    font-size: 13px;
    font-weight: 700;
  }

  .field input {
    width: 100%;
    min-height: 45px;
    box-sizing: border-box;
    padding: 10px 12px;
    border: 1px solid #393939;
    border-radius: 9px;
    outline: none;
    background: #090909;
    color: #fff;
    font-family: inherit;
    font-size: 15px;
  }

  .field input:focus {
    border-color: #e11d2e;
  }

  .field small,
  .toggle-row small {
    display: block;
    color: #929292;
    font-size: 11px;
    font-weight: 400;
    line-height: 1.6;
  }

  .toggle-list {
    display: grid;
    align-content: start;
    gap: 0;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 10px 0;
    cursor: pointer;
  }

  .toggle-row + .toggle-row {
    border-top: 1px solid #292929;
  }

  .toggle-row strong {
    display: block;
    margin-bottom: 5px;
    color: #f5f5f5;
    font-size: 13px;
  }

  .toggle-row input {
    flex: 0 0 auto;
    width: 19px;
    height: 19px;
    accent-color: #e11d2e;
    cursor: pointer;
  }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 22px;
    padding-top: 18px;
    border-top: 1px solid #292929;
  }

  .changed,
  .unchanged {
    font-size: 12px;
  }

  .changed {
    color: #f2d58a;
  }

  .unchanged {
    color: #8fe0ad;
  }

  .save-button {
    min-width: 140px;
  }

  .empty {
    padding: 42px 18px;
    border: 1px solid #292929;
    border-radius: 12px;
    background: #111;
    color: #aaa;
    text-align: center;
    line-height: 1.8;
  }

  footer {
    margin-top: 30px;
    padding: 20px 0;
  }

  footer a,
  .back-link {
    color: #aaa;
    font-size: 13px;
    text-decoration: none;
  }

  footer a:hover,
  .back-link:hover {
    color: #fff;
  }

  .message-card {
    width: 100%;
    max-width: 450px;
    box-sizing: border-box;
    margin: 12vh auto 0;
    padding: 32px;
    border: 1px solid #303030;
    border-radius: 16px;
    background: #111;
    text-align: center;
  }

  .message-card h1 {
    margin: 26px 0 12px;
    font-size: 27px;
  }

  .message-card p {
    margin: 0;
    color: #aaa;
    font-size: 14px;
    line-height: 1.8;
  }

  .message-card .button {
    width: 100%;
    margin-top: 24px;
  }

  .back-link {
    display: block;
    margin-top: 22px;
  }

  @media (max-width: 720px) {
    .page {
      padding: 20px 14px;
    }

    .topbar {
      align-items: flex-start;
      margin-bottom: 30px;
    }

    .header-actions {
      width: 100%;
    }

    .header-actions .button {
      flex: 1;
    }

    .product-card {
      padding: 16px;
    }

    .product-heading {
      gap: 13px;
    }

    .product-image {
      flex-basis: 78px;
      width: 78px;
      height: 78px;
    }

    .product-info h2 {
      font-size: 17px;
    }

    .editor {
      grid-template-columns: 1fr;
      gap: 18px;
    }

    .card-footer {
      align-items: stretch;
      flex-direction: column;
    }

    .save-button {
      width: 100%;
    }
  }

  @media (max-width: 380px) {
    .product-heading {
      flex-direction: column;
    }

    .product-image {
      flex-basis: 100px;
      width: 100px;
      height: 100px;
    }

    .message-card {
      padding: 24px 18px;
    }
  }
`;
