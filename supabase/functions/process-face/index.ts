
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const formData = await req.formData()
    const file = formData.get('image')
    const userId = formData.get('userId')

    if (!file || !userId) {
      return new Response(
        JSON.stringify({ error: 'Image and userId are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Upload image to storage
    const timestamp = new Date().getTime()
    const filePath = `${userId}/${timestamp}_${file.name}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('face-recognition')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return new Response(
        JSON.stringify({ error: 'Failed to upload image' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        filePath,
        imageUrl: `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/face-recognition/${filePath}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Processing error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process image' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
