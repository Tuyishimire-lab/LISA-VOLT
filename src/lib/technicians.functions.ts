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

const SELECT_COLS =
  "id, name, initials, specialty, years, areas, rating, ratings, phone, whatsapp, status, color, skills, sort_order";

export const listTechniciansPublic = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("technicians")
    .select(SELECT_COLS)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return { rows: data ?? [] };
});

const TokenOnly = z.object({ token: z.string().min(1).max(200) });

export const adminListTechnicians = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => TokenOnly.parse(d))
  .handler(async ({ data }) => {
    checkToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("technicians")
      .select(SELECT_COLS)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

const TechFields = z.object({
  name: z.string().trim().min(1).max(120),
  initials: z.string().trim().min(1).max(4),
  specialty: z.enum(["Electrician", "CCTV Installer", "Lighting Specialist"]),
  years: z.number().int().min(0).max(80),
  areas: z.array(z.string().trim().min(1).max(60)).max(30),
  rating: z.number().min(0).max(5),
  ratings: z.number().int().min(0).max(100000),
  phone: z.string().trim().min(1).max(40),
  whatsapp: z.string().trim().min(1).max(20),
  status: z.enum(["Available Now", "Busy", "Offline"]),
  color: z.string().trim().min(1).max(20),
  skills: z.array(z.string().trim().min(1).max(120)).max(100),
  sort_order: z.number().int().min(0).max(100000).optional(),
});

const CreateSchema = z.object({ token: z.string().min(1).max(200), fields: TechFields });
const UpdateSchema = z.object({
  token: z.string().min(1).max(200),
  id: z.string().uuid(),
  fields: TechFields.partial(),
});
const DeleteSchema = z.object({ token: z.string().min(1).max(200), id: z.string().uuid() });

export const adminCreateTechnician = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => CreateSchema.parse(d))
  .handler(async ({ data }) => {
    checkToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("technicians")
      .insert(data.fields)
      .select(SELECT_COLS)
      .single();
    if (error) throw new Error(error.message);
    return { row };
  });

export const adminUpdateTechnician = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => UpdateSchema.parse(d))
  .handler(async ({ data }) => {
    checkToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("technicians")
      .update(data.fields)
      .eq("id", data.id)
      .select(SELECT_COLS)
      .single();
    if (error) throw new Error(error.message);
    return { row };
  });

export const adminDeleteTechnician = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => DeleteSchema.parse(d))
  .handler(async ({ data }) => {
    checkToken(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("technicians").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
