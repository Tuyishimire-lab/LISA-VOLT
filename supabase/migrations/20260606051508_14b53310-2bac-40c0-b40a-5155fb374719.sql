
-- ============= Roles =============
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','customer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- ============= Quotations =============
CREATE TABLE IF NOT EXISTS public.quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(18),'hex'),
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  delivery_pref text NOT NULL DEFAULT 'pickup',
  delivery_location text,
  notes text,
  status text NOT NULL DEFAULT 'Pending',
  validity_hours integer NOT NULL DEFAULT 48,
  original_total numeric NOT NULL DEFAULT 0,
  current_total numeric NOT NULL DEFAULT 0,
  final_total numeric,
  quoted_at timestamptz,
  expires_at timestamptz,
  confirmed_at timestamptz,
  rejected_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.quotations TO service_role;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.quotation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  product_name text NOT NULL,
  qty integer NOT NULL,
  original_unit_price numeric NOT NULL,
  current_unit_price numeric NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.quotation_items TO service_role;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_quotation_items_q ON public.quotation_items(quotation_id);

CREATE TABLE IF NOT EXISTS public.quotation_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  actor text NOT NULL,            -- 'customer' | 'admin'
  kind text NOT NULL,             -- 'request'|'quote_sent'|'counter_offer'|'revised'|'accepted'|'rejected'
  total numeric,
  discount_pct numeric,
  message text,
  item_overrides jsonb,           -- [{product_id, unit_price}]
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.quotation_offers TO service_role;
ALTER TABLE public.quotation_offers ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_quotation_offers_q ON public.quotation_offers(quotation_id, created_at);

CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  reference text NOT NULL UNIQUE,
  deposit_amount numeric NOT NULL,
  deposit_momo_reference uuid,
  total numeric NOT NULL,
  balance numeric NOT NULL,
  expires_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active',  -- active|expired|completed|cancelled
  refund_deposit boolean NOT NULL DEFAULT false,
  reminded_24h boolean NOT NULL DEFAULT false,
  reminded_2h boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.pickup_holds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  reference text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.pickup_holds TO service_role;
ALTER TABLE public.pickup_holds ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.online_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  reference text NOT NULL UNIQUE,
  amount numeric NOT NULL,
  momo_reference uuid,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.online_payments TO service_role;
ALTER TABLE public.online_payments ENABLE ROW LEVEL SECURITY;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS quotations_set_updated_at ON public.quotations;
CREATE TRIGGER quotations_set_updated_at BEFORE UPDATE ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

DROP TRIGGER IF EXISTS bookings_set_updated_at ON public.bookings;
CREATE TRIGGER bookings_set_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Bootstrap-first-admin helper: returns true if no admins exist yet
CREATE OR REPLACE FUNCTION public.no_admins_yet()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
$$;
