
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  showThemeToggle?: boolean;
}

export function PageLayout({
  children,
  className,
  showThemeToggle = true,
}: PageLayoutProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "min-h-screen bg-gradient-to-b from-background to-secondary/20",
        className
      )}
    >
      {showThemeToggle && (
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
      )}
      {children}
    </motion.div>
  );
}
