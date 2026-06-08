import { Zap } from "lucide-react";

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-9 w-9 place-items-center rounded-md bg-yellow">
        <Zap className="h-5 w-5 text-navy" fill="currentColor" />
      </div>
      <div className="flex flex-col leading-none">
        <span className={`text-base font-extrabold tracking-tight ${inverse ? "text-white" : "text-navy"}`}>
          LISA VOLT <span className="text-yellow">LINK</span>
        </span>
        <span className={`text-[10px] uppercase tracking-[0.2em] ${inverse ? "text-white/60" : "text-muted-foreground"}`}>
          Electrical · Lighting · CCTV
        </span>
      </div>
    </div>
  );
}
