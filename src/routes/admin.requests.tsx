import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import {
  adminListProductRequests,
  adminUpdateProductRequestStatus,
  adminDeleteProductRequest,
  adminListAlerts,
  adminAcknowledgeAlert,
  adminAcknowledgeAllAlerts,
  PRODUCT_REQUEST_STATUSES,
  PRODUCT_REQUEST_CATEGORIES,
} from "@/lib/product-requests.functions";
import {
  Bell,
  ImageIcon,
  Link as LinkIcon,
  MessageCircle,
  Trash2,
  X,
  Plus,
  RotateCcw,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/admin/requests")({
  head: () => ({
    meta: [
      { title: "Admin — Product Requests" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminRequestsPage,
  errorComponent: ({ error }) => (
    <div className="container-x py-10 text-sm text-destructive">{error.message}</div>
  ),
  notFoundComponent: () => <div className="container-x py-10">Not found</div>,
});

const TOKEN_KEY = "admin_momo_token";

type Req = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  product_name: string;
  category: string;
  budget_range: string | null;
  image_urls: string[];
  image_signed_urls: string[];
  product_link: string | null;
  notes: string | null;
  status: string;
  created_at: string;
};

const STATUS_STYLES: Record<string, string> = {
  New: "bg-yellow text-navy",
  Sourcing: "bg-blue-100 text-blue-700",
  Found: "bg-green-100 text-green-700",
  Unavailable: "bg-red-100 text-red-700",
};

function waLink(phone: string, msg: string) {
  const digits = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
}

type Alert = {
  id: string;
  kind: string;
  message: string | null;
  reference_id: string | null;
  created_at: string;
  acknowledged_at: string | null;
};

function AdminRequestsPage() {
  const list = useServerFn(adminListProductRequests);
  const update = useServerFn(adminUpdateProductRequestStatus);
  const remove = useServerFn(adminDeleteProductRequest);
  const listAlerts = useServerFn(adminListAlerts);
  const ackAlert = useServerFn(adminAcknowledgeAlert);
  const ackAll = useServerFn(adminAcknowledgeAllAlerts);

  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [rows, setRows] = useState<Req[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<Req | null>(null);

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unread, setUnread] = useState(0);
  const [alertsOpen, setAlertsOpen] = useState(false);

  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDate, setFilterDate] = useState("");

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
      setAlerts(res.rows as Alert[]);
      setUnread(res.unread);
    } catch {
      /* ignore */
    }
  }

  async function load(t = token) {
    setLoading(true);
    setError(null);
    try {
      const res = await list({ data: { token: t } });
      setRows(res.rows as Req[]);
      sessionStorage.setItem(TOKEN_KEY, t);
      setAuthed(true);
      await loadAlerts(t);
    } catch (e) {
      setError((e as Error).message);
      setAuthed(false);
      sessionStorage.removeItem(TOKEN_KEY);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authed) void load(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  useEffect(() => {
    if (!authed) return;
    const i = setInterval(() => void loadAlerts(), 30000);
    return () => clearInterval(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, token]);

  async function handleAck(id: string) {
    try {
      await ackAlert({ data: { token, id } });
      await loadAlerts();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleAckAll() {
    try {
      await ackAll({ data: { token } });
      await loadAlerts();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filterStatus && r.status !== filterStatus) return false;
      if (filterCategory && r.category !== filterCategory) return false;
      if (filterDate && !r.created_at.startsWith(filterDate)) return false;
      return true;
    });
  }, [rows, filterStatus, filterCategory, filterDate]);

  async function setStatus(id: string, status: string) {
    try {
      await update({ data: { token, id, status: status as never } });
      await load();
      if (detail?.id === id) setDetail({ ...detail, status });
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function del(id: string) {
    if (!confirm("Delete this request?")) return;
    try {
      await remove({ data: { token, id } });
      setDetail(null);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (!authed) {
    return (
      <div className="container-x py-12 max-w-md">
        <h1 className="text-2xl font-bold text-navy">Admin — Product Requests</h1>
        <p className="mt-2 text-sm text-muted-foreground">Enter the admin token to continue.</p>
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void load(token);
          }}
        >
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Admin token"
          />
          <button
            type="submit"
            className="rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white"
          >
            Sign in
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="container-x py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">Product Requests</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} of {rows.length} requests
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAlertsOpen((v) => !v)}
            className="relative rounded-md border border-input px-3 py-2 text-xs font-semibold text-navy hover:bg-accent"
            aria-label="Notifications"
          >
            <Bell className="inline h-4 w-4" />
            {unread > 0 && (
              <span className="absolute -top-1.5 -right-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
          <Link
            to="/admin/technicians"
            className="rounded-md border border-input px-3 py-2 text-xs font-semibold text-navy hover:bg-accent"
          >
            Technicians
          </Link>
          <button
            onClick={() => {
              sessionStorage.removeItem(TOKEN_KEY);
              setAuthed(false);
              setToken("");
            }}
            className="rounded-md border border-input px-3 py-2 text-xs font-semibold text-navy hover:bg-accent"
          >
            Sign out
          </button>
        </div>
      </div>

      {alertsOpen && (
        <div className="mt-4 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <div className="text-sm font-semibold text-navy">
              Notifications {unread > 0 && <span className="ml-1 text-xs text-muted-foreground">({unread} unread)</span>}
            </div>
            <div className="flex gap-2">
              {unread > 0 && (
                <button
                  onClick={handleAckAll}
                  className="rounded-md border border-input px-2 py-1 text-xs font-semibold text-navy hover:bg-accent"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setAlertsOpen(false)}
                className="rounded-md border border-input px-2 py-1 text-xs text-muted-foreground hover:bg-accent"
              >
                Close
              </button>
            </div>
          </div>
          <ul className="max-h-80 overflow-y-auto divide-y divide-border">
            {alerts.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">No notifications yet.</li>
            )}
            {alerts.map((a) => {
              const isUnread = !a.acknowledged_at;
              const row = a.reference_id ? rows.find((r) => r.id === a.reference_id) : null;
              return (
                <li
                  key={a.id}
                  className={`flex items-start gap-3 px-4 py-3 ${isUnread ? "bg-yellow/10" : ""}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-navy">
                      {isUnread && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-red-600 align-middle" />}
                      {a.message || a.kind}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      {new Date(a.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 gap-1">
                    {row && (
                      <button
                        onClick={() => {
                          setDetail(row);
                          setAlertsOpen(false);
                        }}
                        className="rounded-md border border-input px-2 py-1 text-xs hover:bg-accent"
                      >
                        View
                      </button>
                    )}
                    {isUnread && (
                      <button
                        onClick={() => handleAck(a.id)}
                        className="rounded-md bg-navy px-2 py-1 text-xs font-semibold text-white hover:bg-navy/90"
                        title="Mark as read"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-5 rounded-xl border border-border bg-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
            >
              <option value="">All</option>
              {PRODUCT_REQUEST_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
            >
              <option value="">All</option>
              {PRODUCT_REQUEST_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterStatus("");
                setFilterCategory("");
                setFilterDate("");
              }}
              className="inline-flex items-center gap-1 rounded-md border border-input px-3 py-2 text-xs font-semibold text-navy hover:bg-accent"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Clear
            </button>
          </div>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      {loading && <p className="mt-3 text-sm text-muted-foreground">Loading…</p>}

      <div className="mt-5 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left">Customer</th>
              <th className="px-3 py-2 text-left">Product</th>
              <th className="px-3 py-2 text-left">Category</th>
              <th className="px-3 py-2 text-left">Budget</th>
              <th className="px-3 py-2 text-left">Attached</th>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-border align-top hover:bg-accent/30">
                <td className="px-3 py-3">
                  <div className="font-semibold text-navy">{r.full_name}</div>
                  <div className="text-xs text-muted-foreground">{r.phone}</div>
                </td>
                <td className="px-3 py-3 max-w-[260px]">
                  <div className="line-clamp-2">{r.product_name}</div>
                </td>
                <td className="px-3 py-3">{r.category}</td>
                <td className="px-3 py-3 text-xs">{r.budget_range || "—"}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {r.image_urls.length > 0 && (
                      <span
                        title={`${r.image_urls.length} image(s)`}
                        className="inline-flex items-center gap-1 rounded bg-yellow/30 px-1.5 py-0.5 text-[11px] font-semibold text-navy"
                      >
                        <ImageIcon className="h-3 w-3" /> {r.image_urls.length}
                      </span>
                    )}
                    {r.product_link && (
                      <span
                        title="Has link"
                        className="inline-flex items-center gap-1 rounded bg-blue-100 px-1.5 py-0.5 text-[11px] font-semibold text-blue-700"
                      >
                        <LinkIcon className="h-3 w-3" /> link
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-3 text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
                <td className="px-3 py-3">
                  <select
                    value={r.status}
                    onChange={(e) => setStatus(r.id, e.target.value)}
                    className={`rounded-md px-2 py-1 text-xs font-semibold border-0 ${STATUS_STYLES[r.status] ?? ""}`}
                  >
                    {PRODUCT_REQUEST_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setDetail(r)}
                      className="rounded-md border border-input px-2 py-1 text-xs hover:bg-accent"
                    >
                      View
                    </button>
                    <a
                      href={waLink(r.phone, `Hi ${r.full_name}, regarding your request: ${r.product_name}`)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md bg-green-600 px-2 py-1 text-xs font-semibold text-white hover:bg-green-700"
                    >
                      <MessageCircle className="inline h-3.5 w-3.5" />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {detail && <DetailDrawer req={detail} onClose={() => setDetail(null)} onDelete={() => del(detail.id)} onStatus={(s) => setStatus(detail.id, s)} />}
    </div>
  );
}

function DetailDrawer({
  req,
  onClose,
  onDelete,
  onStatus,
}: {
  req: Req;
  onClose: () => void;
  onDelete: () => void;
  onStatus: (s: string) => void;
}) {
  const convertSearch = useMemo(() => {
    const params = new URLSearchParams({
      name: req.product_name.slice(0, 120),
      category: req.category,
      requestId: req.id,
    });
    return `/admin/technicians?${params.toString()}`;
  }, [req]);

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full sm:w-[480px] bg-background overflow-y-auto shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-navy px-5 py-3">
          <h3 className="text-white font-bold">Request details</h3>
          <button onClick={onClose} aria-label="Close" className="text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 space-y-4 text-sm">
          <div>
            <div className="text-xs font-semibold uppercase text-muted-foreground">Customer</div>
            <div className="text-navy font-bold">{req.full_name}</div>
            <div className="text-xs text-muted-foreground">{req.phone}</div>
            {req.email && <div className="text-xs text-muted-foreground">{req.email}</div>}
          </div>

          <div>
            <div className="text-xs font-semibold uppercase text-muted-foreground">Product</div>
            <div className="whitespace-pre-wrap">{req.product_name}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-semibold uppercase text-muted-foreground">Category</div>
              <div>{req.category}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase text-muted-foreground">Budget</div>
              <div>{req.budget_range || "—"}</div>
            </div>
          </div>

          {req.product_link && (
            <div>
              <div className="text-xs font-semibold uppercase text-muted-foreground">Link</div>
              <a
                href={req.product_link}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {req.product_link}
              </a>
            </div>
          )}

          {req.image_signed_urls.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                Images
              </div>
              <div className="flex flex-wrap gap-2">
                {req.image_signed_urls.map((u, i) => (
                  <a
                    key={i}
                    href={u}
                    target="_blank"
                    rel="noreferrer"
                    className="block h-24 w-24 overflow-hidden rounded-md border border-border"
                  >
                    <img src={u} alt="" className="h-full w-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {req.notes && (
            <div>
              <div className="text-xs font-semibold uppercase text-muted-foreground">Notes</div>
              <div className="whitespace-pre-wrap">{req.notes}</div>
            </div>
          )}

          <div>
            <div className="text-xs font-semibold uppercase text-muted-foreground mb-1">Status</div>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_REQUEST_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => onStatus(s)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                    req.status === s
                      ? STATUS_STYLES[s]
                      : "border border-input text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
            <a
              href={waLink(
                req.phone,
                `Hi ${req.full_name}, regarding your request: ${req.product_name}`,
              )}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
            >
              <MessageCircle className="h-4 w-4" /> Reply on WhatsApp
            </a>
            <a
              href={convertSearch}
              className="inline-flex items-center gap-1 rounded-md bg-yellow px-3 py-2 text-xs font-semibold text-navy hover:bg-yellow-dark"
              title="Open admin to create a product listing from this request"
            >
              <Plus className="h-4 w-4" /> Convert to product
            </a>
            <button
              onClick={onDelete}
              className="ml-auto inline-flex items-center gap-1 rounded-md border border-destructive px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
