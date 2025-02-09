
import { motion } from "framer-motion";
import { Upload, Search } from "lucide-react";
import { Link } from "react-router-dom";

const UserOptions = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center p-4">
      <div className="container max-w-4xl">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold text-center mb-12"
        >
          What would you like to do?
        </motion.h1>
        
        <div className="grid md:grid-cols-2 gap-8">
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
              <div className="h-full p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 
                            hover:bg-white/15 transition-all duration-300 
                            shadow-[0_4px_32px_-12px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_32px_-8px_rgba(0,0,0,0.3)]
                            dark:bg-gray-800/40 dark:border-white/10">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-6
                            transform transition-transform duration-300 group-hover:scale-110">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold mb-4">Add Your Stunning Reference Photo</h2>
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
              <div className="h-full p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 
                            hover:bg-white/15 transition-all duration-300 
                            shadow-[0_4px_32px_-12px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_32px_-8px_rgba(0,0,0,0.3)]
                            dark:bg-gray-800/40 dark:border-white/10">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-6
                            transform transition-transform duration-300 group-hover:scale-110">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold mb-4">Find Your Photos</h2>
                <p className="text-muted-foreground">
                  Browse through our galleries and find photos that match your reference
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
