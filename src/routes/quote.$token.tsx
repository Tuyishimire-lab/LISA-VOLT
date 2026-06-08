import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  getQuoteByToken,
  customerAcceptQuote,
  customerCounterOffer,
  customerRejectQuote,
  customerChoosePayAtShop,
  customerCreateBooking,
  customerMarkBookingPaid,
  customerMarkOnlinePaid,
} from "@/lib/quotations.functions";
import { formatRWF } from "@/lib/products";
import { MomoPaymentModal } from "@/components/site/MomoPaymentModal";
import {
  Check, Clock, AlertCircle, ThumbsUp, MessageSquare, ThumbsDown,
  CreditCard, MapPin, Lock, ArrowRight, Loader2, FileText, Phone,
} from "lucide-react";

export const Route = createFileRoute("/quote/$token")({
  head: ({ params }) => ({
    meta: [
      { title: `Your Quotation — LISA VOLT LINK` },
      { name: "description", content: "View and respond to your official quotation." },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: `/quote/${params.token}` }],
  }),
  component: QuotePage,
  errorComponent: ({ error }) => (
    <div className="container-x py-10 text-sm text-destructive">{error.message}</div>
  ),
  notFoundComponent: () => <div className="container-x py-10">Quotation not found</div>,
});

const STATUS_BADGES: Record<string, string> = {
  Pending: "bg-muted text-muted-foreground",
  Sent: "bg-yellow text-navy",
  Negotiating: "bg-blue-100 text-blue-700",
  Confirmed: "bg-green-100 text-green-700",
  Booked: "bg-emerald-200 text-emerald-900",
  PickupHold: "bg-emerald-200 text-emerald-900",
  Paid: "bg-green-600 text-white",
  Completed: "bg-green-600 text-white",
  Expired: "bg-red-100 text-red-700",
  Rejected: "bg-red-100 text-red-700",
};

