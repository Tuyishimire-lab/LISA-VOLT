import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, Mail, MapPin, MessageCircle, Send } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — LISA VOLT LINK Kigali" },
      { name: "description", content: "Get in touch with LISA VOLT LINK. Visit our Kigali shop, call +250 788 286 465 or send a message." },
      { property: "og:title", content: "Contact — LISA VOLT LINK" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <>
      <div className="bg-navy text-white">
        <div className="container-x py-14">
          <p className="text-yellow text-xs font-bold uppercase tracking-widest">Get in touch</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-extrabold">Talk to our team</h1>
          <p className="mt-3 text-white/70 max-w-2xl">Quotes, orders, installation requests — we're here to help.</p>
        </div>
      </div>

      <div className="container-x py-12 grid lg:grid-cols-2 gap-10">
        <div>
          <div className="space-y-4">
            {[
              { Icon: Phone, label: "Phone", value: "+250 788 286 465", href: "tel:+250788286465" },
              { Icon: MessageCircle, label: "WhatsApp", value: "+250 788 286 465", href: "https://wa.me/250788286465" },
              { Icon: Mail, label: "Email", value: "info@lisavoltlink.rw", href: "mailto:info@lisavoltlink.rw" },
              { Icon: MapPin, label: "Address", value: "Kigali, Rwanda" },
            ].map(({ Icon, label, value, href }) => (
              <a key={label} href={href} className="flex items-start gap-4 p-5 rounded-xl border border-border bg-card hover:border-yellow transition-colors">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-yellow/15 text-yellow-dark shrink-0"><Icon className="h-5 w-5" /></div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
                  <p className="text-base font-semibold text-navy">{value}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-6 rounded-xl overflow-hidden border border-border aspect-video">
            <iframe
              title="Kigali map"
              src="https://www.google.com/maps?q=Kigali,Rwanda&output=embed"
              className="w-full h-full"
              loading="lazy"
            />
          </div>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-4 h-fit"
        >
          <h2 className="text-2xl font-extrabold text-navy">Send us a message</h2>
          {sent && <div className="rounded-md bg-green-50 border border-green-200 text-green-800 text-sm p-3">Thanks! We'll get back to you shortly.</div>}
          <div className="grid sm:grid-cols-2 gap-4">
            <input required placeholder="Your name" className="border border-border rounded-md px-3 py-2.5 bg-background text-sm outline-none focus:border-yellow" />
            <input required type="email" placeholder="Email" className="border border-border rounded-md px-3 py-2.5 bg-background text-sm outline-none focus:border-yellow" />
          </div>
          <input placeholder="Phone (optional)" className="w-full border border-border rounded-md px-3 py-2.5 bg-background text-sm outline-none focus:border-yellow" />
          <input required placeholder="Subject" className="w-full border border-border rounded-md px-3 py-2.5 bg-background text-sm outline-none focus:border-yellow" />
          <textarea required placeholder="How can we help?" rows={5} className="w-full border border-border rounded-md px-3 py-2.5 bg-background text-sm outline-none focus:border-yellow resize-none" />
          <button type="submit" className="btn-yellow w-full"><Send className="h-4 w-4" /> Send Message</button>
        </form>
      </div>
    </>
  );
}
