import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { adminListQuotations } from "@/lib/quotations.functions";
import { adminListMomo } from "@/lib/admin-momo.functions";
import { adminListTechnicians } from "@/lib/technicians.functions";
import { adminListProductRequests } from "@/lib/product-requests.functions";
import {
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  Lock,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ClipboardList,
  Wrench,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboardIndex,
});

const TOKEN_KEY = "admin_momo_token";

interface Quotation {
  id: string;
  full_name: string;
  phone: string;
  current_total: number;
  status: string;
  created_at: string;
}

interface MoMoTransaction {
  id: string;
  amount: number;
  status: string;
  created_at: string;
}

interface ProductRequest {
  id: string;
  product_name: string;
  category: string;
  status: string;
  created_at: string;
}

interface Technician {
  id: string;
  name: string;
  specialty: string;
  status: string;
  rating: number;
  ratings: number;
}

const COLORS = ["#0B1527", "#F2C21A", "#3B82F6", "#10B981"];

function AdminDashboardIndex() {
  const router = useRouter();
  const listQuotations = useServerFn(adminListQuotations);
  const listMomo = useServerFn(adminListMomo);
  const listTechnicians = useServerFn(adminListTechnicians);
  const listRequests = useServerFn(adminListProductRequests);

  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Load token from storage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = sessionStorage.getItem(TOKEN_KEY);
    if (t) {
      setToken(t);
      setAuthed(true);
    }
  }, []);

  // Fetch Quotes (Free from Token requirement, uses Supabase)
  const {
    data: quotesData,
    isLoading: quotesLoading,
    error: quotesError,
  } = useQuery({
    queryKey: ["admin-quotations-summary"],
    queryFn: () => listQuotations({ data: { status: "All" } }),
    refetchInterval: 30000,
  });

  // Fetch Token-guarded lists only if authed
  const {
    data: momoData,
    isLoading: momoLoading,
    error: momoError,
  } = useQuery({
    queryKey: ["admin-momo-summary", token],
    queryFn: () => listMomo({ data: { token, status: "ALL" } }),
    enabled: authed,
    refetchInterval: 30000,
  });

  const {
    data: techData,
    isLoading: techLoading,
    error: techError,
  } = useQuery({
    queryKey: ["admin-tech-summary", token],
    queryFn: () => listTechnicians({ data: { token } }),
    enabled: authed,
    refetchInterval: 60000,
  });

  const {
    data: requestsData,
    isLoading: requestsLoading,
    error: requestsError,
  } = useQuery({
    queryKey: ["admin-requests-summary", token],
    queryFn: () => listRequests({ data: { token } }),
    enabled: authed,
    refetchInterval: 30000,
  });

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTokenError(null);
    if (!tokenInput.trim()) {
      setTokenError("Please enter a valid token.");
      return;
    }
    // Test the token by calling the list requests endpoint
    listRequests({ data: { token: tokenInput } })
      .then(() => {
        sessionStorage.setItem(TOKEN_KEY, tokenInput);
        setToken(tokenInput);
        setAuthed(true);
      })
      .catch((err) => {
        setTokenError(err?.message || "Invalid Admin Token. Please try again.");
      });
  };

  const handleSignOutToken = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken("");
    setAuthed(false);
    setTokenInput("");
  };

  // derived metrics & formatting
  const quotes = (quotesData?.rows || []) as Quotation[];
  const momoTx = (momoData?.rows || []) as MoMoTransaction[];
  const technicians = (techData?.rows || []) as Technician[];
  const prodReqs = (requestsData?.rows || []) as ProductRequest[];

  // 1. Calculations: Quotations
  const totalQuotesVal = useMemo(() => {
    return quotes.reduce((acc, curr) => acc + (Number(curr.current_total) || 0), 0);
  }, [quotes]);

  const activeQuotesCount = useMemo(() => {
    return quotes.filter((q) => !["Cancelled", "Rejected", "Expired"].includes(q.status)).length;
  }, [quotes]);

  // 2. Calculations: Momo
  const totalMomoVal = useMemo(() => {
    return momoTx
      .filter((t) => t.status === "SUCCESSFUL")
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [momoTx]);

  const momoPendingCount = useMemo(() => {
    return momoTx.filter((t) => t.status === "PENDING").length;
  }, [momoTx]);

  // 3. Calculations: Tech Specialty Dist
  const techSpecialtyData = useMemo(() => {
    const counts: Record<string, number> = {};
    technicians.forEach((t) => {
      counts[t.specialty] = (counts[t.specialty] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [technicians]);

  // 4. Calculations: Product Sourcing funnel
  const reqNewCount = useMemo(() => {
    return prodReqs.filter((r) => r.status === "New").length;
  }, [prodReqs]);

  // 5. Chart 1: Quotations by Status
  const quoteStatusData = useMemo(() => {
    const counts: Record<string, number> = {};
    quotes.forEach((q) => {
      counts[q.status] = (counts[q.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [quotes]);

  // 6. Chart 2: Recent Transaction / Inquiries daily volume (grouped by date)
  const DailyVolumeChartData = useMemo(() => {
    const days: Record<string, { quotes: number; momo: number }> = {};
    // grab last 7 days keys
    const last7Days = Array.from({ length: 7 })
      .map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split("T")[0];
      })
      .reverse();

    last7Days.forEach((dateString) => {
      days[dateString] = { quotes: 0, momo: 0 };
    });

    quotes.forEach((q) => {
      const dateString = q.created_at?.split("T")[0];
      if (days[dateString]) {
        days[dateString].quotes += Math.round(Number(q.current_total) / 1000) || 0; // standardise in '000 RWF
      }
    });

    momoTx.forEach((m) => {
      if (m.status !== "SUCCESSFUL") return;
      const dateString = m.created_at?.split("T")[0];
      if (days[dateString]) {
        days[dateString].momo += Math.round(Number(m.amount) / 1000) || 0;
      }
    });

    return Object.entries(days).map(([date, val]) => ({
      date: date.substring(5), // exclude year for chart readability
      "Quotes Volume ('k RWF)": val.quotes,
      "MoMo successful ('k RWF)": val.momo,
    }));
  }, [quotes, momoTx]);

  return (
    <div className="container-x py-8 space-y-8 animate-fade-in">
      {/* Header section with Greeting and Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-yellow/20 text-[#A07000] text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Core Secured
            </span>
            <span className="text-xs text-muted-foreground">System Overview Dashboard</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#0B1527] mt-1.5 tracking-tight flex items-center gap-2">
            Control Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1 text-slate-500">
            Real-time shop intelligence, quotation pipelines, on-field technicians, and MoMo cashflow.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {authed ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <div className="text-left">
                <p className="text-xs font-bold text-emerald-800">MoMo Security Session</p>
                <p className="text-[10px] text-emerald-600">Secure API access fully unlocked</p>
              </div>
              <button
                onClick={handleSignOutToken}
                className="text-xs text-slate-500 hover:text-red-500 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-all font-semibold ml-2"
              >
                Lock Session
              </button>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-amber-400"></div>
              <div className="text-left">
                <p className="text-xs font-bold text-amber-900">Reduced Data Mode</p>
                <p className="text-[10px] text-amber-700">Submit secure token to unlock cash logs</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Quotation Volume */}
        <div className="bg-white rounded-[2rem] border border-slate-100/80 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-slate-50 rounded-2xl text-navy">
              <ClipboardList className="h-6 w-6 stroke-2" />
            </div>
            <Link
              to="/admin/quotations"
              className="text-[11px] font-bold text-[#E2B11B] flex items-center gap-1 hover:underline uppercase tracking-wide"
            >
              Details <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Quotations Pipeline
            </p>
            <h3 className="text-2xl font-black text-navy mt-1.5 tabular-nums">
              {quotesLoading ? (
                <span className="text-slate-300">...</span>
              ) : (
                `${totalQuotesVal.toLocaleString()} RWF`
              )}
            </h3>
            <div className="mt-2.5 flex items-center gap-2 text-xs">
              <span className="font-extrabold text-navy text-[11px] bg-[#F2C21A]/20 px-2.5 py-0.5 rounded-full">
                {quotesLoading ? "Loading" : `${activeQuotesCount} Active`}
              </span>
              <span className="text-slate-400 font-medium">quotation requests</span>
            </div>
          </div>
        </div>

        {/* Card 2: successful MoMo volume */}
        <div className="bg-white rounded-[2rem] border border-slate-100/80 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-slate-50 rounded-2xl text-emerald-600">
              <DollarSign className="h-6 w-6 stroke-2" />
            </div>
            {authed && (
              <Link
                to="/admin/momo"
                className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 hover:underline uppercase tracking-wide"
              >
                Logs <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
          <div className="mt-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              MoMo Total Volume
            </p>
            <h3 className="text-2xl font-black text-navy mt-1.5 tabular-nums">
              {!authed ? (
                <span className="text-[11px] text-slate-400 italic bg-amber-50 px-2 py-1 rounded">
                  Locked 🔒
                </span>
              ) : momoLoading ? (
                <span className="text-slate-300">...</span>
              ) : (
                `${totalMomoVal.toLocaleString()} RWF`
              )}
            </h3>
            <div className="mt-2.5 flex items-center gap-2 text-xs">
              {!authed ? (
                <span className="text-slate-400">Unlock with admin token</span>
              ) : (
                <>
                  <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    {momoPendingCount} Pending
                  </span>
                  <span className="text-slate-400 font-medium">transactions</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Registered Technicians */}
        <div className="bg-white rounded-[2rem] border border-slate-100/80 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-slate-50 rounded-2xl text-blue-600">
              <Wrench className="h-6 w-6 stroke-2" />
            </div>
            {authed && (
              <Link
                to="/admin/technicians"
                className="text-[11px] font-bold text-blue-600 flex items-center gap-1 hover:underline uppercase tracking-wide"
              >
                Manage <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
          <div className="mt-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Field Technicians
            </p>
            <h3 className="text-2xl font-black text-navy mt-1.5">
              {!authed ? (
                <span className="text-[11px] text-slate-400 italic bg-amber-50 px-2 py-1 rounded">
                  Locked 🔒
                </span>
              ) : techLoading ? (
                <span className="text-slate-300">...</span>
              ) : (
                `${technicians.length} Experts`
              )}
            </h3>
            <div className="mt-2.5 flex items-center gap-2 text-xs">
              {!authed ? (
                <span className="text-slate-400">Unlock with admin token</span>
              ) : (
                <>
                  <span className="font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                    {technicians.filter((t) => t.status === "Available Now").length} Available
                  </span>
                  <span className="text-slate-400 font-medium font-sans">Active in Rwanda</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Card 4: Product Request Inquiries */}
        <div className="bg-white rounded-[2rem] border border-slate-100/80 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-slate-50 rounded-2xl text-[#A07000]">
              <ShoppingBag className="h-6 w-6 stroke-2" />
            </div>
            {authed && (
              <Link
                to="/admin/requests"
                className="text-[11px] font-bold text-[#A07000] flex items-center gap-1 hover:underline uppercase tracking-wide"
              >
                Source <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
          <div className="mt-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Product Requests
            </p>
            <h3 className="text-2xl font-black text-navy mt-1.5">
              {!authed ? (
                <span className="text-[11px] text-slate-400 italic bg-amber-50 px-2 py-1 rounded">
                  Locked 🔒
                </span>
              ) : requestsLoading ? (
                <span className="text-slate-300">...</span>
              ) : (
                `${prodReqs.length} Inquiries`
              )}
            </h3>
            <div className="mt-2.5 flex items-center gap-2 text-xs">
              {!authed ? (
                <span className="text-slate-400">Unlock with admin token</span>
              ) : (
                <>
                  <span className="font-extrabold text-[#A07000] bg-yellow/20 px-2.5 py-0.5 rounded-full">
                    {reqNewCount} Sourcing
                  </span>
                  <span className="text-slate-400 font-medium">waiting reply</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main view columns splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left & Middle columns: Data Visualisations / Analytics */}
        <div className="lg:col-span-2 space-y-8">
          {/* Daily trend Chart */}
          <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-extrabold text-navy">7-Day Income & Invoice Trends</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Comparative volume analytics in thousands of RWF ('k RWF)
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-navy">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#0B1527]"></span> Quotes
                </span>
                {authed && (
                  <span className="flex items-center gap-1.5 font-semibold text-[#F2C21A]">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#F2C21A]"></span> MoMo Received
                  </span>
                )}
              </div>
            </div>

            <div className="h-72 w-full">
              {quotesLoading || (authed && momoLoading) ? (
                <div className="h-full w-full flex items-center justify-center text-sm text-slate-400">
                  Compiling trend curves...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={DailyVolumeChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        border: "0",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                        borderRadius: "1rem",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Quotes Volume ('k RWF)"
                      stroke="#0B1527"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2 }}
                    />
                    {authed && (
                      <Line
                        type="monotone"
                        dataKey="MoMo successful ('k RWF)"
                        stroke="#F2C21A"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2 }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Slices of distributions: Quotes status + Tech Specialty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie chart for specialty ratio */}
            <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-base font-extrabold text-navy">Specialist Distributions</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Certified experts grouped by technical focus
                </p>
              </div>

              <div className="h-44 my-4 flex items-center justify-center">
                {!authed ? (
                  <div className="text-center p-4">
                    <Lock className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Unlock dashboard to view distributions</p>
                  </div>
                ) : techLoading ? (
                  <p className="text-xs text-slate-400">Loading specialties...</p>
                ) : techSpecialtyData.length === 0 ? (
                  <p className="text-xs text-slate-500">No technicians registered yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={techSpecialtyData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {techSpecialtyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {authed && techSpecialtyData.length > 0 && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {techSpecialtyData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-1.5 font-medium">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></span>
                      <span className="truncate text-slate-600">
                        {item.name}: <strong>{item.value}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quotation Status Ratios */}
            <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-base font-extrabold text-navy">Quotations Status ratio</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Current distribution of shop quotation states
                </p>
              </div>

              <div className="h-44 my-4 flex items-center justify-center">
                {quotesLoading ? (
                  <p className="text-xs text-slate-400">Loading states...</p>
                ) : quoteStatusData.length === 0 ? (
                  <p className="text-xs text-slate-500">No quotations logged yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={quoteStatusData} barSize={24}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#0B1527" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {!quotesLoading && quoteStatusData.length > 0 && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  {quoteStatusData.slice(0, 4).map((item) => (
                    <span key={item.name} className="whitespace-nowrap">
                      {item.name}: <strong className="text-navy">{item.value}</strong>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Action Hub & Token Gate */}
        <div className="space-y-8">
          {/* Admin Token Security Box */}
          {!authed && (
            <div className="bg-white p-6 rounded-[2rem] border-2 border-[#F2C21A]/30 shadow-md">
              <div className="flex items-center gap-2 text-navy text-sm font-extrabold uppercase">
                <Lock className="h-5 w-5 text-[#E2B11B] shrink-0" />
                <span>Submit Security Key</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                This dashboard includes secure business metrics. Supply your configured backend{" "}
                <strong>ADMIN_TOKEN</strong> key to unlock:
              </p>
              <ul className="text-xs space-y-1.5 my-4 bg-slate-50 p-4 rounded-2xl font-medium text-slate-600">
                <li className="flex items-center gap-1.5">✓ Full Mobile Money Cashflow Logs</li>
                <li className="flex items-center gap-1.5">✓ Certified Technician Profiles</li>
                <li className="flex items-center gap-1.5">✓ Custom Product Sourcing Tickets</li>
                <li className="flex items-center gap-1.5">✓ Real-time Notification Dispatchers</li>
              </ul>
              <form onSubmit={handleTokenSubmit} className="space-y-3 pt-2">
                <input
                  type="password"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full text-xs font-mono font-bold rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 outline-none focus:border-[#E2B11B] focus:bg-white transition-all shadow-inner"
                  placeholder="Insert secure ADMIN_TOKEN..."
                />
                <button
                  type="submit"
                  className="w-full text-xs font-black bg-navy text-white hover:bg-navy/90 py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all text-center"
                >
                  <Sparkles className="h-4 w-4 text-yellow" /> Unlock Security Logs
                </button>
              </form>
              {tokenError && (
                <p className="mt-3 text-xs text-red-500 font-semibold text-center">{tokenError}</p>
              )}
            </div>
          )}

          {/* Quick Actions Panel */}
          <div className="bg-[#0B1527] text-white p-7 rounded-[2rem] shadow-lg flex flex-col justify-between">
            <div>
              <p className="text-yellow text-[10px] uppercase font-black tracking-widest">
                Action Desk
              </p>
              <h3 className="text-xl font-extrabold mt-1">Quick Navigation</h3>
              <p className="text-xs text-white/70 mt-1 max-w-xs">
                Jump directly to dedicated workspace tools to process inquiries.
              </p>

              <div className="space-y-3 mt-6">
                <Link
                  to="/admin/quotations"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-sm group"
                >
                  <span className="font-semibold text-white/90">Review Quotations</span>
                  <ArrowRight className="h-4 w-4 text-yellow transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/admin/requests"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-sm group"
                >
                  <span className="font-semibold text-white/90 font-sans">Product Sourcing</span>
                  <ArrowRight className="h-4 w-4 text-yellow transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/admin/momo"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-sm group"
                >
                  <span className="font-semibold text-white/90">MoMo Cash Logs</span>
                  <ArrowRight className="h-4 w-4 text-yellow transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/admin/technicians"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-sm group"
                >
                  <span className="font-semibold text-white/90">Field Technicians</span>
                  <ArrowRight className="h-4 w-4 text-yellow transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-4 text-[11px] text-white/50 text-center font-mono">
              LISA VOLT LINK Management System v3.2.1
            </div>
          </div>

          {/* Quick Realtime Active Inquiries Feed */}
          <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm">
            <h4 className="text-base font-extrabold text-navy mb-4">Latest Quotation Requests</h4>
            <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-1">
              {quotesLoading ? (
                <p className="text-xs text-slate-400 py-3">Loading inquiries...</p>
              ) : quotes.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 font-medium">No recent requests.</p>
              ) : (
                quotes.slice(0, 5).map((q) => (
                  <div key={q.id} className="py-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-navy truncate">{q.full_name}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(q.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-navy tabular-nums">
                        {Number(q.current_total).toLocaleString()} RWF
                      </p>
                      <span className="text-[9px] font-extrabold uppercase bg-slate-100 px-2.5 py-0.5 rounded-full text-slate-600">
                        {q.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {quotes.length > 5 && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <Link
                  to="/admin/quotations"
                  className="text-xs text-[#E2B11B] font-bold hover:underline flex items-center gap-1"
                >
                  View all inquiries ({quotes.length}) →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
