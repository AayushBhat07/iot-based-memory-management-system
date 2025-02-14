
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

// Sample images (replace with actual image data)
const portfolioImages: Image[] = [
  {
    id: 1,
    src: "/placeholder.svg", // Replace with actual image
    title: "Summer Wedding",
    eventType: "Wedding",
    year: "2023"
  },
  {
    id: 2,
    src: "/placeholder.svg", // Replace with actual image
    title: "Corporate Event",
    eventType: "Corporate",
    year: "2023"
  },
  {
    id: 3,
    src: "/placeholder.svg", // Replace with actual image
    title: "Beach Engagement",
    eventType: "Engagement",
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Header Section */}
      <header className="container mx-auto px-4 py-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-playfair mb-16 text-white"
        >
          John Doe Photography
        </motion.h1>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Years Experience */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center mb-4">
              <div className="text-3xl font-bold text-white">{yearsCount}</div>
            </div>
            <span className="text-white/80">Years of Experience</span>
          </motion.div>

          {/* Events Completed */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center"
          >
            <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center mb-4">
              <div className="text-3xl font-bold text-white">{eventsCount}</div>
            </div>
            <span className="text-white/80">Events Completed</span>
          </motion.div>

          {/* Specialization */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col items-center"
          >
            <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center mb-4">
              <Camera className="w-12 h-12 text-white" />
            </div>
            <span className="text-white/80">Wedding Specialist</span>
          </motion.div>
        </div>
      </header>

      {/* Portfolio Slideshow Section */}
      <div className="relative w-full bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div
            className="relative"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {/* Navigation Arrows */}
            <button
              onClick={previousImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full
                       hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full
                       hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Images */}
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

              {/* Image Caption */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-4">
                <h3 className="text-xl font-semibold">
                  {portfolioImages[currentImageIndex].title}
                </h3>
                <div className="flex items-center gap-4 text-sm mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {portfolioImages[currentImageIndex].year}
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    {portfolioImages[currentImageIndex].eventType}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <Progress 
                value={((currentImageIndex + 1) / portfolioImages.length) * 100} 
                className="h-1" 
              />
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {portfolioImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? "bg-white" : "bg-white/30"
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
