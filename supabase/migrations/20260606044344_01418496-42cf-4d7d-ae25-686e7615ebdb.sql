CREATE TABLE public.product_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  product_name text NOT NULL,
  category text NOT NULL DEFAULT 'Other',
  budget_range text,
  image_urls text[] NOT NULL DEFAULT '{}',
  product_link text,
  notes text,
  status text NOT NULL DEFAULT 'New',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.product_requests TO anon, authenticated;
GRANT ALL ON public.product_requests TO service_role;

ALTER TABLE public.product_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a product request"
  ON public.product_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE TRIGGER product_requests_set_updated_at
  BEFORE UPDATE ON public.product_requests
  FOR EACH ROW EXECUTE FUNCTION public.momo_set_updated_at();

CREATE INDEX product_requests_created_at_idx ON public.product_requests (created_at DESC);
CREATE INDEX product_requests_status_idx ON public.product_requests (status);
