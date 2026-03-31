import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, kin_slug, nahual_nombre } = await req.json();

    if (!email || !kin_slug) {
      return new Response(
        JSON.stringify({ error: "Email y kin_slug son requeridos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY no está configurado");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Get origin for redirect URLs
    const origin = req.headers.get("origin") || "https://calculadoramaya-azulanaite.lovable.app";

    // Create checkout session with multi-currency support
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Lectura Maya Completa",
              description: `Tu Kin: ${nahual_nombre || "Nahual Maya"} - Cruz Maya de 9 posiciones, conocimiento profundo y guía espiritual`,
              images: ["https://calculadoramaya-azulanaite.lovable.app/og-image.png"],
            },
            unit_amount: 199, // $1.99 USD in cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        email: email.toLowerCase(),
        kin_slug,
        nahual_nombre: nahual_nombre || "",
      },
      success_url: `${origin}/resultado?session_id={CHECKOUT_SESSION_ID}&success=true&kin=${encodeURIComponent(kin_slug)}`,
      cancel_url: `${origin}/?canceled=true`,
      // Enable automatic currency conversion based on customer location
      automatic_tax: { enabled: false },
      // Allow promotion codes
      allow_promotion_codes: true,
    });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
