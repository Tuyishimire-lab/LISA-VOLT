import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* ============================================================
   Shared types
   ============================================================ */
export const QUOTATION_STATUSES = [
  "Pending",
  "Sent",
  "Negotiating",
  "Confirmed",
  "Booked",
  "PickupHold",
  "Paid",
  "Completed",
  "Expired",
  "Rejected",
] as const;
export type QuotationStatus = (typeof QUOTATION_STATUSES)[number];

/* ============================================================
   PUBLIC: create quotation request
   ============================================================ */
const ItemInput = z.object({
  product_id: z.string().min(1).max(80),
  product_name: z.string().min(1).max(200),
  qty: z.number().int().min(1).max(999),
  unit_price: z.number().min(0).max(100_000_000),
});

const CreateSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, "Invalid phone"),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  delivery_pref: z.enum(["pickup", "delivery"]),
  delivery_location: z.string().trim().max(255).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  items: z.array(ItemInput).min(1).max(50),
});

export const createQuotationRequest = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => CreateSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const total = data.items.reduce((s, i) => s + i.qty * i.unit_price, 0);

    const { data: q, error } = await supabaseAdmin
      .from("quotations")
      .insert({
        full_name: data.full_name,
        phone: data.phone.replace(/\s+/g, " ").trim(),
        email: data.email || null,
        delivery_pref: data.delivery_pref,
        delivery_location: data.delivery_location || null,
        notes: data.notes || null,
        status: "Pending",
        original_total: total,
        current_total: total,
      })
      .select("id, share_token")
      .single();
    if (error || !q) throw new Error(error?.message || "Could not create quotation");

    const items = data.items.map((it, idx) => ({
      quotation_id: q.id,
      product_id: it.product_id,
      product_name: it.product_name,
      qty: it.qty,
      original_unit_price: it.unit_price,
      current_unit_price: it.unit_price,
      sort_order: idx,
    }));
    await supabaseAdmin.from("quotation_items").insert(items);

    await supabaseAdmin.from("quotation_offers").insert({
      quotation_id: q.id,
      actor: "customer",
      kind: "request",
      total,
      message: data.notes || null,
    });

    await supabaseAdmin.from("admin_alerts").insert({
      kind: "NEW_QUOTATION",
      message: `New quotation from ${data.full_name} (RWF ${total.toLocaleString()})`,
      reference_id: q.id,
    });

    return { id: q.id, share_token: q.share_token };
  });

/* ============================================================
   PUBLIC: get quote by token
   ============================================================ */
const TokenSchema = z.object({ token: z.string().min(8).max(80) });

async function loadQuoteByToken(token: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: q } = await supabaseAdmin
    .from("quotations").select("*").eq("share_token", token).maybeSingle();
  if (!q) throw new Error("Quotation not found");
  const [{ data: items }, { data: offers }, { data: bookings }, { data: holds }] = await Promise.all([
    supabaseAdmin.from("quotation_items").select("*").eq("quotation_id", q.id).order("sort_order"),
    supabaseAdmin.from("quotation_offers").select("*").eq("quotation_id", q.id).order("created_at"),
    supabaseAdmin.from("bookings").select("*").eq("quotation_id", q.id).order("created_at", { ascending: false }),
    supabaseAdmin.from("pickup_holds").select("*").eq("quotation_id", q.id).order("created_at", { ascending: false }),
  ]);
  return { quotation: q, items: items ?? [], offers: offers ?? [], bookings: bookings ?? [], pickup_holds: holds ?? [] };
}

export const getQuoteByToken = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => TokenSchema.parse(d))
  .handler(async ({ data }) => loadQuoteByToken(data.token));

/* ============================================================
   PUBLIC: customer actions
   ============================================================ */
