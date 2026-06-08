import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Returns whether the signed-in user has the admin role, and whether any admin exists. */
export const getMyAdminStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    const { data: noAdmins } = await supabase.rpc("no_admins_yet");
    return { isAdmin: !!isAdmin, noAdminsYet: !!noAdmins, userId };
  });

/** First-admin bootstrap: only works when no admin exists yet. */
export const bootstrapMakeMeAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin
      .from("user_roles").select("id").eq("role", "admin").limit(1).maybeSingle();
    if (existing) throw new Error("An admin already exists. Ask an existing admin to grant you the role.");
    const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "admin" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
