import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
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
import { X, Plus, Pencil, Trash2, Search, RotateCcw, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from "lucide-react";
import {
  adminListTechnicians,
  adminCreateTechnician,
  adminUpdateTechnician,
  adminDeleteTechnician,
} from "@/lib/technicians.functions";

export const Route = createFileRoute("/admin/technicians")({
  head: () => ({
    meta: [{ title: "Admin — Technicians" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminTechniciansPage,
  errorComponent: ({ error }) => (
    <div className="container mx-auto p-8 text-sm text-destructive">{error.message}</div>
  ),
  notFoundComponent: () => <div className="container mx-auto p-8">Not found</div>,
});

const TOKEN_KEY = "admin_momo_token";
const SPECIALTIES = ["Electrician", "CCTV Installer", "Lighting Specialist"] as const;
const STATUSES = ["Available Now", "Busy", "Offline"] as const;

type Tech = {
  id: string;
  name: string;
  initials: string;
  specialty: (typeof SPECIALTIES)[number];
  years: number;
  areas: string[];
  rating: number;
  ratings: number;
  phone: string;
  whatsapp: string;
  status: (typeof STATUSES)[number];
  color: string;
  skills: string[];
  sort_order: number;
};

const emptyTech = (): Omit<Tech, "id"> => ({
  name: "",
  initials: "",
  specialty: "Electrician",
  years: 0,
  areas: [],
  rating: 5,
  ratings: 0,
  phone: "",
  whatsapp: "",
  status: "Available Now",
  color: "#F5C300",
  skills: [],
  sort_order: 0,
});

function AdminTechniciansPage() {
  const list = useServerFn(adminListTechnicians);
  const create = useServerFn(adminCreateTechnician);
  const update = useServerFn(adminUpdateTechnician);
  const remove = useServerFn(adminDeleteTechnician);

  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [rows, setRows] = useState<Tech[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Tech | (Omit<Tech, "id"> & { id?: string }) | null>(null);

  // Filters
  const [searchName, setSearchName] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState<string>("");
  const [searchLocation, setSearchLocation] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  // Sorting
  const [sortField, setSortField] = useState<"name" | "rating" | "specialty" | "status" | "">("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = sessionStorage.getItem(TOKEN_KEY);
    if (t) {
      setToken(t);
      setAuthed(true);
    }
  }, []);

  async function load(t = token) {
    setLoading(true);
    setError(null);
    try {
      const res = await list({ data: { token: t } });
      setRows(res.rows as Tech[]);
      sessionStorage.setItem(TOKEN_KEY, t);
      setAuthed(true);
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

  const filteredRows = useMemo(() => {
    const nameQ = searchName.trim().toLowerCase();
    const locQ = searchLocation.trim().toLowerCase();
    return rows.filter((t) => {
      if (nameQ && !t.name.toLowerCase().includes(nameQ)) return false;
      if (filterSpecialty && t.specialty !== filterSpecialty) return false;
      if (locQ && !t.areas.some((a) => a.toLowerCase().includes(locQ))) return false;
      if (filterStatus && t.status !== filterStatus) return false;
      return true;
    });
  }, [rows, searchName, filterSpecialty, searchLocation, filterStatus]);

  const sortedRows = useMemo(() => {
    if (!sortField) return filteredRows;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filteredRows].sort((a, b) => {
      switch (sortField) {
        case "name":
          return dir * a.name.localeCompare(b.name);
        case "rating":
          return dir * (a.rating - b.rating);
        case "specialty":
          return dir * a.specialty.localeCompare(b.specialty);
        case "status":
          return dir * a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
  }, [filteredRows, sortField, sortDir]);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const PAGE_SIZES = [5, 10, 20, 50];

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedRows = sortedRows.slice(startIndex, startIndex + pageSize);

  const activeFilters =
    Boolean(searchName) ||
    Boolean(filterSpecialty) ||
    Boolean(searchLocation) ||
    Boolean(filterStatus) ||
    Boolean(sortField);

  useEffect(() => {
    setPage(1);
  }, [searchName, filterSpecialty, searchLocation, filterStatus, pageSize, sortField, sortDir]);

  async function save() {
    if (!editing) return;
    setLoading(true);
    setError(null);
    try {
      const { id, ...fields } = editing as Tech;
      if (id) await update({ data: { token, id, fields } });
      else await create({ data: { token, fields } });
      setEditing(null);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function del(id: string) {
    if (!confirm("Delete this technician?")) return;
    try {
      await remove({ data: { token, id } });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

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
        </form>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Technicians</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => setEditing(emptyTech())}>
            <Plus className="h-4 w-4" /> New
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              sessionStorage.removeItem(TOKEN_KEY);
              setAuthed(false);
              setToken("");
              setRows([]);
            }}
          >
            Sign out
          </Button>
        </div>
      </div>

      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

      <div className="mb-5 rounded-xl border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Search & Filter</span>
          {activeFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-7 gap-1 text-xs"
              onClick={() => {
                setSearchName("");
                setFilterSpecialty("");
                setSearchLocation("");
                setFilterStatus("");
                setSortField("");
                setSortDir("asc");
              }}
            >
              <RotateCcw className="h-3 w-3" /> Clear
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label className="text-xs text-muted-foreground">Name</Label>
            <Input
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Search name…"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Specialty</Label>
            <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="All specialties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All specialties</SelectItem>
                {SPECIALTIES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Location</Label>
            <Input
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              placeholder="Search service area…"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Availability</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Sort by</span>
          <Select value={sortField} onValueChange={(v) => setSortField(v as typeof sortField)}>
            <SelectTrigger className="h-7 w-40 text-xs">
              <SelectValue placeholder="Default" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Default</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="specialty">Specialty</SelectItem>
              <SelectItem value="status">Availability</SelectItem>
            </SelectContent>
          </Select>
          {sortField && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              title={sortDir === "asc" ? "Ascending" : "Descending"}
            >
              {sortDir === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            </Button>
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            Showing {paginatedRows.length} of {sortedRows.length} technicians
            {sortedRows.length !== rows.length && ` (filtered from ${rows.length})`}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Per page</span>
            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger className="h-7 w-16 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {paginatedRows.map((t) => (
          <div
            key={t.id}
            className="flex flex-wrap items-start justify-between gap-3 rounded-lg border bg-card p-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className="grid h-9 w-9 place-items-center rounded-full text-sm font-bold text-navy"
                  style={{ backgroundColor: t.color }}
                >
                  {t.initials}
                </span>
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.specialty} • {t.years}y • {t.status}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {t.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-navy px-2 py-0.5 text-[10px] font-semibold text-white"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(t)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => del(t.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === safePage ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0 text-xs"
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {editing && (
        <EditorModal
          value={editing}
          onChange={setEditing}
          onClose={() => setEditing(null)}
          onSave={save}
          saving={loading}
        />
      )}
    </div>
  );
}

function EditorModal({
  value,
  onChange,
  onClose,
  onSave,
  saving,
}: {
  value: Omit<Tech, "id"> & { id?: string };
  onChange: (v: Omit<Tech, "id"> & { id?: string }) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  const [skillInput, setSkillInput] = useState("");
  const [areaInput, setAreaInput] = useState("");

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || value.skills.includes(s)) return;
    onChange({ ...value, skills: [...value.skills, s] });
    setSkillInput("");
  };
  const removeSkill = (s: string) =>
    onChange({ ...value, skills: value.skills.filter((x) => x !== s) });

  const addArea = () => {
    const s = areaInput.trim();
    if (!s || value.areas.includes(s)) return;
    onChange({ ...value, areas: [...value.areas, s] });
    setAreaInput("");
  };
  const removeArea = (s: string) =>
    onChange({ ...value, areas: value.areas.filter((x) => x !== s) });

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-background p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {value.id ? "Edit technician" : "New technician"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Label>Name</Label>
            <Input value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} />
          </div>
          <div>
            <Label>Initials</Label>
            <Input
              value={value.initials}
              maxLength={4}
              onChange={(e) => onChange({ ...value, initials: e.target.value.toUpperCase() })}
            />
          </div>
          <div>
            <Label>Specialty</Label>
            <Select
              value={value.specialty}
              onValueChange={(v) => onChange({ ...value, specialty: v as Tech["specialty"] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SPECIALTIES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select
              value={value.status}
              onValueChange={(v) => onChange({ ...value, status: v as Tech["status"] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Years experience</Label>
            <Input
              type="number"
              value={value.years}
              onChange={(e) => onChange({ ...value, years: Number(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label>Color (hex)</Label>
            <Input value={value.color} onChange={(e) => onChange({ ...value, color: e.target.value })} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={value.phone} onChange={(e) => onChange({ ...value, phone: e.target.value })} />
          </div>
          <div>
            <Label>WhatsApp (e.g. 250788…)</Label>
            <Input
              value={value.whatsapp}
              onChange={(e) => onChange({ ...value, whatsapp: e.target.value.replace(/\D/g, "") })}
            />
          </div>
          <div>
            <Label>Rating (0–5)</Label>
            <Input
              type="number"
              step="0.1"
              value={value.rating}
              onChange={(e) => onChange({ ...value, rating: Number(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label># Ratings</Label>
            <Input
              type="number"
              value={value.ratings}
              onChange={(e) => onChange({ ...value, ratings: Number(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label>Sort order</Label>
            <Input
              type="number"
              value={value.sort_order}
              onChange={(e) => onChange({ ...value, sort_order: Number(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div className="mt-5">
          <Label>Service areas</Label>
          <div className="mt-2 mb-2 flex flex-wrap gap-1.5">
            {value.areas.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs"
              >
                {s}
                <button onClick={() => removeArea(s)} className="hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={areaInput}
              onChange={(e) => setAreaInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addArea();
                }
              }}
              placeholder="e.g. Kigali"
            />
            <Button type="button" onClick={addArea}>
              Add
            </Button>
          </div>
        </div>

        <div className="mt-5">
          <Label className="text-yellow-dark">What I Can Do — Skills</Label>
          <div className="mt-2 mb-2 flex flex-wrap gap-1.5">
            {value.skills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 rounded-full bg-navy px-2 py-1 text-xs font-semibold text-white"
              >
                {s}
                <button onClick={() => removeSkill(s)} className="hover:text-yellow">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {value.skills.length === 0 && (
              <p className="text-xs text-muted-foreground">No skills yet</p>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="Type a skill and press Enter"
            />
            <Button type="button" onClick={addSkill}>
              Add
            </Button>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving || !value.name || !value.initials}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
