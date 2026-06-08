import { useEffect, useState } from "react";

type Key = "lvl_cart" | "lvl_wishlist" | "lvl_recent" | "lvl_compare";

function read<T>(k: Key, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(k: Key, v: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(k, JSON.stringify(v));
  window.dispatchEvent(new CustomEvent("lvl-store", { detail: k }));
}

export type CartItem = { id: string; qty: number };

export function useStore<T>(k: Key, fallback: T) {
  const [val, setVal] = useState<T>(() => read(k, fallback));
  useEffect(() => {
    const onUpdate = (e: Event) => {
      const ce = e as CustomEvent<Key>;
      if (ce.detail === k) setVal(read(k, fallback));
    };
    window.addEventListener("lvl-store", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("lvl-store", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [k]);
  return val;
}

/* Cart */
export const useCart = () => useStore<CartItem[]>("lvl_cart", []);
export function addToCart(id: string, qty = 1) {
  const cur = read<CartItem[]>("lvl_cart", []);
  const i = cur.findIndex((c) => c.id === id);
  if (i >= 0) cur[i].qty += qty;
  else cur.push({ id, qty });
  write("lvl_cart", cur);
}
export function setCartQty(id: string, qty: number) {
  const cur = read<CartItem[]>("lvl_cart", []).map((c) => (c.id === id ? { ...c, qty } : c)).filter((c) => c.qty > 0);
  write("lvl_cart", cur);
}
export function removeFromCart(id: string) {
  write("lvl_cart", read<CartItem[]>("lvl_cart", []).filter((c) => c.id !== id));
}
export function clearCart() { write("lvl_cart", []); }

/* Wishlist */
export const useWishlist = () => useStore<string[]>("lvl_wishlist", []);
export function toggleWishlist(id: string) {
  const cur = read<string[]>("lvl_wishlist", []);
  write("lvl_wishlist", cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
}

/* Recently viewed */
export const useRecent = () => useStore<string[]>("lvl_recent", []);
export function pushRecent(id: string) {
  const cur = read<string[]>("lvl_recent", []).filter((x) => x !== id);
  cur.unshift(id);
  write("lvl_recent", cur.slice(0, 8));
}

/* Compare */
export const useCompare = () => useStore<string[]>("lvl_compare", []);
export function toggleCompare(id: string) {
  const cur = read<string[]>("lvl_compare", []);
  if (cur.includes(id)) write("lvl_compare", cur.filter((x) => x !== id));
  else if (cur.length < 4) write("lvl_compare", [...cur, id]);
}
