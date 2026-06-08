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
              className="btn-yellow w-full mt-4"
            >
              <KeyRound className="h-4 w-4" /> {grant.isPending ? "Granting…" : "Grant me admin"}
            </button>
            {grant.error && <p className="mt-2 text-xs text-destructive">{(grant.error as Error).message}</p>}
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
          <nav className="flex gap-3 text-sm">
            <Link to="/admin/quotations" className="hover:text-yellow font-semibold" activeProps={{ className: "text-yellow font-semibold" }}>Quotations</Link>
            <a href="/admin/requests" className="hover:text-yellow">Product Requests</a>
            <a href="/admin/momo" className="hover:text-yellow">MoMo</a>
            <a href="/admin/technicians" className="hover:text-yellow">Technicians</a>
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
