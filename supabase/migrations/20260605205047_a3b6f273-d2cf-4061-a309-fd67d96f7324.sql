
CREATE TABLE public.momo_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reference_id UUID NOT NULL UNIQUE,
  external_id TEXT NOT NULL,
  phone TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'RWF',
  payer_message TEXT,
  payee_note TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  financial_transaction_id TEXT,
  reason TEXT,
  raw_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.momo_transactions TO service_role;
ALTER TABLE public.momo_transactions ENABLE ROW LEVEL SECURITY;

-- No anon/authenticated policies: all access is through server functions using the service role.

CREATE OR REPLACE FUNCTION public.momo_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER momo_transactions_updated_at
BEFORE UPDATE ON public.momo_transactions
FOR EACH ROW EXECUTE FUNCTION public.momo_set_updated_at();

CREATE INDEX momo_transactions_status_idx ON public.momo_transactions(status);
CREATE INDEX momo_transactions_created_at_idx ON public.momo_transactions(created_at DESC);
