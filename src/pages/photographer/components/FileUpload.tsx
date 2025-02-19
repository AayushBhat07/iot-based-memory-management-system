
import { ChangeEvent, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UploadCloud } from "lucide-react";

interface FileUploadProps {
  onUploadComplete: (urls: string[]) => void;
  eventId: string;
  eventName: string;
}

export const FileUpload = ({ onUploadComplete, eventId, eventName }: FileUploadProps) => {
  const { toast } = useToast();

  const handleFileChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${user.id}/${eventName}/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('photographer-uploads')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('photographer-uploads')
          .getPublicUrl(filePath);

        // Create media record
        const { error: mediaError } = await supabase
          .from('media')
          .insert({
            event_id: eventId,
            file_name: fileName,
            file_url: publicUrl,
            file_type: 'image',
            upload_status: 'completed'
          });

        if (mediaError) throw mediaError;

        return publicUrl;
      });

      const urls = await Promise.all(uploadPromises);
      onUploadComplete(urls);

      toast({
        title: "Success",
        description: `${files.length} files uploaded successfully`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload files. Please try again.",
      });
    }
  }, [onUploadComplete, eventId, eventName, toast]);

  return (
    <div className="w-full">
      <Button 
        variant="outline" 
        className="w-full h-32 border-dashed"
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <div className="flex flex-col items-center gap-2">
          <UploadCloud className="h-8 w-8" />
          <span>Click to upload photos</span>
          <span className="text-xs text-muted-foreground">
            Supported formats: JPG, PNG, WEBP
          </span>
        </div>
      </Button>
      <input
        id="file-upload"
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};
