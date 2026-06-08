import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { adminListQuotations, QUOTATION_STATUSES } from "@/lib/quotations.functions";
import { Search, MessageCircle, FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/quotations")({
  head: () => ({ meta: [{ title: "Admin — Quotations" }, { name: "robots", content: "noindex" }] }),
  component: AdminQuotationsList,
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

function AdminQuotationsList() {
  const list = useServerFn(adminListQuotations);
  const [status, setStatus] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-quotations", status, search, from, to],
    queryFn: () => list({ data: { status, search: search || undefined, from: from || undefined, to: to || undefined } }),
    refetchInterval: 30_000,
  });

  return (
    <div className="container-x py-6">
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <h1 className="text-2xl font-extrabold text-navy">Quotations</h1>
        <p className="text-xs text-muted-foreground">{data?.rows.length ?? 0} total</p>
      </div>

      <div className="grid sm:grid-cols-4 gap-2 mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, phone, email" className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-md outline-none focus:border-yellow" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-md outline-none focus:border-yellow">
          <option value="All">All statuses</option>
          {QUOTATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-md outline-none focus:border-yellow" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-md outline-none focus:border-yellow" />
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}

      <div className="overflow-x-auto bg-card border border-border rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Phone</th>
              <th className="text-right p-3">Total</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(data?.rows ?? []).map((q) => (
              <tr key={q.id} className="hover:bg-muted/30">
                <td className="p-3 text-xs">{new Date(q.created_at).toLocaleString()}</td>
                <td className="p-3 font-semibold text-navy">{q.full_name}</td>
                <td className="p-3 text-xs">{q.phone}</td>
                <td className="p-3 text-right font-bold tabular-nums">{Number(q.current_total).toLocaleString()} RWF</td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded text-[11px] font-bold ${STATUS_BADGES[q.status] || ""}`}>{q.status}</span></td>
                <td className="p-3 text-right">
                  <div className="inline-flex gap-1">
                    <a href={`https://wa.me/${q.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello ${q.full_name}, regarding your quotation: ${window.location.origin}/quote/${q.share_token}`)}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-green-100 text-green-700" title="WhatsApp"><MessageCircle className="h-4 w-4" /></a>
                    <Link to="/admin/quotations/$id" params={{ id: q.id }} className="p-1.5 rounded hover:bg-yellow/30 text-navy" title="Open">
                      <FileText className="h-4 w-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && (data?.rows ?? []).length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground text-sm">No quotations match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
