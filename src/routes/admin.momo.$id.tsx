import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { adminGetMomo } from "@/lib/admin-momo.functions";
import { ArrowLeft, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/admin/momo/$id")({
  head: () => ({ meta: [{ title: "Transaction Details" }, { name: "robots", content: "noindex" }] }),
  component: TransactionDetailPage,
  errorComponent: ({ error }) => (
    <div className="container mx-auto p-8 text-sm text-destructive">{error.message}</div>
  ),
  notFoundComponent: () => <div className="container mx-auto p-8">Not found</div>,
});

type Tx = {
  id: string;
  reference_id: string;
  external_id: string;
  phone: string;
  amount: number;
  currency: string;
  status: string;
  financial_transaction_id: string | null;
  reason: string | null;
  payer_message: string | null;
  payee_note: string | null;
  raw_response: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

const TOKEN_KEY = "admin_momo_token";

function statusVariant(s: string): "default" | "secondary" | "destructive" | "outline" {
  if (s === "SUCCESSFUL") return "default";
  if (s === "FAILED") return "destructive";
  if (s === "PENDING") return "secondary";
  return "outline";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString();
}

function TransactionDetailPage() {
  const { id } = Route.useParams();
  const fetchDetail = useServerFn(adminGetMomo);

  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tx, setTx] = useState<Tx | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = sessionStorage.getItem(TOKEN_KEY);
    if (t) {
      setToken(t);
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (!authed || !id) return;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchDetail({ data: { token, id } });
        setTx(res.row as Tx);
      } catch (e) {
        setError((e as Error).message);
        if ((e as Error).message.toLowerCase().includes("unauthorized")) {
          setAuthed(false);
          sessionStorage.removeItem(TOKEN_KEY);
        }
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [authed, id, token, fetchDetail]);

  async function submitToken() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDetail({ data: { token, id } });
      setTx(res.row as Tx);
      sessionStorage.setItem(TOKEN_KEY, token);
      setAuthed(true);
    } catch (e) {
      setError((e as Error).message);
      sessionStorage.removeItem(TOKEN_KEY);
    } finally {
      setLoading(false);
    }
  }

  if (!authed) {
    return (
      <div className="container mx-auto max-w-sm p-8">
        <h1 className="mb-4 text-2xl font-semibold">Admin access</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submitToken();
          }}
          className="space-y-3"
        >
          <div>
            <Label htmlFor="token">Admin token</Label>
            <Input
              id="token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={!token || loading} className="w-full">
            {loading ? "Checking…" : "Sign in"}
          </Button>
        </form>
      </div>
    );
  }

  if (loading && !tx) {
    return (
      <div className="container mx-auto p-8">
        <p className="text-sm text-muted-foreground">Loading transaction…</p>
      </div>
    );
  }

  if (error && !tx) {
    return (
      <div className="container mx-auto p-8">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="ghost" size="sm" className="mt-2" asChild>
          <Link to="/admin/momo">← Back to list</Link>
        </Button>
      </div>
    );
  }

  if (!tx) return null;

  const createdAt = new Date(tx.created_at);
  const updatedAt = new Date(tx.updated_at);
  const isResolved = tx.status === "SUCCESSFUL" || tx.status === "FAILED";
  const timeoutAt = new Date(createdAt.getTime() + 90_000);
  const timedOut = !isResolved && Date.now() > timeoutAt.getTime();

  const timeline = [
    {
      label: "Payment requested",
      time: formatDate(tx.created_at),
      icon: <Clock className="h-4 w-4" />,
      active: true,
      color: "text-primary",
    },
    isResolved
      ? {
          label: tx.status === "SUCCESSFUL" ? "Payment approved" : "Payment failed",
          time: formatDate(tx.updated_at),
          icon:
            tx.status === "SUCCESSFUL" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            ),
          active: true,
          color: tx.status === "SUCCESSFUL" ? "text-green-600" : "text-destructive",
        }
      : {
          label: timedOut ? "Timed out awaiting approval" : "Awaiting approval",
          time: timedOut ? formatDate(timeoutAt.toISOString()) : `Est. timeout ${formatDate(timeoutAt.toISOString())}`,
          icon: timedOut ? <AlertCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />,
          active: false,
          color: timedOut ? "text-destructive" : "text-muted-foreground",
        },
  ];

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/momo">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Transaction details</h1>
      </div>

      {/* Timeline */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Status timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />
            <div className="space-y-6">
              {timeline.map((step, i) => (
                <div key={i} className="relative flex items-start gap-4">
                  <div
                    className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background ${
                      step.active ? "border-primary" : "border-muted"
                    }`}
                  >
                    <span className={step.color}>{step.icon}</span>
                  </div>
                  <div className="pt-1">
                    <p className="text-sm font-medium">{step.label}</p>
                    <p className="text-xs text-muted-foreground">{step.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key fields */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Key fields</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="text-lg font-semibold">
                {tx.amount} {tx.currency}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="font-mono text-sm">{tx.phone}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant={statusVariant(tx.status)} className="mt-1">
                {tx.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reference ID</p>
              <p className="font-mono text-sm">{tx.reference_id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">External ID</p>
              <p className="font-mono text-sm">{tx.external_id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Financial Transaction ID</p>
              <p className="font-mono text-sm">{tx.financial_transaction_id ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Payer message</p>
              <p className="text-sm">{tx.payer_message ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Payee note</p>
              <p className="text-sm">{tx.payee_note ?? "—"}</p>
            </div>
            {tx.reason && (
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">Reason</p>
                <p className="text-sm text-destructive">{tx.reason}</p>
              </div>
            )}
          </div>
          <Separator className="my-4" />
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>Created: {formatDate(tx.created_at)}</div>
            <div>Updated: {formatDate(tx.updated_at)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Raw response */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Raw provider response</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="max-h-[60vh] overflow-auto rounded-md border bg-muted p-3 text-xs">
            {JSON.stringify(tx.raw_response ?? null, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
