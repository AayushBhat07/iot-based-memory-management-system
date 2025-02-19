
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Search, Upload, X } from "lucide-react";

interface FormData {
  eventName: string;
  eventLocation: string;
  eventDate: Date | undefined;
  referencePhoto: File | null;
}

const UserOptions = () => {
  const [formData, setFormData] = useState<FormData>({
    eventName: "",
    eventLocation: "",
    eventDate: undefined,
    referencePhoto: null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isFormValid = formData.eventName && formData.referencePhoto;

  const handleFileSelect = (file: File) => {
    if (file) {
      setFormData(prev => ({ ...prev, referencePhoto: file }));
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleSearch = () => {
    // Implement search functionality
    console.log("Searching with form data:", formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Find Your Photos
            </h1>
            <p className="text-muted-foreground text-lg">
              Enter event details and upload a reference photo to find your matches
            </p>
          </div>

          {/* Main Dashboard */}
          <Card className="p-8 shadow-lg bg-card/50 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event Name */}
              <div className="space-y-2">
                <Label htmlFor="eventName">Event Name *</Label>
                <Input
                  id="eventName"
                  placeholder="Enter event name"
                  value={formData.eventName}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, eventName: e.target.value }))
                  }
                />
              </div>

              {/* Event Location */}
              <div className="space-y-2">
                <Label htmlFor="eventLocation">Event Location</Label>
                <Input
                  id="eventLocation"
                  placeholder="Enter event location"
                  value={formData.eventLocation}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, eventLocation: e.target.value }))
                  }
                />
              </div>

              {/* Event Date */}
              <div className="space-y-2">
                <Label>Event Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.eventDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.eventDate ? (
                        format(formData.eventDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.eventDate}
                      onSelect={(date) => 
                        setFormData(prev => ({ ...prev, eventDate: date }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Reference Photo Upload */}
              <div className="space-y-2">
                <Label>Reference Photo *</Label>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-4 transition-colors duration-200",
                    isDragging ? "border-primary bg-primary/5" : "border-muted",
                    "hover:border-primary/50 hover:bg-muted/50"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {previewUrl ? (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-md"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setPreviewUrl(null);
                          setFormData(prev => ({ ...prev, referencePhoto: null }));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Drag & drop or{" "}
                        <label className="text-primary cursor-pointer hover:underline">
                          browse
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileSelect(file);
                            }}
                          />
                        </label>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Supported formats: JPG, PNG, HEIC
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Search Button */}
            <AnimatePresence>
              {isFormValid && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mt-8"
                >
                  <Button
                    className="w-full md:w-auto"
                    size="lg"
                    onClick={handleSearch}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Search Photos
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Results Section */}
          <Card className="p-8 border-dashed">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold text-muted-foreground">
                Your Matched Photos Will Appear Here
              </h2>
              <div className="h-48 flex items-center justify-center border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">
                  Upload a photo and fill in the required fields to start searching
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default UserOptions;
