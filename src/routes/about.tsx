import { createFileRoute, Link } from "@tanstack/react-router";
import { Zap, Users, Award, Target } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — LISA VOLT LINK" },
      { name: "description", content: "LISA VOLT LINK is Rwanda's leading shop for lighting, CCTV security and electrical accessories. Based in Kigali, serving customers nationwide." },
      { property: "og:title", content: "About LISA VOLT LINK" },
      { property: "og:description", content: "Rwanda's leading shop for lighting, CCTV security and electrical accessories, based in Kigali." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <div className="bg-navy text-white">
        <div className="container-x py-14">
          <p className="text-yellow text-xs font-bold uppercase tracking-widest">About Us</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-extrabold max-w-3xl">Powering Rwanda with quality lighting, security and electrical solutions.</h1>
        </div>
      </div>

      <div className="container-x py-14 grid md:grid-cols-2 gap-10 items-start">
        <div>
          <p className="text-base text-foreground leading-relaxed">
            Based in Kigali, <strong>LISA VOLT LINK</strong> is a one-stop shop for everything electrical, lighting and CCTV security in Rwanda. We source genuine products from trusted global brands and deliver them with a network of certified technicians who install, configure and maintain.
          </p>
          <p className="mt-4 text-base text-foreground leading-relaxed">
            From a single bulb to a full smart-home build-out, from one dome camera to a multi-site CCTV deployment — our customers count on us for honest pricing, real expertise, and fast turnaround.
          </p>
          <div className="mt-6 flex gap-3">
            <Link to="/products" className="btn-yellow">Shop Products</Link>
            <Link to="/contact" className="btn-outline-navy">Contact Us</Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { Icon: Users, k: "5,000+", v: "Happy Customers" },
            { Icon: Award, k: "10+ yrs", v: "Industry Experience" },
            { Icon: Zap, k: "30+", v: "Subcategories" },
            { Icon: Target, k: "All Rwanda", v: "Delivery Coverage" },
          ].map(({ Icon, k, v }) => (
            <div key={v} className="rounded-xl border border-border bg-card p-6">
              <Icon className="h-6 w-6 text-yellow-dark" />
              <p className="mt-3 text-2xl font-extrabold text-navy">{k}</p>
              <p className="text-xs text-muted-foreground">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
