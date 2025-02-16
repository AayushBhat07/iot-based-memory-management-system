
import { motion } from "framer-motion";
import { StatsCounter } from "./components/StatsCounter";
import { ImageSlider } from "./components/ImageSlider";
import { portfolioImages } from "./types/portfolio";

const PhotographerPortfolio = () => {
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
          <StatsCounter />
        </div>
      </header>

      <div className="w-full">
        <div className="container mx-auto px-4 mt-[10vh]">
          <ImageSlider images={portfolioImages} />
        </div>
      </div>
    </div>
  );
};

export default PhotographerPortfolio;
