import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

serve(async (req) => {
  // Paystack webhook doesn't need CORS, but we'll handle it for consistency
  if (req.method === "OPTIONS") {
    return new Response("ok", { 
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      }
    });
  }

  try {
    const signature = req.headers.get("x-paystack-signature");
    const PAYSTACK_SECRET = Deno.env.get("PAYSTACK_SECRET_KEY");
    
    if (!PAYSTACK_SECRET) {
      return new Response(
        JSON.stringify({ error: "Paystack not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verify webhook signature (optional but recommended)
    // In production, you should verify the signature using HMAC

    const event = await req.json();
    
    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (event.event === "charge.success") {
      const reference = event.data.reference;
      const orderId = event.data.metadata?.order_id;

      // Update order payment status
      const { error } = await supabase
        .from('orders')
        .update({ 
          payment_status: 'paid',
          delivery_status: 'confirmed'
        })
        .eq('paystack_reference', reference);

      if (error) {
        console.error("Error updating order:", error);
        return new Response(
          JSON.stringify({ error: "Failed to update order" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Acknowledge other events
    return new Response(
      JSON.stringify({ received: true }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
