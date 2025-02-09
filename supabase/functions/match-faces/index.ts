
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

interface FaceFeatures {
  landmarks: any[];
  detectionConfidence: number;
  joyLikelihood: string;
  sorrowLikelihood: string;
  angerLikelihood: string;
  surpriseLikelihood: string;
  headwearLikelihood: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting face matching process...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse and validate request
    const { guestPhotoPath, photographerEventName, guestName } = await req.json() as MatchRequest
    
    if (!guestPhotoPath || !photographerEventName || !guestName) {
      throw new Error('Missing required parameters');
    }

    console.log('Received request with:', { guestPhotoPath, photographerEventName, guestName });

    // Initialize Google Cloud Vision client with credentials
    const credentials = JSON.parse(Deno.env.get('GOOGLE_VISION_CREDENTIALS') || '{}');
    console.log('Initializing Vision API with credentials type:', credentials.type);
    
    if (!credentials.client_email) {
      throw new Error('Invalid Google Vision credentials - missing client_email');
    }

    const client = new vision.ImageAnnotatorClient({
      credentials: credentials,
    });

    console.log('Vision API client initialized successfully');
    console.log('Starting face matching process for guest:', guestName);

    // Get the reference photo
    const { data: photoRecord, error: photoError } = await supabase
      .from('photos')
      .select('url, metadata')
      .ilike('metadata->>guest_name', guestName.trim())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (photoError) {
      console.error('Database error when fetching photo:', photoError);
      throw new Error(`Database error: ${photoError.message}`);
    }

    if (!photoRecord) {
      console.error('No photo found for guest:', guestName);
      throw new Error(`Could not find photo record for guest: ${guestName}`);
    }

    console.log('Found photo record:', photoRecord);

    // Get list of photographer photos
    const { data: photographerPhotos, error: listError } = await supabase.storage
      .from('photographer-uploads')
      .list(photographerEventName);

    if (listError) {
      console.error('Error listing photographer photos:', listError);
      throw listError;
    }

    console.log(`Found ${photographerPhotos?.length || 0} photographer photos`);

    // Enhanced face detection for guest photo
    const [guestResult] = await client.faceDetection(photoRecord.url);
    console.log('Guest photo face detection completed');
    
