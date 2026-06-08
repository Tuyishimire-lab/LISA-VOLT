import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, ShoppingCart, Truck, ShieldCheck, RotateCcw, Star, Share2, GitCompare, Facebook, Twitter, Linkedin, Check } from "lucide-react";
import { products, formatRWF, BADGE_CLASSES } from "@/lib/products";
import { addToCart, toggleWishlist, useWishlist, pushRecent, toggleCompare, useCompare, useRecent } from "@/lib/store";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/products/$id")({
  loader: ({ params }) => {
    const p = products.find((x) => x.id === params.id);
    if (!p) throw notFound();
    return { product: p };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [] };
    const p = loaderData.product;
    const title = `${p.name} — LISA VOLT LINK`;
    const url = `https://lisavoltli.lovable.app/products/${params.id}`;
    return {
      meta: [
        { title },
        { name: "description", content: p.description },
        { property: "og:title", content: title },
        { property: "og:description", content: p.description },
        { property: "og:image", content: p.image },
        { property: "og:type", content: "product" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: `/products/${params.id}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: p.name,
            description: p.description,
            image: p.image,
            sku: p.id,
            category: p.category,
            brand: { "@type": "Brand", name: "LISA VOLT LINK" },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: p.rating,
              reviewCount: p.reviews,
            },
            offers: {
              "@type": "Offer",
              priceCurrency: "RWF",
              price: p.price,
              availability:
                p.badge === "OUT OF STOCK"
                  ? "https://schema.org/OutOfStock"
                  : "https://schema.org/InStock",
              url,
            },
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container-x py-20 text-center">
      <h1 className="text-2xl font-bold text-navy">Product not found</h1>
      <Link to="/products" className="btn-yellow mt-6 inline-flex">Back to shop</Link>
    </div>
  ),
  component: ProductDetail,
});


function ProductDetail() {
  const { product: p } = Route.useLoaderData();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const wl = useWishlist();
  const cmp = useCompare();
  const recentIds = useRecent();

  useEffect(() => { pushRecent(p.id); }, [p.id]);

  const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
  const recent = recentIds.map((id) => products.find((x) => x.id === id)).filter(Boolean).filter((x) => x!.id !== p.id).slice(0, 4) as typeof products;

  const discount = p.oldPrice ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  function handleAdd() {
    addToCart(p.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <>
      <div className="container-x py-4 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-navy">Home</Link> / <Link to="/products" className="hover:text-navy">Products</Link> / <span className="text-navy">{p.name}</span>
      </div>

      <section className="container-x grid lg:grid-cols-2 gap-10 pb-12">
        <div className="relative rounded-2xl bg-muted overflow-hidden aspect-square">
          <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
          {p.badge && <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase ${BADGE_CLASSES[p.badge as keyof typeof BADGE_CLASSES]}`}>{p.badge}</span>}
          {discount > 0 && <span className="absolute top-4 right-4 px-3 py-1 rounded bg-yellow text-navy text-sm font-bold">-{discount}%</span>}
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-yellow-dark font-bold">{p.category} · {p.subcategory}</p>
          <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-navy">{p.name}</h1>

          <div className="mt-3 flex items-center gap-2 text-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < Math.round(p.rating) ? "fill-yellow text-yellow" : "text-muted-foreground/30"}`} />
            ))}
            <span className="text-muted-foreground">{p.rating} · {p.reviews} reviews</span>
          </div>

          <div className="mt-5 flex items-end gap-3">
            <p className="text-3xl font-extrabold text-navy">{formatRWF(p.price)}</p>
            {p.oldPrice && <p className="text-base text-muted-foreground line-through mb-1">{formatRWF(p.oldPrice)}</p>}
          </div>

          <p className="mt-5 text-sm text-muted-foreground leading-relaxed">{p.description}. Genuine product backed by manufacturer warranty and our 7-day return policy. Free delivery within Kigali on orders above 100,000 RWF.</p>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center border border-border rounded-md overflow-hidden">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-navy hover:bg-muted">−</button>
              <span className="px-4 font-semibold text-navy tabular-nums">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-3 py-2 text-navy hover:bg-muted">+</button>
            </div>
            <button onClick={handleAdd} className="btn-yellow flex-1">
              {added ? <><Check className="h-4 w-4" /> Added to cart</> : <><ShoppingCart className="h-4 w-4" /> Add to Cart</>}
            </button>
            <button onClick={() => toggleWishlist(p.id)} aria-label="Wishlist" className={`grid h-11 w-11 place-items-center rounded-md border-2 transition-colors ${wl.includes(p.id) ? "bg-yellow border-yellow text-navy" : "border-navy text-navy hover:bg-navy hover:text-white"}`}>
              <Heart className={`h-5 w-5 ${wl.includes(p.id) ? "fill-current" : ""}`} />
            </button>
          </div>

          <button onClick={() => toggleCompare(p.id)} className="mt-3 inline-flex items-center gap-2 text-sm text-navy hover:text-yellow-dark font-semibold">
            <GitCompare className="h-4 w-4" /> {cmp.includes(p.id) ? "Remove from compare" : "Add to compare"}
          </button>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            {[
              { Icon: Truck, t: "Free delivery", s: "Kigali, orders 100k+" },
              { Icon: ShieldCheck, t: "Warranty", s: "Manufacturer backed" },
              { Icon: RotateCcw, t: "7-day returns", s: "Easy refunds" },
            ].map(({ Icon, t, s }) => (
              <div key={t} className="rounded-lg border border-border p-3">
                <Icon className="h-5 w-5 mx-auto text-yellow-dark" />
                <p className="mt-1 text-xs font-bold text-navy">{t}</p>
                <p className="text-[10px] text-muted-foreground">{s}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-2">
            <Share2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground mr-2">Share:</span>
            {[
              { Icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
              { Icon: Twitter, href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(p.name)}&url=${encodeURIComponent(shareUrl)}` },
              { Icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
            ].map(({ Icon, href }, i) => (
              <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="grid h-8 w-8 place-items-center rounded-full border border-border text-navy hover:bg-yellow hover:border-yellow transition-colors">
                <Icon className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-x py-10">
          <h2 className="text-2xl font-extrabold text-navy mb-5">Related products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {related.map((r) => <ProductCard key={r.id} p={r} />)}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section className="container-x py-10">
          <h2 className="text-2xl font-extrabold text-navy mb-5">Recently viewed</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {recent.map((r) => <ProductCard key={r.id} p={r} />)}
          </div>
        </section>
      )}
    </>
  );
}
