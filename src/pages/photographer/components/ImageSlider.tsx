
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, Award } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Progress } from "@/components/ui/progress";
import { PortfolioImage } from "../types/portfolio";

interface ImageSliderProps {
  images: PortfolioImage[];
}

export const ImageSlider = ({ images }: ImageSliderProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  const preloadCount = 2; // Number of images to preload ahead
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  // Preload initial images and setup image cache
  useEffect(() => {
    const preloadImage = (src: string): Promise<void> => {
      return new Promise((resolve) => {
        if (imageCache.current.has(src)) {
          resolve();
          return;
        }

        const img = new Image();
        img.onload = () => {
          imageCache.current.set(src, img);
          resolve();
        };
        img.src = src;
      });
    };

    // Preload first few images immediately
    const preloadInitialImages = async () => {
      const imagesToPreload = images.slice(0, preloadCount + 1);
      await Promise.all(imagesToPreload.map(img => preloadImage(img.src)));
      setLoadedImages(new Set(imagesToPreload.map((_, index) => index)));
    };

    preloadInitialImages();

    // Add to browser's disk cache
    images.forEach(image => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = image.src;
      document.head.appendChild(link);
    });
  }, [images]);

  // Preload next images when current index changes
  useEffect(() => {
    const preloadNextImages = async () => {
      const nextIndexes = Array.from({ length: preloadCount }, (_, i) => 
        (currentImageIndex + i + 1) % images.length
      );

      // Only preload images that haven't been loaded yet
      const newIndexes = nextIndexes.filter(index => !loadedImages.has(index));
      
      if (newIndexes.length > 0) {
        await Promise.all(
          newIndexes.map(async (index) => {
            const img = new Image();
            await new Promise((resolve) => {
              img.onload = resolve;
              img.src = images[index].src;
            });
            imageCache.current.set(images[index].src, img);
          })
        );

        setLoadedImages(prev => {
          const newSet = new Set(prev);
          newIndexes.forEach(index => newSet.add(index));
          return newSet;
        });
      }
    };

    preloadNextImages();
  }, [currentImageIndex, images, loadedImages]);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, images.length]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  return (
    <div
      className="relative glass-card p-4 rounded-xl max-w-4xl mx-auto"
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
        <AspectRatio ratio={16 / 9}>
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={images[currentImageIndex].src}
              alt={images[currentImageIndex].title}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              loading={currentImageIndex === 0 ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={currentImageIndex === 0 ? "high" : "auto"}
            />
          </AnimatePresence>
        </AspectRatio>

        <div className="absolute bottom-0 left-0 right-0 bg-background/60 backdrop-blur-sm p-4">
          <h3 className="text-lg font-semibold text-foreground">
            {images[currentImageIndex].title}
          </h3>
          <div className="flex items-center gap-4 text-sm mt-2">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {images[currentImageIndex].year}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Award className="w-4 h-4" />
              {images[currentImageIndex].eventType}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Progress
          value={((currentImageIndex + 1) / images.length) * 100}
          className="h-1"
        />
      </div>

      <div className="flex justify-center gap-2 mt-4">
        {images.map((_, index) => (
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
  );
};