    const guestFaces = guestResult.faceAnnotations;
    if (!guestFaces?.length) {
      console.error('No faces detected in guest photo:', photoRecord.url);
      return new Response(
        JSON.stringify({ error: 'No face detected in guest photo' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Extract comprehensive face features for the guest
    const guestFeatures = extractFaceFeatures(guestFaces[0]);
    console.log('Guest face features extracted successfully');

    const matches = [];
    let processedPhotos = 0;

    // Compare with each photographer photo
    for (const photo of photographerPhotos || []) {
      console.log(`Processing photo: ${photo.name}`);
      
      const { data: urlData } = await supabase.storage
        .from('photographer-uploads')
        .createSignedUrl(`${photographerEventName}/${photo.name}`, 60);

      if (!urlData?.signedUrl) {
        console.log(`Could not get signed URL for photo: ${photo.name}`);
        continue;
      }

      try {
        const [photographerResult] = await client.faceDetection(urlData.signedUrl);
        const photographerFaces = photographerResult.faceAnnotations;

        if (!photographerFaces?.length) {
          console.log(`No faces detected in photographer photo: ${photo.name}`);
          continue;
        }

        console.log(`Found ${photographerFaces.length} faces in photographer photo: ${photo.name}`);

        // Extract features for each photographer's photo
        const photographerFeatures = extractFaceFeatures(photographerFaces[0]);
        
        // Enhanced comparison using multiple criteria
        const matchResult = compareGoogleVisionFaces(guestFeatures, photographerFeatures);
        processedPhotos++;

        console.log(`Match score for ${photo.name}: ${matchResult.confidence}`);

        if (matchResult.confidence > 0.75) {
          // Get the public URL for the photographer's photo
          const { data: { publicUrl } } = supabase.storage
            .from('photographer-uploads')
            .getPublicUrl(`${photographerEventName}/${photo.name}`);

          const match = {
            reference_photo_url: photoRecord.url,
            photo_id: photo.name,
            confidence: matchResult.confidence,
            match_details: matchResult.details, // Send as object
            guest_name: guestName,
            match_score: matchResult.confidence,
            processed_at: new Date().toISOString()
          };
          
          matches.push(match);
          console.log(`Match found in photo ${photo.name} with confidence: ${matchResult.confidence}`);
          
          // Insert match into database
          const { error: insertError } = await supabase
            .from('matches')
            .insert([{
              ...match,
              user_id: null // explicitly set to null for matches
            }]);

          if (insertError) {
            console.error('Error inserting match:', insertError);
            // Continue processing other photos even if one insert fails
          }
        }
      } catch (error) {
        console.error(`Error processing photo ${photo.name}:`, error);
        continue;
      }
    }

    console.log(`Processed ${processedPhotos} photos, found ${matches.length} matches`);

    return new Response(
      JSON.stringify({ 
        matches,
        totalProcessed: processedPhotos,
        matchCount: matches.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in face matching process:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function extractFaceFeatures(face: any): FaceFeatures {
  return {
    landmarks: face.landmarks || [],
    detectionConfidence: face.detectionConfidence || 0,
    joyLikelihood: face.joyLikelihood || 'UNKNOWN',
    sorrowLikelihood: face.sorrowLikelihood || 'UNKNOWN',
    angerLikelihood: face.angerLikelihood || 'UNKNOWN',
    surpriseLikelihood: face.surpriseLikelihood || 'UNKNOWN',
    headwearLikelihood: face.headwearLikelihood || 'UNKNOWN'
  };
}

function compareGoogleVisionFaces(face1: FaceFeatures, face2: FaceFeatures) {
  // Enhanced detection confidence comparison
  const confidenceScore = (face1.detectionConfidence + face2.detectionConfidence) / 2;

  // Improved landmark comparison with weighted scoring
  let landmarkScore = 0;
  const landmarks1 = face1.landmarks || [];
  const landmarks2 = face2.landmarks || [];
  
  if (landmarks1.length > 0 && landmarks2.length > 0) {
    const landmarkPairs = Math.min(landmarks1.length, landmarks2.length);
    let totalDistance = 0;
    let validPairs = 0;
    
    for (let i = 0; i < landmarkPairs; i++) {
      const l1 = landmarks1[i];
      const l2 = landmarks2[i];
      if (l1?.position && l2?.position) {
        // Calculate normalized 3D distance
        const distance = Math.sqrt(
          Math.pow(l1.position.x - l2.position.x, 2) +
          Math.pow(l1.position.y - l2.position.y, 2) +
          Math.pow((l1.position.z || 0) - (l2.position.z || 0), 2)
        );
        totalDistance += distance;
        validPairs++;
      }
    }
    
    if (validPairs > 0) {
      landmarkScore = 1 - (totalDistance / validPairs / 100);
      landmarkScore = Math.max(0, Math.min(1, landmarkScore));
    }
  }

  // Expression matching score
  const expressionScore = calculateExpressionScore(face1, face2);

  // Weighted combination of all scores
  const confidence = (
    confidenceScore * 0.5 + // Detection confidence weight
    landmarkScore * 0.3 + // Landmark similarity weight
    expressionScore * 0.2  // Expression similarity weight
  );

  return {
    confidence,
    details: {
      confidenceScore,
      landmarkScore,
      expressionScore,
      landmarkCount: landmarks1.length
    }
  };
}

function calculateExpressionScore(face1: FaceFeatures, face2: FaceFeatures): number {
  const likelihoods = ['joyLikelihood', 'sorrowLikelihood', 'angerLikelihood', 'surpriseLikelihood'];
  let matchCount = 0;
  
  for (const likelihood of likelihoods) {
    if (face1[likelihood as keyof FaceFeatures] === face2[likelihood as keyof FaceFeatures]) {
      matchCount++;
    }
  }
  
  return matchCount / likelihoods.length;
}
