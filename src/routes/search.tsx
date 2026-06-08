import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { ProductCard } from "@/components/site/ProductCard";
import { products } from "@/lib/products";
import { aiSearch } from "@/lib/ai-search.functions";
import { RequestProductBanner } from "@/components/site/RequestProductBanner";

const searchSchema = z.object({ q: z.string().optional() });

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "AI Search — LISA VOLT LINK" },
      { name: "description", content: "AI-powered product search across lighting, CCTV cameras and electrical accessories." },
      { property: "og:title", content: "AI Search — LISA VOLT LINK" },
    ],
  }),

  component: SearchPage,
  errorComponent: ({ error }) => (
    <div className="container-x py-16 text-center">
      <p className="text-navy font-bold">Search failed</p>
      <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => <div className="container-x py-16 text-center text-muted-foreground">Page not found</div>,
});

type Sort = "relevant" | "price-asc" | "price-desc" | "rating";

function SearchPage() {
  const { q } = Route.useSearch();
  const query = (q ?? "").trim();
  const search = useServerFn(aiSearch);
  const [sort, setSort] = useState<Sort>("relevant");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["ai-search", query],
    queryFn: () => search({ data: { query } }),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const results = useMemo(() => {
    if (!data) return [];
    const ordered = data.product_ids
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean) as typeof products;
    if (sort === "price-asc") return [...ordered].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...ordered].sort((a, b) => b.price - a.price);
    if (sort === "rating") return [...ordered].sort((a, b) => b.rating - a.rating);
    return ordered;
  }, [data, sort]);

  return (
    <>
      <div className="bg-navy text-white">
        <div className="container-x py-10">
          <p className="text-yellow text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> AI Search
          </p>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold">
            {query ? <>Results for: <span className="text-yellow">{query}</span></> : "Search products"}
          </h1>
          {data && (
            <p className="mt-3 text-white/80 max-w-3xl text-sm md:text-base">{data.explanation}</p>
          )}
        </div>
      </div>

      <div className="container-x py-10">
        {!query ? (
          <p className="text-center text-muted-foreground">Type a query in the search bar above to get started.</p>
        ) : isLoading ? (
          <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-yellow" />
            <p className="text-sm">Searching the catalog with AI…</p>
          </div>
        ) : isError ? (
          <div className="text-center py-16 border border-dashed border-destructive/30 rounded-xl">
            <AlertCircle className="h-8 w-8 mx-auto text-destructive" />
            <p className="mt-2 text-navy font-bold">{(error as Error)?.message ?? "Search failed"}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5 gap-3">
              <p className="text-sm text-muted-foreground">
                {results.length} {results.length === 1 ? "result" : "results"} for "{query}"
              </p>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="border border-border rounded-md px-3 py-2 text-sm bg-card"
              >
                <option value="relevant">Most Relevant</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-xl space-y-4">
                <p className="text-navy font-bold text-lg">No products matched "{query}"</p>
                {data?.suggested_categories && data.suggested_categories.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Try these categories instead:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {data.suggested_categories.map((c) => (
                        <Link
                          key={c}
                          to="/search"
                          search={{ q: c } as never}
                          className="px-3 py-1.5 text-sm rounded-full bg-muted hover:bg-yellow/30"
                        >
                          {c}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                <div className="pt-2">
                  <Link to="/request-product" className="btn-yellow inline-flex">
                    Request this product
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {results.map((p) => <ProductCard key={p.id} p={p} />)}
              </div>
            )}
            <RequestProductBanner />
          </>
        )}
      </div>
    </>
  );
}
