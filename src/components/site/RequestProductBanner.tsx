import { Link } from "@tanstack/react-router";
import { PackageSearch } from "lucide-react";

export function RequestProductBanner() {
  return (
    <div className="mt-10 rounded-xl bg-navy p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-yellow text-navy shrink-0">
          <PackageSearch className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold">Can't find what you need?</h3>
          <p className="text-sm text-white/75">We'll source it for you!</p>
        </div>
      </div>
      <Link
        to="/request-product"
        className="ml-auto inline-flex items-center justify-center rounded-md bg-yellow px-5 py-3 text-sm font-bold text-navy hover:bg-yellow-dark transition-colors"
      >
        Request a Product
      </Link>
    </div>
  );
}
