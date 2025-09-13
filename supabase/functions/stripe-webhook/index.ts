import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2022-11-15',
    })

    // Initialize Supabase client with service role key for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get the webhook signature
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      return new Response('No signature', { status: 400 })
    }

    // Get the raw body
    const body = await req.text()

    // Verify the webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        Deno.env.get('STRIPE_WEBHOOK_SECRET')!
      )
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message)
      return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 })
    }

    console.log('✅ Webhook event received:', event.type)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        console.log('💳 Checkout session completed:', session.id)
        
        // Extract metadata
        const userId = session.metadata?.userId
        const packageId = session.metadata?.packageId
        const points = parseInt(session.metadata?.points || '0')
        
        if (!userId || !packageId || !points) {
          console.error('❌ Missing metadata in session:', session.metadata)
          return new Response('Missing metadata', { status: 400 })
        }

        // Add points to user account
        const { data: addPointsResult, error: addPointsError } = await supabaseClient.rpc('add_points', {
          target_user_id: userId,
          points_to_add: points,
          transaction_type: 'purchase',
          description: `Purchased ${points} points via Stripe (Session: ${session.id})`,
          reference_id: session.id
        })

        if (addPointsError) {
          console.error('❌ Failed to add points:', addPointsError)
          return new Response('Failed to add points', { status: 500 })
        }

        console.log('✅ Points added successfully:', points, 'for user:', userId)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('💰 Payment succeeded:', paymentIntent.id)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('❌ Payment failed:', paymentIntent.id)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('❌ Webhook error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Webhook processing failed' 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
