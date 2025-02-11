
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface EventMetadata {
  eventName: string;
  location: string;
  date: string;
}

const PhotographerUpload = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [metadata, setMetadata] = useState<EventMetadata>({
    eventName: "",
    location: "",
    date: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
    }
  };

  const handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMetadata(prev => ({ ...prev, [name]: value }));
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload",
        variant: "destructive",
      });
      return;
    }

    if (!metadata.eventName || !metadata.location || !metadata.date) {
      toast({
        title: "Missing metadata",
        description: "Please fill in all event details",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // First check if user is authenticated
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error("You must be logged in to upload photos");
      }

      // Create the event first
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert({
          name: metadata.eventName,
          location: metadata.location,
          date: metadata.date,
          photographer_id: sessionData.session.user.id // Set the photographer_id to the current user's ID
        })
        .select()
        .single();

      if (eventError || !eventData) {
        throw eventError || new Error("Failed to create event");
      }

      // Now upload the photos
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${metadata.eventName}/${Date.now()}-${i}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('photographer-uploads')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Update progress
        const currentProgress = ((i + 1) / files.length) * 100;
        setProgress(currentProgress);
      }

      toast({
        title: "Upload successful",
        description: `Successfully created event and uploaded ${files.length} images`,
      });

      // Navigate to events page after successful upload
      navigate('/photographer/events');
      
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was an error uploading your images",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Upload Photos</h1>
          <p className="text-muted-foreground">
            Upload multiple photos and organize them by event
          </p>
        </div>

        {/* Event Metadata Form */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Event Details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              name="eventName"
              placeholder="Event Name"
              value={metadata.eventName}
              onChange={handleMetadataChange}
            />
            <Input
              name="location"
              placeholder="Location"
              value={metadata.location}
              onChange={handleMetadataChange}
            />
            <Input
              name="date"
              type="date"
              value={metadata.date}
              onChange={handleMetadataChange}
              className="md:col-span-2"
            />
          </div>
        </div>

        {/* Upload Section */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 mb-4 text-primary" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, JPEG (MAX. 10MB each)
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                multiple
                accept=".jpg,.jpeg,.png"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
          </div>

          {files && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                <span>{files.length} files selected</span>
              </div>
              {uploading && (
                <div className="space-y-2">
                  <Progress value={progress} />
                  <p className="text-sm text-muted-foreground text-center">
                    Uploading... {Math.round(progress)}%
                  </p>
                </div>
              )}
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!files || uploading}
            className="w-full"
          >
            {uploading ? "Uploading..." : "Upload Photos"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PhotographerUpload;
