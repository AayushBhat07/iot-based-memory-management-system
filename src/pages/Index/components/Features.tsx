
import { motion } from "framer-motion";

interface Feature {
  title: string;
  description: string;
}

interface FeaturesProps {
  features: Feature[];
}

export function Features({ features }: FeaturesProps) {
  return (
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
  );
}
