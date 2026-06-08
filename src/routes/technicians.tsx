import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Star, Phone, MessageCircle, MapPin, Wrench } from "lucide-react";
import { listTechniciansPublic } from "@/lib/technicians.functions";

type Technician = {
  id: string;
  name: string;
  initials: string;
  specialty: "Electrician" | "CCTV Installer" | "Lighting Specialist";
  years: number;
  areas: string[];
  rating: number;
  ratings: number;
  phone: string;
  whatsapp: string;
  status: "Available Now" | "Busy" | "Offline";
  color: string;
  skills: string[];
};

export const Route = createFileRoute("/technicians")({
  head: () => ({
    meta: [
      { title: "Certified Technicians in Rwanda — LISA VOLT LINK" },
      { name: "description", content: "Hire certified electricians, CCTV installers and lighting specialists across Rwanda. Browse profiles, ratings and WhatsApp them directly." },
      { property: "og:title", content: "Certified Technicians in Rwanda — LISA VOLT LINK" },
      { property: "og:description", content: "Certified electricians, CCTV installers and lighting specialists across Rwanda — book and WhatsApp them directly." },
      { property: "og:url", content: "/technicians" },
    ],
    links: [{ rel: "canonical", href: "/technicians" }],
  }),
  loader: async () => {
    const res = await listTechniciansPublic();
    return { technicians: res.rows as Technician[] };
  },
  component: TechniciansPage,
  errorComponent: ({ error }) => (
    <div className="container-x py-10 text-sm text-destructive">{error.message}</div>
  ),
  notFoundComponent: () => <div className="container-x py-10">Not found</div>,
});

const STATUS_STYLES: Record<Technician["status"], string> = {
  "Available Now": "bg-green-100 text-green-700 border-green-200",
  Busy: "bg-orange-100 text-orange-700 border-orange-200",
  Offline: "bg-gray-100 text-gray-600 border-gray-200",
};

function TechniciansPage() {
  const { technicians } = Route.useLoaderData() as { technicians: Technician[] };
  const [spec, setSpec] = useState<"All" | Technician["specialty"]>("All");
  const [area, setArea] = useState("All");

  const areas = Array.from(new Set(technicians.flatMap((t) => t.areas)));
  const filtered = technicians.filter(
    (t) => (spec === "All" || t.specialty === spec) && (area === "All" || t.areas.includes(area))
  );

  return (
    <>
      <div className="bg-navy text-white">
        <div className="container-x py-12">
          <p className="text-yellow text-xs font-bold uppercase tracking-widest">Technicians</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold">Trusted experts across Rwanda</h1>
          <p className="mt-3 text-white/70 max-w-2xl">Connect directly with certified electricians, CCTV installers and lighting specialists. Rate them after every job.</p>
        </div>
      </div>

      <div className="container-x py-10">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <select value={spec} onChange={(e) => setSpec(e.target.value as typeof spec)} className="border border-border rounded-md px-3 py-2 text-sm bg-card">
            <option value="All">All Specialties</option>
            <option>Electrician</option>
            <option>CCTV Installer</option>
            <option>Lighting Specialist</option>
          </select>
          <select value={area} onChange={(e) => setArea(e.target.value)} className="border border-border rounded-md px-3 py-2 text-sm bg-card">
            <option value="All">All Locations</option>
            {areas.map((a) => <option key={a}>{a}</option>)}
          </select>
          <p className="text-sm text-muted-foreground ml-auto">{filtered.length} technicians</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((t) => (
            <article key={t.id} className="bg-card rounded-2xl border border-border p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-full text-xl font-extrabold text-navy" style={{ backgroundColor: t.color }}>
                  {t.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-navy truncate">{t.name}</h3>
                  <p className="text-xs text-yellow-dark font-semibold uppercase tracking-wider flex items-center gap-1 mt-0.5"><Wrench className="h-3 w-3" />{t.specialty}</p>
                  <span className={`mt-2 inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_STYLES[t.status]}`}>
                    {t.status}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Experience</p>
                  <p className="font-semibold text-navy">{t.years} years</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Rating</p>
                  <div className="flex items-center gap-1 font-semibold text-navy">
                    <Star className="h-3.5 w-3.5 fill-yellow text-yellow" /> {t.rating} ({t.ratings})
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-yellow-dark" />
                <span>{t.areas.join(", ")}</span>
              </div>

              {t.skills.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-yellow-dark mb-2">What I Can Do</p>
                  <div className="flex flex-wrap gap-1.5">
                    {t.skills.map((s) => (
                      <span key={s} className="inline-block bg-navy text-white text-[10px] font-semibold px-2 py-1 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5 grid grid-cols-3 gap-2">
                <a href={`https://wa.me/${t.whatsapp}`} target="_blank" rel="noopener noreferrer" className="col-span-2 inline-flex items-center justify-center gap-1.5 bg-[#25D366] text-white text-xs font-bold py-2.5 rounded-lg hover:opacity-90">
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
                <a href={`tel:${t.phone}`} className="inline-flex items-center justify-center gap-1 bg-navy text-white text-xs font-bold py-2.5 rounded-lg hover:bg-navy-light">
                  <Phone className="h-3.5 w-3.5" />
                </a>
              </div>
              <button className="mt-2 w-full btn-yellow !py-2 text-xs">
                <Star className="h-3.5 w-3.5" /> Rate Technician
              </button>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
