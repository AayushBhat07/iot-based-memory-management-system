
import { motion } from "framer-motion";
import { Camera, User, ArrowRight, Images } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/theme-toggle";

const Index = () => {
  // Fetch media files as background photos
  const { data: backgroundPhotos = [] } = useQuery({
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
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary overflow-hidden relative">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Floating Background Photos */}
      <div className="absolute inset-0 -z-10">
        {backgroundPhotos.map((photoUrl, index) => (
          <motion.div
            key={index}
            className="absolute rounded-2xl overflow-hidden shadow-lg bg-white/10 backdrop-blur-sm"
            style={{
              width: `${Math.random() * 100 + 150}px`,
              height: `${Math.random() * 100 + 150}px`,
              left: `${(index * 25) % 100}%`,
              top: `${(index * 20) % 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 50 - 25],
              y: [0, Math.random() * 50 - 25],
              rotate: [0, Math.random() * 10 - 5],
            }}
            transition={{
              duration: 10 + Math.random() * 5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          >
            <img
              src={photoUrl}
              alt=""
              className="w-full h-full object-cover opacity-30"
            />
          </motion.div>
        ))}
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 space-y-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <span className="px-4 py-2 rounded-full bg-primary/10 text-primary inline-block animate-fade-down">
            Introducing Iot Based Memory Mangement System Integrated With AI
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-fade-up">
            Find Your Photos with
            <br />
            <span className="text-primary">Perfect Precision</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-up">
            Wedding Photo Search? AI Just Made it a Piece of Cake!
          </p>
        </motion.div>

        {/* Split Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Photographer Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative overflow-hidden rounded-2xl p-8 transition-all duration-300
                     bg-white/10 backdrop-blur-md border border-white/20
                     hover:bg-white/15 hover:shadow-2xl hover:-translate-y-1
                     dark:bg-gray-800/40 dark:border-white/10"
            style={{
              boxShadow: "0 4px 32px -12px rgba(0, 0, 0, 0.2)",
            }}
          >
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center
                          transform transition-transform duration-300 hover:scale-110">
                <Camera className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold">For Photographers</h2>
              <p className="text-muted-foreground">
                Upload and manage your event galleries. Let your clients easily find
                their photos using AI matching.
              </p>
              <Button 
                asChild 
                className="w-full group relative overflow-hidden transition-all duration-300
                          hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                <Link to="/photographer/login">
                  <span className="relative z-10 flex items-center justify-center">
                    Photographer Login
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* User Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative overflow-hidden rounded-2xl p-8 transition-all duration-300
                     bg-white/10 backdrop-blur-md border border-white/20
                     hover:bg-white/15 hover:shadow-2xl hover:-translate-y-1
                     dark:bg-gray-800/40 dark:border-white/10"
            style={{
              boxShadow: "0 4px 32px -12px rgba(0, 0, 0, 0.2)",
            }}
          >
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center
                          transform transition-transform duration-300 hover:scale-110">
                <User className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold">For Users</h2>
              <p className="text-muted-foreground">
                Upload a reference photo and let our AI find all your matching
                photos from event galleries.
              </p>
              <Button 
                asChild 
                variant="secondary" 
                className="w-full group relative overflow-hidden transition-all duration-300
                          hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                <Link to="/user">
                  <span className="relative z-10 flex items-center justify-center">
                    Find Your Photos
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* New Portfolio Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="relative overflow-hidden rounded-2xl p-8 transition-all duration-300
                     bg-white/10 backdrop-blur-md border border-white/20
                     hover:bg-white/15 hover:shadow-2xl hover:-translate-y-1
                     dark:bg-gray-800/40 dark:border-white/10"
            style={{
              boxShadow: "0 4px 32px -12px rgba(0, 0, 0, 0.2)",
            }}
          >
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center
                          transform transition-transform duration-300 hover:scale-110">
                <Images className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold">Show Portfolios</h2>
              <p className="text-muted-foreground">
                Browse through our talented photographers' portfolios and discover their 
                unique styles and creative work.
              </p>
              <Button 
                asChild 
                variant="outline"
                className="w-full group relative overflow-hidden transition-all duration-300
                          hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                <Link to="/photographer/portfolio">
                  <span className="relative z-10 flex items-center justify-center">
                    View Portfolios
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 
                       transition-all duration-300 hover:bg-white/10 hover:shadow-lg hover:-translate-y-1
                       shadow-md border-white/20"
            >
              <h3 className="font-medium mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

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

export default Index;
