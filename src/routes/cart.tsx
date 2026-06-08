import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, ShoppingBag, ArrowRight, FileText } from "lucide-react";
import { products, formatRWF } from "@/lib/products";
import { useCart, setCartQty, removeFromCart, clearCart } from "@/lib/store";


export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — LISA VOLT LINK" },
      { name: "description", content: "Review the lighting, CCTV and electrical items in your LISA VOLT LINK cart, request a quotation, or proceed to secure checkout." },
      { property: "og:title", content: "Your Cart — LISA VOLT LINK" },
      { property: "og:description", content: "Review your cart, request a quotation, or proceed to secure checkout at LISA VOLT LINK." },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/cart" }],
  }),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  const rows = cart.map((c) => ({ ...c, p: products.find((x) => x.id === c.id)! })).filter((r) => r.p);
  const subtotal = rows.reduce((s, r) => s + r.p.price * r.qty, 0);
  const shipping = subtotal > 0 && subtotal < 100000 ? 3000 : 0;
  const total = subtotal + shipping;

  return (
    <>
      <div className="bg-navy text-white">
        <div className="container-x py-10">
          <p className="text-yellow text-xs font-bold uppercase tracking-widest">Checkout</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold">Your Cart</h1>
        </div>
      </div>

      <div className="container-x py-10">
        {rows.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-14 w-14 mx-auto text-muted-foreground/40" />
            <h2 className="mt-4 text-xl font-bold text-navy">Your cart is empty</h2>
            <p className="mt-1 text-sm text-muted-foreground">Add products to start shopping.</p>
            <Link to="/products" className="btn-yellow mt-6 inline-flex">Browse Products</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_360px] gap-8">
            <div className="space-y-3">
              {rows.map((r) => (
                <div key={r.id} className="flex gap-4 p-4 bg-card border border-border rounded-xl">
                  <img src={r.p.image} alt={r.p.name} className="h-24 w-24 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <Link to="/products/$id" params={{ id: r.p.id }} className="font-bold text-navy hover:text-yellow-dark line-clamp-1">{r.p.name}</Link>
                    <p className="text-xs text-muted-foreground">{r.p.subcategory}</p>
                    <p className="mt-1 text-sm font-bold text-navy">{formatRWF(r.p.price)}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center border border-border rounded-md text-sm">
                        <button onClick={() => setCartQty(r.id, r.qty - 1)} className="px-2.5 py-1 hover:bg-muted">−</button>
                        <span className="px-3 tabular-nums font-semibold">{r.qty}</span>
                        <button onClick={() => setCartQty(r.id, r.qty + 1)} className="px-2.5 py-1 hover:bg-muted">+</button>
                      </div>
                      <button onClick={() => removeFromCart(r.id)} className="text-xs text-destructive hover:underline flex items-center gap-1"><Trash2 className="h-3.5 w-3.5" /> Remove</button>
                    </div>
                  </div>
                  <p className="font-extrabold text-navy whitespace-nowrap">{formatRWF(r.p.price * r.qty)}</p>
                </div>
              ))}
              <button onClick={clearCart} className="text-xs text-muted-foreground hover:text-destructive">Clear cart</button>
            </div>

            <aside className="h-fit p-6 bg-card border border-border rounded-xl sticky top-20">
              <h3 className="text-lg font-bold text-navy">Order summary</h3>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-semibold">{formatRWF(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="font-semibold">{shipping === 0 ? "Free" : formatRWF(shipping)}</span></div>
                <div className="border-t border-border pt-3 mt-3 flex justify-between text-base">
                  <span className="font-bold text-navy">Total</span>
                  <span className="font-extrabold text-navy">{formatRWF(total)}</span>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Link to="/checkout" className="btn-yellow w-full justify-center">
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/request-quotation" className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-bold text-yellow bg-navy hover:opacity-90 transition">
                  <FileText className="h-4 w-4" /> Request a Quotation
                </Link>
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground text-center">
                Not sure about the price? Request a quotation and negotiate your deal.
              </p>
              <p className="mt-2 text-[11px] text-muted-foreground text-center">Pay on delivery · Mobile Money · Bank Transfer</p>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
