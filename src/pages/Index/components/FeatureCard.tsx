
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonText: string;
  buttonVariant?: "default" | "secondary" | "outline";
  to: string;
  initial: { opacity: number; x?: number; y?: number };
  animate: { opacity: number; x?: number; y?: number };
  transition: { duration: number; delay: number };
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  buttonText,
  buttonVariant = "default",
  to,
  initial,
  animate,
  transition,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={transition}
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
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
        <Button 
          asChild 
          variant={buttonVariant}
          className="w-full group relative overflow-hidden transition-all duration-300
                    hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          <Link to={to}>
            <span className="relative z-10 flex items-center justify-center">
              {buttonText}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
