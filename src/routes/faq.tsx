import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  { q: "How do I place an order?", a: "Browse the catalog, add items to your cart, and proceed to checkout. You can also order directly via WhatsApp using the floating button." },
  { q: "Do you deliver outside Kigali?", a: "Yes. We deliver nationwide within 48 hours. Kigali orders ship same-day when placed before 4pm." },
  { q: "What payment methods do you accept?", a: "Mobile Money (MTN, Airtel), bank transfer, and cash on delivery within Kigali." },
  { q: "Do your products come with a warranty?", a: "All products carry the manufacturer warranty. Lighting: 1–2 years. CCTV: 2 years. Electrical: 6 months–1 year." },
  { q: "Can your technicians install at my home or office?", a: "Yes — book a certified technician on the Technicians page. We cover Kigali and major cities across Rwanda." },
  { q: "What is your return policy?", a: "Unused items in original packaging can be returned within 7 days for a full refund or exchange." },
  { q: "Do you offer bulk discounts for projects?", a: "Yes. Contact our sales team via the Contact page or WhatsApp for project pricing." },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — LISA VOLT LINK" },
      { name: "description", content: "Answers to common questions about ordering, delivery, installation, payment, and warranty at LISA VOLT LINK Rwanda." },
      { property: "og:title", content: "FAQ — LISA VOLT LINK" },
      { property: "og:description", content: "Common questions about ordering, delivery, installation, payment and warranty at LISA VOLT LINK." },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: FAQPage,
});


function FAQPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <>
      <div className="bg-navy text-white">
        <div className="container-x py-10">
          <p className="text-yellow text-xs font-bold uppercase tracking-widest">Help</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold">Frequently Asked Questions</h1>
        </div>
      </div>
      <div className="container-x py-10 max-w-3xl">
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <div key={i} className="border border-border rounded-xl bg-card overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-4 p-5 text-left">
                <span className="font-bold text-navy">{f.q}</span>
                <ChevronDown className={`h-5 w-5 text-yellow-dark transition-transform shrink-0 ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
