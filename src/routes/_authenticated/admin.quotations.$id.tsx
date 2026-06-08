import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  adminGetQuotation,
  adminSendQuote,
  adminAcceptCounter,
  adminRejectQuote,
  adminMarkCompleted,
  adminToggleRefundDeposit,
} from "@/lib/quotations.functions";
import { ArrowLeft, MessageCircle, Send, Check, X, RefreshCw, Printer } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/quotations/$id")({
  head: () => ({ meta: [{ title: "Admin — Quotation" }, { name: "robots", content: "noindex" }] }),
  component: AdminQuotationDetail,
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

function AdminQuotationDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const get = useServerFn(adminGetQuotation);
  const send = useServerFn(adminSendQuote);
  const accept = useServerFn(adminAcceptCounter);
  const reject = useServerFn(adminRejectQuote);
  const complete = useServerFn(adminMarkCompleted);
  const toggleRefund = useServerFn(adminToggleRefundDeposit);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-quotation", id],
    queryFn: () => get({ data: { id } }),
    refetchInterval: 20_000,
  });
  const refetch = () => qc.invalidateQueries({ queryKey: ["admin-quotation", id] });

  const [prices, setPrices] = useState<Record<string, string>>({});
  const [validity, setValidity] = useState(48);
  const [message, setMessage] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (data) {
      const map: Record<string, string> = {};
      data.items.forEach((i) => { map[i.id] = String(i.current_unit_price); });
      setPrices(map);
      setValidity(data.quotation.validity_hours || 48);
    }
  }, [data]);

  const sendM = useMutation({
    mutationFn: () => send({
      data: {
        id,
        validity_hours: validity,
        message,
        items: Object.entries(prices).map(([itemId, p]) => ({ id: itemId, unit_price: Number(p) })),
      },
    }),
    onSuccess: () => { setMessage(""); refetch(); },
  });
  const acceptM = useMutation({ mutationFn: () => accept({ data: { id } }), onSuccess: refetch });
  const rejectM = useMutation({ mutationFn: () => reject({ data: { id, reason: rejectReason } }), onSuccess: () => { setRejectReason(""); refetch(); } });
  const completeM = useMutation({ mutationFn: () => complete({ data: { id } }), onSuccess: refetch });

  if (isLoading) return <div className="container-x py-10 text-sm text-muted-foreground">Loading…</div>;
  if (error) return <div className="container-x py-10 text-sm text-destructive">{(error as Error).message}</div>;
  if (!data) return null;

  const { quotation, items, offers, bookings, pickup_holds, payments } = data;
  const total = items.reduce((s, i) => s + (Number(prices[i.id]) || 0) * i.qty, 0);
  const customerLastCounter = [...offers].reverse().find((o) => o.actor === "customer" && o.kind === "counter_offer");

  return (
    <div className="container-x py-6 grid lg:grid-cols-[1fr_360px] gap-6">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: "/admin/quotations" })} className="text-sm inline-flex items-center gap-1 text-muted-foreground hover:text-navy">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-2xl font-extrabold text-navy">{quotation.full_name}</h1>
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${STATUS_BADGES[quotation.status] || ""}`}>{quotation.status}</span>
        </div>

        {/* Items */}
        <section className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-bold text-navy">Quoted items</h2>
            {(quotation.status === "Pending" || quotation.status === "Sent" || quotation.status === "Negotiating") && (
              <p className="text-xs text-muted-foreground">Adjust unit prices to offer a deal</p>
            )}
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase">
              <tr><th className="text-left p-3">Item</th><th className="text-right p-3">Qty</th><th className="text-right p-3">Original</th><th className="text-right p-3 w-40">Quoted unit (RWF)</th><th className="text-right p-3">Subtotal</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((it) => (
                <tr key={it.id}>
                  <td className="p-3 font-semibold text-navy">{it.product_name}</td>
                  <td className="p-3 text-right">{it.qty}</td>
                  <td className="p-3 text-right text-muted-foreground">{Number(it.original_unit_price).toLocaleString()}</td>
                  <td className="p-3 text-right">
                    <input type="number" min={0} value={prices[it.id] ?? ""} onChange={(e) => setPrices({ ...prices, [it.id]: e.target.value })}
                      disabled={!["Pending", "Sent", "Negotiating"].includes(quotation.status)}
                      className="w-32 text-right px-2 py-1 border-2 border-border rounded-md outline-none focus:border-yellow text-sm" />
                  </td>
                  <td className="p-3 text-right font-bold">{((Number(prices[it.id]) || 0) * it.qty).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-muted/40">
              <tr><td colSpan={4} className="p-3 text-right font-bold text-navy">Total (RWF)</td><td className="p-3 text-right font-extrabold text-navy">{total.toLocaleString()}</td></tr>
            </tfoot>
          </table>
        </section>

        {/* Send/revise */}
        {(quotation.status === "Pending" || quotation.status === "Sent" || quotation.status === "Negotiating") && (
          <section className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-lg font-bold text-navy">Send {quotation.status === "Pending" ? "official quotation" : "revised quotation"}</h2>
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-navy">Validity (hours)</span>
                <input type="number" min={1} max={720} value={validity} onChange={(e) => setValidity(Number(e.target.value) || 48)}
                  className="w-full mt-1 px-3 py-2 text-sm border-2 border-border rounded-md outline-none focus:border-yellow" />
              </label>
              <label className="block sm:col-span-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-navy">Message (optional)</span>
                <input value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1000}
                  className="w-full mt-1 px-3 py-2 text-sm border-2 border-border rounded-md outline-none focus:border-yellow" />
              </label>
            </div>
            {sendM.error && <p className="mt-2 text-xs text-destructive">{(sendM.error as Error).message}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => sendM.mutate()} disabled={sendM.isPending} className="btn-yellow">
                <Send className="h-4 w-4" /> {sendM.isPending ? "Sending…" : "Send Quotation to Customer"}
              </button>
              {customerLastCounter && (
                <button onClick={() => acceptM.mutate()} disabled={acceptM.isPending}
                  className="px-4 py-2 rounded-md font-bold text-white bg-green-600 hover:opacity-90 inline-flex items-center gap-2">
                  <Check className="h-4 w-4" /> Accept customer offer ({Number(customerLastCounter.total).toLocaleString()} RWF)
                </button>
              )}
            </div>
          </section>
        )}

        {/* Reject */}
        {["Pending", "Sent", "Negotiating"].includes(quotation.status) && (
          <section className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-lg font-bold text-navy">Reject quotation</h2>
            <input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason (optional)" maxLength={500}
              className="w-full mt-2 px-3 py-2 text-sm border-2 border-border rounded-md outline-none focus:border-destructive" />
            <button onClick={() => rejectM.mutate()} disabled={rejectM.isPending}
              className="mt-3 px-4 py-2 rounded-md font-bold text-white bg-destructive hover:opacity-90 inline-flex items-center gap-2">
              <X className="h-4 w-4" /> Reject
            </button>
          </section>
        )}

        {/* Mark completed */}
        {["Booked", "Paid", "PickupHold", "Confirmed"].includes(quotation.status) && (
          <button onClick={() => completeM.mutate()} disabled={completeM.isPending} className="btn-outline-navy">
            <Check className="h-4 w-4" /> Mark completed
          </button>
        )}

        {/* Bookings & payments */}
        {bookings.length > 0 && (
          <section className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-lg font-bold text-navy">Bookings (5% deposit)</h2>
            <ul className="mt-3 space-y-3">
              {bookings.map((b) => (
                <li key={b.id} className="border border-border rounded-md p-3">
                  <div className="flex flex-wrap items-baseline gap-3 text-sm">
                    <span className="font-mono font-bold text-navy">{b.reference}</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${b.status === "active" ? "bg-emerald-100 text-emerald-700" : b.status === "expired" ? "bg-red-100 text-red-700" : "bg-muted text-muted-foreground"}`}>{b.status}</span>
                    <span className="text-xs text-muted-foreground">Expires {new Date(b.expires_at).toLocaleString()}</span>
                  </div>
                  <p className="mt-2 text-xs">
                    Deposit <strong>{Number(b.deposit_amount).toLocaleString()}</strong> · Balance <strong>{Number(b.balance).toLocaleString()}</strong> · Total <strong>{Number(b.total).toLocaleString()}</strong>
                  </p>
                  {b.status === "expired" && (
                    <label className="mt-2 inline-flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={b.refund_deposit} onChange={(e) => toggleRefund({ data: { booking_id: b.id, refund: e.target.checked } }).then(refetch)} />
                      Refund deposit
                    </label>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {pickup_holds.length > 0 && (
          <section className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-lg font-bold text-navy">Pickup holds</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {pickup_holds.map((h) => (
                <li key={h.id} className="flex flex-wrap gap-3 items-baseline">
                  <span className="font-mono font-bold">{h.reference}</span>
                  <span className="text-xs text-muted-foreground">Expires {new Date(h.expires_at).toLocaleString()}</span>
                  <span className="text-xs">{h.status}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {payments.length > 0 && (
          <section className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-lg font-bold text-navy">Online payments</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {payments.map((p) => (
                <li key={p.id} className="flex justify-between">
                  <span className="font-mono">{p.reference}</span>
                  <span className="font-bold">{Number(p.amount).toLocaleString()} RWF</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* History */}
        <section className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-lg font-bold text-navy mb-3">Negotiation history</h2>
          <ol className="space-y-3 text-sm">
            {offers.map((o) => (
              <li key={o.id} className={`p-3 rounded-md ${o.actor === "customer" ? "bg-yellow/10" : "bg-navy/5"}`}>
                <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">{o.actor} · {o.kind}</p>
                {o.total != null && <p className="font-extrabold text-navy">{Number(o.total).toLocaleString()} RWF</p>}
                {o.discount_pct != null && <p className="text-xs">Discount: {o.discount_pct}%</p>}
                {o.message && <p className="text-xs mt-1 whitespace-pre-wrap">{o.message}</p>}
                <p className="text-[10px] opacity-60 mt-1">{new Date(o.created_at).toLocaleString()}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* Sidebar */}
      <aside className="space-y-3">
        <div className="p-4 bg-card border border-border rounded-xl">
          <p className="text-xs font-bold uppercase tracking-wider text-navy">Customer</p>
          <p className="mt-2 text-sm font-bold text-navy">{quotation.full_name}</p>
          <p className="text-xs">{quotation.phone}</p>
          {quotation.email && <p className="text-xs text-muted-foreground">{quotation.email}</p>}
          <p className="mt-3 text-xs">{quotation.delivery_pref === "pickup" ? "Pickup at shop" : `Delivery: ${quotation.delivery_location || "—"}`}</p>
          {quotation.notes && <p className="mt-2 text-xs italic text-muted-foreground">"{quotation.notes}"</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <a href={`https://wa.me/${quotation.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello ${quotation.full_name}, your quotation: ${window.location.origin}/quote/${quotation.share_token}`)}`} target="_blank" rel="noopener noreferrer" className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200">
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </a>
            <Link to="/quote/$token" params={{ token: quotation.share_token }} target="_blank" className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded bg-yellow/30 text-navy hover:bg-yellow/50">
              <RefreshCw className="h-3.5 w-3.5" /> Customer view
            </Link>
            {quotation.status === "Confirmed" || quotation.status === "Booked" || quotation.status === "Paid" || quotation.status === "Completed" ? (
              <a href={`/quote/${quotation.share_token}/invoice`} target="_blank" rel="noopener noreferrer" className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded bg-navy text-white hover:opacity-90">
                <Printer className="h-3.5 w-3.5" /> Invoice
              </a>
            ) : null}
          </div>
        </div>
      </aside>
    </div>
  );
}
