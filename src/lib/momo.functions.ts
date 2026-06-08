import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InitiateSchema = z.object({
  amount: z.number().positive().max(10_000_000),
  phone: z.string().min(7).max(20),
  externalId: z.string().min(1).max(64),
  payerMessage: z.string().max(160).optional(),
  payeeNote: z.string().max(160).optional(),
});

export const initiateMomoPayment = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => InitiateSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { requestToPay } = await import("@/lib/momo.server");

    const referenceId = crypto.randomUUID();
    const normalizedPhone = data.phone.replace(/\D/g, "");

    // Pre-insert the transaction record so we always have a trail.
    const { error: insertErr } = await supabaseAdmin.from("momo_transactions").insert({
      reference_id: referenceId,
      external_id: data.externalId,
      phone: normalizedPhone,
      amount: data.amount,
      currency: "RWF",
      payer_message: data.payerMessage ?? null,
      payee_note: data.payeeNote ?? null,
      status: "PENDING",
    });
    if (insertErr) throw new Error(`db insert failed: ${insertErr.message}`);

    try {
      await requestToPay({
        referenceId,
        externalId: data.externalId,
        amount: data.amount,
        phone: normalizedPhone,
        payerMessage: data.payerMessage,
        payeeNote: data.payeeNote,
      });
    } catch (e) {
      await supabaseAdmin
        .from("momo_transactions")
        .update({ status: "FAILED", reason: (e as Error).message })
        .eq("reference_id", referenceId);
      throw e;
    }

    return { referenceId };
  });

const StatusSchema = z.object({ referenceId: z.string().uuid() });

export const checkMomoStatus = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => StatusSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { getPaymentStatus } = await import("@/lib/momo.server");

    const { data: prior } = await supabaseAdmin
      .from("momo_transactions")
      .select("id, status")
      .eq("reference_id", data.referenceId)
      .maybeSingle();

    const result = await getPaymentStatus(data.referenceId);

    await supabaseAdmin
      .from("momo_transactions")
      .update({
        status: result.status,
        reason: result.reason ?? null,
        financial_transaction_id: result.financialTransactionId ?? null,
        raw_response: result.raw as never,
      })
      .eq("reference_id", data.referenceId);

    if (result.status === "FAILED" && prior?.status !== "FAILED") {
      await supabaseAdmin.from("admin_alerts").insert({
        transaction_id: prior?.id ?? null,
        reference_id: data.referenceId,
        kind: "FAILED",
        message: result.reason || "Payment failed at provider.",
      });
    }

    return {
      status: result.status,
      reason: result.reason,
      financialTransactionId: result.financialTransactionId,
    };
  });

const TimeoutSchema = z.object({ referenceId: z.string().uuid() });

export const markMomoTimedOut = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => TimeoutSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: prior } = await supabaseAdmin
      .from("momo_transactions")
      .select("id, status")
      .eq("reference_id", data.referenceId)
      .maybeSingle();

    if (!prior || prior.status !== "PENDING") return { ok: true };

    await supabaseAdmin
      .from("momo_transactions")
      .update({ status: "TIMEOUT", reason: "Client polling window expired without provider confirmation." })
      .eq("reference_id", data.referenceId);

    await supabaseAdmin.from("admin_alerts").insert({
      transaction_id: prior.id,
      reference_id: data.referenceId,
      kind: "TIMEOUT",
      message: "Payment timed out without provider response.",
    });

    return { ok: true };
  });