function QuotePage() {
  const { token } = Route.useParams();
  const qc = useQueryClient();
  const get = useServerFn(getQuoteByToken);
  const { data, isLoading, error } = useQuery({
    queryKey: ["quote", token],
    queryFn: () => get({ data: { token } }),
    refetchInterval: 15_000,
  });
  const refetch = () => qc.invalidateQueries({ queryKey: ["quote", token] });

  if (isLoading) return <div className="container-x py-16 text-sm text-muted-foreground">Loading your quotation…</div>;
  if (error) return <div className="container-x py-16 text-sm text-destructive">{(error as Error).message}</div>;
  if (!data) return null;

  const { quotation, items, offers, bookings, pickup_holds } = data;
  const activeBooking = bookings.find((b) => b.status === "active") ?? bookings[0];
  const activeHold = pickup_holds.find((h) => h.status === "active") ?? pickup_holds[0];
  const currentTotal = Number(quotation.final_total ?? quotation.current_total);

  return (
    <>
      <div className="bg-navy text-white">
        <div className="container-x py-8">
          <p className="text-yellow text-xs font-bold uppercase tracking-widest">Your Quotation</p>
          <div className="mt-2 flex flex-wrap items-end gap-3">
            <h1 className="text-3xl md:text-4xl font-extrabold">Hi {quotation.full_name.split(" ")[0]}</h1>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_BADGES[quotation.status] || "bg-muted text-muted-foreground"}`}>
              {quotation.status}
            </span>
          </div>
          <p className="mt-2 text-white/80 text-sm">Reference: {quotation.id.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>

      <div className="container-x py-8 grid lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-6">
          <StatusBanner quotation={quotation} />

          {/* Items */}
          <section className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold text-navy">Itemized list</h2>
              {quotation.status === "Sent" || quotation.status === "Negotiating" || quotation.status === "Confirmed" ? (
                <CountdownBadge expires_at={quotation.expires_at} />
              ) : null}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr><th className="text-left p-3">Item</th><th className="text-right p-3">Qty</th><th className="text-right p-3">Unit price</th><th className="text-right p-3">Subtotal</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((it) => (
                    <tr key={it.id}>
                      <td className="p-3 font-semibold text-navy">{it.product_name}</td>
                      <td className="p-3 text-right">{it.qty}</td>
                      <td className="p-3 text-right">
                        {it.current_unit_price !== it.original_unit_price && (
                          <span className="line-through text-muted-foreground text-xs mr-1.5">{formatRWF(Number(it.original_unit_price))}</span>
                        )}
                        {formatRWF(Number(it.current_unit_price))}
                      </td>
                      <td className="p-3 text-right font-bold">{formatRWF(Number(it.current_unit_price) * it.qty)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/40">
                  <tr><td colSpan={3} className="p-3 text-right font-bold text-navy">Total (RWF)</td><td className="p-3 text-right font-extrabold text-navy text-base">{formatRWF(currentTotal)}</td></tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* Customer actions */}
          {(quotation.status === "Sent" || quotation.status === "Negotiating") && (
            <CustomerActions token={token} currentTotal={currentTotal} onChanged={refetch} />
          )}

          {/* Payment options */}
          {quotation.status === "Confirmed" && (
            <PaymentOptions token={token} quotation={quotation} onChanged={refetch} />
          )}

          {/* Booked / Pickup / Paid summaries */}
          {quotation.status === "Booked" && activeBooking && <BookingConfirmation booking={activeBooking} quotation={quotation} />}
          {quotation.status === "PickupHold" && activeHold && <PickupConfirmation hold={activeHold} quotation={quotation} />}
          {quotation.status === "Paid" && (
            <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
              <Check className="h-8 w-8 text-green-700" />
              <h3 className="mt-2 text-lg font-bold text-green-900">Payment received in full</h3>
              <p className="mt-1 text-sm text-green-800">We'll prepare your order. Our team will be in touch shortly.</p>
            </div>
          )}

          {/* Negotiation thread */}
          <NegotiationThread offers={offers} />
        </div>

        {/* Sidebar */}
        <aside className="h-fit lg:sticky lg:top-20 space-y-3">
          <div className="p-5 bg-card border border-border rounded-xl">
            <h3 className="text-sm font-bold text-navy uppercase tracking-wider">Quotation summary</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="Original total" value={formatRWF(Number(quotation.original_total))} />
              <Row label="Current total" value={formatRWF(currentTotal)} strong />
              <Row label="Delivery" value={quotation.delivery_pref === "pickup" ? "Pickup at shop" : "Delivery"} />
              {quotation.delivery_location && <Row label="Location" value={quotation.delivery_location} />}
              {quotation.expires_at && <Row label="Valid until" value={new Date(quotation.expires_at).toLocaleString()} />}
            </dl>
          </div>
          <div className="p-5 bg-navy text-white rounded-xl text-sm">
            <p className="font-bold text-yellow">Need to talk to us?</p>
            <a href="https://wa.me/250788286465" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-white hover:text-yellow">
              <Phone className="h-4 w-4" /> +250 788 286 465
            </a>
          </div>
          <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-navy">← Back to site</Link>
        </aside>
      </div>
    </>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`text-right ${strong ? "font-extrabold text-navy" : "font-semibold text-navy"}`}>{value}</dd>
    </div>
  );
}

function StatusBanner({ quotation }: { quotation: { status: string; rejected_reason: string | null } }) {
  const s = quotation.status;
  if (s === "Pending") return <Banner tone="info" icon={Clock} title="Quotation received" sub="Our team is reviewing. You'll see an official quote here within 2 hours." />;
  if (s === "Sent") return <Banner tone="info" icon={FileText} title="Official quotation sent" sub="Review the items and pricing below, then accept, counter-offer or reject." />;
  if (s === "Negotiating") return <Banner tone="info" icon={MessageSquare} title="Negotiation in progress" sub="Your offer was sent. We'll respond shortly." />;
  if (s === "Confirmed") return <Banner tone="success" icon={Check} title="Quotation confirmed!" sub="Choose how you'd like to pay below." />;
  if (s === "Expired") return <Banner tone="error" icon={AlertCircle} title="Quotation expired" sub="Validity period elapsed. Please request a new quote." />;
  if (s === "Rejected") return <Banner tone="error" icon={ThumbsDown} title="Quotation rejected" sub={quotation.rejected_reason || "This quote was rejected."} />;
  return null;
}

function Banner({ tone, icon: Icon, title, sub }: { tone: "info" | "success" | "error"; icon: typeof Clock; title: string; sub: string }) {
  const tones = {
    info: "bg-blue-50 border-blue-200 text-blue-900",
    success: "bg-green-50 border-green-200 text-green-900",
    error: "bg-red-50 border-red-200 text-red-900",
  };
  return (
    <div className={`flex items-start gap-3 p-4 border rounded-xl ${tones[tone]}`}>
      <Icon className="h-5 w-5 mt-0.5 shrink-0" />
      <div>
        <p className="font-bold">{title}</p>
        <p className="text-sm opacity-90">{sub}</p>
      </div>
    </div>
  );
}

function CountdownBadge({ expires_at }: { expires_at: string | null }) {
  if (!expires_at) return null;
  const ms = new Date(expires_at).getTime() - Date.now();
  if (ms <= 0) return <span className="text-xs text-destructive font-bold">Expired</span>;
  const h = Math.floor(ms / 3600_000);
  return <span className="text-xs font-bold text-yellow-dark inline-flex items-center gap-1"><Clock className="h-3 w-3" /> Valid for {h}h</span>;
}

function CustomerActions({ token, currentTotal, onChanged }: { token: string; currentTotal: number; onChanged: () => void }) {
  const accept = useServerFn(customerAcceptQuote);
  const counter = useServerFn(customerCounterOffer);
  const reject = useServerFn(customerRejectQuote);
  const [mode, setMode] = useState<"none" | "counter" | "reject">("none");
  const [pct, setPct] = useState("");
  const [newTotal, setNewTotal] = useState("");
  const [msg, setMsg] = useState("");
  const [reason, setReason] = useState("");
  const acceptM = useMutation({ mutationFn: () => accept({ data: { token } }), onSuccess: onChanged });
  const counterM = useMutation({
    mutationFn: () => counter({
      data: {
        token,
        discount_pct: pct ? Number(pct) : undefined,
        new_total: newTotal ? Number(newTotal) : undefined,
        message: msg,
      },
    }),
    onSuccess: () => { setMode("none"); setPct(""); setNewTotal(""); setMsg(""); onChanged(); },
  });
  const rejectM = useMutation({
    mutationFn: () => reject({ data: { token, reason } }),
    onSuccess: () => { setMode("none"); setReason(""); onChanged(); },
  });

  if (mode === "counter") {
    return (
      <section className="p-5 bg-card border-2 border-yellow rounded-xl">
        <h3 className="text-lg font-bold text-navy">Suggest a discount</h3>
        <p className="text-xs text-muted-foreground mt-1">Current total: {formatRWF(currentTotal)}</p>
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-navy">Discount %</span>
            <input type="number" min={0} max={95} value={pct} onChange={(e) => { setPct(e.target.value); setNewTotal(""); }}
              className="w-full mt-1 px-3 py-2.5 text-sm border-2 border-border rounded-md outline-none focus:border-yellow" placeholder="e.g. 10" />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-navy">OR new total (RWF)</span>
            <input type="number" min={0} value={newTotal} onChange={(e) => { setNewTotal(e.target.value); setPct(""); }}
              className="w-full mt-1 px-3 py-2.5 text-sm border-2 border-border rounded-md outline-none focus:border-yellow" placeholder="e.g. 180000" />
          </label>
        </div>
        <label className="block mt-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-navy">Message (optional)</span>
          <textarea rows={2} maxLength={1000} value={msg} onChange={(e) => setMsg(e.target.value)}
            className="w-full mt-1 px-3 py-2 text-sm border-2 border-border rounded-md outline-none focus:border-yellow" />
        </label>
        {counterM.error && <p className="mt-2 text-xs text-destructive">{(counterM.error as Error).message}</p>}
        <div className="mt-4 flex gap-2">
          <button onClick={() => counterM.mutate()} disabled={counterM.isPending || (!pct && !newTotal)} className="btn-yellow">
            {counterM.isPending ? "Sending…" : "Send My Offer"}
          </button>
          <button onClick={() => setMode("none")} className="text-xs text-muted-foreground px-3">Cancel</button>
        </div>
      </section>
    );
  }
  if (mode === "reject") {
    return (
      <section className="p-5 bg-card border-2 border-destructive/40 rounded-xl">
        <h3 className="text-lg font-bold text-navy">Reject quotation</h3>
        <label className="block mt-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-navy">Reason (optional)</span>
          <textarea rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)}
            className="w-full mt-1 px-3 py-2 text-sm border-2 border-border rounded-md outline-none focus:border-destructive" />
        </label>
        {rejectM.error && <p className="mt-2 text-xs text-destructive">{(rejectM.error as Error).message}</p>}
        <div className="mt-4 flex gap-2">
          <button onClick={() => rejectM.mutate()} disabled={rejectM.isPending} className="px-4 py-2 rounded-md text-sm font-bold bg-destructive text-white hover:opacity-90">
            {rejectM.isPending ? "Rejecting…" : "Reject quotation"}
          </button>
          <button onClick={() => setMode("none")} className="text-xs text-muted-foreground px-3">Cancel</button>
        </div>
      </section>
    );
  }

  return (
    <section className="p-5 bg-card border border-border rounded-xl">
      <h3 className="text-lg font-bold text-navy">Respond to this quote</h3>
      <p className="text-xs text-muted-foreground mt-1">Choose one option below.</p>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button onClick={() => acceptM.mutate()} disabled={acceptM.isPending}
          className="px-4 py-3 rounded-md font-bold text-white bg-green-600 hover:opacity-90 inline-flex items-center justify-center gap-2">
          {acceptM.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />} Accept Quotation
        </button>
        <button onClick={() => setMode("counter")} className="btn-yellow justify-center">
          <MessageSquare className="h-4 w-4" /> Suggest a Discount
        </button>
        <button onClick={() => setMode("reject")}
          className="px-4 py-3 rounded-md font-bold text-white bg-destructive hover:opacity-90 inline-flex items-center justify-center gap-2">
          <ThumbsDown className="h-4 w-4" /> Reject
        </button>
      </div>
      {acceptM.error && <p className="mt-2 text-xs text-destructive">{(acceptM.error as Error).message}</p>}
    </section>
  );
}

function PaymentOptions({ token, quotation, onChanged }: { token: string; quotation: { final_total: number | null; current_total: number }; onChanged: () => void }) {
  const total = Number(quotation.final_total ?? quotation.current_total);
  const deposit = Math.round(total * 0.05);
  const [activePay, setActivePay] = useState<"none" | "full" | "deposit">("none");
  const [pendingBooking, setPendingBooking] = useState<{ reference: string } | null>(null);

  const payAtShop = useServerFn(customerChoosePayAtShop);
  const createBooking = useServerFn(customerCreateBooking);
  const markBookingPaid = useServerFn(customerMarkBookingPaid);
  const markOnlinePaid = useServerFn(customerMarkOnlinePaid);

  const shopM = useMutation({ mutationFn: () => payAtShop({ data: { token } }), onSuccess: onChanged });
  const startDepositM = useMutation({
    mutationFn: () => createBooking({ data: { token } }),
    onSuccess: (b) => { setPendingBooking({ reference: b.reference }); setActivePay("deposit"); },
  });

  return (
    <section>
      <h3 className="text-lg font-bold text-navy mb-3">Choose how you'd like to pay</h3>
      <div className="grid md:grid-cols-3 gap-4">
        {/* Option A */}
        <div className="p-5 bg-card border-2 border-yellow rounded-xl flex flex-col">
          <CreditCard className="h-7 w-7 text-yellow-dark" />
          <h4 className="mt-3 font-bold text-navy">Pay Online Now</h4>
          <p className="text-xs text-muted-foreground mt-1">Full payment via MTN MoMo, Airtel Money or card. Order confirmed immediately.</p>
          <p className="mt-3 text-2xl font-extrabold text-navy">{formatRWF(total)}</p>
          <button onClick={() => setActivePay("full")} className="btn-yellow mt-auto w-full">Pay Online Now <ArrowRight className="h-4 w-4" /></button>
        </div>
        {/* Option B */}
        <div className="p-5 bg-card border-2 border-navy rounded-xl flex flex-col">
          <MapPin className="h-7 w-7 text-navy" />
          <h4 className="mt-3 font-bold text-navy">Pay at Shop</h4>
          <p className="text-xs text-muted-foreground mt-1">Visit our Kigali shop to pay and collect. Reserved for 24 hours.</p>
          <p className="mt-3 text-2xl font-extrabold text-navy">{formatRWF(total)}</p>
          <button onClick={() => shopM.mutate()} disabled={shopM.isPending}
            className="mt-auto w-full px-4 py-2.5 rounded-md font-bold text-white bg-navy hover:opacity-90 inline-flex items-center justify-center gap-2">
            {shopM.isPending ? "Reserving…" : "I Will Pay at Shop"} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        {/* Option C */}
        <div className="p-5 bg-card border-2 border-green-600 rounded-xl flex flex-col">
          <Lock className="h-7 w-7 text-green-700" />
          <h4 className="mt-3 font-bold text-navy">Book with 5% Deposit</h4>
          <p className="text-xs text-muted-foreground mt-1">Lock and reserve all goods for 48 hours. Pay the balance on collection.</p>
          <ul className="mt-3 text-xs space-y-1">
            <li className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-bold text-navy">{formatRWF(total)}</span></li>
            <li className="flex justify-between"><span className="text-muted-foreground">Booking deposit (5%)</span><span className="font-bold text-green-700">{formatRWF(deposit)}</span></li>
            <li className="flex justify-between"><span className="text-muted-foreground">Balance on collection</span><span className="font-bold text-navy">{formatRWF(total - deposit)}</span></li>
          </ul>
          <button onClick={() => startDepositM.mutate()} disabled={startDepositM.isPending} className="btn-yellow mt-4 w-full">
            {startDepositM.isPending ? "Setting up…" : "Book with 5% Deposit"}
          </button>
        </div>
      </div>

      <MomoPaymentModal
        open={activePay === "full"}
        amount={total}
        phone=""
        onClose={() => setActivePay("none")}
        onSuccess={async (ref) => {
          await markOnlinePaid({ data: { token, momo_reference: ref } });
          setActivePay("none");
          onChanged();
        }}
      />
      <MomoPaymentModal
        open={activePay === "deposit"}
        amount={deposit}
        phone=""
        onClose={() => { setActivePay("none"); setPendingBooking(null); }}
        onSuccess={async (ref) => {
          if (pendingBooking) {
            await markBookingPaid({ data: { token, booking_reference: pendingBooking.reference, momo_reference: ref } });
          }
          setActivePay("none");
          setPendingBooking(null);
          onChanged();
        }}
      />
    </section>
  );
}

function BookingConfirmation({ booking, quotation }: { booking: { reference: string; deposit_amount: number; balance: number; total: number; expires_at: string }; quotation: { full_name: string } }) {
  return (
    <section className="p-6 bg-green-50 border border-green-200 rounded-xl">
      <Lock className="h-7 w-7 text-green-700" />
      <h3 className="mt-2 text-xl font-extrabold text-green-900">Booking confirmed!</h3>
      <p className="text-sm text-green-800 mt-1">Your goods are reserved until {new Date(booking.expires_at).toLocaleString()}.</p>
      <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
        <Info label="Reference" value={booking.reference} mono />
        <Info label="Customer" value={quotation.full_name} />
        <Info label="Deposit paid" value={formatRWF(Number(booking.deposit_amount))} />
        <Info label="Balance remaining" value={formatRWF(Number(booking.balance))} />
        <Info label="Total" value={formatRWF(Number(booking.total))} />
        <Info label="Reserved until" value={new Date(booking.expires_at).toLocaleString()} />
      </div>
      <div className="mt-4 p-3 bg-white border border-green-200 rounded-md text-xs">
        <p className="font-bold text-navy">Pick up at:</p>
        <p className="text-muted-foreground mt-1">LISA VOLT LINK · Kigali, Rwanda · +250 788 286 465</p>
      </div>
    </section>
  );
}

function PickupConfirmation({ hold, quotation }: { hold: { reference: string; expires_at: string }; quotation: { full_name: string } }) {
  return (
    <section className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
      <MapPin className="h-7 w-7 text-blue-700" />
      <h3 className="mt-2 text-xl font-extrabold text-blue-900">Pickup hold confirmed</h3>
      <p className="text-sm text-blue-800 mt-1">We're reserving your order for 24 hours. Come to the shop to pay and collect.</p>
      <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
        <Info label="Reference" value={hold.reference} mono />
        <Info label="Customer" value={quotation.full_name} />
        <Info label="Reserved until" value={new Date(hold.expires_at).toLocaleString()} />
      </div>
      <div className="mt-4 p-3 bg-white border border-blue-200 rounded-md text-xs">
        <p className="font-bold text-navy">Visit:</p>
        <p className="text-muted-foreground mt-1">LISA VOLT LINK · Kigali, Rwanda · +250 788 286 465</p>
      </div>
    </section>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
      <p className={`mt-0.5 font-bold text-navy ${mono ? "font-mono text-xs" : ""}`}>{value}</p>
    </div>
  );
}

function NegotiationThread({ offers }: { offers: Array<{ id: string; actor: string; kind: string; total: number | null; discount_pct: number | null; message: string | null; created_at: string }> }) {
  if (offers.length === 0) return null;
  return (
    <section className="p-5 bg-card border border-border rounded-xl">
      <h3 className="text-lg font-bold text-navy mb-3">History</h3>
      <ol className="space-y-3">
        {offers.map((o) => {
          const fromCustomer = o.actor === "customer";
          return (
            <li key={o.id} className={`flex ${fromCustomer ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] p-3 rounded-lg text-sm ${fromCustomer ? "bg-yellow/20 text-navy" : "bg-navy/5 text-navy"}`}>
                <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">{fromCustomer ? "You" : "LISA VOLT LINK"} · {labelForKind(o.kind)}</p>
                {o.total != null && <p className="mt-1 font-extrabold">{formatRWF(Number(o.total))}</p>}
                {o.discount_pct != null && <p className="text-xs opacity-80">Requested discount: {o.discount_pct}%</p>}
                {o.message && <p className="mt-1 text-xs whitespace-pre-wrap">{o.message}</p>}
                <p className="mt-1.5 text-[10px] opacity-60">{new Date(o.created_at).toLocaleString()}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function labelForKind(k: string) {
  switch (k) {
    case "request": return "Request submitted";
    case "quote_sent": return "Quote sent";
    case "revised": return "Revised quote";
    case "counter_offer": return "Counter offer";
    case "accepted": return "Accepted";
    case "rejected": return "Rejected";
    default: return k;
  }
}
