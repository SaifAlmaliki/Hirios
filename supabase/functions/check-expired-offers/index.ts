import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check for expired offers
    const { data: expiredOffers, error } = await supabaseClient
      .from('job_offers')
      .select(`
        id,
        resume_pool_id,
        job_id,
        offer_status,
        expiry_date,
        created_at
      `)
      .in('offer_status', ['sent', 'draft'])
      .lt('expiry_date', new Date().toISOString().split('T')[0])

    if (error) {
      console.error('Error fetching expired offers:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch expired offers' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!expiredOffers || expiredOffers.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No expired offers found',
          processed: 0 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update expired offers
    const offerIds = expiredOffers.map(offer => offer.id)
    
    const { error: updateError } = await supabaseClient
      .from('job_offers')
      .update({ 
        offer_status: 'expired',
        updated_at: new Date().toISOString()
      })
      .in('id', offerIds)

    if (updateError) {
      console.error('Error updating expired offers:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update expired offers' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Add expiry comments to offers using existing candidate_comments table
    const expiryComments = expiredOffers.map(offer => ({
      resume_pool_id: offer.resume_pool_id,
      job_id: offer.job_id,
      comment: `[EXPIRY_NOTE] Offer expired on ${new Date().toISOString().split('T')[0]}. No response received from candidate.`,
      created_by_user_id: 'system' // You might want to use a system user ID
    }))

    const { error: commentError } = await supabaseClient
      .from('candidate_comments')
      .insert(expiryComments)

    if (commentError) {
      console.error('Error adding expiry comments:', commentError)
      // Don't fail the entire operation for comment errors
    }

    console.log(`Processed ${expiredOffers.length} expired offers`)

    return new Response(
      JSON.stringify({ 
        message: 'Expired offers processed successfully',
        processed: expiredOffers.length,
        offers: expiredOffers.map(offer => ({
          id: offer.id,
          expiry_date: offer.expiry_date,
          previous_status: offer.offer_status
        }))
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
