import { createFileRoute } from "@tanstack/react-router";
import { ProductCard } from "@/components/site/ProductCard";
import { products } from "@/lib/products";
import { Timer } from "lucide-react";

export const Route = createFileRoute("/deals")({
  head: () => ({
    meta: [
      { title: "Deals & Promotions — LISA VOLT LINK" },
      { name: "description", content: "All discounted lighting, CCTV and electrical products in one place. Limited-time offers." },
      { property: "og:title", content: "Deals & Promotions — LISA VOLT LINK" },
      { property: "og:url", content: "/deals" },
    ],
    links: [{ rel: "canonical", href: "/deals" }],
  }),
  component: DealsPage,
});

function DealsPage() {
  const deals = products.filter((p) => p.oldPrice || p.badge === "BLACK FRIDAY" || p.badge === "LIMITED STOCK");
  return (
    <>
      <div className="bg-black text-white">
        <div className="container-x py-14">
          <p className="text-yellow text-xs font-bold uppercase tracking-widest flex items-center gap-2"><Timer className="h-4 w-4" /> Limited Time</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-extrabold">Deals & <span className="text-yellow">Promotions</span></h1>
          <p className="mt-3 text-white/70 max-w-2xl">Save big on selected lighting, CCTV cameras and electrical accessories. New deals every week.</p>
        </div>
      </div>
      <div className="container-x py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {deals.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </div>
    </>
  );
}
