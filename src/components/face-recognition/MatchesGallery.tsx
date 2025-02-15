
import { MatchResult, getFaceImageUrl } from "@/lib/api/face-recognition";

export interface MatchesGalleryProps {
  matches: MatchResult[];
  isLoading?: boolean;
}

export const MatchesGallery = ({ matches, isLoading }: MatchesGalleryProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-muted animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No matches found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {matches.map((match) => (
        <div key={match.id} className="group relative aspect-square">
          <img
            src={getFaceImageUrl(match.image_path)}
            alt="Matched face"
            className="w-full h-full object-cover rounded-lg transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
            <div className="absolute bottom-2 left-2 right-2 text-white text-sm">
              <p className="font-medium">
                Match Score: {(match.similarity * 100).toFixed(1)}%
              </p>
              <p className="text-xs opacity-80">
                Confidence: {(match.confidence_score * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
