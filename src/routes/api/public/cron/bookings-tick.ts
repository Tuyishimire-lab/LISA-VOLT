import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/cron/bookings-tick")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apikey = request.headers.get("apikey");
        const expected = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!expected || apikey !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const now = new Date();
        const in2h = new Date(now.getTime() + 2 * 3600_000).toISOString();
        const in24h = new Date(now.getTime() + 24 * 3600_000).toISOString();

        // Expire bookings past deadline
        const { data: expired } = await supabaseAdmin
          .from("bookings").select("id, reference, quotation_id")
          .eq("status", "active").lte("expires_at", now.toISOString());
        for (const b of expired ?? []) {
          await supabaseAdmin.from("bookings").update({ status: "expired" }).eq("id", b.id);
          await supabaseAdmin.from("quotations").update({ status: "Expired" }).eq("id", b.quotation_id);
          await supabaseAdmin.from("admin_alerts").insert({
            kind: "BOOKING_EXPIRED",
            message: `Booking ${b.reference} expired — goods released back to stock`,
            reference_id: b.quotation_id,
          });
        }

        // 24-hour reminders
        const { data: dueSoon24 } = await supabaseAdmin
          .from("bookings").select("id, reference, quotation_id")
          .eq("status", "active").eq("reminded_24h", false).lte("expires_at", in24h).gt("expires_at", in2h);
        for (const b of dueSoon24 ?? []) {
          await supabaseAdmin.from("bookings").update({ reminded_24h: true }).eq("id", b.id);
          await supabaseAdmin.from("admin_alerts").insert({
            kind: "BOOKING_EXPIRING_24H",
            message: `Booking ${b.reference} expires in 24 hours`,
            reference_id: b.quotation_id,
          });
        }

        // 2-hour reminders
        const { data: dueSoon2 } = await supabaseAdmin
          .from("bookings").select("id, reference, quotation_id")
          .eq("status", "active").eq("reminded_2h", false).lte("expires_at", in2h).gt("expires_at", now.toISOString());
        for (const b of dueSoon2 ?? []) {
          await supabaseAdmin.from("bookings").update({ reminded_2h: true }).eq("id", b.id);
          await supabaseAdmin.from("admin_alerts").insert({
            kind: "BOOKING_EXPIRING_2H",
            message: `Booking ${b.reference} expires in 2 hours`,
            reference_id: b.quotation_id,
          });
        }

        // Expire stale pickup holds (24h)
        await supabaseAdmin.from("pickup_holds").update({ status: "expired" })
          .eq("status", "active").lte("expires_at", now.toISOString());

        return Response.json({
          ok: true,
          expired: expired?.length ?? 0,
          reminded_24h: dueSoon24?.length ?? 0,
          reminded_2h: dueSoon2?.length ?? 0,
        });
      },
    },
  },
});
