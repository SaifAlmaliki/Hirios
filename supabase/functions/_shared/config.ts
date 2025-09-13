// Shared configuration for Supabase Edge Functions

export const config = {
  // Stripe configuration
  stripe: {
    secretKey: Deno.env.get('STRIPE_SECRET_KEY')!,
    webhookSecret: Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
  },
  
  // Supabase configuration
  supabase: {
    url: Deno.env.get('SUPABASE_URL')!,
    anonKey: Deno.env.get('SUPABASE_ANON_KEY')!,
    serviceRoleKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  },
  
  // Site configuration
  site: {
    url: Deno.env.get('SITE_URL') || 'http://localhost:8080',
  },
}

// Validate required environment variables
export function validateConfig() {
  const required = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ]
  
  const missing = required.filter(key => !Deno.env.get(key))
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}
