import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import heroLighting from "@/assets/hero-lighting.jpg";
import heroCctv from "@/assets/hero-cctv.jpg";
import heroElectrical from "@/assets/hero-electrical.jpg";

const SLIDES = [
  {
    eyebrow: "Lighting Collection",
    title: "Light up every corner of your home",
    desc: "Chandeliers, LED panels, smart bulbs and decorative lights — premium quality at fair prices.",
    cta: "Shop Lighting",
    image: heroLighting,
  },
  {
    eyebrow: "CCTV Security",
    title: "Protect what matters most",
    desc: "HD indoor & outdoor cameras, PTZ, video doorbells and full DVR/NVR systems with expert installation.",
    cta: "Browse Cameras",
    image: heroCctv,
  },
  {
    eyebrow: "Electrical Accessories",
    title: "Powering Rwanda's smartest homes",
    desc: "Smart switches, circuit protection, cables, solar inverters — everything you need, in one place.",
    cta: "Explore Catalog",
    image: heroElectrical,
  },
];

export function HeroSlider() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % SLIDES.length), 6000);
    return () => clearInterval(id);
  }, []);
  const s = SLIDES[i];
  return (
    <section className="relative bg-navy text-white overflow-hidden">
      <div className="container-x grid lg:grid-cols-2 gap-8 py-14 md:py-20 items-center">
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-yellow/15 text-yellow text-xs font-semibold uppercase tracking-widest">
            {s.eyebrow}
          </span>
          <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05]">
            {s.title}
          </h1>
          <p className="mt-5 text-white/75 max-w-lg text-base md:text-lg">{s.desc}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/products" className="btn-yellow">
              {s.cta} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/technicians" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 border-white/20 text-white font-semibold hover:border-yellow hover:text-yellow transition-colors">
              Find a Technician
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-4">
            <button onClick={() => setI((p) => (p - 1 + SLIDES.length) % SLIDES.length)} className="grid h-10 w-10 place-items-center rounded-full border border-white/20 hover:bg-yellow hover:text-navy hover:border-yellow transition-colors" aria-label="Previous">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setI(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all ${idx === i ? "w-10 bg-yellow" : "w-5 bg-white/25"}`}
                />
              ))}
            </div>
            <button onClick={() => setI((p) => (p + 1) % SLIDES.length)} className="grid h-10 w-10 place-items-center rounded-full border border-white/20 hover:bg-yellow hover:text-navy hover:border-yellow transition-colors" aria-label="Next">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 bg-yellow/10 blur-3xl rounded-full" />
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl aspect-[4/3]">
            <img src={s.image} alt={s.title} className="h-full w-full object-cover" key={s.image} />
          </div>
        </div>
      </div>
    </section>
  );
}
