
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as tf from 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js'
import '@tensorflow/tfjs-backend-webgl'

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

    // Load and preprocess image for face detection
    const imageUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/face-recognition/${filePath}`
    const response = await fetch(imageUrl)
    const imageBlob = await response.blob()
    
    // Convert blob to tensor
    const img = await tf.browser.fromPixels(imageBlob)
    const normalized = tf.div(img, 255.0)
    const resized = tf.image.resizeBilinear(normalized, [224, 224])
    const batched = tf.expandDims(resized, 0)

    // Load face detection model (you'll need to implement model loading)
    const model = await tf.loadLayersModel('path/to/your/face/model')
    
    // Generate face embedding
    const embedding = model.predict(batched)
    const embeddingArray = await embedding.data()

    // Store embedding in database
    const { error: dbError } = await supabase
      .from('face_embeddings')
      .insert({
        user_id: userId,
        image_path: filePath,
        embedding: embeddingArray,
        confidence_score: 0.95, // You should calculate this based on model confidence
        metadata: { 
          processedAt: new Date().toISOString(),
          originalFilename: file.name
        }
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ error: 'Failed to store face embedding' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Cleanup
    tf.dispose([img, normalized, resized, batched, embedding])

    return new Response(
      JSON.stringify({ 
        success: true, 
        filePath,
        imageUrl 
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
