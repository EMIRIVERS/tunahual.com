-- Create configuration table for storing app settings like webhook URLs
CREATE TABLE public.configuracion (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clave TEXT NOT NULL UNIQUE,
  valor TEXT NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.configuracion ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read configuration (needed for webhook URL)
CREATE POLICY "Anyone can read configuration" 
ON public.configuracion 
FOR SELECT 
USING (true);

-- Only admins can modify configuration
CREATE POLICY "Admins can insert configuration" 
ON public.configuracion 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admins can update configuration" 
ON public.configuracion 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete configuration" 
ON public.configuracion 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_configuracion_updated_at
BEFORE UPDATE ON public.configuracion
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default empty webhook URL
INSERT INTO public.configuracion (clave, valor, descripcion)
VALUES ('zapier_webhook_url', '', 'URL del webhook de Zapier para enviar leads a Kajabi');