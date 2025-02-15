
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useProcessFace } from "@/lib/api/face-recognition";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import Image from "@/components/ui/image";

export interface FaceUploadProps {
  onUploadComplete?: (imageId: string) => void;
  userId: string;
}

export const FaceUpload = ({ onUploadComplete, userId }: FaceUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const processFaceMutation = useProcessFace();

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);

    // Process face
    try {
      const response = await processFaceMutation.mutateAsync({ image: file, userId });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to process face');
      }

      toast({
        title: "Success!",
        description: "Face image uploaded and processed successfully.",
      });

      if (response.filePath && onUploadComplete) {
        onUploadComplete(response.filePath);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process face image",
      });
    }
  }, [userId, onUploadComplete, processFaceMutation, toast]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4">
        <Button
          variant="outline"
          className="w-full max-w-xs relative"
          disabled={processFaceMutation.isPending}
        >
          {processFaceMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          <span className="ml-2">Upload Face Image</span>
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            accept="image/*"
            disabled={processFaceMutation.isPending}
          />
        </Button>

        {previewUrl && (
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary">
            <img
              src={previewUrl}
              alt="Face preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
};
