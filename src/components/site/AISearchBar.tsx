import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Sparkles, Search, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { aiSuggest, type AISuggestResult } from "@/lib/ai-search.functions";
import { products } from "@/lib/products";

const TRENDING = ["LED strip", "outdoor camera", "smart switch", "solar inverter"];

export function AISearchBar({ compact = false }: { compact?: boolean }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AISuggestResult | null>(null);
  const navigate = useNavigate();
  const suggest = useServerFn(aiSuggest);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Debounced suggestion fetch
  useEffect(() => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setResult(null);
      setLoading(false);
      return;
    }
    const t = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      try {
        const r = await suggest({ data: { query: trimmed } });
        if (!ctrl.signal.aborted) setResult(r);
      } catch {
        if (!ctrl.signal.aborted) setResult({ product_ids: [], categories: [] });
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [q, suggest]);

  // Click outside closes dropdown
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return;
    setOpen(false);
    navigate({ to: "/search", search: { q: trimmed } as never });
  }

  const matched = (result?.product_ids ?? [])
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as typeof products;

  return (
    <div ref={containerRef} className={`relative ${compact ? "w-full" : "w-full md:flex-1 md:max-w-2xl"}`}>
      <form onSubmit={submit} className="flex items-center bg-white rounded-md overflow-hidden h-10 shadow-sm ring-1 ring-yellow/40 focus-within:ring-2 focus-within:ring-yellow">
        <div className="pl-3 pr-2 text-yellow-dark"><Sparkles className="h-4 w-4" /></div>
        <input
          type="search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Describe what you need… e.g. lights for my bedroom ceiling"
          aria-label="AI product search"
          className="flex-1 py-2 text-sm text-navy outline-none placeholder:text-muted-foreground/80"
        />
        <button
          type="submit"
          className="h-full px-4 bg-yellow text-navy hover:bg-yellow-dark transition-colors flex items-center gap-1.5 text-sm font-bold"
          aria-label="AI Search"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          <span className="hidden sm:inline">AI</span>
        </button>
      </form>

      {open && q.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-md shadow-xl ring-1 ring-black/5 overflow-hidden z-50 text-navy">
          {loading && matched.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
            </div>
          ) : matched.length === 0 && (result?.categories.length ?? 0) === 0 ? (
            <div className="p-4 text-sm">
              <p className="text-muted-foreground">No matches yet.</p>
              <Link to="/request-product" onClick={() => setOpen(false)} className="block mt-2 text-yellow-dark font-semibold hover:underline">
                Can't find it? Request this product →
              </Link>
            </div>
          ) : (
            <>
              {matched.length > 0 && (
                <div className="p-2">
                  <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Top matches</p>
                  {matched.map((p) => (
                    <Link
                      key={p.id}
                      to="/products/$id"
                      params={{ id: p.id }}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 p-2 rounded hover:bg-muted"
                    >
                      <img src={p.image} alt="" className="h-10 w-10 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.subcategory}</p>
                      </div>
                      <p className="text-sm font-bold text-yellow-dark">{p.price.toLocaleString()} RWF</p>
                    </Link>
                  ))}
                </div>
              )}
              {(result?.categories.length ?? 0) > 0 && (
                <div className="border-t border-border p-2">
                  <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Categories</p>
                  <div className="flex flex-wrap gap-1.5 px-2 pb-2">
                    {result!.categories.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => { setOpen(false); navigate({ to: "/search", search: { q: c } as never }); }}
                        className="px-2.5 py-1 text-xs rounded-full bg-muted hover:bg-yellow/30"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="border-t border-border p-2 flex items-center justify-between bg-muted/40">
                <button type="button" onClick={submit} className="text-xs font-semibold text-yellow-dark hover:underline px-2">
                  See all AI results for "{q.trim()}" →
                </button>
                <Link to="/request-product" onClick={() => setOpen(false)} className="text-xs text-muted-foreground hover:text-navy px-2">
                  Request a product
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      {open && q.trim().length < 2 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-md shadow-xl ring-1 ring-black/5 overflow-hidden z-50 text-navy p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Trending</p>
          <div className="flex flex-wrap gap-1.5">
            {TRENDING.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setOpen(false); navigate({ to: "/search", search: { q: t } as never }); }}
                className="px-2.5 py-1 text-xs rounded-full bg-muted hover:bg-yellow/30"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
