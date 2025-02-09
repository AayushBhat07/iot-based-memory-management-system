
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting face matching process...');

    // Validate request body
    const { guestPhotoPath, photographerEventName, guestName } = await req.json() as MatchRequest;
    
    if (!guestPhotoPath || !photographerEventName || !guestName) {
      throw new Error('Missing required parameters');
    }

    console.log('Request parameters:', { guestPhotoPath, photographerEventName, guestName });

    // Validate Supabase configuration
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate Google Vision credentials
    const credentials = Deno.env.get('GOOGLE_VISION_CREDENTIALS');
    if (!credentials) {
      throw new Error('Missing Google Vision credentials');
    }

    try {
      JSON.parse(credentials);
    } catch (e) {
      throw new Error('Invalid Google Vision credentials format');
    }

    console.log('Initializing Google Vision client...');
    const client = new vision.ImageAnnotatorClient({ 
      credentials: JSON.parse(credentials)
    });

    // Get reference photo face detection
    console.log('Detecting faces in reference photo:', guestPhotoPath);
    const [guestResult] = await client.faceDetection(guestPhotoPath);
    const guestFaces = guestResult.faceAnnotations;

    if (!guestFaces?.length) {
      throw new Error('No face detected in reference photo');
    }

    console.log(`Found ${guestFaces.length} faces in reference photo`);

    // Get all photographer photos
    const { data: photographerPhotos, error: listError } = await supabase.storage
      .from('photographer-uploads')
      .list(photographerEventName);

    if (listError) {
      console.error('Error listing photographer photos:', listError);
      throw listError;
    }

    if (!photographerPhotos?.length) {
      console.log('No photographer photos found in event:', photographerEventName);
      return new Response(
        JSON.stringify({ 
          message: 'No photos found in event folder',
          totalPhotos: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${photographerPhotos.length} photographer photos to process`);

    const guestFolderPath = `${photographerEventName}/${guestName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    
    // Process each photographer photo
    for (const photo of photographerPhotos) {
      try {
        console.log('Processing photo:', photo.name);
        
        const { data: urlData } = await supabase.storage
          .from('photographer-uploads')
          .createSignedUrl(`${photographerEventName}/${photo.name}`, 60);

        if (!urlData?.signedUrl) {
          console.log('Could not generate signed URL for photo:', photo.name);
          continue;
        }

        const [photographerResult] = await client.faceDetection(urlData.signedUrl);
        const photographerFaces = photographerResult.faceAnnotations;

        if (!photographerFaces?.length) {
          console.log('No faces detected in photo:', photo.name);
          continue;
        }

        console.log(`Found ${photographerFaces.length} faces in photo:`, photo.name);

        // Basic confidence check from Google Vision API
        const isMatch = photographerFaces.some(face => face.detectionConfidence > 0.8);
        
        if (isMatch) {
          console.log('Match found in photo:', photo.name);
          
          // Copy matched photo to guest's folder
          const sourceFile = `${photographerEventName}/${photo.name}`;
          const destinationFile = `${guestFolderPath}/${photo.name}`;

          // Create guest folder if it doesn't exist
          const { data: photoExists } = await supabase.storage
            .from('photographer-uploads')
            .list(guestFolderPath);

          if (!photoExists) {
            console.log('Creating guest folder:', guestFolderPath);
            await supabase.storage
              .from('photographer-uploads')
              .upload(`${guestFolderPath}/.folder`, new Uint8Array());
          }

          // Copy the file to guest's folder
          const { error: copyError } = await supabase.storage
            .from('photographer-uploads')
            .copy(sourceFile, destinationFile);

          if (copyError) {
            console.error('Error copying file:', copyError);
            continue;
          }

          console.log('Successfully copied photo to guest folder:', destinationFile);

          // Get public URL for the copied photo
          const { data: { publicUrl } } = supabase.storage
            .from('photographer-uploads')
            .getPublicUrl(destinationFile);

          // Record the match in the database
          const { error: insertError } = await supabase
            .from('matches')
            .insert({
              reference_photo_url: guestPhotoPath,
              photo_id: photo.name,
              confidence: photographerFaces[0].detectionConfidence,
              match_details: { faces: photographerFaces.length },
              guest_name: guestName,
              match_score: photographerFaces[0].detectionConfidence,
            });

          if (insertError) {
            console.error('Error inserting match:', insertError);
          }

          // Update the photo record
          const { error: updateError } = await supabase
            .from('photos')
            .update({
              is_matched: true,
              guest_folder_path: guestFolderPath
            })
            .eq('id', photo.name);

          if (updateError) {
            console.error('Error updating photo:', updateError);
          }
        }
      } catch (error) {
        console.error(`Error processing photo ${photo.name}:`, error);
        continue;
      }
    }

    // After processing, get all photos in the guest's folder
    const { data: guestPhotos, error: guestPhotosError } = await supabase.storage
      .from('photographer-uploads')
      .list(guestFolderPath);

    if (guestPhotosError) {
      throw guestPhotosError;
    }

    console.log('Processing complete. Total photos in guest folder:', guestPhotos?.length || 0);

    return new Response(
      JSON.stringify({
        message: 'Processing complete',
        guestFolder: guestFolderPath,
        totalPhotos: guestPhotos?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in face matching process:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack, // Include stack trace for debugging
        name: error.name
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