export const customerAcceptQuote = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => TokenSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { quotation } = await loadQuoteByToken(data.token);
    if (!["Sent", "Negotiating"].includes(quotation.status)) {
      throw new Error("This quotation cannot be accepted in its current state.");
    }
    await supabaseAdmin.from("quotations").update({
      status: "Confirmed",
      confirmed_at: new Date().toISOString(),
      final_total: quotation.current_total,
    }).eq("id", quotation.id);
    await supabaseAdmin.from("quotation_offers").insert({
      quotation_id: quotation.id, actor: "customer", kind: "accepted", total: quotation.current_total,
    });
    await supabaseAdmin.from("admin_alerts").insert({
      kind: "QUOTE_ACCEPTED",
      message: `Quotation accepted by ${quotation.full_name} (RWF ${Number(quotation.current_total).toLocaleString()})`,
      reference_id: quotation.id,
    });
    return { ok: true };
  });

const CounterSchema = z.object({
  token: z.string().min(8).max(80),
  discount_pct: z.number().min(0).max(95).optional(),
  new_total: z.number().min(0).max(1_000_000_000).optional(),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
}).refine((d) => d.discount_pct != null || d.new_total != null, { message: "Provide discount or total" });

export const customerCounterOffer = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => CounterSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { quotation } = await loadQuoteByToken(data.token);
    if (!["Sent", "Negotiating"].includes(quotation.status)) throw new Error("Cannot counter in this state.");
    const proposed = data.new_total ?? Math.max(0, Number(quotation.current_total) * (1 - (data.discount_pct ?? 0) / 100));
    await supabaseAdmin.from("quotation_offers").insert({
      quotation_id: quotation.id,
      actor: "customer",
      kind: "counter_offer",
      total: proposed,
      discount_pct: data.discount_pct ?? null,
      message: data.message || null,
    });
    await supabaseAdmin.from("quotations").update({ status: "Negotiating" }).eq("id", quotation.id);
    await supabaseAdmin.from("admin_alerts").insert({
      kind: "COUNTER_OFFER",
      message: `Counter-offer from ${quotation.full_name}: RWF ${Math.round(proposed).toLocaleString()}`,
      reference_id: quotation.id,
    });
    return { ok: true };
  });

const RejectSchema = z.object({
  token: z.string().min(8).max(80),
  reason: z.string().trim().max(500).optional().or(z.literal("")),
});

export const customerRejectQuote = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => RejectSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { quotation } = await loadQuoteByToken(data.token);
    if (["Confirmed", "Booked", "Paid", "Completed"].includes(quotation.status)) {
      throw new Error("This quotation is already confirmed.");
    }
    await supabaseAdmin.from("quotations").update({ status: "Rejected", rejected_reason: data.reason || null }).eq("id", quotation.id);
    await supabaseAdmin.from("quotation_offers").insert({
      quotation_id: quotation.id, actor: "customer", kind: "rejected", message: data.reason || null,
    });
    await supabaseAdmin.from("admin_alerts").insert({
      kind: "QUOTE_REJECTED",
      message: `Quotation rejected by ${quotation.full_name}`,
      reference_id: quotation.id,
    });
    return { ok: true };
  });

/* ============================================================
   PUBLIC: pay at shop
   ============================================================ */
export const customerChoosePayAtShop = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => TokenSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { quotation } = await loadQuoteByToken(data.token);
    if (quotation.status !== "Confirmed") throw new Error("Quotation must be confirmed first.");
    const reference = "PICK-" + Date.now().toString(36).toUpperCase();
    const expires_at = new Date(Date.now() + 24 * 3600_000).toISOString();
    await supabaseAdmin.from("pickup_holds").insert({
      quotation_id: quotation.id, reference, expires_at, status: "active",
    });
    await supabaseAdmin.from("quotations").update({ status: "PickupHold" }).eq("id", quotation.id);
    return { reference, expires_at };
  });

/* ============================================================
   PUBLIC: booking deposit + full payment
   ============================================================ */
const BookingCreateSchema = z.object({ token: z.string().min(8).max(80) });

