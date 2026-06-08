import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

function checkToken(token: string) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) throw new Error("ADMIN_TOKEN not configured in backend secrets");
  if (token.length !== expected.length) throw new Error("Unauthorized");
  let diff = 0;
  for (let i = 0; i < token.length; i++) diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) throw new Error("Unauthorized");
}

const CATEGORIES = ["Lighting", "CCTV", "Electrical", "Other"] as const;
const BUDGETS = [
  "Under 10,000",
  "10,000–50,000",
  "50,000–200,000",
  "200,000–500,000",
  "Above 500,000",
] as const;
const STATUSES = ["New", "Sourcing", "Found", "Unavailable"] as const;

const ImageSchema = z.object({
  name: z.string().min(1).max(200),
  contentType: z.string().min(1).max(120),
  // base64-encoded data, ~2MB cap (2,800,000 base64 chars ≈ 2.1MB)
  dataBase64: z.string().min(1).max(3_500_000),
});

const SubmitSchema = z.object({
  full_name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(5).max(40),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  product_name: z.string().trim().min(1).max(2000),
  category: z.enum(CATEGORIES),
  budget_range: z.enum(BUDGETS).optional().or(z.literal("")),
  product_link: z.string().trim().max(2000).optional().or(z.literal("")),
  notes: z.string().trim().max(4000).optional().or(z.literal("")),
  images: z.array(ImageSchema).max(3).optional().default([]),
});

export const submitProductRequest = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => SubmitSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const uploadedPaths: string[] = [];
    for (const img of data.images ?? []) {
      const ext = (img.name.split(".").pop() || "jpg").toLowerCase().slice(0, 8);
      const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "jpg";
      const path = `${crypto.randomUUID()}.${safeExt}`;
      const buf = Buffer.from(img.dataBase64, "base64");
      const { error: upErr } = await supabaseAdmin.storage
        .from("product-requests")
        .upload(path, buf, { contentType: img.contentType, upsert: false });
      if (upErr) throw new Error(`Upload failed: ${upErr.message}`);
      uploadedPaths.push(path);
    }

    const { data: row, error } = await supabaseAdmin
      .from("product_requests")
      .insert({
        full_name: data.full_name,
        phone: data.phone,
        email: data.email || null,
        product_name: data.product_name,
        category: data.category,
        budget_range: data.budget_range || null,
        product_link: data.product_link || null,
        notes: data.notes || null,
        image_urls: uploadedPaths,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("admin_alerts").insert({
      kind: "product_request",
      message: `New product request from ${data.full_name}: ${data.product_name.slice(0, 80)}`,
      reference_id: row.id,
    });

    return { ok: true, id: row.id };
  });

const TokenOnly = z.object({ token: z.string().min(1).max(200) });

async function signImageUrls(paths: string[]): Promise<string[]> {
  if (!paths.length) return [];
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.storage
    .from("product-requests")
    .createSignedUrls(paths, 60 * 60);
  return (data ?? []).map((d) => d.signedUrl).filter((u): u is string => Boolean(u));
}

type ProductRequestRow = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  product_name: string;
  category: string;
  budget_range: string | null;
  image_urls: string[];
  product_link: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  image_signed_urls: string[];
};

export const adminListProductRequests = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => TokenOnly.parse(d))
  .handler(async ({ data }): Promise<{ rows: ProductRequestRow[] }> => {
    checkToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("product_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const out: ProductRequestRow[] = [];
    for (const r of (rows ?? []) as ProductRequestRow[]) {
      const signed = await signImageUrls(r.image_urls ?? []);
      out.push({ ...r, image_signed_urls: signed });
    }
    return { rows: out };
  });


const UpdateStatusSchema = z.object({
  token: z.string().min(1).max(200),
  id: z.string().uuid(),
  status: z.enum(STATUSES),
});

export const adminUpdateProductRequestStatus = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => UpdateStatusSchema.parse(d))
  .handler(async ({ data }) => {
    checkToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("product_requests")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const DeleteSchema = z.object({ token: z.string().min(1).max(200), id: z.string().uuid() });

export const adminDeleteProductRequest = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => DeleteSchema.parse(d))
  .handler(async ({ data }) => {
    checkToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("product_requests")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

type AdminAlertRow = {
  id: string;
  kind: string;
  message: string | null;
  reference_id: string | null;
  created_at: string;
  acknowledged_at: string | null;
};

export const adminListAlerts = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => TokenOnly.parse(d))
  .handler(async ({ data }): Promise<{ rows: AdminAlertRow[]; unread: number }> => {
    checkToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("admin_alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    const list = (rows ?? []) as AdminAlertRow[];
    return { rows: list, unread: list.filter((r) => !r.acknowledged_at).length };
  });

const AckSchema = z.object({ token: z.string().min(1).max(200), id: z.string().uuid() });

export const adminAcknowledgeAlert = createServerFn({ method: "POST" })
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

export const adminAcknowledgeAllAlerts = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => TokenOnly.parse(d))
  .handler(async ({ data }) => {
    checkToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("admin_alerts")
      .update({ acknowledged_at: new Date().toISOString() })
      .is("acknowledged_at", null);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const PRODUCT_REQUEST_CATEGORIES = CATEGORIES;
export const PRODUCT_REQUEST_BUDGETS = BUDGETS;
export const PRODUCT_REQUEST_STATUSES = STATUSES;
