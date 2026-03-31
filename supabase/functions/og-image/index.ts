import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const nahual = url.searchParams.get("nahual") || "Imox";
    const tono = url.searchParams.get("tono") || "1";
    
    // All 9 positions of the Maya Cross
    const concepcion = url.searchParams.get("concepcion") || "";
    const concepcion_izq = url.searchParams.get("concepcion_izq") || "";
    const concepcion_der = url.searchParams.get("concepcion_der") || "";
    const izq = url.searchParams.get("izq") || "";
    const der = url.searchParams.get("der") || "";
    const destino = url.searchParams.get("destino") || "";
    const destino_izq = url.searchParams.get("destino_izq") || "";
    const destino_der = url.searchParams.get("destino_der") || "";

    const hasCross = concepcion && destino && izq && der;

    // Box dimensions
    const boxW = 140;
    const boxH = 55;
    const centerBoxW = 180;
    const centerBoxH = 70;
    const gap = 10;
    
    // Calculate positions for 3x3 grid centered at 600, 315
    const centerX = 600;
    const centerY = 300;
    
    // Row Y positions
    const topY = centerY - centerBoxH/2 - gap - boxH;
    const midY = centerY - centerBoxH/2;
    const bottomY = centerY + centerBoxH/2 + gap;
    
    // Column X positions  
    const leftX = centerX - centerBoxW/2 - gap - boxW;
    const midX = centerX - centerBoxW/2;
    const rightX = centerX + centerBoxW/2 + gap;

    // Generate SVG image for OG with full Maya Cross (9 positions)
    const svg = hasCross ? `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0f172a"/>
            <stop offset="50%" style="stop-color:#1e1b4b"/>
            <stop offset="100%" style="stop-color:#0f172a"/>
          </linearGradient>
          <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#4ade80"/>
            <stop offset="100%" style="stop-color:#22c55e"/>
          </linearGradient>
          <linearGradient id="purple" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#8b5cf6"/>
            <stop offset="100%" style="stop-color:#7c3aed"/>
          </linearGradient>
          <linearGradient id="orange" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#fb923c"/>
            <stop offset="100%" style="stop-color:#f97316"/>
          </linearGradient>
          <linearGradient id="pink" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#f472b6"/>
            <stop offset="100%" style="stop-color:#ec4899"/>
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- Background -->
        <rect width="1200" height="630" fill="url(#bg)"/>
        
        <!-- Subtle pattern overlay -->
        <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="15" r="1" fill="#4ade80" opacity="0.1"/>
        </pattern>
        <rect width="1200" height="630" fill="url(#dots)"/>
        
        <!-- Title -->
        <text x="600" y="55" font-family="system-ui, sans-serif" font-size="24" fill="#94a3b8" text-anchor="middle" font-weight="500">
          Mi Cruz Maya
        </text>
        
        <!-- Cross connecting lines -->
        <line x1="${centerX}" y1="${topY + boxH}" x2="${centerX}" y2="${midY}" stroke="#4ade80" stroke-width="2" opacity="0.4"/>
        <line x1="${centerX}" y1="${midY + centerBoxH}" x2="${centerX}" y2="${bottomY}" stroke="#4ade80" stroke-width="2" opacity="0.4"/>
        <line x1="${leftX + boxW}" y1="${centerY}" x2="${midX}" y2="${centerY}" stroke="#4ade80" stroke-width="2" opacity="0.4"/>
        <line x1="${midX + centerBoxW}" y1="${centerY}" x2="${rightX}" y2="${centerY}" stroke="#4ade80" stroke-width="2" opacity="0.4"/>
        
        <!-- TOP ROW -->
        <!-- Concepción Izquierdo (Top Left) -->
        <rect x="${leftX}" y="${topY}" width="${boxW}" height="${boxH}" rx="8" fill="#1e293b" stroke="#6366f1" stroke-width="1.5" opacity="0.9"/>
        <text x="${leftX + boxW/2}" y="${topY + 22}" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8" text-anchor="middle">Herencia</text>
        <text x="${leftX + boxW/2}" y="${topY + 42}" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="#c4b5fd" text-anchor="middle">${concepcion_izq}</text>
        
        <!-- Concepción (Top Center) -->
        <rect x="${midX + (centerBoxW - boxW)/2}" y="${topY}" width="${boxW}" height="${boxH}" rx="8" fill="#1e293b" stroke="#a78bfa" stroke-width="2"/>
        <text x="${centerX}" y="${topY + 22}" font-family="system-ui, sans-serif" font-size="11" fill="#c4b5fd" text-anchor="middle" font-weight="500">Concepción</text>
        <text x="${centerX}" y="${topY + 42}" font-family="system-ui, sans-serif" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">${concepcion}</text>
        
        <!-- Concepción Derecho (Top Right) -->
        <rect x="${rightX}" y="${topY}" width="${boxW}" height="${boxH}" rx="8" fill="#1e293b" stroke="#6366f1" stroke-width="1.5" opacity="0.9"/>
        <text x="${rightX + boxW/2}" y="${topY + 22}" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8" text-anchor="middle">Ancestral</text>
        <text x="${rightX + boxW/2}" y="${topY + 42}" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="#c4b5fd" text-anchor="middle">${concepcion_der}</text>
        
        <!-- MIDDLE ROW -->
        <!-- Izquierdo (Middle Left - Espiritual) -->
        <rect x="${leftX}" y="${midY + (centerBoxH - boxH)/2}" width="${boxW}" height="${boxH}" rx="8" fill="#1e293b" stroke="#8b5cf6" stroke-width="2"/>
        <text x="${leftX + boxW/2}" y="${centerY - 8}" font-family="system-ui, sans-serif" font-size="11" fill="#a78bfa" text-anchor="middle" font-weight="500">Espiritual</text>
        <text x="${leftX + boxW/2}" y="${centerY + 14}" font-family="system-ui, sans-serif" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">${izq}</text>
        
        <!-- Centro (Center - Main Nahual) -->
        <rect x="${midX}" y="${midY}" width="${centerBoxW}" height="${centerBoxH}" rx="12" fill="url(#accent)" filter="url(#glow)"/>
        <text x="${centerX}" y="${centerY - 8}" font-family="system-ui, sans-serif" font-size="12" fill="#065f46" text-anchor="middle" font-weight="500">Nacimiento</text>
        <text x="${centerX}" y="${centerY + 18}" font-family="system-ui, sans-serif" font-size="26" font-weight="bold" fill="#052e16" text-anchor="middle">${tono} ${nahual}</text>
        
        <!-- Derecho (Middle Right - Material) -->
        <rect x="${rightX}" y="${midY + (centerBoxH - boxH)/2}" width="${boxW}" height="${boxH}" rx="8" fill="#1e293b" stroke="#f97316" stroke-width="2"/>
        <text x="${rightX + boxW/2}" y="${centerY - 8}" font-family="system-ui, sans-serif" font-size="11" fill="#fdba74" text-anchor="middle" font-weight="500">Material</text>
        <text x="${rightX + boxW/2}" y="${centerY + 14}" font-family="system-ui, sans-serif" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">${der}</text>
        
        <!-- BOTTOM ROW -->
        <!-- Destino Izquierdo (Bottom Left) -->
        <rect x="${leftX}" y="${bottomY}" width="${boxW}" height="${boxH}" rx="8" fill="#1e293b" stroke="#ec4899" stroke-width="1.5" opacity="0.9"/>
        <text x="${leftX + boxW/2}" y="${bottomY + 22}" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8" text-anchor="middle">Misión</text>
        <text x="${leftX + boxW/2}" y="${bottomY + 42}" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="#f9a8d4" text-anchor="middle">${destino_izq}</text>
        
        <!-- Destino (Bottom Center) -->
        <rect x="${midX + (centerBoxW - boxW)/2}" y="${bottomY}" width="${boxW}" height="${boxH}" rx="8" fill="#1e293b" stroke="#ec4899" stroke-width="2"/>
        <text x="${centerX}" y="${bottomY + 22}" font-family="system-ui, sans-serif" font-size="11" fill="#f9a8d4" text-anchor="middle" font-weight="500">Destino</text>
        <text x="${centerX}" y="${bottomY + 42}" font-family="system-ui, sans-serif" font-size="18" font-weight="bold" fill="#ffffff" text-anchor="middle">${destino}</text>
        
        <!-- Destino Derecho (Bottom Right) -->
        <rect x="${rightX}" y="${bottomY}" width="${boxW}" height="${boxH}" rx="8" fill="#1e293b" stroke="#ec4899" stroke-width="1.5" opacity="0.9"/>
        <text x="${rightX + boxW/2}" y="${bottomY + 22}" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8" text-anchor="middle">Legado</text>
        <text x="${rightX + boxW/2}" y="${bottomY + 42}" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" fill="#f9a8d4" text-anchor="middle">${destino_der}</text>
        
        <!-- CTA Button -->
        <rect x="425" y="440" width="350" height="50" rx="25" fill="url(#accent)"/>
        <text x="600" y="472" font-family="system-ui, sans-serif" font-size="18" font-weight="600" fill="#052e16" text-anchor="middle">
          Descubre tu Cruz Maya gratis
        </text>
        
        <!-- Legend -->
        <text x="600" y="530" font-family="system-ui, sans-serif" font-size="13" fill="#64748b" text-anchor="middle">
          Calendario Sagrado Maya Cholq'ij
        </text>
        
        <!-- Brand -->
        <text x="600" y="580" font-family="system-ui, sans-serif" font-size="14" fill="#475569" text-anchor="middle">
          azulanaite.com
        </text>
      </svg>
    ` : `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0f172a"/>
            <stop offset="50%" style="stop-color:#1e1b4b"/>
            <stop offset="100%" style="stop-color:#0f172a"/>
          </linearGradient>
          <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#4ade80"/>
            <stop offset="100%" style="stop-color:#22c55e"/>
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="1200" height="630" fill="url(#bg)"/>
        
        <!-- Decorative border -->
        <rect x="20" y="20" width="1160" height="590" fill="none" stroke="#22c55e" stroke-width="2" opacity="0.3"/>
        <rect x="30" y="30" width="1140" height="570" fill="none" stroke="#22c55e" stroke-width="1" opacity="0.2"/>
        
        <!-- Main content -->
        <text x="600" y="180" font-family="system-ui, sans-serif" font-size="32" fill="#9ca3af" text-anchor="middle">
          Mi Nahual Maya es
        </text>
        
        <!-- Tono number -->
        <text x="600" y="300" font-family="system-ui, sans-serif" font-size="140" font-weight="bold" fill="url(#accent)" text-anchor="middle">
          ${tono}
        </text>
        
        <!-- Nahual name -->
        <text x="600" y="400" font-family="system-ui, sans-serif" font-size="80" font-weight="bold" fill="#ffffff" text-anchor="middle">
          ${nahual.toUpperCase()}
        </text>
        
        <!-- CTA -->
        <rect x="400" y="480" width="400" height="60" rx="30" fill="url(#accent)"/>
        <text x="600" y="520" font-family="system-ui, sans-serif" font-size="24" font-weight="600" fill="#000000" text-anchor="middle">
          Descubre el tuyo gratis
        </text>
        
        <!-- Brand -->
        <text x="600" y="590" font-family="system-ui, sans-serif" font-size="18" fill="#6b7280" text-anchor="middle">
          azulanaite.com
        </text>
      </svg>
    `;

    // Return SVG as image
    return new Response(svg, {
      headers: {
        ...corsHeaders,
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error: unknown) {
    console.error("Error generating OG image:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});