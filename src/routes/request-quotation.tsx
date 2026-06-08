import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { z } from "zod";
import { products, formatRWF } from "@/lib/products";
import { useCart, clearCart } from "@/lib/store";
import { createQuotationRequest } from "@/lib/quotations.functions";
import { Check, Copy, FileText, MapPin, Truck, Loader2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/request-quotation")({
  head: () => ({
    meta: [
      { title: "Request a Quotation — LISA VOLT LINK" },
      { name: "description", content: "Not sure about the price? Request a quotation and our team will reply within 2 hours." },
    ],
  }),
  component: RequestQuotationPage,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Required").max(120),
  phone: z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, "Valid phone required"),
  email: z.string().trim().email("Invalid email").max(255).optional().or(z.literal("")),
  delivery_pref: z.enum(["pickup", "delivery"]),
  delivery_location: z.string().trim().max(255).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

function RequestQuotationPage() {
  const navigate = useNavigate();
  const cart = useCart();
  const rows = cart.map((c) => ({ ...c, p: products.find((x) => x.id === c.id)! })).filter((r) => r.p);
  const grand = rows.reduce((s, r) => s + r.p.price * r.qty, 0);

  const create = useServerFn(createQuotationRequest);
  const [form, setForm] = useState({
    full_name: "", phone: "", email: "",
    delivery_pref: "pickup" as "pickup" | "delivery",
    delivery_location: "", notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ token: string; copied: boolean } | null>(null);
  const upd = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { if (i.path[0]) errs[String(i.path[0])] = i.message; });
      setErrors(errs);
      return;
    }
    if (rows.length === 0) return;
    setErrors({});
    setBusy(true);
    try {
      const res = await create({
        data: {
          ...parsed.data,
          items: rows.map((r) => ({
            product_id: r.p.id, product_name: r.p.name, qty: r.qty, unit_price: r.p.price,
          })),
        },
      });
      setDone({ token: res.share_token, copied: false });
      clearCart();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setErrors({ form: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    const quoteUrl = `${window.location.origin}/quote/${done.token}`;
    return (
      <div className="container-x py-16 max-w-xl text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-yellow text-navy">
          <Check className="h-10 w-10" />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold text-navy">Quotation request received!</h1>
        <p className="mt-3 text-muted-foreground">
          Our team will review and send you an official quote within <strong>2 hours</strong>.
        </p>
        <div className="mt-8 p-5 bg-card border border-border rounded-xl text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-navy">Your private quotation link</p>
          <div className="mt-2 flex items-center gap-2">
            <input readOnly value={quoteUrl} className="flex-1 text-xs px-3 py-2 border border-border rounded-md bg-muted font-mono" />
            <button
              onClick={() => { navigator.clipboard.writeText(quoteUrl); setDone({ ...done, copied: true }); }}
              className="btn-outline-navy text-xs"
            >
              <Copy className="h-3.5 w-3.5" /> {done.copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Bookmark this — it's how you'll view, negotiate, and pay for your quote.
          </p>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/quote/$token" params={{ token: done.token }} className="btn-yellow">
            <FileText className="h-4 w-4" /> Open my quotation
          </Link>
          <button onClick={() => navigate({ to: "/products" })} className="btn-outline-navy">Continue shopping</button>
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="container-x py-20 text-center">
        <FileText className="h-14 w-14 mx-auto text-muted-foreground/40" />
        <h1 className="mt-4 text-xl font-bold text-navy">Your cart is empty</h1>
        <p className="mt-1 text-sm text-muted-foreground">Add products to request a quotation.</p>
        <Link to="/products" className="btn-yellow mt-6 inline-flex">Browse products</Link>
      </div>
    );
  }

  return (
    <>
      <div className="bg-navy text-white">
        <div className="container-x py-10">
          <p className="text-yellow text-xs font-bold uppercase tracking-widest">Quotation</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold">Request a Quotation</h1>
          <p className="mt-2 text-white/80 text-sm">Tell us about you and we'll send an official quote within 2 hours. You'll be able to accept it, suggest a discount, or reject it.</p>
        </div>
      </div>

      <form onSubmit={submit} className="container-x py-10 grid lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-6">
          <Card title="Your contact details">
            <Grid>
              <Field label="Full name *" error={errors.full_name}>
                <input value={form.full_name} onChange={(e) => upd("full_name", e.target.value)} maxLength={120} className={input(errors.full_name)} />
              </Field>
              <Field label="Phone / WhatsApp *" error={errors.phone}>
                <input type="tel" placeholder="+250 7…" value={form.phone} onChange={(e) => upd("phone", e.target.value)} maxLength={20} className={input(errors.phone)} />
              </Field>
              <Field label="Email (optional)" error={errors.email} className="md:col-span-2">
                <input type="email" value={form.email} onChange={(e) => upd("email", e.target.value)} maxLength={255} className={input(errors.email)} />
              </Field>
            </Grid>
          </Card>

          <Card title="Delivery preference">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { k: "pickup", Icon: MapPin, label: "Pickup at Shop", sub: "Collect from our Kigali store" },
                { k: "delivery", Icon: Truck, label: "Deliver to Me", sub: "We deliver to your location" },
              ].map(({ k, Icon, label, sub }) => {
                const active = form.delivery_pref === k;
                return (
                  <label key={k} className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${active ? "border-yellow bg-yellow/5" : "border-border hover:border-navy"}`}>
                    <input type="radio" checked={active} onChange={() => upd("delivery_pref", k as "pickup" | "delivery")} className="accent-yellow" />
                    <Icon className="h-5 w-5 text-navy" />
                    <div>
                      <p className="text-sm font-bold text-navy">{label}</p>
                      <p className="text-xs text-muted-foreground">{sub}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            {form.delivery_pref === "delivery" && (
              <div className="mt-4">
                <Field label="Delivery location *" error={errors.delivery_location}>
                  <input value={form.delivery_location} onChange={(e) => upd("delivery_location", e.target.value)} maxLength={255}
                    placeholder="District, sector, landmark…" className={input(errors.delivery_location)} />
                </Field>
              </div>
            )}
          </Card>

          <Card title="Additional notes (optional)">
            <textarea rows={4} value={form.notes} onChange={(e) => upd("notes", e.target.value)} maxLength={1000} className={input(errors.notes)}
              placeholder="Any special requests, requirements, or context for your quote…" />
          </Card>

          {errors.form && (
            <div className="flex items-start gap-2 text-sm text-destructive p-3 rounded-lg bg-destructive/10">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /><span>{errors.form}</span>
            </div>
          )}
        </div>

        <aside className="h-fit lg:sticky lg:top-20 space-y-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-5 border-b border-border">
              <h3 className="text-lg font-bold text-navy">Items to quote</h3>
              <p className="text-xs text-muted-foreground">{rows.length} product{rows.length > 1 ? "s" : ""}</p>
            </div>
            <ul className="max-h-72 overflow-y-auto divide-y divide-border">
              {rows.map((r) => (
                <li key={r.id} className="flex gap-3 p-4">
                  <img src={r.p.image} alt={r.p.name} className="h-12 w-12 rounded-md object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-navy line-clamp-1">{r.p.name}</p>
                    <p className="text-[11px] text-muted-foreground">Qty {r.qty} × {formatRWF(r.p.price)}</p>
                  </div>
                  <p className="text-xs font-bold text-navy whitespace-nowrap">{formatRWF(r.p.price * r.qty)}</p>
                </li>
              ))}
            </ul>
            <div className="p-5 border-t border-border flex justify-between items-baseline">
              <span className="font-bold text-navy">Grand total</span>
              <span className="font-extrabold text-navy text-lg">{formatRWF(grand)}</span>
            </div>
            <div className="p-5 pt-0">
              <button type="submit" disabled={busy} className="btn-yellow w-full">
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Send Quotation Request
              </button>
              <p className="mt-2 text-[11px] text-muted-foreground text-center">We reply within 2 hours.</p>
            </div>
          </div>
          <Link to="/cart" className="block text-center text-xs text-yellow-dark hover:underline font-semibold">← Back to cart</Link>
        </aside>
      </form>
    </>
  );
}

/* helpers shared with checkout-style cards */
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-card border border-border rounded-xl p-6">
      <h2 className="text-lg font-bold text-navy mb-4">{title}</h2>
      {children}
    </section>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}
function Field({ label, error, children, className = "" }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-navy mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
function input(err?: string) {
  return `w-full px-3 py-2.5 text-sm border-2 rounded-md outline-none transition-colors ${err ? "border-destructive" : "border-border focus:border-yellow"}`;
}
