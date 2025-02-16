
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

      console.log('Fetching photos from trial2 bucket...');
      const { data: files, error } = await supabase
        .storage
        .from('trial2')
        .list();

      if (error) {
        console.error('Error fetching photos:', error);
        throw error;
      }

      console.log('Files found:', files);
      
      const photosWithUrls = files?.map(file => {
        const { data: { publicUrl } } = supabase.storage
          .from('trial2')
          .getPublicUrl(file.name);
        console.log('Generated URL for', file.name, ':', publicUrl);
        return {
          name: file.name,
          url: publicUrl,
        };
      }) || [];

      console.log('Final photos array:', photosWithUrls);
      return photosWithUrls;
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
