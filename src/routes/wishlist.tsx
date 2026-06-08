import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { ProductCard } from "@/components/site/ProductCard";
import { products } from "@/lib/products";
import { useWishlist } from "@/lib/store";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "My Wishlist — LISA VOLT LINK" },
      { name: "description", content: "Your saved lighting, CCTV and electrical products at LISA VOLT LINK — keep favourites handy and order whenever you're ready." },
      { property: "og:title", content: "My Wishlist — LISA VOLT LINK" },
      { property: "og:description", content: "Your saved lighting, CCTV and electrical products at LISA VOLT LINK." },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/wishlist" }],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const ids = useWishlist();
  const items = products.filter((p) => ids.includes(p.id));
  return (
    <>
      <div className="bg-navy text-white">
        <div className="container-x py-10">
          <p className="text-yellow text-xs font-bold uppercase tracking-widest">Saved</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold">My Wishlist</h1>
        </div>
      </div>
      <div className="container-x py-10">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-14 w-14 mx-auto text-muted-foreground/40" />
            <h2 className="mt-4 text-xl font-bold text-navy">No saved items yet</h2>
            <Link to="/products" className="btn-yellow mt-6 inline-flex">Find products to love</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {items.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </div>
    </>
  );
}
