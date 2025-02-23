
import { motion } from "framer-motion";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface BackgroundPhotosProps {
  photos: string[];
}

export function BackgroundPhotos({ photos }: BackgroundPhotosProps) {
  return (
    <div className="absolute inset-0 -z-10">
      {photos.map((photoUrl, index) => (
        <BackgroundPhoto key={index} photoUrl={photoUrl} index={index} />
      ))}
    </div>
  );
}

function BackgroundPhoto({ photoUrl, index }: { photoUrl: string; index: number }) {
  const [ref, entry] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "50px",
  });

  return (
    <motion.div
      ref={(node) => {
        if (ref.current) {
          ref.current = node as Element;
        }
      }}
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
      {entry?.isIntersecting && (
        <OptimizedImage
          src={photoUrl}
          alt=""
          className="w-full h-full object-cover opacity-30"
          loadingClassName="animate-pulse"
        />
      )}
    </motion.div>
  );
}
