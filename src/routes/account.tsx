import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { User, Mail, Lock, Phone, Package } from "lucide-react";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "My Account — LISA VOLT LINK" }] }),
  component: AccountPage,
});

function AccountPage() {
  const [tab, setTab] = useState<"login" | "register" | "track">("login");

  return (
    <>
      <div className="bg-navy text-white">
        <div className="container-x py-10">
          <p className="text-yellow text-xs font-bold uppercase tracking-widest">Customer</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold">My Account</h1>
        </div>
      </div>

      <div className="container-x py-10 max-w-xl">
        <div className="flex border-b border-border">
          {(["login", "register", "track"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-3 text-sm font-semibold uppercase tracking-wider transition-colors ${tab === t ? "text-navy border-b-2 border-yellow" : "text-muted-foreground hover:text-navy"}`}>
              {t === "track" ? "Track Order" : t}
            </button>
          ))}
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="mt-6 space-y-4 bg-card p-6 border border-border rounded-xl">
          {tab === "register" && (
            <Field icon={User} type="text" placeholder="Full name" />
          )}
          {tab === "track" ? (
            <>
              <Field icon={Package} type="text" placeholder="Order number (e.g. LVL-2026-001)" />
              <Field icon={Mail} type="email" placeholder="Email used for the order" />
              <button className="btn-yellow w-full">Track my order</button>
            </>
          ) : (
            <>
              <Field icon={Mail} type="email" placeholder="Email" />
              {tab === "register" && <Field icon={Phone} type="tel" placeholder="Phone (+250 …)" />}
              <Field icon={Lock} type="password" placeholder="Password" />
              <button className="btn-yellow w-full">{tab === "login" ? "Sign in" : "Create account"}</button>
              {tab === "login" && <p className="text-xs text-center text-muted-foreground"><a href="#" className="hover:text-navy">Forgot password?</a></p>}
            </>
          )}
        </form>

        <p className="mt-6 text-xs text-muted-foreground text-center">
          Need help? <Link to="/contact" className="text-yellow-dark font-semibold hover:underline">Contact support</Link>
        </p>
      </div>
    </>
  );
}

function Field({ icon: Icon, ...props }: { icon: typeof User } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex items-center border border-border rounded-md focus-within:border-yellow">
      <Icon className="h-4 w-4 ml-3 text-muted-foreground" />
      <input {...props} className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent" />
    </div>
  );
}
