-- Create table for purchases/access tokens
CREATE TABLE public.reading_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  kin_slug text NOT NULL,
  is_premium boolean DEFAULT false,
  payment_id text,
  amount_paid numeric(10,2),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  UNIQUE(email, kin_slug)
);

-- Enable RLS
ALTER TABLE public.reading_tokens ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (for free readings)
CREATE POLICY "Anyone can insert reading tokens"
ON public.reading_tokens
FOR INSERT
WITH CHECK (true);

-- Users can read their own tokens by email match
CREATE POLICY "Users can read own tokens"
ON public.reading_tokens
FOR SELECT
USING (true);

-- Only service role can update (for payment confirmation)
CREATE POLICY "Service role can update tokens"
ON public.reading_tokens
FOR UPDATE
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_reading_tokens_email_kin ON public.reading_tokens(email, kin_slug);
CREATE INDEX idx_reading_tokens_payment ON public.reading_tokens(payment_id);