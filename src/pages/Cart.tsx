import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, CheckCircle2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { RequireAuth } from "@/components/RequireAuth";
import { formatINR, useStore } from "@/lib/store";

const GST_RATE = 0.05;

export default function CartPage() {
  const { products, cart, setCartQty, clearCart, placeOrder } = useStore();
  const [placed, setPlaced] = useState(false);

  useEffect(() => {
    document.title = "Your Cart — PawPoint";
  }, []);

  const items = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => ({ product: products.find((p) => p.id === id)!, qty }))
        .filter((i) => i.product),
    [cart, products],
  );

  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const gst = Math.round(subtotal * GST_RATE);
  const total = subtotal + gst;

  if (placed) {
    return (
      <RequireAuth>
        <AppHeader />
        <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
          <CheckCircle2 className="h-16 w-16 text-primary" />
          <h1 className="font-display mt-6 text-3xl font-semibold">Order placed!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Thank you — your items are being packed and stock levels have been updated in
            inventory.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              to="/store"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Continue shopping
            </Link>
            <Link
              to="/inventory"
              className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold hover:bg-secondary"
            >
              View inventory
            </Link>
          </div>
        </main>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Link
          to="/store"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to store
        </Link>
        <h1 className="font-display mt-2 text-3xl font-semibold">Your cart</h1>

        {items.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <ShoppingBag className="h-14 w-14 text-muted-foreground/50" />
            <p className="font-display mt-4 text-xl font-semibold">Your cart is empty</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add food, medicine or supplies from the store.
            </p>
            <Link
              to="/store"
              className="mt-6 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
            <ul className="space-y-4">
              {items.map(({ product: p, qty }) => (
                <li
                  key={p.id}
                  className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    width={512}
                    height={512}
                    className="h-24 w-24 shrink-0 rounded-xl object-cover"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {p.brand} · {p.category}
                        </p>
                        <h2 className="font-display font-semibold leading-snug">{p.name}</h2>
                      </div>
                      <button
                        onClick={() => setCartQty(p.id, 0)}
                        className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1 rounded-full border border-border">
                        <button
                          onClick={() => setCartQty(p.id, qty - 1)}
                          className="p-2 text-muted-foreground hover:text-foreground"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                        <button
                          onClick={() => setCartQty(p.id, Math.min(qty + 1, p.stock))}
                          disabled={qty >= p.stock}
                          className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-30"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="font-bold">{formatINR(p.price * qty)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="font-display text-lg font-semibold">Order summary</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-medium">{formatINR(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">GST (5%)</dt>
                  <dd className="font-medium">{formatINR(gst)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd className="font-medium text-primary">Free</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
                  <dt>Total</dt>
                  <dd>{formatINR(total)}</dd>
                </div>
              </dl>
              <button
                onClick={() => {
                  placeOrder();
                  setPlaced(true);
                }}
                className="mt-6 w-full rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
              >
                Place order
              </button>
              <button
                onClick={clearCart}
                className="mt-2 w-full rounded-lg px-4 py-2 text-xs font-medium text-muted-foreground hover:text-destructive"
              >
                Clear cart
              </button>
            </aside>
          </div>
        )}
      </main>
    </RequireAuth>
  );
}
