import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the hCaptcha site key from secrets
    const hcaptchaSiteKey = Deno.env.get('HCAPTCHA_SITE_KEY')
    
    if (!hcaptchaSiteKey) {
      console.error('HCAPTCHA_SITE_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'hCaptcha site key not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Setting up hCaptcha site key in forum settings...')

    // Store the hCaptcha site key in forum settings
    const { error } = await supabase.rpc('set_forum_setting', {
      key_name: 'hcaptcha_site_key',
      value: JSON.stringify(hcaptchaSiteKey),
      setting_type: 'string',
      category: 'security',
      description: 'hCaptcha site key for spam protection',
      is_public: false
    })

    if (error) {
      console.error('Error setting hCaptcha site key:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to store hCaptcha site key' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('hCaptcha site key successfully stored in forum settings')

    return new Response(
      JSON.stringify({ 
        message: 'hCaptcha site key configured successfully',
        success: true 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in setup-hcaptcha function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})