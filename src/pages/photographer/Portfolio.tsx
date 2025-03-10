
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Camera, Calendar, Award } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Progress } from "@/components/ui/progress";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { ErrorBoundary } from "@/components/error-boundary";
import { PageLayout } from "@/components/layout/page-layout";

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
    src: "/lovable-uploads/7eddcc40-02cf-4ce2-af21-d85c97d808ff.png",
    title: "Night Garden Illumination",
    eventType: "Night Photography",
    year: "2024"
  },
  {
    id: 2,
    src: "/lovable-uploads/1a134332-da24-4006-bf04-104afbb10355.png",
    title: "Stairway to Lights",
    eventType: "Architectural",
    year: "2024"
  },
  {
    id: 3,
    src: "/lovable-uploads/60537293-2282-49fb-9ca6-b3345432dd65.png",
    title: "Blue Hour Reflection",
    eventType: "Landscape",
    year: "2024"
  },
  {
    id: 4,
    src: "/lovable-uploads/6a7985f3-168d-4250-94ed-6cfef3cbd0db.png",
    title: "Golden Lights Installation",
    eventType: "Night Photography",
    year: "2024"
  }
];

const PhotographerPortfolio = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [yearsCount, setYearsCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [ref, entry] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "100px",
  });

  useEffect(() => {
    const animateCounters = () => {
      const targetYears = 10;
      const targetEvents = 250;
      const duration = 2000;
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
    
    if (entry?.isIntersecting) {
      animateCounters();
    }
  }, [entry?.isIntersecting]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % portfolioImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const nextImage = () => {
    setCurrentImageIndex(prev => (prev + 1) % portfolioImages.length);
  };

  const previousImage = () => {
    setCurrentImageIndex(prev => prev === 0 ? portfolioImages.length - 1 : prev - 1);
  };

  return (
    <ErrorBoundary>
      <PageLayout>
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

            <motion.div 
              ref={ref as React.RefObject<HTMLDivElement>}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-3 gap-4 max-w-4xl mx-auto"
            >
              <div className="col-span-3 bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20
                          shadow-lg flex justify-between items-center">
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
                  <span className="text-sm text-muted-foreground">Portrait</span>
                </div>
              </div>
            </motion.div>
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
                      <motion.div
                        key={currentImageIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0"
                      >
                        <OptimizedImage
                          src={portfolioImages[currentImageIndex].src}
                          alt={portfolioImages[currentImageIndex].title}
                          className="absolute inset-0 w-full h-full object-cover"
                          loadingClassName="animate-pulse bg-muted"
                        />
                      </motion.div>
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
                    value={(currentImageIndex + 1) / portfolioImages.length * 100}
                    className="h-1"
                  />
                </div>

                <div className="flex justify-center gap-2 mt-4">
                  {portfolioImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors 
                                ${index === currentImageIndex ? "bg-primary" : "bg-primary/30"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    </ErrorBoundary>
  );
};

export default PhotographerPortfolio;
