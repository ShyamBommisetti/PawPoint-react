import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import dogFood from "@/assets/dog-food.jpg";
import catFood from "@/assets/cat-food.jpg";
import syrup from "@/assets/syrup.jpg";
import tablets from "@/assets/tablets.jpg";
import shampoo from "@/assets/shampoo.jpg";
import toy from "@/assets/toy.jpg";

export const CATEGORIES = ["Food", "Medicine", "Supplements", "Grooming", "Accessories"] as const;
export const PET_TYPES = ["Dog", "Cat", "All Pets"] as const;

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  pet: string;
  price: number;
  stock: number;
  image: string;
  description: string;
}

export interface SessionUser {
  method: "email" | "otp";
  identifier: string;
}

const SEED_PRODUCTS: Product[] = [
  { id: "p1", name: "Premium Adult Dog Kibble", brand: "Premum", category: "Food", pet: "Dog", price: 1299, stock: 42, image: dogFood, description: "High-protein chicken & rice formula for adult dogs. 3 kg bag." },
  { id: "p2", name: "Gourmet Cat Food Tins", brand: "Whisker & Co", category: "Food", pet: "Cat", price: 449, stock: 68, image: catFood, description: "Grain-free salmon pâté multipack, 6 x 185 g tins." },
  { id: "p3", name: "Puppy Starter Kibble", brand: "Premum", category: "Food", pet: "Dog", price: 899, stock: 25, image: dogFood, description: "DHA-enriched small-bite kibble for puppies up to 12 months." },
  { id: "p4", name: "Veterinary Cough Syrup", brand: "Anmer", category: "Medicine", pet: "All Pets", price: 325, stock: 30, image: syrup, description: "Soothing expectorant syrup for dogs and cats. 100 ml bottle." },
  { id: "p5", name: "Deworming Oral Suspension", brand: "Anmer", category: "Medicine", pet: "All Pets", price: 275, stock: 8, image: syrup, description: "Broad-spectrum dewormer suspension. Vet-recommended dosage chart included." },
  { id: "p6", name: "Joint Care Tablets", brand: "VetPlus", category: "Supplements", pet: "Dog", price: 649, stock: 54, image: tablets, description: "Glucosamine & chondroitin chewable tablets, 60 count." },
  { id: "p7", name: "Skin & Coat Multivitamins", brand: "VetPlus", category: "Supplements", pet: "Cat", price: 549, stock: 12, image: tablets, description: "Omega-3 and biotin tablets for a healthy, glossy coat." },
  { id: "p8", name: "Gentle Pet Shampoo", brand: "Pet Crown", category: "Grooming", pet: "All Pets", price: 399, stock: 47, image: shampoo, description: "pH-balanced aloe & oatmeal shampoo, 250 ml pump bottle." },
  { id: "p9", name: "Anti-Tick Conditioning Wash", brand: "Pet Crown", category: "Grooming", pet: "Dog", price: 475, stock: 5, image: shampoo, description: "Neem-infused wash that repels ticks and fleas naturally." },
  { id: "p10", name: "Rope Tug & Ball Set", brand: "PlayPaw", category: "Accessories", pet: "Dog", price: 299, stock: 80, image: toy, description: "Braided cotton rope with a tough tennis ball for active play." },
  { id: "p11", name: "Dental Chew Toy", brand: "PlayPaw", category: "Accessories", pet: "Dog", price: 349, stock: 33, image: toy, description: "Textured rubber chew that cleans teeth while dogs play." },
  { id: "p12", name: "Calming Cat Treats", brand: "Whisker & Co", category: "Supplements", pet: "Cat", price: 425, stock: 0, image: catFood, description: "L-theanine soft chews to ease travel and vet-visit anxiety." },
];

interface StoreContextValue {
  user: SessionUser | null;
  ready: boolean;
  login: (user: SessionUser) => void;
  logout: () => void;
  products: Product[];
  addProduct: (p: Omit<Product, "id" | "image">) => void;
  updateStock: (id: string, delta: number) => void;
  updatePrice: (id: string, price: number) => void;
  removeProduct: (id: string) => void;
  cart: Record<string, number>;
  addToCart: (id: string) => void;
  setCartQty: (id: string, qty: number) => void;
  clearCart: () => void;
  placeOrder: () => void;
  cartCount: number;
  cartTotal: number;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [cart, setCart] = useState<Record<string, number>>({});

  useEffect(() => {
    setUser(readJSON<SessionUser | null>("pawpoint:user", null));
    setProducts(readJSON<Product[]>("pawpoint:products", SEED_PRODUCTS));
    setCart(readJSON<Record<string, number>>("pawpoint:cart", {}));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem("pawpoint:user", JSON.stringify(user));
  }, [user, ready]);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem("pawpoint:products", JSON.stringify(products));
  }, [products, ready]);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem("pawpoint:cart", JSON.stringify(cart));
  }, [cart, ready]);

  const login = useCallback((u: SessionUser) => setUser(u), []);
  const logout = useCallback(() => {
    setUser(null);
    setCart({});
  }, []);

  const addProduct = useCallback((p: Omit<Product, "id" | "image">) => {
    setProducts((prev) => [
      ...prev,
      { ...p, id: `p${Date.now()}`, image: tablets },
    ]);
  }, []);

  const updateStock = useCallback((id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p)),
    );
  }, []);

  const updatePrice = useCallback((id: string, price: number) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, price } : p)));
  }, []);

  const removeProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCart((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const addToCart = useCallback((id: string) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  }, []);

  const setCartQty = useCallback((id: string, qty: number) => {
    setCart((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  }, []);

  const clearCart = useCallback(() => setCart({}), []);

  const placeOrder = useCallback(() => {
    setProducts((prev) =>
      prev.map((p) => {
        const qty = cart[p.id] ?? 0;
        return qty > 0 ? { ...p, stock: Math.max(0, p.stock - qty) } : p;
      }),
    );
    setCart({});
  }, [cart]);

  const cartCount = useMemo(
    () => Object.values(cart).reduce((a, b) => a + b, 0),
    [cart],
  );

  const cartTotal = useMemo(
    () =>
      Object.entries(cart).reduce((sum, [id, qty]) => {
        const p = products.find((pr) => pr.id === id);
        return sum + (p ? p.price * qty : 0);
      }, 0),
    [cart, products],
  );

  const value: StoreContextValue = {
    user,
    ready,
    login,
    logout,
    products,
    addProduct,
    updateStock,
    updatePrice,
    removeProduct,
    cart,
    addToCart,
    setCartQty,
    clearCart,
    placeOrder,
    cartCount,
    cartTotal,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function formatINR(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}
