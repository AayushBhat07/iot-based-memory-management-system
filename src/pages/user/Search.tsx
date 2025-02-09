
import React, { useState } from 'react';
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
}

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
      console.log('Searching for:', searchTerm.trim()); // Debug log

      // Using textSearch for more flexible matching
      const { data: matches, error } = await supabase
        .from('matches')
        .select('*')
        .textSearch('guest_name', `'${searchTerm.trim()}'`, {
          type: 'plain',
          config: 'english'
        });

      if (error) {
        console.error('Supabase error:', error); // Debug log
        throw error;
      }

      console.log('Raw matches data:', matches); // Debug log

      setResults(matches || []);

      if (!matches || matches.length === 0) {
        toast({
          title: "No matches found",
          description: "No photos were found matching your search criteria",
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
          <CardTitle>Search Reference Photos</CardTitle>
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

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((match) => (
            <Card key={match.id} className="overflow-hidden">
              <CardContent className="p-4">
                <img 
                  src={match.reference_photo_url} 
                  alt="Reference photo" 
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
