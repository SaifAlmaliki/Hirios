import { serve } from "std/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client with service role key
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    if (action === 'get-oauth-url') {
      // Generate OAuth URL using environment variables
      const clientId = Deno.env.get('GMAIL_CLIENT_ID')
      const redirectUri = `${url.origin.replace('functions', 'auth')}/gmail/callback`
      const scope = 'https://www.googleapis.com/auth/gmail.readonly'
      
      if (!clientId) {
        return new Response(
          JSON.stringify({ error: 'Gmail Client ID not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code&access_type=offline&prompt=consent`

      return new Response(
        JSON.stringify({ oauthUrl }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'exchange-code') {
      // Exchange authorization code for tokens
      const { code, email_address, company_profile_id } = await req.json()

      const clientId = Deno.env.get('GMAIL_CLIENT_ID')
      const clientSecret = Deno.env.get('GMAIL_CLIENT_SECRET')
      const redirectUri = `${url.origin.replace('functions', 'auth')}/gmail/callback`

      if (!clientId || !clientSecret) {
        return new Response(
          JSON.stringify({ error: 'Gmail credentials not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      })

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text()
        console.error('Token exchange failed:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to exchange authorization code' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const tokens = await tokenResponse.json()

      // Store the configuration in the database
      const { data, error } = await supabase
        .from('email_configurations')
        .insert([{
          company_profile_id,
          email_address,
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: tokens.refresh_token,
          access_token: tokens.access_token,
          token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          is_active: true,
        }])
        .select()
        .single()

      if (error) {
        console.error('Database insert error:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to save email configuration' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, configuration: data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Gmail OAuth error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
