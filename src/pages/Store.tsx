import { useEffect, useMemo, useState } from "react";
import { Search, ShoppingCart, Check, SlidersHorizontal } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { RequireAuth } from "@/components/RequireAuth";
import { CATEGORIES, PET_TYPES, formatINR, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type SortKey = "featured" | "price-asc" | "price-desc" | "name";

export default function StorePage() {
  const { products, cart, addToCart } = useStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [pet, setPet] = useState<string>("All");
  const [sort, setSort] = useState<SortKey>("featured");
  const [justAdded, setJustAdded] = useState<string | null>(null);

  useEffect(() => {
    document.title = "PawPoint Store — Pet Food, Medicine & Supplies";
  }, []);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const q = query.trim().toLowerCase();
      const matchesQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      const matchesCat = category === "All" || p.category === category;
      const matchesPet = pet === "All" || p.pet === pet || p.pet === "All Pets";
      return matchesQ && matchesCat && matchesPet;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, query, category, pet, sort]);

  const handleAdd = (id: string) => {
    addToCart(id);
    setJustAdded(id);
    window.setTimeout(() => setJustAdded((cur) => (cur === id ? null : cur)), 1200);
  };

  return (
    <RequireAuth>
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">Store</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {filtered.length} of {products.length} products
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search food, medicine, brands…"
              className="w-full rounded-full border border-input bg-card py-2.5 pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 space-y-3">
          <div className="flex flex-wrap gap-2">
            {["All", ...CATEGORIES].map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  category === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground/80 hover:border-primary/50",
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            {["All", ...PET_TYPES].map((t) => (
              <button
                key={t}
                onClick={() => setPet(t)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  pet === t
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-card text-foreground/70 hover:border-accent/50",
                )}
              >
                {t === "All" ? "All pets" : t}
              </button>
            ))}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="ml-auto rounded-full border border-input bg-card px-3 py-1.5 text-xs font-medium outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="font-display text-xl">No products match those filters.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different search or category.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => {
              const inCart = cart[p.id] ?? 0;
              const out = p.stock === 0;
              const low = !out && p.stock <= 10;
              const maxed = inCart >= p.stock;
              return (
                <article
                  key={p.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      width={512}
                      height={512}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold">
                      {p.category}
                    </span>
                    {out && (
                      <span className="absolute right-3 top-3 rounded-full bg-destructive px-2.5 py-1 text-xs font-semibold text-destructive-foreground">
                        Out of stock
                      </span>
                    )}
                    {low && (
                      <span className="absolute right-3 top-3 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                        Only {p.stock} left
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {p.brand} · {p.pet}
                    </p>
                    <h2 className="font-display mt-1 text-lg font-semibold leading-snug">
                      {p.name}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {p.description}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <span className="text-lg font-bold">{formatINR(p.price)}</span>
                      <button
                        disabled={out || maxed}
                        onClick={() => handleAdd(p.id)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                          justAdded === p.id
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-primary text-primary-foreground hover:opacity-90",
                          (out || maxed) && "cursor-not-allowed opacity-40",
                        )}
                      >
                        {justAdded === p.id ? (
                          <>
                            <Check className="h-4 w-4" /> Added
                          </>
                        ) : out ? (
                          "Sold out"
                        ) : maxed ? (
                          "Max stock"
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4" />
                            {inCart > 0 ? `Add (${inCart})` : "Add"}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </RequireAuth>
  );
}
