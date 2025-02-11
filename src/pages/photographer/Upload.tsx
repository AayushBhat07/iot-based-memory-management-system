
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Upload as UploadIcon, Image as ImageIcon, Video, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

// Utility function for className concatenation
const cn = (...inputs: (string | boolean | undefined | null)[]): string => {
  return inputs.filter(Boolean).join(" ");
};

const PhotographerUpload = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [eventDetails, setEventDetails] = useState<{ name: string; date: string } | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { eventId } = useParams();

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) {
        navigate('/photographer/events');
        return;
      }

      const { data, error } = await supabase
        .from('events')
        .select('name, date')
        .eq('id', eventId)
        .single();

      if (error || !data) {
        toast({
          title: "Error",
          description: "Failed to fetch event details",
          variant: "destructive",
        });
        navigate('/photographer/events');
        return;
      }

      setEventDetails(data);
    };

    fetchEventDetails();
  }, [eventId, navigate, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
      setUploadingFiles([]);
    }
  };

  const handleUpload = async () => {
    if (!files || files.length === 0 || !eventId) {
      toast({
        title: "No files selected",
        description: "Please select files to upload",
        variant: "destructive",
      });
      return;
    }

    // Convert FileList to array of UploadingFile objects
    const filesToUpload: UploadingFile[] = Array.from(files).map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    }));
    setUploadingFiles(filesToUpload);

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i].file;
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !sessionData.session) {
          throw new Error("You must be logged in to upload files");
        }

        // Determine media type
        const mediaType = file.type.startsWith('image/') ? 'image' : 
                         file.type.startsWith('video/') ? 'video' : null;

        if (!mediaType) {
          throw new Error(`Unsupported file type: ${file.type}`);
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${eventId}/${Date.now()}-${i}.${fileExt}`;

        // Upload the file to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('event-media')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get the public URL
        const { data: publicUrlData } = supabase.storage
          .from('event-media')
          .getPublicUrl(fileName);

        // Create a record in the media table
        const { error: mediaError } = await supabase
          .from('media')
          .insert({
            event_id: eventId,
            url: publicUrlData.publicUrl,
            media_type: mediaType,
            filename: file.name,
            size: file.size,
            mime_type: file.type,
            metadata: {
              originalName: file.name,
              uploadedBy: sessionData.session.user.id
            }
          });

        if (mediaError) {
          throw mediaError;
        }

        // Update progress
        setUploadingFiles(prev => prev.map((item, index) => 
          index === i ? { ...item, progress: 100, status: 'completed' } : item
        ));

      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        setUploadingFiles(prev => prev.map((item, index) => 
          index === i ? { ...item, status: 'error' } : item
        ));

        toast({
          title: "Upload Error",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }
    }

    // Show success message if at least one file was uploaded
    const successfulUploads = uploadingFiles.filter(f => f.status === 'completed').length;
    if (successfulUploads > 0) {
      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${successfulUploads} files`,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/photographer/events')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>

        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Upload Media</h1>
          {eventDetails && (
            <p className="text-muted-foreground">
              Uploading to: {eventDetails.name} ({format(new Date(eventDetails.date), "PPP")})
            </p>
          )}
        </div>

        {/* Upload Section */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadIcon className="w-12 h-12 mb-4 text-primary" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  Images (JPG, PNG) and Videos (MP4, MOV)
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                disabled={uploadingFiles.some(f => f.status === 'uploading')}
              />
            </label>
          </div>

          {files && files.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                <span>{files.length} files selected</span>
              </div>
              
              {uploadingFiles.map((file, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate">{file.file.name}</span>
                    <span className={cn(
                      "text-xs",
                      file.status === 'completed' ? "text-green-500" :
                      file.status === 'error' ? "text-red-500" :
                      "text-muted-foreground"
                    )}>
                      {file.status === 'completed' ? 'Completed' :
                       file.status === 'error' ? 'Failed' :
                       'Uploading...'}
                    </span>
                  </div>
                  <Progress value={file.progress} />
                </div>
              ))}

              <Button
                onClick={handleUpload}
                disabled={uploadingFiles.some(f => f.status === 'uploading')}
                className="w-full"
              >
                {uploadingFiles.some(f => f.status === 'uploading')
                  ? "Uploading..."
                  : "Upload Files"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotographerUpload;
