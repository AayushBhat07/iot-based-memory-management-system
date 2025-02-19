
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";

interface Image {
  id: number;
  src: string;
  title: string;
  eventType: string;
  year: string;
}

const userPhotos: Image[] = [
  {
    id: 1,
    src: "/lovable-uploads/3aac8710-073c-4f4e-a1cf-c4e6fc24abe3.png",
    title: "Elegant Style",
    eventType: "Portrait",
    year: "2024"
  },
  {
    id: 2,
    src: "/lovable-uploads/8c55b1ee-fc95-4ca0-885e-cbf2c8e041ca.png",
    title: "Group Celebration",
    eventType: "Group",
    year: "2024"
  },
  {
    id: 3,
    src: "/lovable-uploads/c099ddca-6a0b-4247-a932-92a12300c75a.png",
    title: "Campus Life",
    eventType: "Casual",
    year: "2024"
  },
  {
    id: 4,
    src: "/lovable-uploads/45915723-6041-4d3d-b93e-2f8bd60dfaa5.png",
    title: "Bowling Night",
    eventType: "Group",
    year: "2024"
  },
  {
    id: 5,
    src: "/lovable-uploads/87d93acc-f7cf-418a-a316-60602b6e2e6a.png",
    title: "Game Garden Fun",
    eventType: "Group",
    year: "2024"
  },
  {
    id: 6,
    src: "/lovable-uploads/e08e7dd3-f8e6-4246-8d5f-18412f970e0d.png",
    title: "Art Gallery Visit",
    eventType: "Group",
    year: "2024"
  }
];

const UserSearch = () => {
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!isAutoPlaying || !selectedUser) return;

    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % userPhotos.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, selectedUser]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % userPhotos.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? userPhotos.length - 1 : prev - 1
    );
  };

  const handleUserSelect = (value: string) => {
    setSelectedUser(value);
    toast({
      title: "User Selected",
      description: `Now showing photos for ${value}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary p-6">
      <div className="container mx-auto px-4 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-semibold bg-gradient-to-r from-primary via-primary/80 to-primary/60 
                        bg-clip-text text-transparent">
            Find Your Photos
          </h1>
          <p className="text-muted-foreground">Select a user to view their photos</p>
        </div>

        <div className="max-w-xs mx-auto">
          <Select onValueChange={handleUserSelect} value={selectedUser}>
            <SelectTrigger>
              <SelectValue placeholder="Select a user" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Aayush_bhat">Aayush_bhat</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedUser && (
          <div className="max-w-4xl mx-auto mt-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary to-primary/60 
                           bg-clip-text text-transparent inline-block">
                Photos Matched
              </h2>
            </div>
            <div
              className="relative glass-card p-4 rounded-xl"
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              <button
                onClick={previousImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/50 p-2 rounded-full
                         hover:bg-background/70 transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-primary" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/50 p-2 rounded-full
                         hover:bg-background/70 transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-primary" />
              </button>

              <div className="relative overflow-hidden rounded-lg">
                <AspectRatio ratio={4 / 3}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentImageIndex}
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <img
                        src={userPhotos[currentImageIndex].src}
                        alt={userPhotos[currentImageIndex].title}
                        className="w-full h-full object-contain"
                      />
                    </motion.div>
                  </AnimatePresence>
                </AspectRatio>

                <div className="absolute bottom-0 left-0 right-0 bg-background/60 backdrop-blur-sm p-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    {userPhotos[currentImageIndex].title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm mt-2">
                    <span className="text-muted-foreground">
                      {userPhotos[currentImageIndex].year}
                    </span>
                    <span className="text-muted-foreground">
                      {userPhotos[currentImageIndex].eventType}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Progress
                  value={((currentImageIndex + 1) / userPhotos.length) * 100}
                  className="h-1"
                />
              </div>

              <div className="flex justify-center gap-2 mt-4">
                {userPhotos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? "bg-primary" : "bg-primary/30"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSearch;
