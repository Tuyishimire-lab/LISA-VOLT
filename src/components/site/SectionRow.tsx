import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/products";

export function SectionRow({
  title,
  eyebrow,
  products,
  viewAll = "/products",
  accent = "navy",
}: {
  title: string;
  eyebrow?: string;
  products: Product[];
  viewAll?: string;
  accent?: "navy" | "yellow";
}) {
  return (
    <section className="container-x py-12 md:py-16">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          {eyebrow && (
            <span className={`text-xs font-bold uppercase tracking-widest ${accent === "yellow" ? "text-yellow-dark" : "text-yellow-dark"}`}>
              {eyebrow}
            </span>
          )}
          <h2 className="mt-1 text-2xl md:text-3xl font-extrabold text-navy">{title}</h2>
        </div>
        <Link to={viewAll} className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-navy hover:text-yellow-dark">
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
        {products.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}
