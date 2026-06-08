import { createFileRoute } from "@tanstack/react-router";
import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return null;
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key, {
      apiVersion: "2023-10-16" as any,
    });
  }
  return stripeClient;
}

export const Route = createFileRoute("/api/checkout-session")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { items, email, userId, shippingAddress } = body;

          if (!items || !Array.isArray(items) || items.length === 0) {
            return Response.json(
              { error: "Shopping cart items array is required." },
              { status: 400 }
            );
          }

          const stripe = getStripe();
          if (!stripe) {
            console.warn(
              "STRIPE_SECRET_KEY was not supplied. Falling back to sandbox simulator mode."
            );
            return Response.json({
              stripeActive: false,
              message:
                "Stripe credentials missing in server secrets. Pre-authorizing transactional sandbox.",
            });
          }

          const lineItems = items.map((item: any) => {
            const priceInUSD = Math.max(1, Math.round(item.price / 1300));
            return {
              price_data: {
                currency: "usd",
                product_data: {
                  name: item.name,
                  images: item.image ? [item.image] : [],
                  description: "Model division checkout checkout",
                },
                unit_amount: priceInUSD * 100,
              },
              quantity: item.quantity,
            };
          });

          const appUrl = (
            process.env.APP_URL ||
            process.env.VITE_APP_URL ||
            "http://localhost:3000"
          ).replace(/\/$/, "");

          const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            customer_email: email,
            success_url: `${appUrl}/?status=success&orderId=LV-{CHECKOUT_SESSION_ID}`,
            cancel_url: `${appUrl}/?status=cancelled`,
            metadata: {
              userId,
              customerName: shippingAddress?.fullName || "",
              phone: shippingAddress?.phone || "",
              district: shippingAddress?.district || "",
              street: shippingAddress?.streetAddress || "",
              kigaliNotes: shippingAddress?.notes || "none",
            },
          });

          return Response.json({
            stripeActive: true,
            url: session.url,
            sessionId: session.id,
          });
        } catch (err: any) {
          console.error("Stripe API transactional error:", err);
          return Response.json(
            { error: err.message || "Stripe payments creation failed." },
            { status: 500 }
          );
        }
      },
    },
  },
});
