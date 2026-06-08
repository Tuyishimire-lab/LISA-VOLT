import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyAdminStatus, bootstrapMakeMeAdmin } from "@/lib/admin-auth.functions";
import { ShieldAlert, KeyRound, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchStatus = useServerFn(getMyAdminStatus);
  const bootstrap = useServerFn(bootstrapMakeMeAdmin);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-status"],
    queryFn: () => fetchStatus(),
    staleTime: 60_000,
  });
  const grant = useMutation({
    mutationFn: () => bootstrap(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-status"] }),
  });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (isLoading) {
    return <div className="container-x py-16 text-sm text-muted-foreground">Checking permissions…</div>;
  }

  if (error) {
    return (
      <div className="container-x py-16 max-w-md text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
        <h1 className="mt-4 text-xl font-bold text-navy">Could not check permissions</h1>
        <p className="mt-1 text-sm text-muted-foreground">{(error as Error).message}</p>
      </div>
    );
  }

  if (!data?.isAdmin) {
    return (
      <div className="container-x py-16 max-w-md mx-auto text-center">
        <ShieldAlert className="mx-auto h-12 w-12 text-yellow" />
        <h1 className="mt-4 text-2xl font-bold text-navy">Admins only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You're signed in but you don't have the admin role.
        </p>
        {data?.noAdminsYet ? (
          <div className="mt-6 p-5 bg-card border border-border rounded-xl text-left">
            <p className="text-sm font-semibold text-navy">No admin exists yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Claim the admin role to bootstrap the admin dashboard.
            </p>
            <button
              onClick={() => grant.mutate()}
              disabled={grant.isPending}
              className="btn-yellow w-full mt-4 cursor-pointer"
            >
              <KeyRound className="h-4 w-4" /> {grant.isPending ? "Granting…" : "Grant me admin"}
            </button>
            {grant.error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-700 text-xs rounded-lg flex flex-col gap-2 leading-relaxed">
                <p className="font-semibold">{(grant.error as Error).message}</p>
                {((grant.error as Error).message.includes("SUPABASE_SERVICE_ROLE_KEY") ||
                  (grant.error as Error).message.includes("service role")) && (
                  <div className="bg-white p-3 rounded border border-red-500/10 text-slate-700 space-y-1.5 shadow-sm mt-1">
                    <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider text-red-600">How to Fix This in 4 Steps:</p>
                    <p>1. Open your <strong>Supabase Dashboard</strong> (supabase.com).</p>
                    <p>2. Select your project and navigate to <strong>Project Settings</strong> (gear icon) &rarr; <strong>API</strong>.</p>
                    <p>3. Find the key labeled <code>service_role</code> (secret) under <strong>Project API Keys</strong> &amp; copy it.</p>
                    <p>4. Click the <strong>Settings</strong> button at the top-right of your AI Studio editor, open the <strong>Secrets</strong> panel, and add your secret with the name <code>SUPABASE_SERVICE_ROLE_KEY</code>.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="mt-4 text-xs text-muted-foreground">Ask an existing admin to grant you access.</p>
        )}
        <button onClick={signOut} className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive">
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
        <p className="mt-6"><Link to="/" className="text-yellow-dark text-sm hover:underline">← Back to site</Link></p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-navy text-white">
        <div className="container-x py-4 flex items-center gap-4 flex-wrap">
          <p className="text-yellow text-xs font-bold uppercase tracking-widest">Admin</p>
          <nav className="flex gap-4 text-sm flex-wrap items-center">
            <Link
              to="/admin"
              activeOptions={{ exact: true }}
              className="text-white/80 hover:text-yellow transition-colors whitespace-nowrap"
              activeProps={{ className: "text-yellow font-bold" }}
            >
              Overview
            </Link>
            <Link
              to="/admin/quotations"
              className="text-white/80 hover:text-yellow transition-colors whitespace-nowrap"
              activeProps={{ className: "text-yellow font-bold" }}
            >
              Quotations
            </Link>
            <Link
              to="/admin/requests"
              className="text-white/80 hover:text-yellow transition-colors whitespace-nowrap"
              activeProps={{ className: "text-yellow font-bold" }}
            >
              Product Requests
            </Link>
            <Link
              to="/admin/momo"
              className="text-white/80 hover:text-yellow transition-colors whitespace-nowrap"
              activeProps={{ className: "text-yellow font-bold" }}
            >
              MoMo Logs
            </Link>
            <Link
              to="/admin/technicians"
              className="text-white/80 hover:text-yellow transition-colors whitespace-nowrap"
              activeProps={{ className: "text-yellow font-bold" }}
            >
              Technicians
            </Link>
          </nav>
          <button onClick={signOut} className="ml-auto inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-yellow">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
