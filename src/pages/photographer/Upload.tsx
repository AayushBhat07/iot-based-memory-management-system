
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileUpload } from "./components/FileUpload";
import { EventDashboard } from "./components/EventDashboard";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, X, Camera, ImagePlus } from "lucide-react";

type EventType = "birthday" | "wedding" | "photoshoot" | "conference" | "formal_event" | "college_event" | "custom";

const Upload = () => {
  const navigate = useNavigate();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [event, setEvent] = useState<{
    id?: string;
    name: string;
    date: string;
    location: string;
    type: EventType;
  } | null>(null);

  const handleUploadComplete = (urls: string[]) => {
    setUploadedImages(prev => [...prev, ...urls]);
  };

  const handleEventCreate = async (eventData: {
    name: string;
    date: string;
    location: string;
    type: EventType;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('events')
        .insert({
          event_name: eventData.name,
          event_date: eventData.date,
          event_location: eventData.location,
          event_type: eventData.type,
          photographer_id: user.id,
          status: 'published'
        })
        .select()
        .single();

      if (error) throw error;
      setEvent({ ...eventData, id: data.id });
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/photographer/dashboard")}
            className="flex items-center gap-2 hover:bg-background/80"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Camera className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Create New Event
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Set up your event details before uploading photos.
            </p>
          </div>

          {!event && (
            <Card className="p-6 border-dashed bg-card/50 backdrop-blur-sm">
              <EventDashboard onEventCreate={handleEventCreate} />
            </Card>
          )}

          {event && (
            <Card className="p-6 border-dashed bg-card/50 backdrop-blur-sm">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ImagePlus className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Upload Photos</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Upload multiple photos at once. Supported formats: JPG, PNG, WEBP
                  </p>
                </div>
                <FileUpload 
                  onUploadComplete={handleUploadComplete} 
                  eventId={event.id!} 
                  eventName={event.name}
                />
              </div>
            </Card>
          )}

          {uploadedImages.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Uploaded Photos</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {uploadedImages.map((url, index) => (
                  <Card key={url} className="relative group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-2">
                      <img
                        src={url}
                        alt={`Uploaded ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-sm"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;
