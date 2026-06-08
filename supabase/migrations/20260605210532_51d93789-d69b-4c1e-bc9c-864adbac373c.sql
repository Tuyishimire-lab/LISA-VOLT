
CREATE TABLE public.admin_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES public.momo_transactions(id) ON DELETE CASCADE,
  reference_id uuid,
  kind text NOT NULL CHECK (kind IN ('FAILED','TIMEOUT')),
  message text,
  acknowledged_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.admin_alerts TO service_role;
ALTER TABLE public.admin_alerts ENABLE ROW LEVEL SECURITY;
-- No policies: only service_role (server admin client) can read/write.
CREATE INDEX admin_alerts_unack_idx ON public.admin_alerts (created_at DESC) WHERE acknowledged_at IS NULL;
