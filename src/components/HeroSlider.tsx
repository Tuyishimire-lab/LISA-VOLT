/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Shield, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CategoryID } from '../types';

interface HeroSliderProps {
  onCategoryClick: (category: CategoryID) => void;
}

const SLIDES = [
  {
    id: 'lighting',
    heading: 'Light Up Every Room with Style',
    subheading: 'Premium Chandeliers, Solar Floodlights & Smart LEDs',
    description: 'Transform your residential and commercial projects in Kigali with luxury lighting systems that save electricity and stand out.',
    image: 'https://images.unsplash.com/photo-1543083507-09827ba09fd5?q=80&w=1200&auto=format&fit=crop',
    iconName: 'sparkles',
    badge: 'LUXURY LIGHTING',
    color: 'from-amber-600/90'
  },
  {
    id: 'cctv',
    heading: 'Protect What Matters Most',
    subheading: 'High Definition Hikvision CCTV kits & Solar Security Cameras',
    description: '360-degree night vision control, automatic motion tracking, and remote live feeds on your phone from anywhere in Rwanda.',
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=1200&auto=format&fit=crop',
    iconName: 'shield',
    badge: 'SECURE PERIMETERS',
    color: 'from-blue-600/90'
  },
  {
    id: 'electrical',
    heading: 'Quality Building Wiring & Sockets',
    subheading: 'Flame-Retardant Copper Wires & Universal Sockets',
    description: 'Never compromise on home safety. Grade-A pure oxygen-free copper cables certified by ISO for secure distribution grids.',
    image: 'https://images.unsplash.com/photo-1558211583-0457b2b298db?q=80&w=1200&auto=format&fit=crop',
    iconName: 'zap',
    badge: 'GUARANTEED SAFETY',
    color: 'from-emerald-600/90'
  }
];

export default function HeroSlider({ onCategoryClick }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  };

  return (
    <div className="relative w-full h-[400px] sm:h-[500px] overflow-hidden bg-zinc-950 border-b border-zinc-900">
      
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Slide Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${SLIDES[current].image})` }}
          />
          
          {/* Overlay Gradient (Modern Cinema Styling) */}
          <div className={`absolute inset-0 bg-gradient-to-r ${SLIDES[current].color} to-zinc-950/80 sm:to-zinc-950/40`} />

          {/* Dynamic Slide Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-xl md:max-w-2xl text-white space-y-4">
                
                {/* Badge Indicator */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-700 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider text-amber-500"
                >
                  {SLIDES[current].iconName === 'sparkles' && <Sparkles size={12} />}
                  {SLIDES[current].iconName === 'shield' && <Shield size={12} />}
                  {SLIDES[current].iconName === 'zap' && <Zap size={12} />}
                  <span>{SLIDES[current].badge}</span>
                </motion.div>

                {/* Primary Display Type */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight font-sans"
                >
                  {SLIDES[current].heading}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-amber-400 font-mono text-xs sm:text-sm font-semibold tracking-wide"
                >
                  {SLIDES[current].subheading}
                </motion.p>

                {/* Body Details */}
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-zinc-200 text-sm sm:text-base leading-relaxed hidden sm:block max-w-lg"
                >
                  {SLIDES[current].description}
                </motion.p>

                {/* Action button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="pt-2"
                >
                  <button
                    onClick={() => onCategoryClick(SLIDES[current].id as CategoryID)}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded-lg text-sm font-bold tracking-wider transition-colors font-mono cursor-pointer shadow-lg"
                  >
                    SHOP THIS COLLECTION
                  </button>
                </motion.div>

              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide Navigation Controllers (Left / Right) */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-zinc-950/60 hover:bg-amber-500 hover:text-zinc-950 text-white rounded-full transition-colors border border-zinc-800 z-10"
        title="Previous Slide"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-zinc-950/60 hover:bg-amber-500 hover:text-zinc-950 text-white rounded-full transition-colors border border-zinc-800 z-10"
        title="Next Slide"
      >
        <ChevronRight size={20} />
      </button>

      {/* Slide Index Progress Bullet Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              current === i ? 'w-6 bg-amber-500' : 'w-2 bg-zinc-500/70'
            }`}
            title={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

    </div>
  );
}
