import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getQuoteByToken } from "@/lib/quotations.functions";
import { formatRWF } from "@/lib/products";

export const Route = createFileRoute("/quote/$token/invoice")({
  head: () => ({ meta: [{ title: "Invoice — LISA VOLT LINK" }, { name: "robots", content: "noindex" }] }),
  component: InvoicePage,
});

function InvoicePage() {
  const { token } = Route.useParams();
  const get = useServerFn(getQuoteByToken);
  const { data, isLoading } = useQuery({
    queryKey: ["quote-invoice", token],
    queryFn: () => get({ data: { token } }),
  });

  useEffect(() => {
    if (data) setTimeout(() => window.print(), 400);
  }, [data]);

  if (isLoading || !data) return <div style={{ padding: 40 }}>Loading…</div>;
  const { quotation, items } = data;
  const total = Number(quotation.final_total ?? quotation.current_total);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 40, color: "#0a1a36", fontFamily: "system-ui, sans-serif" }}>
      <style>{`@media print { @page { margin: 16mm; } button { display: none; } }`}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "3px solid #0a1a36", paddingBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900 }}>LISA VOLT LINK</h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#666" }}>Kigali, Rwanda · +250 788 286 465</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <h2 style={{ margin: 0, fontSize: 22 }}>INVOICE</h2>
          <p style={{ margin: "4px 0 0", fontSize: 12 }}>#{quotation.id.slice(0, 8).toUpperCase()}</p>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#666" }}>{new Date(quotation.confirmed_at ?? quotation.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div>
          <p style={{ fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: 1, margin: 0 }}>Billed to</p>
          <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 700 }}>{quotation.full_name}</p>
          <p style={{ margin: 0, fontSize: 12 }}>{quotation.phone}</p>
          {quotation.email && <p style={{ margin: 0, fontSize: 12 }}>{quotation.email}</p>}
          {quotation.delivery_location && <p style={{ margin: "4px 0 0", fontSize: 12 }}>{quotation.delivery_location}</p>}
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: 1, margin: 0 }}>Status</p>
          <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 700 }}>{quotation.status}</p>
        </div>
      </div>

      <table style={{ width: "100%", marginTop: 32, borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#0a1a36", color: "#FFD400" }}>
            <th style={{ padding: 10, textAlign: "left" }}>Item</th>
            <th style={{ padding: 10, textAlign: "right" }}>Qty</th>
            <th style={{ padding: 10, textAlign: "right" }}>Unit price</th>
            <th style={{ padding: 10, textAlign: "right" }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 10 }}>{it.product_name}</td>
              <td style={{ padding: 10, textAlign: "right" }}>{it.qty}</td>
              <td style={{ padding: 10, textAlign: "right" }}>{formatRWF(Number(it.current_unit_price))}</td>
              <td style={{ padding: 10, textAlign: "right" }}>{formatRWF(Number(it.current_unit_price) * it.qty)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} style={{ padding: 12, textAlign: "right", fontWeight: 700 }}>Total</td>
            <td style={{ padding: 12, textAlign: "right", fontWeight: 900, fontSize: 16 }}>{formatRWF(total)}</td>
          </tr>
        </tfoot>
      </table>

      <p style={{ marginTop: 40, fontSize: 11, color: "#666", textAlign: "center" }}>
        Thank you for your business · LISA VOLT LINK · lisavoltlink.com
      </p>

      <div style={{ textAlign: "center", marginTop: 24 }}>
        <button onClick={() => window.print()} style={{ padding: "10px 20px", background: "#FFD400", border: 0, borderRadius: 6, fontWeight: 700, cursor: "pointer" }}>
          Print / Save as PDF
        </button>
      </div>
    </div>
  );
}
