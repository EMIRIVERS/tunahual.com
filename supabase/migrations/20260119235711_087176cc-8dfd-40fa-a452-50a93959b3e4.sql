-- Add unique index on leads(email) to prevent duplicate entries
CREATE UNIQUE INDEX IF NOT EXISTS leads_email_unique_idx ON public.leads(email);