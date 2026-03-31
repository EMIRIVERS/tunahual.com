-- Remove the public SELECT policy from configuracion table
DROP POLICY IF EXISTS "Anyone can read configuration" ON public.configuracion;

-- Create a new policy that only allows admins to read configuration
CREATE POLICY "Only admins can read configuration" 
ON public.configuracion 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));