import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Star, Phone, MessageCircle, MapPin, Wrench } from "lucide-react";
import { listTechniciansPublic, rateTechnicianPublic } from "@/lib/technicians.functions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
      {
        name: "description",
        content:
          "Hire certified electricians, CCTV installers and lighting specialists across Rwanda. Browse profiles, ratings and WhatsApp them directly.",
      },
      {
        property: "og:title",
        content: "Certified Technicians in Rwanda — LISA VOLT LINK",
      },
      {
        property: "og:description",
        content:
          "Certified electricians, CCTV installers and lighting specialists across Rwanda — book and WhatsApp them directly.",
      },
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
    <div className="container-x py-10 text-sm text-destructive">
      {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="container-x py-10">Not found</div>,
});

const STATUS_STYLES: Record<Technician["status"], string> = {
  "Available Now": "bg-green-50 text-green-600 border-green-200",
  Busy: "bg-amber-50 text-amber-600 border-amber-200",
  Offline: "bg-gray-100 text-gray-500 border-gray-200",
};

function TechniciansPage() {
  const { technicians } = Route.useLoaderData() as {
    technicians: Technician[];
  };
  const [spec, setSpec] = useState<"All" | Technician["specialty"]>("All");
  const [area, setArea] = useState("All");

  // Rating States
  const [activeTech, setActiveTech] = useState<Technician | null>(null);
  const [userRating, setUserRating] = useState<number>(5);
  const [rateError, setRateError] = useState<string | null>(null);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState(false);

  const router = useRouter();

  const handleRateSubmit = async () => {
    if (!activeTech) return;
    setSubmittingRating(true);
    setRateError(null);
    try {
      await rateTechnicianPublic({ id: activeTech.id, rating: userRating });
      setRatingSuccess(true);
      setTimeout(() => {
        setRatingSuccess(false);
        setActiveTech(null);
        router.invalidate();
      }, 1500);
    } catch (e) {
      console.error(e);
      setRateError("Error submitting rating. Please try again later.");
    } finally {
      setSubmittingRating(false);
    }
  };

  const areas = Array.from(new Set(technicians.flatMap((t) => t.areas)));
  const filtered = technicians.filter(
    (t) =>
      (spec === "All" || t.specialty === spec) &&
      (area === "All" || t.areas.includes(area)),
  );

  return (
    <>
      <div className="bg-navy text-white">
        <div className="container-x py-12">
          <p className="text-yellow text-xs font-bold uppercase tracking-widest">
            Technicians
          </p>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold">
            Trusted experts across Rwanda
          </h1>
          <p className="mt-3 text-white/70 max-w-2xl">
            Connect directly with certified electricians, CCTV installers and
            lighting specialists. Rate them after every job.
          </p>
        </div>
      </div>

      <div className="container-x py-10">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <select
            value={spec}
            onChange={(e) => setSpec(e.target.value as typeof spec)}
            className="border border-border rounded-md px-3 py-2 text-sm bg-card"
          >
            <option value="All">All Specialties</option>
            <option>Electrician</option>
            <option>CCTV Installer</option>
            <option>Lighting Specialist</option>
          </select>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="border border-border rounded-md px-3 py-2 text-sm bg-card"
          >
            <option value="All">All Locations</option>
            {areas.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
          <p className="text-sm text-muted-foreground ml-auto">
            {filtered.length} technicians
          </p>
        </div>

        {/* Card list */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filtered.map((t) => (
            <article
              key={t.id}
              className="bg-white rounded-[2rem] border border-slate-100 p-6 md:p-7 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-extrabold text-[#0B1527] shadow-sm"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-extrabold text-[#0B1527] truncate">
                      {t.name}
                    </h3>
                    <p className="text-xs text-[#E2B11B] font-bold uppercase tracking-wider flex items-center gap-1.5 mt-1">
                      <Wrench className="h-3.5 w-3.5 shrink-0" />
                      <span>{t.specialty.toUpperCase()}</span>
                    </p>
                    <span
                      className={`mt-2.5 inline-block text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border ${STATUS_STYLES[t.status]}`}
                    >
                      {t.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100/60 pt-4">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">
                      Experience
                    </p>
                    <p className="mt-1 text-sm font-extrabold text-[#0B1527]">
                      {t.years} years
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium font-sans">
                      Rating
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-sm font-extrabold text-[#0B1527]">
                      <Star className="h-4 w-4 fill-[#F2C21A] text-[#F2C21A] stroke-none shrink-0" />
                      <span>
                        {t.rating.toFixed(1)} ({t.ratings})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3.5 flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="h-4 w-4 text-[#E2B11B] shrink-0 fill-none" />
                  <span className="font-semibold text-slate-500 truncate">
                    {t.areas.join(", ")}
                  </span>
                </div>

                {t.skills.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-slate-100/60">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#E2B11B] mb-2.5">
                      WHAT I CAN DO
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {t.skills.map((s) => (
                        <span
                          key={s}
                          className="inline-block bg-[#0B1527] text-white text-[11px] font-semibold px-3 py-1.5 rounded-full"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <div className="grid grid-cols-3 gap-2">
                  <a
                    href={`https://wa.me/${t.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="col-span-2 inline-flex items-center justify-center gap-2 bg-[#25D366] text-white text-sm font-bold py-3.5 rounded-2xl hover:opacity-90 transition-opacity"
                  >
                    <MessageCircle className="h-5 w-5 fill-white" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`tel:${t.phone}`}
                    className="inline-flex items-center justify-center bg-[#0B1527] text-white rounded-2xl hover:bg-[#15233c] transition-colors"
                  >
                    <Phone className="h-5 w-5 fill-white" />
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUserRating(5);
                    setRateError(null);
                    setRatingSuccess(false);
                    setActiveTech(t);
                  }}
                  className="mt-2.5 w-full bg-[#F2C21A] hover:bg-[#e2b11b] text-[#0B1527] font-extrabold py-3.5 rounded-2xl transition-all inline-flex items-center justify-center gap-2 text-sm shadow-sm"
                >
                  <Star className="h-4 w-4 fill-[#0B1527]" />
                  <span>Rate Technician</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Dynamic interactive rating popup */}
      <Dialog
        open={!!activeTech}
        onOpenChange={(open) => {
          if (!open) setActiveTech(null);
        }}
      >
        <DialogContent className="sm:max-w-[420px] rounded-3xl p-6 bg-white border border-slate-100">
          <DialogHeader className="flex flex-col items-center">
            {activeTech && (
              <>
                <div
                  className="grid h-16 w-16 place-items-center rounded-full text-xl font-extrabold text-[#0B1527] mb-3 shadow-sm"
                  style={{ backgroundColor: activeTech.color }}
                >
                  {activeTech.initials}
                </div>
                <DialogTitle className="text-xl font-extrabold text-[#0B1527] text-center">
                  Rate {activeTech.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1 text-center">
                  Quality, punctuality, and skill rating for certified specialist
                </DialogDescription>
              </>
            )}
          </DialogHeader>

          {/* Dialog body */}
          {ratingSuccess ? (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-3 font-bold text-lg animate-bounce">
                ✓
              </div>
              <h4 className="text-base font-bold text-navy">
                Rating Submitted!
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Thank you for your feedback! Recalculating scores...
              </p>
            </div>
          ) : (
            <div className="py-4 flex flex-col items-center">
              <p className="text-xs text-muted-foreground mb-4 text-center">
                Tell others about your experience. How many stars would you give?
              </p>

              {/* Stars selection */}
              <div className="flex items-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserRating(star)}
                    className="p-1.5 rounded-full hover:bg-slate-50 transition-colors focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 stroke-1 shrink-0 ${
                        star <= userRating
                          ? "fill-[#F2C21A] text-[#F2C21A]"
                          : "text-slate-300 fill-none"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {rateError && (
                <p className="text-xs text-red-500 font-semibold mb-3 self-stretch text-center">
                  {rateError}
                </p>
              )}

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3 self-stretch mt-2">
                <button
                  type="button"
                  onClick={() => setActiveTech(null)}
                  className="py-3 px-4 border border-slate-200 rounded-xl text-slate-500 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submittingRating}
                  onClick={handleRateSubmit}
                  className="py-3 px-4 bg-[#F2C21A] text-[#0B1527] rounded-xl text-xs font-bold hover:bg-[#e2b11b] transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
                >
                  {submittingRating ? "Submitting..." : "Submit Rating"}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
