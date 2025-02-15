
import { supabase } from "@/integrations/supabase/client";

export interface ProcessFaceResponse {
  success: boolean;
  filePath?: string;
  imageUrl?: string;
  error?: string;
}

export interface MatchResult {
  id: string;
  image_path: string;
  similarity: number;
  confidence_score: number;
  created_at: string;
  metadata: Record<string, any>;
}

export interface FindMatchesResponse {
  matches: MatchResult[];
  processingTime: number;
  totalMatches: number;
}

export const processFace = async (
  image: File,
  userId: string
): Promise<ProcessFaceResponse> => {
  try {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('userId', userId);

    const { data, error } = await supabase.functions.invoke('process-face', {
      body: formData,
    });

    if (error) {
      console.error('Process face error:', error);
      return { success: false, error: error.message };
    }

    return data as ProcessFaceResponse;
  } catch (error) {
    console.error('Process face error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process face'
    };
  }
};

export const findMatches = async (
  referenceImageId: string,
  options?: {
    threshold?: number;
    limit?: number;
  }
): Promise<FindMatchesResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('find-matches', {
      body: {
        referenceImageId,
        threshold: options?.threshold ?? 0.6,
        limit: options?.limit ?? 10,
      },
    });

    if (error) {
      console.error('Find matches error:', error);
      throw error;
    }

    return data as FindMatchesResponse;
  } catch (error) {
    console.error('Find matches error:', error);
    throw error;
  }
};

// React Query hooks for face recognition operations
import { useMutation, useQuery } from "@tanstack/react-query";

export const useProcessFace = () => {
  return useMutation({
    mutationFn: ({ image, userId }: { image: File; userId: string }) =>
      processFace(image, userId),
  });
};

export const useFindMatches = (
  referenceImageId: string | null,
  options?: {
    threshold?: number;
    limit?: number;
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: ['face-matches', referenceImageId, options?.threshold, options?.limit],
    queryFn: () => findMatches(referenceImageId!, options),
    enabled: !!referenceImageId && options?.enabled !== false,
  });
};

// Utility function to get the public URL for a face image
export const getFaceImageUrl = (imagePath: string): string => {
  const { data } = supabase.storage
    .from('face-recognition')
    .getPublicUrl(imagePath);
  
  return data.publicUrl;
};
