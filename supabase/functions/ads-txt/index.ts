import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get ads.txt content from forum settings
    const { data: setting, error } = await supabase
      .from('forum_settings')
      .select('setting_value')
      .eq('setting_key', 'ads_txt_content')
      .single()

    if (error) {
      console.error('Error fetching ads.txt content:', error)
      return new Response('# No ads.txt content configured', {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          ...corsHeaders,
        },
      })
    }

    // Get the content, ensuring it's a string
    const content = setting?.setting_value || '# No ads.txt content configured'
    const adsTxtContent = typeof content === 'string' ? content : JSON.stringify(content)

    // Return the ads.txt content as plain text
    return new Response(adsTxtContent, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        ...corsHeaders,
      },
    })

  } catch (error) {
    console.error('Error in ads-txt function:', error)
    return new Response('# Error loading ads.txt content', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        ...corsHeaders,
      },
    })
  }
})