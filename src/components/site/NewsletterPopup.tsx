import { useEffect, useState } from "react";
import { X, Mail } from "lucide-react";

export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("lvl_news_dismissed")) return;
    const t = setTimeout(() => setOpen(true), 8000);
    return () => clearTimeout(t);
  }, []);

  function close() {
    setOpen(false);
    localStorage.setItem("lvl_news_dismissed", "1");
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 animate-in fade-in" role="dialog">
      <div className="relative w-full max-w-md rounded-2xl bg-card overflow-hidden shadow-2xl">
        <button onClick={close} aria-label="Close" className="absolute top-3 right-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-navy hover:bg-yellow transition-colors">
          <X className="h-4 w-4" />
        </button>
        <div className="bg-navy text-white p-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-yellow text-navy">
            <Mail className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-xl font-extrabold">Get <span className="text-yellow">10% OFF</span> your first order</h3>
          <p className="mt-1 text-sm text-white/70">Subscribe for weekly deals on lighting, CCTV & electrical gear.</p>
        </div>
        <div className="p-6">
          {done ? (
            <p className="text-center text-sm text-navy font-semibold py-4">Thanks! Check your inbox for the discount code 🎉</p>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (email) { setDone(true); setTimeout(close, 1800); } }} className="flex flex-col gap-3">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="border border-border rounded-md px-3 py-2.5 text-sm outline-none focus:border-yellow" />
              <button type="submit" className="btn-yellow">Subscribe</button>
              <button type="button" onClick={close} className="text-xs text-muted-foreground hover:text-navy">No thanks</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
