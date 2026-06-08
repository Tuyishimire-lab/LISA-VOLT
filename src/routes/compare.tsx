import { createFileRoute, Link } from "@tanstack/react-router";
import { X, GitCompare, Check, Star } from "lucide-react";
import { products, formatRWF } from "@/lib/products";
import { useCompare, toggleCompare, addToCart } from "@/lib/store";

export const Route = createFileRoute("/compare")({
  head: () => ({ meta: [{ title: "Compare Products — LISA VOLT LINK" }] }),
  component: ComparePage,
});

type Item = (typeof products)[number];

function ComparePage() {
  const ids = useCompare();
  const items = products.filter((p) => ids.includes(p.id));

  const rows: Array<[string, (p: Item) => React.ReactNode]> = [
    ["Price", (p) => <span className="font-bold text-navy">{formatRWF(p.price)}</span>],
    ["Category", (p) => `${p.category} · ${p.subcategory}`],
    ["Rating", (p) => <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-yellow text-yellow" />{p.rating} ({p.reviews})</span>],
    ["Availability", (p) => p.badge === "OUT OF STOCK" ? <span className="text-destructive">Out of stock</span> : <span className="text-green-600 inline-flex items-center gap-1"><Check className="h-3.5 w-3.5" /> In stock</span>],
    ["Description", (p) => <span className="text-xs text-muted-foreground">{p.description}</span>],
  ];

  return (
    <>
      <div className="bg-navy text-white">
        <div className="container-x py-10">
          <p className="text-yellow text-xs font-bold uppercase tracking-widest">Tools</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold">Compare Products</h1>
          <p className="mt-2 text-white/70 text-sm">Compare up to 4 products side-by-side.</p>
        </div>
      </div>

      <div className="container-x py-10">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <GitCompare className="h-14 w-14 mx-auto text-muted-foreground/40" />
            <h2 className="mt-4 text-xl font-bold text-navy">Nothing to compare yet</h2>
            <p className="text-sm text-muted-foreground mt-1">Add products from the catalog to compare them here.</p>
            <Link to="/products" className="btn-yellow mt-6 inline-flex">Browse Products</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-separate border-spacing-3">
              <tbody>
                <tr>
                  <th className="w-32 text-left text-xs uppercase text-muted-foreground"></th>
                  {items.map((p) => (
                    <td key={p.id} className="relative align-top w-1/4 bg-card border border-border rounded-xl p-4">
                      <button onClick={() => toggleCompare(p.id)} className="absolute top-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-muted hover:bg-destructive hover:text-white"><X className="h-3.5 w-3.5" /></button>
                      <img src={p.image} alt={p.name} className="aspect-square w-full object-cover rounded-lg" />
                      <Link to="/products/$id" params={{ id: p.id }} className="block mt-3 font-bold text-navy hover:text-yellow-dark line-clamp-2">{p.name}</Link>
                    </td>
                  ))}
                </tr>
                {rows.map(([label, fn]) => (
                  <tr key={label}>
                    <th className="text-left text-xs uppercase text-muted-foreground font-semibold align-top pt-2">{label}</th>
                    {items.map((p) => <td key={p.id} className="bg-card border border-border rounded-xl p-3 text-sm align-top">{fn(p)}</td>)}
                  </tr>
                ))}
                <tr>
                  <th></th>
                  {items.map((p) => (
                    <td key={p.id} className="p-2"><button onClick={() => addToCart(p.id)} className="btn-yellow w-full !py-2 text-sm">Add to cart</button></td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
