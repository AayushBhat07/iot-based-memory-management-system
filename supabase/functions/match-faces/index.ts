
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import vision from 'npm:@google-cloud/vision@4.0.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MatchRequest {
  guestPhotoPath: string;
  photographerEventName: string;
  guestName: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { guestPhotoPath, photographerEventName, guestName } = await req.json() as MatchRequest

    // Initialize Google Cloud Vision client
    const client = new vision.ImageAnnotatorClient({
      credentials: JSON.parse(Deno.env.get('GOOGLE_VISION_CREDENTIALS') || '{}'),
    });

    // Get the guest photo URL
    const { data: guestPhotoData } = await supabase.storage
      .from('guest-reference-photos')
      .createSignedUrl(guestPhotoPath, 60) // 60 seconds expiry

    if (!guestPhotoData?.signedUrl) {
      throw new Error('Could not access guest photo')
    }

    // Get list of photographer photos for the event
    const { data: photographerPhotos, error: listError } = await supabase.storage
      .from('photographer-uploads')
      .list(photographerEventName)

    if (listError) {
      throw listError
    }

    // Get face detection for guest photo
    const [guestResult] = await client.faceDetection(guestPhotoData.signedUrl);
    const guestFaces = guestResult.faceAnnotations;

    if (!guestFaces?.length) {
      return new Response(
        JSON.stringify({ error: 'No face detected in guest photo' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const matches = [];

    // Compare with each photographer photo
    for (const photo of photographerPhotos) {
      const { data: photographerPhotoData } = await supabase.storage
        .from('photographer-uploads')
        .createSignedUrl(`${photographerEventName}/${photo.name}`, 60)

      if (!photographerPhotoData?.signedUrl) continue;

      const [photographerResult] = await client.faceDetection(photographerPhotoData.signedUrl);
      const photographerFaces = photographerResult.faceAnnotations;

      if (!photographerFaces?.length) continue;

      // Compare faces using confidence scores and landmarks
      const confidence = compareGoogleVisionFaces(guestFaces[0], photographerFaces[0]);

      if (confidence > 0.7) { // Minimum confidence threshold
        matches.push({
          guest_photo_path: guestPhotoPath,
          photographer_photo_path: `${photographerEventName}/${photo.name}`,
          confidence,
          guest_name: guestName,
          event_name: photographerEventName
        });
      }
    }

    // Store matches in database
    if (matches.length > 0) {
      const { error: insertError } = await supabase
        .from('matches')
        .insert(matches);

      if (insertError) throw insertError;
    }

    return new Response(
      JSON.stringify({ matches }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

// Helper function to compare faces using Google Vision API results
function compareGoogleVisionFaces(face1: any, face2: any) {
  // Compare detection confidence
  const confidenceScore = (face1.detectionConfidence + face2.detectionConfidence) / 2;

  // Compare facial landmarks (basic implementation)
  const landmarks1 = face1.landmarks || [];
  const landmarks2 = face2.landmarks || [];
  
  let landmarkScore = 0;
  if (landmarks1.length > 0 && landmarks2.length > 0) {
    // Calculate normalized distance between corresponding landmarks
    const landmarkPairs = Math.min(landmarks1.length, landmarks2.length);
    let totalDistance = 0;
    
    for (let i = 0; i < landmarkPairs; i++) {
      const l1 = landmarks1[i];
      const l2 = landmarks2[i];
      if (l1 && l2 && l1.position && l2.position) {
        const distance = Math.sqrt(
          Math.pow(l1.position.x - l2.position.x, 2) +
          Math.pow(l1.position.y - l2.position.y, 2)
        );
        totalDistance += distance;
      }
    }
    
    landmarkScore = 1 - (totalDistance / landmarkPairs / 100); // Normalize to 0-1
    landmarkScore = Math.max(0, Math.min(1, landmarkScore)); // Clamp between 0 and 1
  }

  // Combine scores (weight confidence more heavily)
  return (confidenceScore * 0.7) + (landmarkScore * 0.3);
}
