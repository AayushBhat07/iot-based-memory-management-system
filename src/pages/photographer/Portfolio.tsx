
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Camera, Calendar, Award } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Progress } from "@/components/ui/progress";

interface Image {
  id: number;
  src: string;
  title: string;
  eventType: string;
  year: string;
}

const portfolioImages: Image[] = [
  {
    id: 1,
    src: "/lovable-uploads/b3dd945a-f7df-4a81-bd9d-19d132947b57.png",
    title: "Shared Moments",
    eventType: "Group Photography",
    year: "2024"
  },
  {
    id: 2,
    src: "/lovable-uploads/dc85fab3-382b-4174-8022-9ba35a96ea0d.png",
    title: "Garden Style",
    eventType: "Portrait",
    year: "2024"
  },
  {
    id: 3,
    src: "/lovable-uploads/58bedeb9-5c34-4db0-9d94-9209622ce934.png",
    title: "Beach Silhouette",
    eventType: "Creative",
    year: "2024"
  },
  {
    id: 4,
    src: "/lovable-uploads/600052b9-b242-4a4b-8540-053d56ac376f.png",
    title: "Vintage Corner",
    eventType: "Interior",
    year: "2024"
  },
  {
    id: 5,
    src: "/lovable-uploads/71afab7e-446f-4770-ae2c-232771530e52.png",
    title: "Elegant Banquet Hall",
    eventType: "Architecture",
    year: "2024"
  },
  {
    id: 6,
    src: "/placeholder.svg",
    title: "Summer Wedding",
    eventType: "Wedding",
    year: "2023"
  }
];

const PhotographerPortfolio = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [yearsCount, setYearsCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);

  // Counter animation on load
  useEffect(() => {
    const animateCounters = () => {
      const targetYears = 10; // Replace with actual years
      const targetEvents = 250; // Replace with actual events
      const duration = 2000; // 2 seconds
      const steps = 50;
      const yearsIncrement = targetYears / steps;
      const eventsIncrement = targetEvents / steps;
      const interval = duration / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        if (currentStep < steps) {
          setYearsCount(Math.ceil(yearsIncrement * currentStep));
          setEventsCount(Math.ceil(eventsIncrement * currentStep));
          currentStep++;
        } else {
          setYearsCount(targetYears);
          setEventsCount(targetEvents);
          clearInterval(timer);
        }
      }, interval);

      return () => clearInterval(timer);
    };

    animateCounters();
  }, []);

  // Autoplay functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % portfolioImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % portfolioImages.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? portfolioImages.length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <header className="container mx-auto px-4 py-6 text-center h-[20vh]">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-playfair mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 
                     bg-clip-text text-transparent"
        >
          Aayush Bhat Photography
        </motion.h1>

        <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="col-span-3 bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20
                      shadow-lg flex justify-between items-center"
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <div className="text-xl font-bold text-primary">{yearsCount}</div>
              </div>
              <span className="text-sm text-muted-foreground">Years</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <div className="text-xl font-bold text-primary">{eventsCount}</div>
              </div>
              <span className="text-sm text-muted-foreground">Events</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Camera className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Potrait</span>
            </div>
          </motion.div>
        </div>
      </header>

      <div className="w-full">
        <div className="container mx-auto px-4 mt-[10vh]">
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
                    src={portfolioImages[currentImageIndex].src}
                    alt={portfolioImages[currentImageIndex].title}
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                </AnimatePresence>
              </AspectRatio>

              <div className="absolute bottom-0 left-0 right-0 bg-background/60 backdrop-blur-sm p-4">
                <h3 className="text-lg font-semibold text-foreground">
                  {portfolioImages[currentImageIndex].title}
                </h3>
                <div className="flex items-center gap-4 text-sm mt-2">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {portfolioImages[currentImageIndex].year}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Award className="w-4 h-4" />
                    {portfolioImages[currentImageIndex].eventType}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Progress
                value={((currentImageIndex + 1) / portfolioImages.length) * 100}
                className="h-1"
              />
            </div>

            <div className="flex justify-center gap-2 mt-4">
              {portfolioImages.map((_, index) => (
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
      </div>
    </div>
  );
};

export default PhotographerPortfolio;
