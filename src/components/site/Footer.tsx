import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-navy text-white/80 mt-20">
      <div className="container-x py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo inverse />
          <p className="mt-4 text-sm leading-relaxed text-white/65">
            Rwanda's trusted source for lighting, CCTV security and electrical accessories.
            Quality products, expert technicians, fair prices.
          </p>
          <div className="mt-5 flex gap-3">
            {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-yellow hover:bg-yellow hover:text-navy transition-colors" aria-label="social">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            {[["Home","/"],["Products","/products"],["Technicians","/technicians"],["Deals","/deals"],["About Us","/about"],["FAQ","/faq"],["My Account","/account"],["Wishlist","/wishlist"],["Contact","/contact"]].map(([l, h]) => (
              <li key={h}><Link to={h} className="hover:text-yellow transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Categories</h4>
          <ul className="space-y-2 text-sm">
            <li>Lighting</li>
            <li>CCTV Cameras</li>
            <li>Electrical Accessories</li>
            <li>Smart Home</li>
            <li>Solar & Energy</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2"><MapPin className="h-4 w-4 text-yellow shrink-0 mt-0.5" />Kigali, Rwanda</li>
            <li className="flex gap-2"><Phone className="h-4 w-4 text-yellow shrink-0 mt-0.5" />+250 788 286 465</li>
            <li className="flex gap-2"><Mail className="h-4 w-4 text-yellow shrink-0 mt-0.5" />info@lisavoltlink.rw</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/55">
          <p>© Lisa Volt Link 2026 — All rights reserved.</p>
          <p>www.lisavolt.rw</p>
        </div>
      </div>
    </footer>
  );
}
