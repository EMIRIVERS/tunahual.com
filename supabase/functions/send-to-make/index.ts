/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory rate limiting (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per window
const RATE_WINDOW_MS = 60 * 1000; // 1 minute

function isRateLimited(clientIP: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(clientIP);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return false;
  }
  
  if (record.count >= RATE_LIMIT) {
    return true;
  }
  
  record.count++;
  return false;
}

// Input validation
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && email.length <= 255 && emailRegex.test(email);
}

function validateNombre(nombre: string): boolean {
  return typeof nombre === 'string' && nombre.length >= 2 && nombre.length <= 100;
}

function validateTelefono(telefono: string | null | undefined): boolean {
  if (!telefono) return true; // Optional field
  return typeof telefono === 'string' && telefono.length <= 20;
}

function validateFechaNacimiento(fecha: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(fecha)) return false;
  const date = new Date(fecha);
  return !isNaN(date.getTime()) && date < new Date();
}

function validateNahual(nahual: string): boolean {
  return typeof nahual === 'string' && nahual.length >= 2 && nahual.length <= 50;
}

function validateTono(tono: number): boolean {
  return typeof tono === 'number' && Number.isInteger(tono) && tono >= 1 && tono <= 13;
}

function validateKinCompleto(kin: string): boolean {
  return typeof kin === 'string' && kin.length <= 100;
}

interface LeadData {
  email: string;
  nombre: string;
  telefono?: string | null;
  fecha_nacimiento: string;
  nahual: string;
  tono: number;
  kin_completo: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('cf-connecting-ip') || 
                     'unknown';
    
    if (isRateLimited(clientIP)) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const makeWebhookUrl = Deno.env.get('MAKE_WEBHOOK_URL');
    
    if (!makeWebhookUrl) {
      console.error('MAKE_WEBHOOK_URL not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook URL not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const leadData: LeadData = await req.json();
    
    // Input validation
    const validationErrors: string[] = [];
    
    if (!validateEmail(leadData.email)) {
      validationErrors.push('Invalid email format');
    }
    if (!validateNombre(leadData.nombre)) {
      validationErrors.push('Name must be 2-100 characters');
    }
    if (!validateTelefono(leadData.telefono)) {
      validationErrors.push('Invalid phone format');
    }
    if (!validateFechaNacimiento(leadData.fecha_nacimiento)) {
      validationErrors.push('Invalid birth date format (YYYY-MM-DD required)');
    }
    if (!validateNahual(leadData.nahual)) {
      validationErrors.push('Invalid nahual');
    }
    if (!validateTono(leadData.tono)) {
      validationErrors.push('Tone must be between 1 and 13');
    }
    if (!validateKinCompleto(leadData.kin_completo)) {
      validationErrors.push('Invalid kin completo');
    }
    
    if (validationErrors.length > 0) {
      console.warn('Validation errors:', validationErrors);
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validationErrors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sending validated lead data to Make:', {
      email: leadData.email.substring(0, 3) + '***', // Don't log full email
      nombre: leadData.nombre,
      nahual: leadData.nahual,
      tono: leadData.tono,
    });

    // Send sanitized data to Make webhook
    const makeResponse = await fetch(makeWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: leadData.email.trim().toLowerCase(),
        nombre: leadData.nombre.trim(),
        telefono: leadData.telefono?.trim() || null,
        fecha_nacimiento: leadData.fecha_nacimiento,
        nahual: leadData.nahual.trim(),
        tono: leadData.tono,
        kin_completo: leadData.kin_completo.trim(),
        timestamp: new Date().toISOString(),
      }),
    });

    if (!makeResponse.ok) {
      console.error('Make webhook error:', makeResponse.status);
      return new Response(
        JSON.stringify({ error: 'Failed to send to Make' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully sent lead to Make');
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in send-to-make function:', errorMessage);
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
