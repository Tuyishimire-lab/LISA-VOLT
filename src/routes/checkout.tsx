import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Truck, MapPin, CreditCard, Smartphone, Banknote, Check, ShoppingBag, ShieldCheck } from "lucide-react";
import { products, formatRWF } from "@/lib/products";
import { useCart, clearCart } from "@/lib/store";
import { MomoPaymentModal } from "@/components/site/MomoPaymentModal";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — LISA VOLT LINK" }, { name: "description", content: "Complete your order: address, delivery and payment." }] }),
  component: CheckoutPage,
});

const KIGALI_DISTRICTS = ["Gasabo", "Kicukiro", "Nyarugenge"] as const;
const OTHER_CITIES = ["Musanze", "Rubavu", "Huye", "Muhanga", "Rwamagana", "Nyagatare", "Other"] as const;

const schema = z.object({
  firstName: z.string().trim().min(2, "First name is too short").max(60),
  lastName: z.string().trim().min(2, "Last name is too short").max(60),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, "Invalid phone number"),
  city: z.string().min(1, "Select a city"),
  district: z.string().trim().min(2, "District is required").max(80),
  address: z.string().trim().min(5, "Address is too short").max(200),
  landmark: z.string().trim().max(120).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  delivery: z.enum(["standard", "express", "pickup"]),
  payment: z.enum(["momo", "cod", "bank"]),
  momoNumber: z.string().trim().max(20).optional().or(z.literal("")),
  agree: z.literal(true, { errorMap: () => ({ message: "You must accept the terms" }) }),
});

type FormState = {
  firstName: string; lastName: string; email: string; phone: string;
  city: string; district: string; address: string; landmark: string; notes: string;
  delivery: "standard" | "express" | "pickup";
  payment: "momo" | "cod" | "bank";
  momoNumber: string;
  agree: boolean;
};

const DELIVERY: Record<FormState["delivery"], { label: string; eta: string; fee: number; Icon: typeof Truck }> = {
  standard: { label: "Standard delivery", eta: "Within Kigali · 24h", fee: 3000, Icon: Truck },
  express:  { label: "Express delivery",  eta: "Same day · before 6pm", fee: 7000, Icon: Truck },
  pickup:   { label: "Store pickup",      eta: "Kigali · ready in 2h",  fee: 0,    Icon: MapPin },
};

