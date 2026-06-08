import { useEffect, useRef, useState } from "react";
import { Loader2, Smartphone, Check, X, Clock, ShieldCheck } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { formatRWF } from "@/lib/products";
import { initiateMomoPayment, checkMomoStatus, markMomoTimedOut } from "@/lib/momo.functions";

export type MomoStatus = "idle" | "requesting" | "awaiting" | "approved" | "declined" | "timeout" | "cancelled";

type Props = {
  open: boolean;
  amount: number;
  phone: string;
  onClose: () => void;
  onSuccess: (txnRef: string) => void;
};

const PROVIDERS = [
  { id: "mtn", label: "MTN MoMo", color: "bg-[#FFCC00] text-black" },
  { id: "airtel", label: "Airtel Money", color: "bg-[#E60000] text-white" },
] as const;

export function MomoPaymentModal({ open, amount, phone: initialPhone, onClose, onSuccess }: Props) {
  const [provider, setProvider] = useState<(typeof PROVIDERS)[number]["id"]>("mtn");
  const [phone, setPhone] = useState(initialPhone);
  const [status, setStatus] = useState<MomoStatus>("idle");
  const [countdown, setCountdown] = useState(90);
  const [txnRef, setTxnRef] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelledRef = useRef(false);

  const initiate = useServerFn(initiateMomoPayment);
  const check = useServerFn(checkMomoStatus);
  const markTimeout = useServerFn(markMomoTimedOut);

  function clearPolling() {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }
  useEffect(() => () => clearPolling(), []);
  useEffect(() => {
    if (open) {
      setStatus("idle");
      setCountdown(90);
      setPhone(initialPhone);
      setErrorMsg("");
      setTxnRef("");
      cancelledRef.current = false;
    }
  }, [open, initialPhone]);

  useEffect(() => {
    if (status !== "awaiting") return;
    if (countdown <= 0) {
      clearPolling();
      setStatus("timeout");
      if (txnRef) {
        void markTimeout({ data: { referenceId: txnRef } }).catch(() => {});
      }
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [status, countdown, txnRef, markTimeout]);

  if (!open) return null;

  async function start() {
    if (!/^\+?[0-9 ()-]{7,20}$/.test(phone)) return;
    if (provider !== "mtn") {
      setErrorMsg("Airtel Money is coming soon. Please use MTN MoMo for now.");
      return;
    }
    setErrorMsg("");
    setStatus("requesting");
    setCountdown(90);
    cancelledRef.current = false;

    const externalId = "LVL-" + Date.now().toString(36).toUpperCase();

    try {
      const { referenceId } = await initiate({
        data: {
          amount: Math.round(amount),
          phone,
          externalId,
          payerMessage: "LISA VOLT LINK order",
          payeeNote: externalId,
        },
      });
      if (cancelledRef.current) return;
      setTxnRef(referenceId);
      setStatus("awaiting");

      pollRef.current = setInterval(async () => {
        try {
          const res = await check({ data: { referenceId } });
          if (cancelledRef.current) return;
          if (res.status === "SUCCESSFUL") {
            clearPolling();
            setStatus("approved");
            setTimeout(() => onSuccess(referenceId), 1000);
          } else if (res.status === "FAILED") {
            clearPolling();
            setErrorMsg(res.reason || "Payment declined by provider.");
            setStatus("declined");
          }
        } catch {
          /* keep polling, transient errors */
        }
      }, 3500);
    } catch (e) {
      setErrorMsg((e as Error).message || "Could not start payment.");
      setStatus("declined");
    }
  }

  function cancel() {
    cancelledRef.current = true;
    clearPolling();
    setStatus("cancelled");
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-md rounded-2xl bg-card overflow-hidden shadow-2xl">
        <button onClick={onClose} disabled={status === "requesting" || status === "awaiting"} className="absolute top-3 right-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-navy hover:bg-yellow disabled:opacity-30 disabled:cursor-not-allowed transition-colors" aria-label="Close">
          <X className="h-4 w-4" />
        </button>

        <div className="bg-navy text-white p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-yellow text-navy"><Smartphone className="h-5 w-5" /></div>
            <div>
              <p className="text-yellow text-[11px] font-bold uppercase tracking-widest">Mobile Money</p>
              <h3 className="text-lg font-extrabold">Pay {formatRWF(amount)}</h3>
            </div>
          </div>
        </div>

        <div className="p-6">
          {status === "idle" || status === "cancelled" || status === "declined" || status === "timeout" ? (
            <>
              {(status === "declined" || status === "timeout" || status === "cancelled") && (
                <StatusBanner status={status} message={errorMsg} />
              )}

              <p className="text-xs font-semibold uppercase tracking-wider text-navy mb-2">Choose provider</p>
              <div className="grid grid-cols-2 gap-2">
                {PROVIDERS.map((p) => (
                  <button key={p.id} type="button" onClick={() => setProvider(p.id)} className={`p-3 rounded-lg border-2 text-sm font-bold transition-all ${provider === p.id ? "border-yellow bg-yellow/10" : "border-border hover:border-navy"}`}>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] mr-2 ${p.color}`}>{p.id.toUpperCase()}</span>
                    {p.label}
                  </button>
                ))}
              </div>

              <label className="block mt-4 text-xs font-semibold uppercase tracking-wider text-navy mb-1.5">MoMo number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+250 7…"
                maxLength={20}
                className="w-full px-3 py-2.5 text-sm border-2 border-border rounded-md outline-none focus:border-yellow"
              />
              <p className="mt-1.5 text-[11px] text-muted-foreground">You'll receive a prompt on this number to approve the payment.</p>

              <button onClick={start} className="btn-yellow w-full mt-5">
                <Smartphone className="h-4 w-4" /> Send payment request
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-yellow-dark" /> Secured by LISA VOLT LINK
              </p>
            </>
          ) : (
            <LiveStatus status={status} provider={provider} phone={phone} amount={amount} countdown={countdown} txnRef={txnRef} onCancel={cancel} />
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBanner({ status, message }: { status: MomoStatus; message?: string }) {
  const map: Record<string, { label: string; sub: string; tone: string }> = {
    declined: { label: "Payment declined", sub: message || "The transaction was rejected. Please try again.", tone: "bg-destructive/10 text-destructive" },
    timeout: { label: "Request timed out", sub: "No response from your phone. Try again.", tone: "bg-amber-500/10 text-amber-700" },
    cancelled: { label: "Payment cancelled", sub: "You cancelled the request.", tone: "bg-muted text-muted-foreground" },
  };
  const m = map[status];
  if (!m) return null;
  return (
    <div className={`p-3 rounded-lg mb-4 ${m.tone}`}>
      <p className="text-sm font-bold">{m.label}</p>
      <p className="text-xs opacity-90 break-words">{m.sub}</p>
    </div>
  );
}

function LiveStatus({ status, provider, phone, amount, countdown, txnRef, onCancel }: { status: MomoStatus; provider: string; phone: string; amount: number; countdown: number; txnRef: string; onCancel: () => void }) {
  const steps = [
    { key: "requesting", label: "Sending request to provider", Icon: Loader2 },
    { key: "awaiting", label: "Awaiting confirmation on your phone", Icon: Clock },
    { key: "approved", label: "Payment approved", Icon: Check },
  ] as const;

  const order: MomoStatus[] = ["requesting", "awaiting", "approved"];
  const currentIdx = order.indexOf(status);

  return (
    <div>
      <div className="rounded-xl border border-border p-4 bg-muted/40 text-xs space-y-1.5">
        <Row label="Provider" value={provider.toUpperCase()} />
        <Row label="Number" value={phone} />
        <Row label="Amount" value={formatRWF(amount)} />
        {txnRef && <Row label="Reference" value={txnRef} mono />}
      </div>

      <ul className="mt-5 space-y-3">
        {steps.map((s, i) => {
          const done = currentIdx > i || status === "approved";
          const active = currentIdx === i && status !== "approved";
          return (
            <li key={s.key} className="flex items-center gap-3">
              <div className={`grid h-8 w-8 place-items-center rounded-full transition-colors ${done ? "bg-green-600 text-white" : active ? "bg-yellow text-navy" : "bg-muted text-muted-foreground"}`}>
                {done ? <Check className="h-4 w-4" /> : <s.Icon className={`h-4 w-4 ${active && s.Icon === Loader2 ? "animate-spin" : ""} ${active && s.Icon === Clock ? "animate-pulse" : ""}`} />}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${done ? "text-navy" : active ? "text-navy" : "text-muted-foreground"}`}>{s.label}</p>
                {active && status === "awaiting" && (
                  <p className="text-[11px] text-muted-foreground">Time remaining: <span className="font-bold text-navy tabular-nums">{countdown}s</span></p>
                )}
                {active && status === "requesting" && (
                  <p className="text-[11px] text-muted-foreground">Contacting MoMo gateway…</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {status === "approved" && (
        <div className="mt-5 p-3 rounded-lg bg-green-600/10 text-green-700 text-center">
          <p className="text-sm font-bold">Payment successful · placing your order…</p>
        </div>
      )}

      {(status === "requesting" || status === "awaiting") && (
        <button onClick={onCancel} className="mt-5 w-full text-xs font-semibold text-muted-foreground hover:text-destructive">
          Cancel payment request
        </button>
      )}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold text-navy ${mono ? "font-mono text-[11px]" : ""} break-all`}>{value}</span>
    </div>
  );
}
