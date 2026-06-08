import { createFileRoute } from "@tanstack/react-router";
import { RequestProductForm } from "@/components/site/RequestProductForm";

export const Route = createFileRoute("/request-product")({
  head: () => ({
    meta: [
      { title: "Request a Product — LISA VOLT LINK" },
      {
        name: "description",
        content:
          "Can't find what you need? Submit a sourcing request and our team will find it for you in Rwanda.",
      },
    ],
  }),
  component: RequestProductPage,
  errorComponent: ({ error }) => (
    <div className="container-x py-10 text-sm text-destructive">{error.message}</div>
  ),
  notFoundComponent: () => <div className="container-x py-10">Not found</div>,
});

function RequestProductPage() {
  return (
    <>
      <div className="bg-navy text-white">
        <div className="container-x py-10">
          <p className="text-yellow text-xs font-bold uppercase tracking-widest">
            Can't Find It? Request It!
          </p>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold">Request a Product</h1>
          <p className="mt-2 text-white/70 max-w-2xl">
            Tell us what you're looking for — lighting, CCTV, electrical parts, or anything else.
            Our team will source it and contact you within 24 hours.
          </p>
        </div>
      </div>
      <div className="container-x py-10 max-w-2xl">
        <div className="rounded-xl border border-border bg-card p-5 sm:p-7">
          <RequestProductForm />
        </div>
      </div>
    </>
  );
}
