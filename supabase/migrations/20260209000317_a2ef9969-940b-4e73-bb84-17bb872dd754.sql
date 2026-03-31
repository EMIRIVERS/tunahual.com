-- Allow upsert (UPDATE) on leads table for anyone (same as INSERT policy)
CREATE POLICY "Anyone can update leads"
ON public.leads
FOR UPDATE
USING (true)
WITH CHECK (true);
