import { useState } from "react";
import { PackageSearch, X } from "lucide-react";
import { RequestProductForm } from "./RequestProductForm";

export function RequestProductFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-5 z-40 inline-flex items-center gap-2 rounded-full bg-navy px-4 py-3 text-sm font-bold text-yellow shadow-xl ring-1 ring-black/10 hover:bg-navy/90 hover:scale-105 transition-all"
        aria-label="Request a product"
      >
        <PackageSearch className="h-5 w-5" />
        <span className="hidden sm:inline">Request a Product</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full sm:max-w-xl bg-background sm:rounded-xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-navy px-5 py-3 sm:rounded-t-xl">
              <div>
                <p className="text-yellow text-[10px] font-bold uppercase tracking-widest">
                  Can't find it?
                </p>
                <h2 className="text-white text-lg font-bold">Request a Product</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-white/80 hover:bg-white/10"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">
              <RequestProductForm />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
