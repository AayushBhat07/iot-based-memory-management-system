
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MatchResult {
  id: string;
  match_score: number;
  reference_photo_url: string;
  photo_id: string;
  created_at: string;
  confidence: number | null;
  match_details: any;
  guest_name: string | null;
  photos: {
    url: string;
    is_matched: boolean;
    guest_folder_path: string;
  } | null;
}

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [allMatches, setAllMatches] = useState<MatchResult[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAllMatches = async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          photos (
            url,
            is_matched,
            guest_folder_path
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching all matches:', error);
      } else {
        setAllMatches(data || []);
      }
    };

    fetchAllMatches();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Search term required",
        description: "Please enter a name to search for",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get reference photo
      const { data: refPhotoData, error: refError } = await supabase
        .from('photos')
        .select('url, metadata')
        .ilike('metadata->>guest_name', searchTerm.trim())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (refError) throw refError;

      if (!refPhotoData) {
        toast({
          title: "No reference photo found",
          description: `No reference photo found for "${searchTerm.trim()}". Please upload a reference photo first.`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Process matching
      const { error: matchError } = await supabase.functions.invoke('match-faces', {
        body: {
          guestPhotoPath: refPhotoData.url,
          photographerEventName: 'test',
          guestName: searchTerm.trim()
        }
      });

      if (matchError) throw matchError;

      // Get all photos from guest's folder
      const guestFolderPath = `test/${searchTerm.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const { data: folderPhotos, error: folderError } = await supabase.storage
        .from('photographer-uploads')
        .list(guestFolderPath);

      if (folderError) throw folderError;

      // Get matches information
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select(`
          *,
          photos (
            url,
            is_matched,
            guest_folder_path
          )
        `)
        .eq('guest_name', searchTerm.trim())
        .order('match_score', { ascending: false });

      if (matchesError) throw matchesError;

      setResults(matches || []);

      if (!matches || matches.length === 0) {
        toast({
          title: "No matches found",
          description: `No photos were found matching "${searchTerm.trim()}". Available names: ${Array.from(new Set(allMatches.map(m => m.guest_name))).filter(Boolean).join(', ')}`,
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "There was an error performing the search",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input 
              type="text" 
              placeholder="Search by guest name..."
              className="flex-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
              <SearchIcon className="w-4 h-4 mr-2" />
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {allMatches.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Available names: {Array.from(new Set(allMatches.map(m => m.guest_name))).filter(Boolean).join(', ')}
            </p>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((match) => (
            <Card key={match.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Reference Photo:</p>
                    <img 
                      src={match.reference_photo_url} 
                      alt={`Reference photo of ${match.guest_name}`}
                      className="w-full h-48 object-cover rounded-md"
                    />
                  </div>
                  {match.photos?.url && (
                    <div>
                      <p className="text-sm font-medium mb-2">
                        {match.photos.is_matched ? 'Matched Photo:' : 'Similar Photo (Not Matched):'}
                      </p>
                      <img 
                        src={match.photos.url} 
                        alt={`${match.photos.is_matched ? 'Matched' : 'Similar'} photo of ${match.guest_name}`}
                        className="w-full h-48 object-cover rounded-md"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Guest Name: {match.guest_name}</p>
                    <p className="text-sm font-medium">Match Score: {(match.match_score * 100).toFixed(1)}%</p>
                    {match.confidence && (
                      <p className="text-sm text-muted-foreground">
                        Confidence: {(match.confidence * 100).toFixed(1)}%
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Found on: {new Date(match.created_at || '').toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
