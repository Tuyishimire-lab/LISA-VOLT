import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

function checkToken(token: string) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) throw new Error("ADMIN_TOKEN not configured in backend secrets");
  // constant-time-ish compare
  if (token.length !== expected.length) throw new Error("Unauthorized");
  let diff = 0;
  for (let i = 0; i < token.length; i++) diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) throw new Error("Unauthorized");
}

const ListSchema = z.object({
  token: z.string().min(1).max(200),
  phone: z.string().max(20).optional(),
  status: z.enum(["PENDING", "SUCCESSFUL", "FAILED", "TIMEOUT", "ALL"]).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.number().int().min(1).max(500).optional(),
});

const TokenOnly = z.object({ token: z.string().min(1).max(200) });

export const adminListAlerts = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => TokenOnly.parse(d))
  .handler(async ({ data }) => {
    checkToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("admin_alerts")
      .select("id, transaction_id, reference_id, kind, message, acknowledged_at, created_at")
      .is("acknowledged_at", null)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return { alerts: rows ?? [] };
  });

const AckSchema = z.object({ token: z.string().min(1).max(200), id: z.string().uuid() });

export const adminAckAlert = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => AckSchema.parse(d))
  .handler(async ({ data }) => {
    checkToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("admin_alerts")
      .update({ acknowledged_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListMomo = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ListSchema.parse(d))
  .handler(async ({ data }) => {
    checkToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("momo_transactions")
      .select(
        "id, reference_id, external_id, phone, amount, currency, status, financial_transaction_id, reason, payer_message, created_at, updated_at",
      )
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 100);
    if (data.phone) q = q.ilike("phone", `%${data.phone.replace(/\D/g, "")}%`);
    if (data.status && data.status !== "ALL") q = q.eq("status", data.status);
    if (data.from) q = q.gte("created_at", data.from);
    if (data.to) q = q.lte("created_at", data.to);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

const DetailSchema = z.object({
  token: z.string().min(1).max(200),
  id: z.string().uuid(),
});

export const adminGetMomo = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => DetailSchema.parse(d))
  .handler(async ({ data }) => {
    checkToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("momo_transactions")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Not found");
    return { row };
  });
