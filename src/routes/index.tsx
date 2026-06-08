import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, Truck, Wrench, BadgePercent, Bell, Timer, ArrowRight } from "lucide-react";
import { HeroSlider } from "@/components/site/HeroSlider";
import { SectionRow } from "@/components/site/SectionRow";
import { products } from "@/lib/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LISA VOLT LINK — Lighting, CCTV & Electrical Shop in Kigali" },
      { name: "description", content: "Shop premium lighting, CCTV cameras and electrical accessories in Rwanda. Hot deals, expert technicians, fast delivery in Kigali." },
      { property: "og:title", content: "LISA VOLT LINK — Lighting, CCTV & Electrical" },
      { property: "og:description", content: "Shop premium lighting, CCTV and electrical accessories in Rwanda." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "LISA VOLT LINK",
          url: "https://lisavoltli.lovable.app/",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://lisavoltli.lovable.app/search?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "LISA VOLT LINK",
          url: "https://lisavoltli.lovable.app/",
          description:
            "Rwanda's trusted shop for lighting, CCTV cameras and electrical accessories with certified installation technicians in Kigali.",
          areaServed: "RW",
        }),
      },
    ],
  }),
  component: Index,
});


function useCountdown(target: Date) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff / 3600000) % 24);
  const m = Math.floor((diff / 60000) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return { d, h, m, s };
}

const WHY = [
  { Icon: ShieldCheck, title: "Quality Products", desc: "Genuine brands, tested and certified." },
  { Icon: Truck, title: "Fast Delivery", desc: "Same-day in Kigali, nationwide within 48h." },
  { Icon: Wrench, title: "Expert Technicians", desc: "Certified installers across Rwanda." },
  { Icon: BadgePercent, title: "Best Prices", desc: "Competitive prices and weekly deals." },
];

function Index() {
  const hot = products.filter((p) => p.badge === "HOT MODEL" || p.badge === "BEST SELLER");
  const trending = products.filter((p) => p.badge === "TRENDING" || p.rating >= 4.7).slice(0, 5);
  const newArrivals = products.filter((p) => p.badge === "NEW ARRIVAL").concat(products.slice(0, 3)).slice(0, 5);
  const bf = products.filter((p) => p.badge === "BLACK FRIDAY" || p.oldPrice);
  const stockOnWay = products.filter((p) => p.badge === "STOCK ON THE WAY");

  const { d, h, m, s } = useCountdown(new Date(Date.now() + 3 * 86400000 + 5 * 3600000));

  return (
    <>
      <HeroSlider />

      {/* Why Choose Us */}
      <section className="container-x py-12 md:py-14" aria-labelledby="why-choose-us">
        <h2 id="why-choose-us" className="text-2xl md:text-3xl font-extrabold text-navy mb-6">Why choose LISA VOLT LINK</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {WHY.map(({ Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 p-5 rounded-xl bg-card border border-border hover:border-yellow transition-colors">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-yellow/15 text-yellow-dark shrink-0">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-navy">{title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-x" aria-labelledby="shop-by-category">
        <h2 id="shop-by-category" className="text-2xl md:text-3xl font-extrabold text-navy mb-6">Shop by category</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { name: "Lighting", count: "11+ subcategories", color: "from-yellow/30 to-yellow/5" },
            { name: "CCTV Cameras", count: "8+ subcategories", color: "from-blue-500/30 to-blue-500/5" },
            { name: "Electrical", count: "12+ subcategories", color: "from-emerald-500/30 to-emerald-500/5" },
          ].map((c) => (
            <Link key={c.name} to="/products" className="group relative overflow-hidden rounded-2xl bg-navy text-white p-8 hover:shadow-2xl transition-shadow">
              <div className={`absolute inset-0 bg-gradient-to-br ${c.color} opacity-50 group-hover:opacity-80 transition-opacity`} />
              <div className="relative">
                <p className="text-xs uppercase tracking-widest text-yellow">Shop</p>
                <h3 className="mt-2 text-2xl font-extrabold">{c.name}</h3>
                <p className="mt-1 text-white/80 text-sm">{c.count}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-yellow font-semibold text-sm">
                  Explore <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <SectionRow eyebrow="🔥 Hot Models" title="Most popular this month" products={hot} />

      {/* Black Friday Banner */}
      <section className="container-x py-8">
        <div className="rounded-2xl bg-black text-white overflow-hidden">
          <div className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-yellow font-bold uppercase tracking-widest text-xs">⚫ Black Friday</p>
              <h2 className="mt-2 text-3xl md:text-4xl font-extrabold">Up to <span className="text-yellow">30% OFF</span> sitewide</h2>
              <p className="mt-2 text-white/70 max-w-md">Limited-time deals on lighting, CCTV and electrical accessories. Ends soon.</p>
            </div>
            <div className="flex gap-3">
              {[["DAYS", d], ["HRS", h], ["MIN", m], ["SEC", s]].map(([l, v]) => (
                <div key={String(l)} className="bg-navy rounded-lg px-4 py-3 min-w-[64px] text-center">
                  <p className="text-2xl font-extrabold text-yellow tabular-nums">{String(v).padStart(2, "0")}</p>
                  <p className="text-[10px] tracking-widest text-white/60">{l}</p>
                </div>
              ))}
            </div>
            <Link to="/deals" className="btn-yellow">Shop Deals <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      <SectionRow eyebrow="📈 Trending Now" title="What customers are loving" products={trending} />
      <SectionRow eyebrow="✨ New Arrivals" title="Just landed in our store" products={newArrivals} />

      {bf.length > 0 && (
        <SectionRow eyebrow="🏷️ Black Friday Deals" title="Save big this week" products={bf} viewAll="/deals" />
      )}

      {/* Stock on the way */}
      {stockOnWay.length > 0 && (
        <section className="container-x py-12">
          <div className="rounded-2xl bg-muted p-8">
            <div className="flex items-center gap-2 text-blue-600">
              <Timer className="h-4 w-4" />
              <p className="text-xs font-bold uppercase tracking-widest">Stock On The Way</p>
            </div>
            <h2 className="mt-2 text-2xl md:text-3xl font-extrabold text-navy">Coming soon — get notified first</h2>
            <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stockOnWay.map((p) => (
                <div key={p.id} className="flex gap-3 items-center bg-card p-4 rounded-xl border border-border">
                  <img src={p.image} alt={p.name} className="h-16 w-16 rounded-lg object-cover" loading="lazy" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-navy line-clamp-1">{p.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{p.subcategory}</p>
                  </div>
                  <button className="btn-navy !px-3 !py-2 text-xs"><Bell className="h-3.5 w-3.5" /> Notify</button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Brands */}
      <section className="container-x py-12">
        <h2 className="text-center text-2xl md:text-3xl font-extrabold text-navy">Featured Brands</h2>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {["Philips", "Hikvision", "Schneider", "Dahua", "Legrand", "Tuya"].map((b) => (
            <div key={b} className="h-20 grid place-items-center rounded-xl border border-border bg-card text-navy font-bold text-lg tracking-wide hover:border-yellow hover:text-yellow-dark transition-colors">
              {b}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
