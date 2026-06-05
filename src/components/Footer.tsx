/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShieldCheck, Truck, Wrench, BadgePercent, Zap, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { CategoryID } from '../types';

interface FooterProps {
  onSelectCategory: (category: CategoryID | 'all') => void;
}

export default function Footer({ onSelectCategory }: FooterProps) {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 text-zinc-400 text-sm mt-12">
      {/* 4 Pillars Highlight Section */}
      <div className="bg-zinc-900/55 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-amber-500 shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide font-sans">Quality Products</h4>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">Genuine certified electrical materials and official warranty packages on all electronics.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-amber-500 shrink-0">
                <Truck size={22} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide font-sans">Fast Kigali Delivery</h4>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">Immediate safe dispatch directly to your construction site or house within Kigali hours.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-amber-500 shrink-0">
                <Wrench size={22} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide font-sans">Expert Technicians</h4>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">Certidied electricians available for on-site wiring, configuration, and CCTV camera mounts.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-amber-500 shrink-0">
                <BadgePercent size={22} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide font-sans">Best Wholesale Prices</h4>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">Direct imports with bulk deals that save you money compared to general retailers.</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Primary Footer Links Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Column 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => onSelectCategory('all')}>
              <div className="bg-amber-500 text-zinc-950 p-1.5 rounded font-bold flex items-center justify-center">
                <Zap size={16} className="fill-zinc-950" />
              </div>
              <span className="text-md font-bold tracking-wider font-sans text-white uppercase">LISA VOLT LINK</span>
            </div>
            <p className="text-xs leading-relaxed text-zinc-500 max-w-sm">
              Your one-stop reliable store for architectural luxury lighting systems, HD security camera kits, and flame-retardant electrical accessories in Kigali, Rwanda.
            </p>
            <div className="pt-2 text-xs font-mono text-zinc-500 flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5">
                <Clock size={12} className="text-amber-500" />
                <span>Mon - Sat: 8:00 AM - 7:00 PM</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={12} className="text-amber-500" />
                <span>Sunday: Closed (Available for critical emergency services)</span>
              </span>
            </div>
          </div>

          {/* Column 2: Categories Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold tracking-widest text-white uppercase border-l-2 border-amber-500 pl-2">Product Divisions</h4>
            <ul className="space-y-2 text-zinc-500 text-xs font-mono">
              <li>
                <button onClick={() => onSelectCategory('all')} className="hover:text-amber-500 transition-colors">
                  • View Full Catalog
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('lighting')} className="hover:text-amber-500 transition-colors">
                  • Indoor & Solar Lighting
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('cctv')} className="hover:text-amber-500 transition-colors">
                  • Surveillance CCTV Camera Kit
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('electrical')} className="hover:text-amber-500 transition-colors">
                  • Premium Cables, Sockets & Accessories
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Store maps */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold tracking-widest text-white uppercase border-l-2 border-amber-500 pl-2">Get in Touch</h4>
            <div className="space-y-3 text-xs font-mono text-zinc-400">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <span>Muhima Road, Muhima Commercial Centre, Opposite Yamaha Showroom, Kigali, Rwanda</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-amber-500 shrink-0" />
                <span>+250 788 456 789 / +250 722 123 456</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-amber-500 shrink-0" />
                <span>sales@lisavoltlink.com</span>
              </div>
            </div>
          </div>

        </div>

        {/* Copy bar */}
        <div className="border-t border-zinc-900 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-zinc-600">
          <span>© {new Date().getFullYear()} Lisa Volt Link Kigali. All rights reserved.</span>
          <span className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-850">
            <Zap size={10} className="text-amber-500" />
            <span>Premium Electrical Solutions Kigali</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