export const customerCreateBooking = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => BookingCreateSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { quotation } = await loadQuoteByToken(data.token);
    if (quotation.status !== "Confirmed") throw new Error("Quotation must be confirmed.");
    const total = Number(quotation.final_total ?? quotation.current_total);
    const deposit = Math.round(total * 0.05);
    const reference = "BOOK-" + Date.now().toString(36).toUpperCase();
    const expires_at = new Date(Date.now() + 48 * 3600_000).toISOString();
    const { data: booking, error } = await supabaseAdmin.from("bookings").insert({
      quotation_id: quotation.id, reference, deposit_amount: deposit, total, balance: total - deposit, expires_at,
      status: "active",
    }).select("id, reference, deposit_amount, total, balance, expires_at").single();
    if (error || !booking) throw new Error(error?.message ?? "Could not create booking");
    return booking;
  });

const BookingPaidSchema = z.object({
  token: z.string().min(8).max(80),
  booking_reference: z.string().min(3).max(80),
  momo_reference: z.string().uuid(),
});

export const customerMarkBookingPaid = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => BookingPaidSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { quotation } = await loadQuoteByToken(data.token);
    const { data: booking } = await supabaseAdmin
      .from("bookings").select("*").eq("reference", data.booking_reference).eq("quotation_id", quotation.id).maybeSingle();
    if (!booking) throw new Error("Booking not found");
    await supabaseAdmin.from("bookings").update({ deposit_momo_reference: data.momo_reference }).eq("id", booking.id);
    await supabaseAdmin.from("quotations").update({ status: "Booked" }).eq("id", quotation.id);
    await supabaseAdmin.from("admin_alerts").insert({
      kind: "BOOKING_CREATED",
      message: `New 5% booking ${booking.reference} from ${quotation.full_name} (RWF ${Number(booking.deposit_amount).toLocaleString()} paid)`,
      reference_id: quotation.id,
    });
    return { ok: true };
  });

const FullPaySchema = z.object({
  token: z.string().min(8).max(80),
  momo_reference: z.string().uuid(),
});

export const customerMarkOnlinePaid = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => FullPaySchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { quotation } = await loadQuoteByToken(data.token);
    const amount = Number(quotation.final_total ?? quotation.current_total);
    const reference = "PAY-" + Date.now().toString(36).toUpperCase();
    await supabaseAdmin.from("online_payments").insert({
      quotation_id: quotation.id, reference, amount, momo_reference: data.momo_reference, status: "paid",
    });
    await supabaseAdmin.from("quotations").update({ status: "Paid" }).eq("id", quotation.id);
    await supabaseAdmin.from("admin_alerts").insert({
      kind: "PAID_ONLINE",
      message: `${quotation.full_name} paid online (RWF ${amount.toLocaleString()})`,
      reference_id: quotation.id,
    });
    return { reference };
  });

/* ============================================================
   ADMIN: gated by role
   ============================================================ */
async function requireAdmin(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}
// minimal type avoid extra import
type SupabaseClient = { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }> };

const AdminListSchema = z.object({
  status: z.string().max(40).optional(),
  search: z.string().max(120).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export const adminListQuotations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => AdminListSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase as unknown as SupabaseClient, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin.from("quotations").select("*").order("created_at", { ascending: false }).limit(500);
    if (data.status && data.status !== "All") q = q.eq("status", data.status);
    if (data.search) q = q.or(`full_name.ilike.%${data.search}%,phone.ilike.%${data.search}%,email.ilike.%${data.search}%`);
    if (data.from) q = q.gte("created_at", data.from);
    if (data.to) q = q.lte("created_at", data.to);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

const AdminIdSchema = z.object({ id: z.string().uuid() });

export const adminGetQuotation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => AdminIdSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase as unknown as SupabaseClient, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: q, error } = await supabaseAdmin.from("quotations").select("*").eq("id", data.id).maybeSingle();
    if (error || !q) throw new Error(error?.message ?? "Not found");
    const [{ data: items }, { data: offers }, { data: bookings }, { data: holds }, { data: payments }] = await Promise.all([
      supabaseAdmin.from("quotation_items").select("*").eq("quotation_id", q.id).order("sort_order"),
      supabaseAdmin.from("quotation_offers").select("*").eq("quotation_id", q.id).order("created_at"),
      supabaseAdmin.from("bookings").select("*").eq("quotation_id", q.id).order("created_at", { ascending: false }),
      supabaseAdmin.from("pickup_holds").select("*").eq("quotation_id", q.id).order("created_at", { ascending: false }),
      supabaseAdmin.from("online_payments").select("*").eq("quotation_id", q.id).order("created_at", { ascending: false }),
    ]);
    return { quotation: q, items: items ?? [], offers: offers ?? [], bookings: bookings ?? [], pickup_holds: holds ?? [], payments: payments ?? [] };
  });

