
-- Drop matching related tables
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS photos;

-- Drop handle_reference_photo_upload function
DROP FUNCTION IF EXISTS handle_reference_photo_upload();

-- Since we're removing face recognition functionality, 
-- we should also clean up any orphaned data in photographer_uploads bucket
DELETE FROM storage.objects 
WHERE bucket_id = 'photographer-uploads' 
AND path LIKE '%.jpg';

-- Clean up any storage policies related to face recognition
DROP POLICY IF EXISTS "Users can view their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload profile images" ON storage.objects;
