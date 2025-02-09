
import { motion } from "framer-motion";
import { Camera, User, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 py-16 space-y-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <span className="px-4 py-2 rounded-full bg-primary/10 text-primary inline-block animate-fade-down">
            Introducing AI-Powered Photo Matching
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight animate-fade-up">
            Find Your Photos with
            <br />
            <span className="text-primary">Perfect Precision</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-up">
            Advanced AI technology matches your reference photo across entire
            galleries, making it effortless to find yourself in event photos.
          </p>
        </motion.div>

        {/* Split Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Photographer Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card rounded-2xl p-8 hover-card"
          >
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Camera className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold">For Photographers</h2>
              <p className="text-muted-foreground">
                Upload and manage your event galleries. Let your clients easily find
                their photos using AI matching.
              </p>
              <Button asChild className="w-full group">
                <Link to="/photographer/login">
                  Photographer Login
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* User Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass-card rounded-2xl p-8 hover-card"
          >
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold">For Users</h2>
              <p className="text-muted-foreground">
                Upload a reference photo and let our AI find all your matching
                photos from event galleries.
              </p>
              <Button asChild variant="secondary" className="w-full group">
                <Link to="/user/search">
                  Find Your Photos
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-background/50 backdrop-blur border hover:border-primary/20 transition-colors"
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
    title: "AI-Powered Matching",
    description: "Advanced facial recognition to find your photos with precision",
  },
  {
    title: "Instant Results",
    description: "Get matched photos in seconds, not hours",
  },
  {
    title: "Secure & Private",
    description: "Your photos and data are always protected",
  },
];

export default Index;
