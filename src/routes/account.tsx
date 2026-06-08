import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { User, Mail, Lock, Phone, Package, Loader2, AlertCircle, CheckCircle2, LogOut, ArrowRight, Clipboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/account")({
  ssr: false,
  head: () => ({ meta: [{ title: "My Account — LISA VOLT LINK" }] }),
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "register" | "track">("login");
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Tracking states
  const [orderNumber, setOrderNumber] = useState("");
  const [trackingEmail, setTrackingEmail] = useState("");

  // Status message states
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // User quotations
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);

  // Sync auth state on mount
  useEffect(() => {
    let active = true;

    async function checkUser() {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (active) {
          setUser(currentUser);
          setLoadingUser(false);
          if (currentUser) {
            fetchUserQuotes(currentUser.email);
          }
        }
      } catch (err) {
        if (active) setLoadingUser(false);
      }
    }

    checkUser();

    // Listen to authentication changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (active) {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          fetchUserQuotes(currentUser.email);
        } else {
          setQuotes([]);
        }
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function fetchUserQuotes(userEmail: string | undefined) {
    if (!userEmail) return;
    setLoadingQuotes(true);
    try {
      const { data, error } = await supabase
        .from("quotations")
        .select("*")
        .eq("email", userEmail)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (err) {
      console.error("[Account] Error fetching quotes:", err);
    } finally {
      setLoadingQuotes(false);
    }
  }

  async function handleLogout() {
    setBusy(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSuccessMsg("Signed out successfully.");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sign out.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setBusy(true);

    try {
      if (tab === "register") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/auth",
            data: {
              full_name: fullName,
              phone: phone,
            },
          },
        });
        if (error) throw error;

        if (data.user && !data.session) {
          setSuccessMsg(
            "Account created successfully! We sent a confirmation link to your email. Please check your inbox and verify your email before logging in."
          );
          setTab("login");
        } else {
          setSuccessMsg("Welcome! Your account has been registered and you are now logged in.");
          setUser(data.user);
        }

        // Clean form
        setFullName("");
        setPhone("");
        setEmail("");
        setPassword("");
      } else if (tab === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        setSuccessMsg("Welcome back!");
        setUser(data.user);
        setPassword("");
      } else if (tab === "track") {
        const cleanRef = orderNumber.trim();
        if (!cleanRef) {
          throw new Error("Please enter an order/quote reference or token.");
        }

        // Search by share_token
        let { data: quote, error: tokenErr } = await supabase
          .from("quotations")
          .select("id, share_token, email")
          .eq("share_token", cleanRef)
          .maybeSingle();

        // Search by UUID if needed
        if (!quote && cleanRef.length === 36) {
          const { data } = await supabase
            .from("quotations")
            .select("id, share_token, email")
            .eq("id", cleanRef)
            .maybeSingle();
          quote = data;
        }

        if (!quote) {
          throw new Error("No quotation order found matching that reference or token number. Please check carefully.");
        }

        if (trackingEmail.trim() && quote.email && quote.email.toLowerCase() !== trackingEmail.trim().toLowerCase()) {
          throw new Error("The associated email does not match the record for this quotation.");
        }

        // Redirect directly to the digital invoice / quotation details
        navigate({ to: `/quote/${quote.share_token}` });
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An action error occurred. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
      case "Paid":
      case "Completed":
      case "Booked":
        return "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20";
      case "Sent":
      case "Negotiating":
      case "Pending":
      case "PickupHold":
        return "bg-amber-500/10 text-amber-600 border border-amber-500/20";
      case "Expired":
      case "Rejected":
        return "bg-destructive/10 text-destructive border border-destructive/20";
      default:
        return "bg-zinc-500/10 text-zinc-600 border border-zinc-500/20";
    }
  };

  return (
    <>
      <div className="bg-navy text-white">
        <div className="container-x py-10">
          <p className="text-yellow text-xs font-bold uppercase tracking-widest">Customer Area</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold uppercase tracking-tight">My Account</h1>
        </div>
      </div>

      <div className="container-x py-10 max-w-4xl mx-auto">
        {loadingUser ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-xl">
            <Loader2 className="h-8 w-8 text-yellow animate-spin" />
            <p className="mt-4 text-xs text-muted-foreground font-mono">Authenticating session…</p>
          </div>
        ) : user ? (
          // Authenticated Dashboard Layout
          <div className="space-y-8">
            <div className="bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <p className="text-yellow-dark text-[11px] font-bold uppercase tracking-widest">Active Session</p>
                <h2 className="mt-1 text-2xl font-extrabold text-navy truncate">
                  Welcome back, {user.user_metadata?.full_name || user.email?.split("@")[0]}!
                </h2>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground font-mono">
                  <span>Email: <strong className="text-navy">{user.email}</strong></span>
                  {user.user_metadata?.phone && (
                    <span>Phone: <strong className="text-navy">{user.user_metadata.phone}</strong></span>
                  )}
                </div>
              </div>
              <button
                onClick={handleLogout}
                disabled={busy}
                className="btn-outline flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold border border-border text-navy hover:bg-yellow/10 hover:border-yellow rounded-md transition-all cursor-pointer"
              >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
                Sign out
              </button>
            </div>

            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-start gap-2.5 text-xs">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-start gap-2.5 text-xs">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Quotations / Order list */}
            <div>
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-lg font-bold text-navy uppercase tracking-wide flex items-center gap-2">
                  <Package className="h-5 w-5 text-yellow-dark" />
                  My Quotations &amp; Orders
                </h3>
                <span className="text-xs font-mono text-muted-foreground bg-slate-100 px-2.5 py-0.5 rounded-full font-bold">
                  {quotes.length} total
                </span>
              </div>

              {loadingQuotes ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 text-yellow animate-spin" />
                  <p className="mt-2 text-xs text-muted-foreground font-mono">Retrieving order database…</p>
                </div>
              ) : quotes.length === 0 ? (
                <div className="mt-6 py-12 px-6 text-center bg-card border border-dashed border-border rounded-xl">
                  <p className="text-sm font-semibold text-navy">No quotations found under your account</p>
                  <p className="mt-1.5 text-xs text-muted-foreground max-w-md mx-auto">
                    Any wholesale items you add to your query list can be submitted on the request page to receive interactive price rates from our Kigali office.
                  </p>
                  <div className="mt-4">
                    <Link
                      to="/"
                      className="inline-flex items-center gap-1 bg-yellow text-navy px-4 py-2 rounded font-bold text-xs hover:bg-yellow-dark transition-all"
                    >
                      Browse wholesale catalog <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-6 grid gap-4">
                  {quotes.map((q) => (
                    <div
                      key={q.id}
                      className="bg-card border border-border rounded-xl p-5 hover:border-yellow transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm hover:shadow-md"
                    >
                      <div className="space-y-1 bg-transparent">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-xs font-semibold text-navy font-mono">CODE: {q.share_token}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getStatusColor(q.status)}`}>
                            {q.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          Date: {new Date(q.created_at).toLocaleDateString()}
                        </p>
                        {q.delivery_pref && (
                          <p className="text-xs text-muted-foreground capitalize">
                            Fulfillment: <strong className="text-navy">{q.delivery_pref}</strong>
                            {q.delivery_location && ` (${q.delivery_location})`}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-border">
                        <div className="text-left md:text-right">
                          <p className="text-[10px] text-muted-foreground uppercase font-semibold font-mono">Rate Total</p>
                          <p className="text-sm font-extrabold text-yellow-dark font-mono">
                            RWF {(q.final_total || q.current_total).toLocaleString()}
                          </p>
                        </div>
                        <Link
                          to={`/quote/${q.share_token}` as any}
                          className="inline-flex items-center gap-1.5 bg-yellow font-bold text-xs text-navy px-3.5 py-1.5 rounded hover:bg-yellow-dark transition-all"
                        >
                          Invoice &amp; Chat <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Unauthenticated State (Forms)
          <div className="max-w-xl mx-auto">
            <div className="flex border-b border-border justify-center mb-6">
              {(["login", "register", "track"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTab(t);
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                    tab === t
                      ? "text-navy border-yellow font-black scale-105"
                      : "text-muted-foreground border-transparent hover:text-navy"
                  }`}
                >
                  {t === "track" ? "Track Order" : t === "login" ? "Sign In" : "Register"}
                </button>
              ))}
            </div>

            {successMsg && (
              <div className="p-4 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-start gap-2.5 text-xs">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 mb-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-start gap-2.5 text-xs">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 border border-border rounded-xl shadow-sm">
              {tab === "register" && (
                <>
                  <label className="block space-y-1">
                    <span className="text-[10px] font-bold text-navy uppercase tracking-wider">Full Name</span>
                    <Field
                      icon={User}
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </label>
                </>
              )}

              {tab === "track" ? (
                <>
                  <label className="block space-y-1">
                    <span className="text-[10px] font-bold text-navy uppercase tracking-wider">Order/Quote Token</span>
                    <Field
                      icon={Package}
                      type="text"
                      required
                      placeholder="e.g. quote-or-order-token"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="text-[10px] font-bold text-navy uppercase tracking-wider">Email Address (Optional)</span>
                    <Field
                      icon={Mail}
                      type="email"
                      placeholder="Email matching invoice"
                      value={trackingEmail}
                      onChange={(e) => setTrackingEmail(e.target.value)}
                    />
                  </label>

                  <button
                    disabled={busy}
                    type="submit"
                    className="btn-yellow w-full flex items-center justify-center gap-2 py-3 mt-4"
                  >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clipboard className="h-4 w-4" />}
                    Track quotation order
                  </button>
                </>
              ) : (
                <>
                  <label className="block space-y-1">
                    <span className="text-[10px] font-bold text-navy uppercase tracking-wider">Email</span>
                    <Field
                      icon={Mail}
                      type="email"
                      required
                      placeholder="your.name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </label>

                  {tab === "register" && (
                    <label className="block space-y-1">
                      <span className="text-[10px] font-bold text-navy uppercase tracking-wider">Phone</span>
                      <Field
                        icon={Phone}
                        type="tel"
                        required
                        placeholder="+250 788 123 456"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </label>
                  )}

                  <label className="block space-y-1">
                    <span className="text-[10px] font-bold text-navy uppercase tracking-wider">Password</span>
                    <Field
                      icon={Lock}
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </label>

                  <button
                    disabled={busy}
                    type="submit"
                    className="btn-yellow w-full flex items-center justify-center gap-2 py-3 mt-4"
                  >
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                    {tab === "login" ? "Sign in" : "Create account"}
                  </button>

                  {tab === "login" && (
                    <p className="text-xs text-center text-muted-foreground mt-4">
                      <Link to="/contact" className="hover:text-navy hover:underline">
                        Forgot password? Contact admin
                      </Link>
                    </p>
                  )}
                </>
              )}
            </form>
          </div>
        )}

        <p className="mt-8 text-xs text-muted-foreground text-center">
          Need help? <Link to="/contact" className="text-yellow-dark font-semibold hover:underline">Contact support</Link>
        </p>
      </div>
    </>
  );
}

function Field({ icon: Icon, ...props }: { icon: typeof User } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex items-center border border-border rounded-md bg-white focus-within:border-yellow focus-within:ring-2 focus-within:ring-yellow/20 transition-all">
      <Icon className="h-4 w-4 ml-3 text-muted-foreground shrink-0" />
      <input {...props} className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent" />
    </div>
  );
}

