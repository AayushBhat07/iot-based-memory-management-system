
import { motion } from "framer-motion";

export function HeroSection() {
  return (
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
  );
}
