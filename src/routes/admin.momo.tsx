import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { adminListMomo, adminListAlerts, adminAckAlert } from "@/lib/admin-momo.functions";
import { AlertTriangle, BellRing } from "lucide-react";

export const Route = createFileRoute("/admin/momo")({
  head: () => ({ meta: [{ title: "Admin — MoMo Transactions" }, { name: "robots", content: "noindex" }] }),
  component: AdminMomoPage,
  errorComponent: ({ error }) => (
    <div className="container mx-auto p-8 text-sm text-destructive">{error.message}</div>
  ),
  notFoundComponent: () => <div className="container mx-auto p-8">Not found</div>,
});

type Row = {
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
  created_at: string;
  updated_at: string;
};

const TOKEN_KEY = "admin_momo_token";

function statusVariant(s: string): "default" | "secondary" | "destructive" | "outline" {
  if (s === "SUCCESSFUL") return "default";
  if (s === "FAILED" || s === "TIMEOUT") return "destructive";
  if (s === "PENDING") return "secondary";
  return "outline";
}

type Alert = {
  id: string;
  transaction_id: string | null;
  reference_id: string | null;
  kind: "FAILED" | "TIMEOUT";
  message: string | null;
  created_at: string;
};

function AdminMomoPage() {
  const list = useServerFn(adminListMomo);
  const listAlerts = useServerFn(adminListAlerts);
  const ackAlert = useServerFn(adminAckAlert);

  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"ALL" | "PENDING" | "SUCCESSFUL" | "FAILED" | "TIMEOUT">("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
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

  async function loadAlerts(t = token) {
    try {
      const res = await listAlerts({ data: { token: t } });
      setAlerts(res.alerts as Alert[]);
    } catch {
      /* ignore — main load surfaces auth errors */
    }
  }

  async function load(t = token) {
    setLoading(true);
    setError(null);
    try {
      const res = await list({
        data: {
          token: t,
          phone: phone || undefined,
          status,
          from: from ? new Date(from).toISOString() : undefined,
          to: to ? new Date(to + "T23:59:59").toISOString() : undefined,
        },
      });
      setRows(res.rows as Row[]);
      sessionStorage.setItem(TOKEN_KEY, t);
      setAuthed(true);
      void loadAlerts(t);
    } catch (e) {
      setError((e as Error).message);
      setAuthed(false);
      sessionStorage.removeItem(TOKEN_KEY);
    } finally {
      setLoading(false);
    }
  }

  async function acknowledge(id: string) {
    setAlerts((a) => a.filter((x) => x.id !== id));
    try {
      await ackAlert({ data: { token, id } });
    } catch {
      void loadAlerts();
    }
  }

  useEffect(() => {
    if (!authed) return;
    void load(token);
    const t = setInterval(() => void loadAlerts(), 20_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  if (!authed) {
    return (
      <div className="container mx-auto max-w-sm p-8">
        <h1 className="mb-4 text-2xl font-semibold">Admin access</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void load(token);
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
          <p className="text-xs text-muted-foreground">
            Set the <code>ADMIN_TOKEN</code> secret in backend settings.
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">MoMo transactions</h1>
          {alerts.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
              <BellRing className="h-3.5 w-3.5" /> {alerts.length} alert{alerts.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            sessionStorage.removeItem(TOKEN_KEY);
            setAuthed(false);
            setToken("");
            setRows([]);
            setAlerts([]);
          }}
        >
          Sign out
        </Button>
      </div>

      {alerts.length > 0 && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-destructive">
            <AlertTriangle className="h-4 w-4" /> Transactions needing review
          </div>
          <ul className="space-y-2">
            {alerts.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-background p-3 text-sm shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={a.kind === "FAILED" ? "destructive" : "outline"}>{a.kind}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(a.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {a.message || "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {a.transaction_id && (
                    <Button size="sm" variant="outline" asChild>
                      <Link to="/admin/momo/$id" params={{ id: a.transaction_id }}>
                        Review
                      </Link>
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => acknowledge(a.id)}>
                    Acknowledge
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}


      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-5">
        <div>
          <Label>Phone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="2507…" />
        </div>
        <div>
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="SUCCESSFUL">Successful</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="TIMEOUT">Timed out</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>From</Label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <Label>To</Label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="flex items-end">
          <Button onClick={() => load()} disabled={loading} className="w-full">
            {loading ? "Loading…" : "Apply filters"}
          </Button>
        </div>
      </div>

      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Created</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>External ID</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                  No transactions
                </TableCell>
              </TableRow>
            )}
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="whitespace-nowrap text-xs">
                  {new Date(r.created_at).toLocaleString()}
                </TableCell>
                <TableCell>{r.phone}</TableCell>
                <TableCell>
                  {r.amount} {r.currency}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">{r.external_id}</TableCell>
                <TableCell className="max-w-[220px] truncate text-xs text-muted-foreground">
                  {r.reason ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/admin/momo/$id" params={{ id: r.id }}>
                      Details
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

    </div>
  );
}
