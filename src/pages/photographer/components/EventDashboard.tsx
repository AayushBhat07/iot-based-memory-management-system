import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, MapPin, Folder, Camera } from "lucide-react";

interface EventDashboardProps {
  onEventCreate: (eventData: {
    name: string;
    date: string;
    location: string;
    type: "birthday" | "wedding" | "photoshoot" | "conference" | "formal_event" | "college_event" | "custom";
  }) => void;
}

export const EventDashboard = ({ onEventCreate }: EventDashboardProps) => {
  const { toast } = useToast();
  const [eventData, setEventData] = useState({
    name: "",
    date: "",
    location: "",
    type: "" as "birthday" | "wedding" | "photoshoot" | "conference" | "formal_event" | "college_event" | "custom",
  });

  const handleSubmit = () => {
    if (!eventData.name || !eventData.date || !eventData.location || !eventData.type) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all fields",
      });
      return;
    }
    onEventCreate(eventData);
  };

  const eventTypes = [
    { label: "Wedding", value: "wedding" },
    { label: "Corporate Event", value: "conference" },
    { label: "Birthday Party", value: "birthday" },
    { label: "Concert", value: "custom" },
    { label: "Sports Event", value: "custom" },
    { label: "Fashion Show", value: "custom" },
    { label: "Other", value: "custom" },
  ] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6 space-y-2">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Folder className="h-5 w-5" />
            <Label className="text-lg font-medium">Event Name</Label>
          </div>
          <Input
            placeholder="Enter event name"
            value={eventData.name}
            onChange={(e) => setEventData({ ...eventData, name: e.target.value })}
            className="bg-white/80 dark:bg-black/20"
          />
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6 space-y-2">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CalendarIcon className="h-5 w-5" />
            <Label className="text-lg font-medium">Event Date</Label>
          </div>
          <Input
            type="date"
            value={eventData.date}
            onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
            className="bg-white/80 dark:bg-black/20"
          />
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6 space-y-2">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <MapPin className="h-5 w-5" />
            <Label className="text-lg font-medium">Event Location</Label>
          </div>
          <Input
            placeholder="Enter location"
            value={eventData.location}
            onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
            className="bg-white/80 dark:bg-black/20"
          />
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6 space-y-2">
          <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
            <Camera className="h-5 w-5" />
            <Label className="text-lg font-medium">Event Type</Label>
          </div>
          <Select
            value={eventData.type}
            onValueChange={(value: typeof eventData.type) => 
              setEventData({ ...eventData, type: value })}
          >
            <SelectTrigger className="bg-white/80 dark:bg-black/20">
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              {eventTypes.map(({ label, value }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="md:col-span-2 flex justify-end">
        <Button 
          size="lg"
          onClick={handleSubmit}
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          Create Event
        </Button>
      </div>
    </div>
  );
};
