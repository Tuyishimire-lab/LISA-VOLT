import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react";

const search = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: search,
  head: () => ({ meta: [{ title: "Sign In — LISA VOLT LINK" }, { name: "robots", content: "noindex" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: (redirect as string) ?? "/", replace: true });
    });
  }, [navigate, redirect]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password: pw,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
        if (error) throw error;
      }
      navigate({ to: (redirect as string) ?? "/", replace: true });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container-x py-12 max-w-md mx-auto">
      <div className="bg-card border border-border rounded-xl p-6">
        <p className="text-yellow-dark text-[11px] font-bold uppercase tracking-widest">Account</p>
        <h1 className="mt-1 text-2xl font-extrabold text-navy">
          {mode === "signin" ? "Sign in" : "Create an account"}
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Required for admin access and saving your orders.
        </p>

        <form onSubmit={submit} className="mt-5 space-y-3">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-navy">Email</span>
            <div className="mt-1 flex items-center border-2 border-border rounded-md focus-within:border-yellow">
              <Mail className="h-4 w-4 mx-3 text-muted-foreground" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255}
                className="flex-1 py-2.5 text-sm outline-none bg-transparent" />
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wider text-navy">Password</span>
            <div className="mt-1 flex items-center border-2 border-border rounded-md focus-within:border-yellow">
              <Lock className="h-4 w-4 mx-3 text-muted-foreground" />
              <input type="password" required minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} maxLength={120}
                className="flex-1 py-2.5 text-sm outline-none bg-transparent" />
            </div>
          </label>
          {err && (
            <div className="flex items-start gap-2 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /><span>{err}</span>
            </div>
          )}
          <button disabled={busy} className="btn-yellow w-full">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          {mode === "signin" ? (
            <>New here? <button onClick={() => setMode("signup")} className="text-yellow-dark font-semibold hover:underline">Create an account</button></>
          ) : (
            <>Already have an account? <button onClick={() => setMode("signin")} className="text-yellow-dark font-semibold hover:underline">Sign in</button></>
          )}
        </div>
        <p className="mt-4 text-center"><Link to="/" className="text-xs text-muted-foreground hover:text-navy">← Back to site</Link></p>
      </div>
    </div>
  );
}
