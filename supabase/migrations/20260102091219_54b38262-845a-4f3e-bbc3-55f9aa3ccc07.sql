-- Create leads table for capturing user information
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  nombre TEXT NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  nahual TEXT,
  tono INTEGER,
  kin_completo TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for email lookups
CREATE INDEX idx_leads_email ON public.leads(email);

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policy: Allow insert from anyone (lead capture doesn't require auth)
CREATE POLICY "Anyone can insert leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

-- Policy: Only service role can read leads (for admin/backend use)
CREATE POLICY "Service role can read leads" 
ON public.leads 
FOR SELECT 
USING (false);