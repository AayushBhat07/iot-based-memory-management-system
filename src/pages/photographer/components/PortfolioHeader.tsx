
import { motion } from "framer-motion";
import { StatsCounter } from "./StatsCounter";

export const PortfolioHeader = () => {
  return (
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
  );
};
