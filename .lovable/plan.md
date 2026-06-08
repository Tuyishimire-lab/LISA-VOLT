# Quotation & Negotiation System — Implementation Plan

A complete cart-to-quote-to-payment flow with negotiation history, three payment paths (online, in-shop, 5% deposit booking), and a properly role-gated admin dashboard. Customer notifications are in-app via a unique shareable quote link.

## What you'll get

### Customer flow
- **Cart page**: side-by-side "Proceed to Checkout" (yellow) and "Request a Quotation" (navy) buttons, with the helper note. Empty cart hides both.
- **Quotation request page**: name, phone/WhatsApp, optional email, pickup vs delivery toggle (delivery shows address field), notes, full cart table with subtotal/grand total, yellow submit. Submit issues a unique `share_token`. Success screen tells customer "we'll review within 2 hours" and shows their personal quote link + a "Copy link" button.
- **Customer quote page** (`/quote/$token`): public, no login. Shows current status timeline, itemized list, current total, validity countdown, and full negotiation thread (offers from both sides). When admin has sent an official quote: Accept (green) / Suggest discount (yellow) / Reject (red) buttons.
- **Discount counter-offer form**: percentage OR new total, optional message, "Send My Offer" submit. Disabled while waiting for admin response.
- **Confirmed state**: three payment-option cards (Pay Online, Pay at Shop, Book with 5% Deposit) with clear breakdowns.
- **Pay at shop**: generates a 24-hour pickup hold, shows address/phone and a pickup reference. No payment collected.
- **Book with 5% deposit**: shows total / 5% / balance math; opens the existing MoMo modal to collect just the 5%. On success, shows booking confirmation with reference, items, deposit, balance, deadline (48h from now), shop address.
- **Pay online now**: opens the existing MoMo modal for the full amount; on success shows order-placed confirmation.

### Admin flow (role-gated)
- New `/admin/quotations` page under `_authenticated/admin/...`. Only users with the `admin` role can reach it; everyone else gets redirected.
- List of all quotations with status badges (Pending / Sent / Negotiating / Confirmed / Booked / Paid / Pickup-Hold / Expired / Completed / Rejected). Filter by status, date range, and customer name. Most recent first.
- Per-quotation detail view: customer info, editable per-item prices, validity hours field, send-quote button. Full chronological negotiation thread with both sides' offers and messages.
- Counter-offer responses: accept the customer's offer / send a revised quote / reject with message.
- Booking expiry tracking with countdown, "release stock" action, and a "refund 5% deposit?" toggle per booking.
- One-click WhatsApp button on every quotation (opens `wa.me` with a pre-filled message).
- "Download invoice (PDF)" button on confirmed quotations.
- In-dashboard alert bell (reuses existing `admin_alerts` table) — fires on new requests, counter-offers, booking expiries.

### Booking expiry automation
- A cron job runs every 5 minutes and:
  - Marks bookings older than 48h as `Expired`, releases the reservation, and writes an `admin_alerts` row.
  - Writes alert rows for bookings hitting 24h-remaining and 2h-remaining milestones (admin sees these in the bell; no WhatsApp/email auto-send since you chose in-app only).

## Technical details

### Database (one migration)
- `app_role` enum (`admin`, `customer`), `user_roles` table, `has_role(uuid, app_role)` security-definer function — canonical pattern.
- `quotations`: customer info, `share_token` (unique), `status`, `validity_hours`, `quoted_at`, `confirmed_at`, `final_total`, `delivery_pref`, `delivery_location`, `notes`.
- `quotation_items`: per-line product_id, product_name (snapshot), qty, original_unit_price, current_unit_price.
- `quotation_offers`: append-only negotiation history — `actor` (`customer`/`admin`), `kind` (`quote_sent`/`counter_offer`/`accepted`/`rejected`/`revised`), `total`, `discount_pct`, `message`, item-level overrides as JSONB, `created_at`.
- `bookings`: quotation_id, `reference`, `deposit_amount`, `deposit_momo_reference_id` (FK soft to momo_transactions), `total`, `balance`, `expires_at`, `status` (`active`/`expired`/`completed`/`cancelled`), `refund_deposit` boolean, `reminded_24h`, `reminded_2h`.
- `pickup_holds`: quotation_id, `reference`, `expires_at`, status.
- RLS: all tables locked down to service role. Public quote access goes through a `getQuoteByToken` server fn that uses `supabaseAdmin` + token check (no policies needed). Admin reads go through server fns gated by `requireSupabaseAuth` + `has_role(uid,'admin')`. Insert grants where required.
- All tables get GRANTs to authenticated + service_role per house rules.
- pg_cron + pg_net job calls `/api/public/cron/bookings-tick` every 5 minutes (anon-key authenticated per the cron-job pattern).

