
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Upload, FolderCog } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PhotographerOptions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      <div className="container max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white text-center mb-12">
          Photographer Dashboard
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Create New Event Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card
              className="p-6 hover-card glass-card cursor-pointer"
              onClick={() => navigate("/photographer/upload")}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-full bg-white/10">
                  <Upload className="w-8 h-8 text-[#F97316]" />
                </div>
                <h2 className="text-xl font-semibold text-white">Create New Event</h2>
                <p className="text-white/80">
                  Upload photos for a new event and organize them efficiently
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Manage Events Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card
              className="p-6 hover-card glass-card cursor-pointer"
              onClick={() => navigate("/photographer/events")}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-full bg-white/10">
                  <FolderCog className="w-8 h-8 text-[#F97316]" />
                </div>
                <h2 className="text-xl font-semibold text-white">Manage Events</h2>
                <p className="text-white/80">
                  View and manage your existing events and photos
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PhotographerOptions;