const SendSchema = z.object({
  id: z.string().uuid(),
  validity_hours: z.number().int().min(1).max(720),
  items: z.array(z.object({
    id: z.string().uuid(),
    unit_price: z.number().min(0).max(100_000_000),
  })).min(1).max(100),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const adminSendQuote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SendSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase as unknown as SupabaseClient, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: q } = await supabaseAdmin.from("quotations").select("*").eq("id", data.id).maybeSingle();
    if (!q) throw new Error("Quotation not found");
    const { data: existing } = await supabaseAdmin.from("quotation_items").select("id, qty").eq("quotation_id", q.id);
    if (!existing) throw new Error("No items");
    const byId = new Map(existing.map((i) => [i.id, i]));
    let total = 0;
    const overrides: { product_id: string; unit_price: number }[] = [];
    for (const it of data.items) {
      const row = byId.get(it.id);
      if (!row) continue;
      total += it.unit_price * row.qty;
      await supabaseAdmin.from("quotation_items").update({ current_unit_price: it.unit_price }).eq("id", it.id);
      overrides.push({ product_id: it.id, unit_price: it.unit_price });
    }
    const now = new Date();
    const expires_at = new Date(now.getTime() + data.validity_hours * 3600_000).toISOString();
    await supabaseAdmin.from("quotations").update({
      status: q.status === "Negotiating" ? "Negotiating" : "Sent",
      current_total: total,
      validity_hours: data.validity_hours,
      quoted_at: now.toISOString(),
      expires_at,
    }).eq("id", q.id);
    await supabaseAdmin.from("quotation_offers").insert({
      quotation_id: q.id,
      actor: "admin",
      kind: q.status === "Negotiating" ? "revised" : "quote_sent",
      total,
      message: data.message || null,
      item_overrides: overrides,
    });
    return { ok: true, total, expires_at };
  });

export const adminAcceptCounter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => AdminIdSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase as unknown as SupabaseClient, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: lastCounter } = await supabaseAdmin
      .from("quotation_offers").select("*")
      .eq("quotation_id", data.id).eq("actor", "customer").eq("kind", "counter_offer")
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (!lastCounter) throw new Error("No counter-offer to accept");
    const newTotal = Number(lastCounter.total);
    await supabaseAdmin.from("quotations").update({
      status: "Confirmed", current_total: newTotal, final_total: newTotal,
      confirmed_at: new Date().toISOString(),
    }).eq("id", data.id);
    await supabaseAdmin.from("quotation_offers").insert({
      quotation_id: data.id, actor: "admin", kind: "accepted", total: newTotal,
    });
    return { ok: true };
  });

export const adminRejectQuote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), reason: z.string().trim().max(500).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase as unknown as SupabaseClient, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("quotations").update({ status: "Rejected", rejected_reason: data.reason ?? null }).eq("id", data.id);
    await supabaseAdmin.from("quotation_offers").insert({
      quotation_id: data.id, actor: "admin", kind: "rejected", message: data.reason ?? null,
    });
    return { ok: true };
  });

export const adminMarkCompleted = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => AdminIdSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase as unknown as SupabaseClient, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("quotations").update({ status: "Completed" }).eq("id", data.id);
    await supabaseAdmin.from("bookings").update({ status: "completed" }).eq("quotation_id", data.id).eq("status", "active");
    return { ok: true };
  });

export const adminToggleRefundDeposit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ booking_id: z.string().uuid(), refund: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase as unknown as SupabaseClient, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("bookings").update({ refund_deposit: data.refund }).eq("id", data.booking_id);
    return { ok: true };
  });
