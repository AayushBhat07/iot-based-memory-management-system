
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

      // Hardcode the specific images we want to display for AayushB
      const photoUrls = [
        '/lovable-uploads/58bedeb9-5c34-4db0-9d94-9209622ce934.png',
        '/lovable-uploads/600052b9-b242-4a4b-8540-053d56ac376f.png',
        '/lovable-uploads/71afab7e-446f-4770-ae2c-232771530e52.png',
        '/lovable-uploads/b3dd945a-f7df-4a81-bd9d-19d132947b57.png',
        '/lovable-uploads/dc85fab3-382b-4174-8022-9ba35a96ea0d.png'
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
