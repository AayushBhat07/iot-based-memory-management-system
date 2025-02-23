
import { Camera, User, ArrowRight, Images } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layout/page-layout";
import { HeroSection } from "./components/HeroSection";
import { BackgroundPhotos } from "./components/BackgroundPhotos";
import { FeatureCard } from "./components/FeatureCard";
import { Features } from "./components/Features";
import { ErrorBoundary } from "@/components/error-boundary";
import { Skeleton } from "@/components/ui/skeleton";

const features = [
  {
    title: "Who's Who? AI Face Recognition Knows!",
    description: "Advanced facial recognition to find your photos with precision",
  },
  {
    title: "Unmatched Accuracy in Face Recognition. AI at Its Best.",
    description: "Get matched photos in seconds, not hours",
  },
  {
    title: "Identify Attendees Instantly. AI Face Recognition at Your Service.",
    description: "Your photos and data are always protected",
  },
];

const featureCards = [
  {
    icon: Camera,
    title: "For Photographers",
    description: "Upload and manage your event galleries. Let your clients easily find their photos using AI matching.",
    buttonText: "Photographer Login",
    to: "/photographer/login",
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, delay: 0.2 },
  },
  {
    icon: User,
    title: "For Users",
    description: "Upload a reference photo and let our AI find all your matching photos from event galleries.",
    buttonText: "Find Your Photos",
    buttonVariant: "secondary" as const,
    to: "/user",
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay: 0.4 },
  },
  {
    icon: Images,
    title: "Show Portfolios",
    description: "Browse through our talented photographers' portfolios and discover their unique styles and creative work.",
    buttonText: "View Portfolios",
    buttonVariant: "outline" as const,
    to: "/photographer/portfolio",
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, delay: 0.6 },
  },
];

export default function Index() {
  const { data: backgroundPhotos = [], isLoading } = useQuery({
    queryKey: ['background-photos'],
    queryFn: async () => {
      const { data: mediaFiles, error } = await supabase
        .from('media')
        .select('file_url')
        .eq('file_type', 'image')
        .limit(5);

      if (error) {
        console.error('Error fetching photos:', error);
        return Array(5).fill('/placeholder.svg');
      }

      return mediaFiles?.length > 0 
        ? mediaFiles.map(media => media.file_url)
        : Array(5).fill('/placeholder.svg');
    }
  });

  return (
    <ErrorBoundary>
      <PageLayout>
        {isLoading ? (
          <div className="absolute inset-0 -z-10">
            {Array(5).fill(0).map((_, index) => (
              <Skeleton
                key={index}
                className="absolute rounded-2xl"
                style={{
                  width: `${Math.random() * 100 + 150}px`,
                  height: `${Math.random() * 100 + 150}px`,
                  left: `${(index * 25) % 100}%`,
                  top: `${(index * 20) % 100}%`,
                }}
              />
            ))}
          </div>
        ) : (
          <BackgroundPhotos photos={backgroundPhotos} />
        )}

        <div className="container mx-auto px-4 py-16 space-y-16 relative z-10">
          <HeroSection />

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {featureCards.map((card, index) => (
              <FeatureCard key={index} {...card} />
            ))}
          </div>

          <Features features={features} />
        </div>
      </PageLayout>
    </ErrorBoundary>
  );
}
