import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiting (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // requests per window (stricter for AI calls)
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

// Input validation and sanitization
function sanitizeString(input: unknown, maxLength: number): string | null {
  if (typeof input !== 'string') return null;
  // Remove any characters that could be used for prompt injection
  const sanitized = input
    .trim()
    .substring(0, maxLength)
    .replace(/[<>{}[\]\\]/g, '') // Remove special characters
    .replace(/\n|\r/g, ' '); // Replace newlines with spaces
  return sanitized.length > 0 ? sanitized : null;
}

// Valid nahual names for validation
const VALID_NAHUALES = [
  'Imox', "Iq'", "Aq'ab'al", "K'at", 'Kan', 'Kame', 'Kej', "Q'anil",
  'Toj', "Tz'i'", "B'atz'", 'E', 'Aj', "I'x", "Tz'ikin", 'Ajmaq',
  "No'j", 'Tijax', 'Kawoq', 'Ajpu'
];

const VALID_TYPES = ['animal', 'place'];

serve(async (req) => {
  if (req.method === "OPTIONS") {
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
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    
    // Validate and sanitize inputs
    const animalGuia = sanitizeString(body.animalGuia, 50);
    const nahualName = sanitizeString(body.nahualName, 20);
    const type = sanitizeString(body.type, 10) || 'animal';
    
    if (!animalGuia) {
      return new Response(
        JSON.stringify({ error: "Invalid or missing animalGuia" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!nahualName) {
      return new Response(
        JSON.stringify({ error: "Invalid or missing nahualName" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!VALID_TYPES.includes(type)) {
      return new Response(
        JSON.stringify({ error: "Invalid type. Must be 'animal' or 'place'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Use pre-defined prompts with only the validated input values
    let prompt = "";
    
    if (type === "animal") {
      prompt = `Create a mystical, sacred illustration of a ${animalGuia} as a Mayan spirit animal guide for the Nahual ${nahualName}. Style: Ancient Mayan ceremonial art with golden accents, earth tones, and mystical glowing elements. The animal should appear majestic, spiritual, and powerful. Include subtle Mayan geometric patterns and glyphs in the background. The image should feel sacred and ancient. High quality, detailed illustration, 16:9 aspect ratio.`;
    } else {
      prompt = `Create a mystical, sacred illustration of ${animalGuia} as a Mayan place of power. Style: Ancient Mayan ceremonial setting with golden light, mystical atmosphere, and sacred geometry. Include Mayan architectural elements, glowing energy, and spiritual ambiance. The scene should feel powerful and ancient. High quality, detailed illustration, 16:9 aspect ratio.`;
    }

    console.log(`Generating ${type} image for ${nahualName}: ${animalGuia}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received successfully");
    
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      console.error("No image URL in response");
      throw new Error("No image generated");
    }

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating image:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred generating the image" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
