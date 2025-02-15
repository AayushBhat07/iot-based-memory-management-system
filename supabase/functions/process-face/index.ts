
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import vision from 'https://esm.sh/@google-cloud/vision@4.0.2'

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

    // Initialize Google Cloud Vision client
    const credentials = JSON.parse(Deno.env.get('GOOGLE_VISION_CREDENTIALS') ?? '{}')
    const client = new vision.ImageAnnotatorClient({ credentials })

    // Get the public URL of the uploaded image
    const imageUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/face-recognition/${filePath}`

    // Detect face and get embeddings using Google Cloud Vision
    const [result] = await client.faceDetection(imageUrl)
    const faces = result.faceAnnotations || []

    if (faces.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No face detected in the image' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Use the first detected face
    const face = faces[0]
    const confidence = face.detectionConfidence || 0

    // Store face embedding
    const { error: dbError } = await supabase
      .from('face_embeddings')
      .insert({
        user_id: userId,
        image_path: filePath,
        embedding: face.landmark,  // Using facial landmarks as embedding
        confidence_score: confidence,
        metadata: {
          processedAt: new Date().toISOString(),
          originalFilename: file.name,
          faceAnnotations: face
        }
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ error: 'Failed to store face embedding' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        filePath,
        imageUrl,
        confidence
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
