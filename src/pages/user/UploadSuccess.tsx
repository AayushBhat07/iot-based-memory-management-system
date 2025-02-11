
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, Search } from "lucide-react";

const UploadSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-16 min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-up">
        {/* Headline */}
        <div className="glass-card p-8 rounded-2xl text-center shadow-xl bg-gradient-to-r from-blue-50 to-purple-50">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            That's an Awesome Photo!
          </h1>
          <p className="text-muted-foreground">
            Your reference photo has been successfully uploaded
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload Another Photo Card */}
          <div 
            onClick={() => navigate("/user/reference-upload")}
            className="glass-card hover-card p-6 rounded-xl cursor-pointer text-center space-y-4"
          >
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Camera className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-primary">
              Upload Another Photo
            </h2>
            <p className="text-muted-foreground">
              Want to upload a reference photo for someone else?
            </p>
          </div>

          {/* Find Photos Card */}
          <div 
            onClick={() => navigate("/user/search")}
            className="glass-card hover-card p-6 rounded-xl cursor-pointer text-center space-y-4"
          >
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-primary">
              Find Your Amazing Photos
            </h2>
            <p className="text-muted-foreground">
              Search through your matched photos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadSuccess;
