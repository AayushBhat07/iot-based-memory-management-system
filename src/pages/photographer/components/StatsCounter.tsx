
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";

export const StatsCounter = () => {
  const [yearsCount, setYearsCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);

  useEffect(() => {
    const animateCounters = () => {
      const targetYears = 10;
      const targetEvents = 250;
      const duration = 2000;
      const steps = 50;
      const yearsIncrement = targetYears / steps;
      const eventsIncrement = targetEvents / steps;
      const interval = duration / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        if (currentStep < steps) {
          setYearsCount(Math.ceil(yearsIncrement * currentStep));
          setEventsCount(Math.ceil(eventsIncrement * currentStep));
          currentStep++;
        } else {
          setYearsCount(targetYears);
          setEventsCount(targetEvents);
          clearInterval(timer);
        }
      }, interval);

      return () => clearInterval(timer);
    };

    animateCounters();
  }, []);

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2 }}
      className="col-span-3 bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20
                shadow-lg flex justify-between items-center"
    >
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <div className="text-xl font-bold text-primary">{yearsCount}</div>
        </div>
        <span className="text-sm text-muted-foreground">Years</span>
      </div>

      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <div className="text-xl font-bold text-primary">{eventsCount}</div>
        </div>
        <span className="text-sm text-muted-foreground">Events</span>
      </div>

      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <Camera className="w-6 h-6 text-primary" />
        </div>
        <span className="text-sm text-muted-foreground">Portrait</span>
      </div>
    </motion.div>
  );
};