function CheckoutPage() {
  const navigate = useNavigate();
  const cart = useCart();
  const rows = cart.map((c) => ({ ...c, p: products.find((x) => x.id === c.id)! })).filter((r) => r.p);
  const subtotal = rows.reduce((s, r) => s + r.p.price * r.qty, 0);

  const [form, setForm] = useState<FormState>({
    firstName: "", lastName: "", email: "", phone: "",
    city: "Kigali", district: "", address: "", landmark: "", notes: "",
    delivery: "standard", payment: "momo", momoNumber: "", agree: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placed, setPlaced] = useState<string | null>(null);
  const [momoOpen, setMomoOpen] = useState(false);
  const [paymentRef, setPaymentRef] = useState<string | null>(null);

  const shipping = form.delivery === "pickup" ? 0 : DELIVERY[form.delivery].fee;
  const free = subtotal >= 150000 && form.delivery !== "express";
  const effectiveShipping = free ? 0 : shipping;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + effectiveShipping + tax;

  const upd = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  function placeOrder(paidRef?: string) {
    const orderNo = "LVL-" + new Date().getFullYear() + "-" + Math.floor(100000 + Math.random() * 900000);
    if (paidRef) setPaymentRef(paidRef);
    setPlaced(orderNo);
    clearCart();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { if (i.path[0]) errs[String(i.path[0])] = i.message; });
      setErrors(errs);
      const first = document.querySelector(`[data-field="${Object.keys(errs)[0]}"]`);
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (rows.length === 0) return;
    setErrors({});

    if (form.payment === "momo") {
      setMomoOpen(true);
      return;
    }
    placeOrder();
  }

  if (placed) {
    return (
      <div className="container-x py-16 max-w-2xl text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-yellow text-navy">
          <Check className="h-10 w-10" />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold text-navy">Order placed!</h1>
        <p className="mt-2 text-muted-foreground">Thanks for shopping with LISA VOLT LINK. We've sent a confirmation to your email.</p>
        <div className="mt-8 rounded-xl bg-card border border-border p-6 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Order number</span>
            <span className="font-extrabold text-navy">{placed}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Total paid</span>
            <span className="font-extrabold text-navy">{formatRWF(total)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery</span>
            <span className="font-semibold">{DELIVERY[form.delivery].label} · {DELIVERY[form.delivery].eta}</span>
          </div>
          {paymentRef && (
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-muted-foreground">MoMo reference</span>
              <span className="font-mono text-xs font-bold text-navy">{paymentRef}</span>
            </div>
          )}
        </div>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/account" className="btn-yellow">Track my order</Link>
          <button onClick={() => navigate({ to: "/products" })} className="btn-outline-navy">Continue shopping</button>
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="container-x py-20 text-center">
        <ShoppingBag className="h-14 w-14 mx-auto text-muted-foreground/40" />
        <h1 className="mt-4 text-xl font-bold text-navy">Your cart is empty</h1>
        <p className="mt-1 text-sm text-muted-foreground">Add products before proceeding to checkout.</p>
        <Link to="/products" className="btn-yellow mt-6 inline-flex">Browse products</Link>
      </div>
    );
  }

  return (
    <>
      <div className="bg-navy text-white">
        <div className="container-x py-8">
          <p className="text-yellow text-xs font-bold uppercase tracking-widest">Checkout</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold">Complete your order</h1>
        </div>
      </div>

      <form onSubmit={submit} className="container-x py-10 grid lg:grid-cols-[1fr_380px] gap-8">
        <div className="space-y-8">
          {/* Contact */}
          <Card title="1. Contact information">
            <Grid>
              <Field label="First name" error={errors.firstName} data-field="firstName">
                <input value={form.firstName} onChange={(e) => upd("firstName", e.target.value)} maxLength={60} className={input(errors.firstName)} />
              </Field>
              <Field label="Last name" error={errors.lastName} data-field="lastName">
                <input value={form.lastName} onChange={(e) => upd("lastName", e.target.value)} maxLength={60} className={input(errors.lastName)} />
              </Field>
              <Field label="Email" error={errors.email} data-field="email">
                <input type="email" value={form.email} onChange={(e) => upd("email", e.target.value)} maxLength={255} className={input(errors.email)} />
              </Field>
              <Field label="Phone" error={errors.phone} data-field="phone">
                <input type="tel" placeholder="+250 7…" value={form.phone} onChange={(e) => upd("phone", e.target.value)} maxLength={20} className={input(errors.phone)} />
              </Field>
            </Grid>
          </Card>

          {/* Address */}
          <Card title="2. Delivery address">
            <Grid>
              <Field label="City" error={errors.city} data-field="city">
                <select value={form.city} onChange={(e) => upd("city", e.target.value)} className={input(errors.city)}>
                  <option value="">Select a city</option>
                  <option value="Kigali">Kigali</option>
                  {OTHER_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="District / Sector" error={errors.district} data-field="district">
                {form.city === "Kigali" ? (
                  <select value={form.district} onChange={(e) => upd("district", e.target.value)} className={input(errors.district)}>
                    <option value="">Select district</option>
                    {KIGALI_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                ) : (
                  <input value={form.district} onChange={(e) => upd("district", e.target.value)} maxLength={80} className={input(errors.district)} />
                )}
              </Field>
              <Field label="Street address" error={errors.address} className="md:col-span-2" data-field="address">
                <input value={form.address} onChange={(e) => upd("address", e.target.value)} maxLength={200} className={input(errors.address)} />
              </Field>
              <Field label="Landmark (optional)" error={errors.landmark} className="md:col-span-2" data-field="landmark">
                <input value={form.landmark} onChange={(e) => upd("landmark", e.target.value)} maxLength={120} placeholder="e.g. near KCT building" className={input(errors.landmark)} />
              </Field>
              <Field label="Order notes (optional)" error={errors.notes} className="md:col-span-2" data-field="notes">
                <textarea rows={3} value={form.notes} onChange={(e) => upd("notes", e.target.value)} maxLength={500} className={input(errors.notes)} />
              </Field>
            </Grid>
          </Card>

          {/* Delivery */}
          <Card title="3. Delivery method">
            <div className="space-y-2.5">
              {(Object.keys(DELIVERY) as FormState["delivery"][]).map((k) => {
                const d = DELIVERY[k];
                const active = form.delivery === k;
                return (
                  <label key={k} className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${active ? "border-yellow bg-yellow/5" : "border-border hover:border-navy"}`}>
                    <input type="radio" name="delivery" checked={active} onChange={() => upd("delivery", k)} className="accent-yellow" />
                    <d.Icon className="h-5 w-5 text-navy" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-navy">{d.label}</p>
                      <p className="text-xs text-muted-foreground">{d.eta}</p>
                    </div>
                    <p className="text-sm font-bold text-navy">{d.fee === 0 ? "Free" : formatRWF(d.fee)}</p>
                  </label>
                );
              })}
            </div>
            {free && <p className="mt-3 text-xs text-green-600 font-semibold">🎉 Free standard shipping unlocked (orders ≥ 150,000 RWF)</p>}
          </Card>

          {/* Payment */}
          <Card title="4. Payment method">
            <div className="space-y-2.5">
              {([
                { k: "momo", Icon: Smartphone, label: "Mobile Money", sub: "MTN MoMo / Airtel Money" },
                { k: "cod",  Icon: Banknote,  label: "Cash on delivery", sub: "Pay in cash when you receive" },
                { k: "bank", Icon: CreditCard, label: "Bank transfer", sub: "Bank of Kigali / Equity" },
              ] as const).map(({ k, Icon, label, sub }) => {
                const active = form.payment === k;
                return (
                  <label key={k} className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${active ? "border-yellow bg-yellow/5" : "border-border hover:border-navy"}`}>
                    <input type="radio" name="payment" checked={active} onChange={() => upd("payment", k)} className="accent-yellow" />
                    <Icon className="h-5 w-5 text-navy" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-navy">{label}</p>
                      <p className="text-xs text-muted-foreground">{sub}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            {form.payment === "momo" && (
              <div className="mt-4">
                <Field label="MoMo number (optional)" error={errors.momoNumber} data-field="momoNumber">
                  <input value={form.momoNumber} onChange={(e) => upd("momoNumber", e.target.value)} placeholder="+250 7…" maxLength={20} className={input(errors.momoNumber)} />
                </Field>
                <p className="mt-2 text-xs text-muted-foreground">You'll receive a payment prompt on this number.</p>
              </div>
            )}
          </Card>

          <div data-field="agree">
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" checked={form.agree} onChange={(e) => upd("agree", e.target.checked)} className="accent-yellow mt-1" />
              <span className="text-muted-foreground">I agree to the <a href="#" className="text-yellow-dark font-semibold hover:underline">terms of service</a> and acknowledge the <a href="#" className="text-yellow-dark font-semibold hover:underline">privacy policy</a>.</span>
            </label>
            {errors.agree && <p className="mt-1 text-xs text-destructive">{errors.agree}</p>}
          </div>
        </div>

        {/* Summary */}
        <aside className="h-fit lg:sticky lg:top-20 space-y-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-5 border-b border-border">
              <h3 className="text-lg font-bold text-navy">Order summary</h3>
              <p className="text-xs text-muted-foreground">{rows.length} item{rows.length > 1 ? "s" : ""}</p>
            </div>
            <ul className="max-h-72 overflow-y-auto divide-y divide-border">
              {rows.map((r) => (
                <li key={r.id} className="flex gap-3 p-4">
                  <div className="relative">
                    <img src={r.p.image} alt={r.p.name} className="h-14 w-14 rounded-md object-cover" />
                    <span className="absolute -top-2 -right-2 grid h-5 w-5 place-items-center rounded-full bg-navy text-yellow text-[10px] font-bold">{r.qty}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-navy line-clamp-1">{r.p.name}</p>
                    <p className="text-[11px] text-muted-foreground">{r.p.subcategory}</p>
                  </div>
                  <p className="text-xs font-bold text-navy whitespace-nowrap">{formatRWF(r.p.price * r.qty)}</p>
                </li>
              ))}
            </ul>
            <div className="p-5 space-y-2 text-sm border-t border-border">
              <Line label="Subtotal" value={formatRWF(subtotal)} />
              <Line label="Shipping" value={effectiveShipping === 0 ? "Free" : formatRWF(effectiveShipping)} />
              <Line label="VAT (18%)" value={formatRWF(tax)} />
              <div className="border-t border-border pt-3 mt-3 flex justify-between text-base">
                <span className="font-bold text-navy">Total</span>
                <span className="font-extrabold text-navy">{formatRWF(total)}</span>
              </div>
            </div>
            <div className="p-5 pt-0">
              <button type="submit" className="btn-yellow w-full">Place order · {formatRWF(total)}</button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-yellow-dark" /> Secure checkout</p>
            </div>
          </div>
          <Link to="/cart" className="block text-center text-xs text-yellow-dark hover:underline font-semibold">← Back to cart</Link>
        </aside>
      </form>

      <MomoPaymentModal
        open={momoOpen}
        amount={total}
        phone={form.momoNumber || form.phone}
        onClose={() => setMomoOpen(false)}
        onSuccess={(ref) => { setMomoOpen(false); placeOrder(ref); }}
      />
    </>
  );
}

/* ---------- helpers ---------- */
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
function Field({ label, error, children, className = "", ...rest }: { label: string; error?: string; children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} {...rest}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-navy mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
function Line({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className="font-semibold">{value}</span></div>;
}
function input(error?: string) {
  return `w-full px-3 py-2.5 text-sm border-2 rounded-md outline-none bg-background transition-colors ${error ? "border-destructive" : "border-border focus:border-yellow"}`;
}
