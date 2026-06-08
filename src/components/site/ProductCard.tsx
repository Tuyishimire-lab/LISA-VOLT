import { Link } from "@tanstack/react-router";
import { Heart, ShoppingCart, Star, GitCompare } from "lucide-react";
import { BADGE_CLASSES, formatRWF, type Product } from "@/lib/products";
import { addToCart, toggleWishlist, useWishlist, toggleCompare, useCompare } from "@/lib/store";

export function ProductCard({ p }: { p: Product }) {
  const wl = useWishlist();
  const cmp = useCompare();
  const discount = p.oldPrice ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;
  return (
    <article className="group relative bg-card rounded-xl border border-border overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all">
      <Link to="/products/$id" params={{ id: p.id }} className="block relative aspect-square bg-muted overflow-hidden">
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {p.badge && (
          <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${BADGE_CLASSES[p.badge]}`}>
            {p.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-3 right-3 px-2 py-1 rounded bg-yellow text-navy text-xs font-bold">-{discount}%</span>
        )}
      </Link>

      <button
        onClick={(e) => { e.preventDefault(); toggleWishlist(p.id); }}
        aria-label="Wishlist"
        className={`absolute top-12 right-3 grid h-9 w-9 place-items-center rounded-full shadow-md transition-colors ${wl.includes(p.id) ? "bg-yellow text-navy" : "bg-white text-navy hover:bg-yellow"}`}
      >
        <Heart className={`h-4 w-4 ${wl.includes(p.id) ? "fill-current" : ""}`} />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); toggleCompare(p.id); }}
        aria-label="Compare"
        className={`absolute top-24 right-3 grid h-9 w-9 place-items-center rounded-full shadow-md transition-colors ${cmp.includes(p.id) ? "bg-yellow text-navy" : "bg-white text-navy hover:bg-yellow"}`}
      >
        <GitCompare className="h-4 w-4" />
      </button>

      <div className="p-4">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{p.subcategory}</p>
        <Link to="/products/$id" params={{ id: p.id }} className="block">
          <h3 className="mt-1 text-sm font-semibold text-navy line-clamp-1 hover:text-yellow-dark">{p.name}</h3>
        </Link>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.description}</p>

        <div className="mt-2 flex items-center gap-1 text-xs">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(p.rating) ? "fill-yellow text-yellow" : "text-muted-foreground/30"}`} />
          ))}
          <span className="ml-1 text-muted-foreground">{p.rating} ({p.reviews})</span>
        </div>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            {p.oldPrice && <p className="text-[11px] text-muted-foreground line-through">{formatRWF(p.oldPrice)}</p>}
            <p className="text-base font-bold text-navy">{formatRWF(p.price)}</p>
          </div>
          <button onClick={() => addToCart(p.id)} className="btn-yellow !px-3 !py-2 text-xs" aria-label="Add to cart">
            <ShoppingCart className="h-4 w-4" /> Add
          </button>
        </div>
      </div>
    </article>
  );
}
