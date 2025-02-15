
import { useState } from "react";
import { FaceUpload } from "@/components/face-recognition/FaceUpload";
import { MatchesGallery } from "@/components/face-recognition/MatchesGallery";
import { useFindMatches } from "@/lib/api/face-recognition";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function FaceRecognition() {
  const [referenceImageId, setReferenceImageId] = useState<string | null>(null);
  const [threshold, setThreshold] = useState(0.6);
  
  const {
    data: matchesResponse,
    isLoading,
    refetch
  } = useFindMatches(referenceImageId, {
    threshold,
    enabled: !!referenceImageId,
  });

  const handleUploadComplete = (imageId: string) => {
    setReferenceImageId(imageId);
  };

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Find Your Photos</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Upload a clear photo of your face, and we'll find matching photos from our event galleries
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <FaceUpload
          onUploadComplete={handleUploadComplete}
          userId="test-user" // This should come from auth context in production
        />
      </div>

      {referenceImageId && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">
                Match Threshold: {(threshold * 100).toFixed()}%
              </label>
              <Slider
                value={[threshold * 100]}
                onValueChange={(values) => setThreshold(values[0] / 100)}
                min={0}
                max={100}
                step={1}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <MatchesGallery
            matches={matchesResponse?.matches ?? []}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
};
