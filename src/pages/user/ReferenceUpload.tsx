import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ReferenceUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [guestName, setGuestName] = useState("");
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (selectedFiles.length > 3) {
        toast({
          title: "Too many files",
          description: "Please select up to 3 photos only",
          variant: "destructive",
        });
        return;
      }
      setFiles(selectedFiles);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!guestName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name before uploading",
        variant: "destructive",
      });
      return;
    }

    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one photo",
        variant: "destructive",
      });
      return;
    }

    if (files.length > 3) {
      toast({
        title: "Too many files",
        description: "Please select up to 3 photos only",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const sanitizedName = guestName.trim().replace(/[^a-zA-Z0-9]/g, '_');
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${sanitizedName}/${Date.now()}-${i}.${fileExt}`;

        // First upload to storage
        const { error: storageError, data: storageData } = await supabase.storage
          .from('guest-reference-photos')
          .upload(fileName, file);

        if (storageError) throw storageError;

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('guest-reference-photos')
          .getPublicUrl(fileName);

        // Then create a record in the photos table with metadata
        const { error: dbError } = await supabase
          .from('photos')
          .insert({
            url: publicUrl,
            event_id: null,
            metadata: {
              is_reference: true,
              guest_name: guestName.trim(),
              original_filename: file.name,
              uploaded_by: null // explicitly set to null for reference photos
            }
          });

        if (dbError) throw dbError;

        const currentProgress = ((i + 1) / files.length) * 100;
        setProgress(currentProgress);
      }

      toast({
        title: "Upload successful",
        description: `Successfully uploaded ${files.length} reference photo${files.length > 1 ? 's' : ''}`,
      });

      // Reset form
      setFiles([]);
      setGuestName("");
      setProgress(0);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your photos",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2 text-white">Upload Reference Photos</h1>
            <p className="text-white/80">
              Upload up to 3 photos that will help us understand your style preferences
            </p>
          </div>

          {/* Guest Name Input */}
          <div className="glass-card p-6 rounded-2xl">
            <Input
              placeholder="Your Name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="mb-4 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>

          {/* Upload Section */}
          <div className="glass-card p-6 space-y-4 rounded-2xl">
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer 
                         border-white/20 hover:bg-white/5 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-12 h-12 mb-4 text-[#F97316]" />
                  <p className="mb-2 text-sm text-white/80">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-white/60">
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

            {files.length > 0 && (
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 glass-card rounded-md">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-[#F97316]" />
                        <span className="text-sm text-white truncate">{file.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index)}
                        disabled={uploading}
                        className="text-white hover:text-white/80"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                {uploading && (
                  <div className="space-y-2">
                    <Progress value={progress} className="bg-white/10" />
                    <p className="text-sm text-white/60 text-center">
                      Uploading... {Math.round(progress)}%
                    </p>
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!files.length || uploading || !guestName.trim()}
              className="w-full bg-white/10 hover:bg-white/20 text-[#F97316]"
            >
              {uploading ? "Uploading..." : "Upload Photos"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferenceUpload;
