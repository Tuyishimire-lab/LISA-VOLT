import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Filter, Search, X } from "lucide-react";
import { z } from "zod";
import { ProductCard } from "@/components/site/ProductCard";
import { products, categoryTree } from "@/lib/products";
import { RequestProductBanner } from "@/components/site/RequestProductBanner";

const searchSchema = z.object({
  q: z.string().optional(),
  cat: z.enum(["All", "Lighting", "CCTV", "Electrical"]).optional(),
  sub: z.string().optional(),
});

export const Route = createFileRoute("/products")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Shop Products — LISA VOLT LINK" },
      { name: "description", content: "Browse lighting, CCTV cameras and electrical accessories at LISA VOLT LINK Rwanda. Filter by category, price and rating, with fast Kigali delivery." },
      { property: "og:title", content: "Shop Products — LISA VOLT LINK" },
      { property: "og:description", content: "Browse lighting, CCTV cameras and electrical accessories at LISA VOLT LINK Rwanda with fast Kigali delivery." },
      { property: "og:url", content: "/products" },
    ],
    links: [{ rel: "canonical", href: "/products" }],
  }),
  component: ProductsPage,
});

const BRANDS = ["Philips", "Hikvision", "Schneider", "Dahua", "Legrand", "Tuya"];

function ProductsPage() {
  const { q: initialQ, cat: initialCat, sub: initialSub } = Route.useSearch();
  const [q, setQ] = useState(initialQ ?? "");
  const [cat, setCat] = useState<"All" | "Lighting" | "CCTV" | "Electrical">(initialCat ?? "All");
  const [sub, setSub] = useState<string | null>(initialSub ?? null);
  const [sort, setSort] = useState<"popular" | "price-asc" | "price-desc" | "rating">("popular");
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [minRating, setMinRating] = useState(0);
  const [brands, setBrands] = useState<string[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const filtered = useMemo(() => {
    let r = products;
    if (cat !== "All") r = r.filter((p) => p.category === cat);
    if (sub) r = r.filter((p) => p.subcategory === sub);
    if (q.trim()) {
      const needle = q.toLowerCase();
      r = r.filter((p) => p.name.toLowerCase().includes(needle) || p.description.toLowerCase().includes(needle) || p.subcategory.toLowerCase().includes(needle));
    }
    r = r.filter((p) => p.price <= maxPrice);
    if (minRating > 0) r = r.filter((p) => p.rating >= minRating);
    if (brands.length) r = r.filter((p) => brands.some((b) => p.name.toLowerCase().includes(b.toLowerCase())));
    if (sort === "price-asc") r = [...r].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") r = [...r].sort((a, b) => b.price - a.price);
    if (sort === "popular") r = [...r].sort((a, b) => b.reviews - a.reviews);
    if (sort === "rating") r = [...r].sort((a, b) => b.rating - a.rating);
    return r;
  }, [cat, sub, q, sort, maxPrice, minRating, brands]);

  function reset() {
    setQ(""); setCat("All"); setSub(null); setMaxPrice(1000000); setMinRating(0); setBrands([]);
  }

  const sidebar = (
    <aside className="space-y-6">
      <div className="lg:hidden flex justify-between items-center">
        <h3 className="font-bold text-navy">Filters</h3>
        <button onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="w-full pl-9 pr-3 py-2.5 text-sm border border-border rounded-md outline-none focus:border-yellow" />
      </div>

      <div>
        <h3 className="text-sm font-bold text-navy uppercase tracking-wider mb-3 flex items-center gap-2"><Filter className="h-4 w-4" /> Categories</h3>
        <div className="space-y-1">
          {(["All", "Lighting", "CCTV", "Electrical"] as const).map((c) => (
            <button key={c} onClick={() => { setCat(c); setSub(null); }} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${cat === c ? "bg-yellow text-navy" : "hover:bg-muted text-foreground"}`}>
              {c} {c !== "All" && <span className="text-xs text-muted-foreground">({products.filter((p) => p.category === c).length})</span>}
            </button>
          ))}
        </div>
      </div>

      {cat !== "All" && (
        <div>
          <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-2">Subcategories</h4>
          <ul className="space-y-1.5 text-sm">
            {categoryTree.find((g) => g.name === cat)?.subs.map((s) => (
              <li key={s}>
                <button onClick={() => setSub(sub === s ? null : s)} className={`text-left w-full hover:text-yellow-dark ${sub === s ? "text-yellow-dark font-semibold" : "text-muted-foreground"}`}>
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-2">Max price</h4>
        <input type="range" min={5000} max={1000000} step={5000} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-yellow" />
        <p className="text-xs text-muted-foreground mt-1">Up to <span className="font-bold text-navy">{maxPrice.toLocaleString()} RWF</span></p>
      </div>

      <div>
        <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-2">Min rating</h4>
        <div className="flex gap-1">
          {[0, 3, 4, 4.5].map((r) => (
            <button key={r} onClick={() => setMinRating(r)} className={`flex-1 py-1.5 text-xs rounded border ${minRating === r ? "bg-yellow border-yellow text-navy font-bold" : "border-border text-muted-foreground hover:border-yellow"}`}>
              {r === 0 ? "Any" : `${r}+`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-2">Brands</h4>
        <div className="space-y-1.5">
          {BRANDS.map((b) => (
            <label key={b} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={brands.includes(b)} onChange={(e) => setBrands(e.target.checked ? [...brands, b] : brands.filter((x) => x !== b))} className="accent-yellow" />
              <span className="text-muted-foreground">{b}</span>
            </label>
          ))}
        </div>
      </div>

      <button onClick={reset} className="text-xs font-semibold text-yellow-dark hover:underline">Reset all filters</button>
    </aside>
  );

  return (
    <>
      <div className="bg-navy text-white">
        <div className="container-x py-10">
          <p className="text-yellow text-xs font-bold uppercase tracking-widest">Catalog</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold">Shop all products</h1>
          <p className="mt-2 text-white/70 max-w-2xl">Lighting, CCTV security cameras and electrical accessories — curated for Rwandan homes and businesses.</p>
        </div>
      </div>

      <div className="container-x py-10 grid lg:grid-cols-[260px_1fr] gap-8">
        <div className="hidden lg:block">{sidebar}</div>

        <section>
          <div className="flex items-center justify-between mb-5 gap-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileOpen(true)} className="lg:hidden btn-outline-navy !py-2 !px-3 text-xs"><Filter className="h-4 w-4" /> Filters</button>
              <p className="text-sm text-muted-foreground">{filtered.length} products</p>
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="border border-border rounded-md px-3 py-2 text-sm bg-card">
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-xl">
              <p className="text-navy font-bold">No products match your filters</p>
              <button onClick={reset} className="btn-yellow mt-4">Reset filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {filtered.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
          <RequestProductBanner />
        </section>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-background overflow-y-auto p-5">{sidebar}</div>
        </div>
      )}
    </>
  );
}
