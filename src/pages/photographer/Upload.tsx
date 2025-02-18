
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileUpload } from "./components/FileUpload";
import { ArrowLeft, X } from "lucide-react";

const Upload = () => {
  const navigate = useNavigate();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleUploadComplete = (urls: string[]) => {
    setUploadedImages(prev => [...prev, ...urls]);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/photographer/dashboard")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Upload Photos</h1>
          <p className="text-muted-foreground">
            Upload photos for your events. You can upload multiple photos at once.
          </p>
        </div>

        <FileUpload onUploadComplete={handleUploadComplete} />

        {uploadedImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {uploadedImages.map((url, index) => (
              <Card key={url} className="relative group">
                <CardContent className="p-2">
                  <img
                    src={url}
                    alt={`Uploaded ${index + 1}`}
                    className="w-full aspect-square object-cover rounded-sm"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
