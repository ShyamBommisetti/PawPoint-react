import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Package,
  Boxes,
  AlertTriangle,
  IndianRupee,
  Minus,
  Plus,
  Trash2,
  X,
  Search,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { RequireAuth } from "@/components/RequireAuth";
import { CATEGORIES, PET_TYPES, formatINR, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const LOW_STOCK = 10;

export default function InventoryPage() {
  const { products, updateStock, updatePrice, removeProduct } = useStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    document.title = "Inventory Management — PawPoint";
  }, []);

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const q = query.trim().toLowerCase();
        return (
          (category === "All" || p.category === category) &&
          (!q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q))
        );
      }),
    [products, query, category],
  );

  const stockValue = products.reduce((s, p) => s + p.price * p.stock, 0);
  const lowCount = products.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK).length;
  const outCount = products.filter((p) => p.stock === 0).length;

  return (
    <RequireAuth>
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">Inventory</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage stock, pricing and the product catalog.
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Add product
          </button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { icon: Package, label: "Products", value: String(products.length) },
            { icon: IndianRupee, label: "Stock value", value: formatINR(stockValue) },
            { icon: AlertTriangle, label: "Low stock", value: String(lowCount), warn: lowCount > 0 },
            { icon: Boxes, label: "Out of stock", value: String(outCount), warn: outCount > 0 },
          ].map(({ icon: Icon, label, value, warn }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  warn ? "bg-destructive/10 text-destructive" : "bg-secondary text-secondary-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-bold leading-tight">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search inventory…"
              className="w-64 rounded-full border border-input bg-card py-2 pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-full border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="All">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price (₹)</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const status =
                  p.stock === 0 ? "out" : p.stock <= LOW_STOCK ? "low" : "ok";
                return (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          loading="lazy"
                          width={512}
                          height={512}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.brand} · {p.pet}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{p.category}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        value={p.price}
                        onChange={(e) =>
                          updatePrice(p.id, Math.max(0, Number(e.target.value) || 0))
                        }
                        className="w-24 rounded-lg border border-input bg-background px-2 py-1 outline-none focus:ring-2 focus:ring-ring"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-1 rounded-full border border-border">
                        <button
                          onClick={() => updateStock(p.id, -1)}
                          className="p-1.5 text-muted-foreground hover:text-foreground"
                          aria-label="Decrease stock"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center font-semibold">{p.stock}</span>
                        <button
                          onClick={() => updateStock(p.id, 1)}
                          className="p-1.5 text-muted-foreground hover:text-foreground"
                          aria-label="Increase stock"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-semibold",
                          status === "ok" && "bg-secondary text-secondary-foreground",
                          status === "low" && "bg-accent/15 text-accent",
                          status === "out" && "bg-destructive/10 text-destructive",
                        )}
                      >
                        {status === "ok" ? "In stock" : status === "low" ? "Low" : "Out"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => removeProduct(p.id)}
                        className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        title="Delete product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showAdd && <AddProductModal onClose={() => setShowAdd(false)} />}
      </main>
    </RequireAuth>
  );
}

const fieldCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring";

function AddProductModal({ onClose }: { onClose: () => void }) {
  const { addProduct } = useStore();
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [pet, setPet] = useState<string>(PET_TYPES[0]);
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Product name is required.");
    const priceNum = Number(price);
    const stockNum = Number(stock);
    if (!Number.isFinite(priceNum) || priceNum <= 0) return setError("Enter a valid price.");
    if (!Number.isInteger(stockNum) || stockNum < 0) return setError("Enter a valid stock count.");
    addProduct({
      name: name.trim(),
      brand: brand.trim() || "PawPoint",
      category,
      pet,
      price: priceNum,
      stock: stockNum,
      description: description.trim() || "New catalog product.",
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Add product</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name *" className={fieldCls} />
          <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Brand" className={fieldCls} />
          <div className="grid grid-cols-2 gap-3">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={fieldCls}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select value={pet} onChange={(e) => setPet(e.target.value)} className={fieldCls}>
              {PET_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price (₹) *" inputMode="decimal" className={fieldCls} />
            <input value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Stock count *" inputMode="numeric" className={fieldCls} />
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description"
            rows={2}
            className={fieldCls}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Add to catalog
          </button>
        </form>
      </div>
    </div>
  );
}
