import { motion, useScroll, useTransform } from "framer-motion";
import { Upload, Search, Camera } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

interface FloatingMessage {
  id: number;
  text: string;
  initialX: number;
  initialY: number;
  duration: number;
}

const messages = [
  "✨ We loved celebrating with you! What was your highlight of the event?",
  "📸 Our photographer captured magic! Share your favorite shot!",
  "🍽️ The food was divine! Which dish stole your heart?",
  "👗 Such a beautiful crowd! You all looked absolutely stunning!",
  "💫 Tell us about that unforgettable moment!"
];

// Define corner positions
const cornerPositions = [
  { x: -40, y: 10 },    // Top left
  { x: 40, y: 10 },     // Top right
  { x: -40, y: 70 },    // Bottom left
  { x: 40, y: 70 },     // Bottom right
  { x: 0, y: 40 },      // Center
];

const UserOptions = () => {
  const { scrollYProgress } = useScroll();
  const [floatingMessages, setFloatingMessages] = useState<FloatingMessage[]>([]);
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useEffect(() => {
    // Create floating messages with corner-based positions
    const newMessages = messages.map((text, index) => {
      const position = cornerPositions[index % cornerPositions.length];
      const randomOffset = {
        x: position.x + (Math.random() * 10 - 5), // Add small random offset
        y: position.y + (Math.random() * 10 - 5)
      };
      
      return {
        id: index,
        text,
        initialX: randomOffset.x,
        initialY: randomOffset.y,
        duration: Math.random() * 4 + 8 // 8 to 12 seconds
      };
    });
    setFloatingMessages(newMessages);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-background to-secondary">
      {/* Particle Effect Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-2 w-2 rounded-full bg-primary"
              animate={{
                x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
                y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear"
              }}
            />
          ))}
        </div>
      </div>

      {/* Floating Messages */}
      {floatingMessages.map((message) => (
        <motion.div
          key={message.id}
          className="absolute hidden lg:block"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
          initial={{ 
            x: `${message.initialX}vw`,
            y: `${message.initialY}vh`,
            opacity: 0 
          }}
          animate={{ 
            x: [`${message.initialX}vw`, `${message.initialX + 10}vw`, `${message.initialX}vw`],
            y: [`${message.initialY}vh`, `${message.initialY - 5}vh`, `${message.initialY}vh`],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: message.duration,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        >
          <div className="max-w-sm p-4 rounded-lg backdrop-blur-md bg-white/80 dark:bg-gray-800/80 
                        shadow-[0_8px_16px_rgba(0,0,0,0.1)] border border-white/20
                        transform transition-transform duration-300 hover:scale-105">
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              {message.text}
            </p>
          </div>
        </motion.div>
      ))}

      <div className="container max-w-4xl relative z-10">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold text-center mb-12 pt-12
                     bg-gradient-to-r from-primary via-primary/80 to-primary/60 
                     bg-clip-text text-transparent"
        >
          What would you like to do?
        </motion.h1>
        
        <div className="grid md:grid-cols-3 gap-8 p-4">
          {/* Upload Reference Photo Box */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link 
              to="/user/reference-upload"
              className="block h-full"
            >
              <div className="h-full p-8 rounded-2xl glass-card hover:glass-card-hover
                            transform transition-all duration-500 ease-out">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-6
                              transform transition-all duration-300 group-hover:scale-110
                              hover:rotate-12">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-br from-primary to-primary/70 
                             bg-clip-text text-transparent">
                  Add Your Stunning Reference Photo
                </h2>
                <p className="text-muted-foreground">
                  Upload reference photos to help us find your matching photos in our galleries
                </p>
              </div>
            </Link>
          </motion.div>

          {/* Find Photos Box */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link 
              to="/user/search"
              className="block h-full"
            >
              <div className="h-full p-8 rounded-2xl glass-card hover:glass-card-hover
                            transform transition-all duration-500 ease-out">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-6
                              transform transition-all duration-300 group-hover:scale-110
                              hover:rotate-12">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-br from-primary to-primary/70 
                             bg-clip-text text-transparent">
                  Find Your Photos
                </h2>
                <p className="text-muted-foreground">
                  Browse through our galleries and find photos that match your reference
                </p>
              </div>
            </Link>
          </motion.div>

          {/* Edit Profile Box */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link 
              to="/user/edit-profile"
              className="block h-full"
            >
              <div className="h-full p-8 rounded-2xl glass-card hover:glass-card-hover
                            transform transition-all duration-500 ease-out">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-6
                              transform transition-all duration-300 group-hover:scale-110
                              hover:rotate-12">
                  <Camera className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-br from-primary to-primary/70 
                             bg-clip-text text-transparent">
                  Edit Profile
                </h2>
                <p className="text-muted-foreground">
                  Update your profile information and preferences
                </p>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserOptions;
