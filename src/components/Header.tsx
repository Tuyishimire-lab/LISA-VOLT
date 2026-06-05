/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ShoppingBag, User, LogOut, Search, Menu, X, Lightbulb, Shield, Zap } from 'lucide-react';
import { CategoryID } from '../types';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  user: any; // Firebase user or guest
  onLogout: () => void;
  onSelectCategory: (category: CategoryID | 'all') => void;
  selectedCategory: CategoryID | 'all';
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Header({
  cartCount,
  onOpenCart,
  onOpenAuth,
  user,
  onLogout,
  onSelectCategory,
  selectedCategory,
  searchQuery,
  onSearchChange,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-zinc-950 border-b border-zinc-800 text-zinc-150 shadow-md">
      {/* Top micro-bar for Kigali local contact */}
      <div className="bg-amber-500 text-zinc-950 text-xs py-1.5 px-4 font-mono font-medium flex justify-between items-center overflow-x-auto whitespace-nowrap">
        <span>📍 KN 2 Rd, Muhima, Kigali, Rwanda (Opposite Yamaha)</span>
        <span className="hidden sm:inline">📞 Call us: +250 788 456 789 | Fast Delivery & Expert Installers</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-1.5 cursor-pointer shrink-0" onClick={() => onSelectCategory('all')}>
            <div className="bg-amber-500 text-zinc-950 p-2 rounded-lg font-bold flex items-center justify-center">
              <Zap size={22} className="fill-zinc-950" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-wider font-sans text-white block">LISA VOLT</span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-amber-500 font-mono font-bold block -mt-1 leading-none">LINK KIGALI</span>
            </div>
          </div>

          {/* Desktop Product Search */}
          <div className="hidden md:flex relative max-w-md w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-500">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search lighting, cables, sockets, CCTV..."
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-150 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors font-mono"
            />
          </div>

          {/* Interactive Actions */}
          <div className="flex items-center gap-4">
            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2 text-zinc-300 hover:text-amber-500 transition-colors rounded-lg hover:bg-zinc-900"
              title="Shopping Cart"
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-zinc-950 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth Indicator */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden lg:block text-right">
                  <span className="text-xs text-zinc-400 block font-mono">Signed in as</span>
                  <span className="text-sm text-zinc-100 font-medium block truncate max-w-[120px]">
                    {user.displayName || user.email}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-zinc-300 hover:text-red-500 transition-colors rounded-lg hover:bg-zinc-900"
                  title="Logout"
                >
                  <LogOut size={22} />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-sm text-zinc-100 hover:text-amber-500 font-mono font-medium transition-colors"
              >
                <User size={16} />
                <span>Log In</span>
              </button>
            )}

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-zinc-300 hover:text-amber-500 transition-colors rounded-lg hover:bg-zinc-900"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>

        {/* Categories Navigator Row (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 mt-4 pt-4 border-t border-zinc-900 justify-center">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => onSelectCategory('lighting')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 ${
              selectedCategory === 'lighting'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Lightbulb size={12} />
            Lighting
          </button>
          <button
            onClick={() => onSelectCategory('cctv')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 ${
              selectedCategory === 'cctv'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Shield size={12} />
            CCTV Cameras
          </button>
          <button
            onClick={() => onSelectCategory('electrical')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 ${
              selectedCategory === 'electrical'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Zap size={12} />
            Electrical Accessories
          </button>
        </nav>

        {/* Mobile Expansion (Search & Categories) */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-zinc-800 space-y-4 animate-fadeIn">
            {/* Mobile Search */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                <Search size={18} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search catalog..."
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-150 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none"
              />
            </div>

            {/* Mobile Nav Links */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onSelectCategory('all');
                  setMobileMenuOpen(false);
                }}
                className={`py-2 px-3 text-center rounded-lg text-xs font-mono font-bold uppercase tracking-wider ${
                  selectedCategory === 'all' ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-900 text-zinc-300'
                }`}
              >
                All Items
              </button>
              <button
                onClick={() => {
                  onSelectCategory('lighting');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-mono font-bold uppercase tracking-wider ${
                  selectedCategory === 'lighting' ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-900 text-zinc-300'
                }`}
              >
                <Lightbulb size={12} />
                Lighting
              </button>
              <button
                onClick={() => {
                  onSelectCategory('cctv');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-mono font-bold uppercase tracking-wider ${
                  selectedCategory === 'cctv' ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-900 text-zinc-300'
                }`}
              >
                <Shield size={12} />
                CCTV Cameras
              </button>
              <button
                onClick={() => {
                  onSelectCategory('electrical');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-mono font-bold uppercase tracking-wider ${
                  selectedCategory === 'electrical' ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-900 text-zinc-300'
                }`}
              >
                <Zap size={12} />
                Electrical
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
