import { Link } from "@tanstack/react-router";
import { ShoppingCart, Menu, X, Heart, User, GitCompare } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { AISearchBar } from "./AISearchBar";
import { useCart, useWishlist, useCompare } from "@/lib/store";

const NAV = [
  { label: "Home", to: "/" as const },
  { label: "Products", to: "/products" as const },
  { label: "Request a Product", to: "/request-product" as const },
  { label: "Technicians", to: "/technicians" as const },
  { label: "Deals", to: "/deals" as const },
  { label: "About Us", to: "/about" as const },
  { label: "Contact", to: "/contact" as const },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const cart = useCart();
  const wl = useWishlist();
  const cmp = useCompare();
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  return (
    <header className="sticky top-0 z-40 bg-navy text-white shadow-lg">
      <div className="container-x flex h-16 items-center gap-4">
        <Link to="/"><Logo inverse /></Link>

        <nav className="ml-2 hidden xl:flex items-center gap-5">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm font-medium text-white/85 hover:text-yellow transition-colors whitespace-nowrap"
              activeProps={{ className: "text-yellow" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden md:block flex-1 max-w-2xl">
          <AISearchBar />
        </div>

        <Link to="/compare" className="relative p-2 hover:text-yellow transition-colors hidden sm:block" aria-label="Compare">
          <GitCompare className="h-5 w-5" />
          {cmp.length > 0 && <span className="absolute -top-1 -right-1 h-5 w-5 grid place-items-center rounded-full bg-yellow text-navy text-[11px] font-bold">{cmp.length}</span>}
        </Link>
        <Link to="/wishlist" className="relative p-2 hover:text-yellow transition-colors hidden sm:block" aria-label="Wishlist">
          <Heart className="h-5 w-5" />
          {wl.length > 0 && <span className="absolute -top-1 -right-1 h-5 w-5 grid place-items-center rounded-full bg-yellow text-navy text-[11px] font-bold">{wl.length}</span>}
        </Link>
        <Link to="/account" className="p-2 hover:text-yellow transition-colors hidden sm:block" aria-label="Account">
          <User className="h-5 w-5" />
        </Link>
        <Link to="/cart" className="relative p-2 hover:text-yellow transition-colors" aria-label="Cart">
          <ShoppingCart className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 h-5 w-5 grid place-items-center rounded-full bg-yellow text-navy text-[11px] font-bold">{cartCount}</span>
        </Link>

        <button className="xl:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile search row (always visible on small screens) */}
      <div className="md:hidden border-t border-white/10 px-4 py-2.5">
        <AISearchBar compact />
      </div>

      {open && (
        <div className="xl:hidden border-t border-white/10 bg-navy">
          <div className="container-x py-3 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-2 px-2 rounded text-sm font-medium text-white/85 hover:bg-white/5 hover:text-yellow"
                activeProps={{ className: "text-yellow bg-white/5" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
            <div className="border-t border-white/10 mt-2 pt-2 grid grid-cols-3 gap-2 text-center text-xs">
              <Link to="/wishlist" onClick={() => setOpen(false)} className="py-2 rounded bg-white/5 text-white/85">Wishlist ({wl.length})</Link>
              <Link to="/compare" onClick={() => setOpen(false)} className="py-2 rounded bg-white/5 text-white/85">Compare ({cmp.length})</Link>
              <Link to="/account" onClick={() => setOpen(false)} className="py-2 rounded bg-white/5 text-white/85">Account</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

