
import { useState } from "react";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { motion, AnimatePresence } from "framer-motion";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ['photos', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.toLowerCase() !== 'aayushb') {
        return [];
      }

      // Add a 3.5 second delay
      await new Promise(resolve => setTimeout(resolve, 3500));

      // Hardcode the specific images we want to display for AayushB
      const photoUrls = [
        '/lovable-uploads/bdb64c32-f8ef-4c76-8c59-d7d148f9294e.png',
        '/lovable-uploads/b8fa06e6-943f-44a2-8674-5c3fb47b131c.png',
        '/lovable-uploads/9c98c37d-5ddb-4fb4-a2c6-4a0d25bfe269.png',
        '/lovable-uploads/c3a692f5-68ef-4ac9-b890-8772e8a432c5.png',
        '/lovable-uploads/7a9b3320-c383-4f73-971a-d1ae101d308a.png'
      ];

      return photoUrls.map((url, index) => ({
        name: `aayushb-photo-${index + 1}`,
        url: url
      }));
    },
    enabled: searchTerm.toLowerCase() === 'aayushb',
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Search Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-semibold">Photo Search</h1>
          <p className="text-muted-foreground">Find your perfect moments</p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <Input
            type="text"
            placeholder="Search photos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 h-14 text-lg shadow-lg transition-shadow duration-300 hover:shadow-xl
                     focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:ring-primary/50"
          />
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
        </div>

        {/* Results Section */}
        <div className="mt-12">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center items-center h-40"
              >
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </motion.div>
            ) : photos.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {photos.map((photo, index) => (
                  <motion.div
                    key={photo.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative rounded-lg overflow-hidden shadow-md hover:shadow-xl 
                             transition-shadow duration-300"
                  >
                    <AspectRatio ratio={1}>
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </AspectRatio>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent">
                      <span className="absolute bottom-3 right-3 text-white text-sm font-medium">
                        Matched Photos
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : searchTerm && !isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-muted-foreground py-12"
              >
                <p className="text-lg">No photos found</p>
                <p className="text-sm mt-2">Try searching for "AayushB"</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Search;
