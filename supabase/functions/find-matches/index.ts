
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
    const { referenceImageId, threshold = 0.6, limit = 10 } = await req.json()

    if (!referenceImageId) {
      return new Response(
        JSON.stringify({ error: 'Reference image ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get reference embedding
    const { data: referenceData, error: refError } = await supabase
      .from('face_embeddings')
      .select('embedding, user_id')
      .eq('id', referenceImageId)
      .single()

    if (refError || !referenceData) {
      return new Response(
        JSON.stringify({ error: 'Reference embedding not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Find similar faces using cosine similarity
    const { data: matches, error: matchError } = await supabase
      .rpc('find_similar_faces', {
        reference_embedding: referenceData.embedding,
        similarity_threshold: threshold,
        max_results: limit
      })

    if (matchError) {
      console.error('Match error:', matchError)
      return new Response(
        JSON.stringify({ error: 'Failed to find matches' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Store match results
    const matchPromises = matches.map(match => 
      supabase.from('face_matches').insert({
        user_id: referenceData.user_id,
        reference_embedding_id: referenceImageId,
        matched_embedding_id: match.id,
        similarity_score: match.similarity,
        confidence_score: match.confidence_score,
        match_metadata: {
          matched_at: new Date().toISOString(),
          processing_time_ms: Date.now() - new Date(match.created_at).getTime()
        }
      })
    )

    await Promise.all(matchPromises)

    return new Response(
      JSON.stringify({ 
        matches,
        processingTime: Date.now(),
        totalMatches: matches.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Processing error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process match request' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
