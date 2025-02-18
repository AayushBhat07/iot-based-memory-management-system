
import { ChangeEvent, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UploadCloud } from "lucide-react";

interface FileUploadProps {
  onUploadComplete: (urls: string[]) => void;
}

export const FileUpload = ({ onUploadComplete }: FileUploadProps) => {
  const { toast } = useToast();

  const handleFileChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

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
  }, [onUploadComplete, toast]);

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