### Server functions (`src/lib/quotations.functions.ts`, `bookings.functions.ts`)
- Public: `createQuotationRequest`, `getQuoteByToken`, `customerAcceptQuote`, `customerCounterOffer`, `customerRejectQuote`, `customerChoosePayAtShop`, `customerStartDepositBooking` (returns the same MoMo `referenceId` flow), `customerStartFullPayment`, `customerConfirmBookingPayment`.
- Admin (gated by `requireSupabaseAuth` + `has_role`): `adminListQuotations`, `adminGetQuotation`, `adminSendQuote`, `adminAcceptCounter`, `adminReviseQuote`, `adminRejectQuote`, `adminToggleRefundDeposit`, `adminMarkCompleted`, `adminGenerateInvoicePdf` (uses pdf-lib in the server runtime).
- All inputs validated with Zod (lengths, ranges, regex on phone).

### Server route
- `/api/public/cron/bookings-tick` (POST): verifies `apikey` header matches `SUPABASE_PUBLISHABLE_KEY`, then runs expiry + reminder logic. Returns 401 otherwise.

### Auth gate
- The integration-managed `src/routes/_authenticated/route.tsx` already redirects unauthenticated users to `/auth`.
- New nested pathless layout `src/routes/_authenticated/admin.tsx` reads the user via a server fn `getMyRoles` and redirects non-admins to `/`.
- New page: `src/routes/_authenticated/admin.quotations.tsx` (+ detail at `_authenticated/admin.quotations.$id.tsx`).
- A small seeding helper inside the admin layout displays "You're signed in but not an admin — grant yourself the admin role" with a one-click button **only when no admin exists yet** (uses a server fn that bootstraps the first admin). This avoids the chicken-and-egg problem after the migration runs.

### Public routes
- `/request-quotation` — the form.
- `/quote/$token` — customer quote view with negotiation, accept/counter/reject, payment chooser, booking confirmation.

### Reuse of existing pieces
- `MomoPaymentModal` is reused as-is for both full payment and the 5% deposit (it accepts `amount` and a success callback).
- `admin_alerts` table reused for the new alert kinds (`NEW_QUOTATION`, `COUNTER_OFFER`, `BOOKING_EXPIRING`, `BOOKING_EXPIRED`).
- Existing token-gated `/admin/requests`, `/admin/momo`, `/admin/technicians` are left untouched for now — only the new quotations area uses the new role gate. (We can migrate those later in a separate pass.)

### Notifications
- In-app only as you chose. After form submission the customer gets the share link and a copy button; the admin sees the alert immediately via the existing polling bell.
- No WhatsApp/email auto-send. WhatsApp button on the admin side opens `wa.me` so admin can send the link manually if they want.

## Out of scope for this round
- WhatsApp auto-confirmations and reminders (you said skip Twilio).
- Email notifications (deferred; no domain configured).
- Replacing the existing admin token gate on legacy admin pages.
- Stock-level enforcement (the catalog is a static product list, not a stock DB).

## What I'll need from you after the migration runs
- Sign in once (Supabase auth — email/password and Google are already wired). Then click "Grant me admin" on the gated admin layout. After that, `/admin/quotations` is yours.
