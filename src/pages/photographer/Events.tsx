
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Upload } from "lucide-react";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type Event = Tables<"events">;

const PhotographerEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: "",
    location: "",
    date: new Date().toISOString().split('T')[0],
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }

      if (!sessionData.session) {
        navigate('/photographer/login');
        return;
      }

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching events:", error);
        toast({
          title: "Error",
          description: "Failed to fetch events. Please try again.",
          variant: "destructive",
        });
      } else {
        setEvents(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error("You must be logged in to create events");
      }

      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert({
          name: newEvent.name,
          location: newEvent.location,
          date: newEvent.date,
          photographer_id: sessionData.session.user.id
        })
        .select()
        .single();

      if (eventError || !eventData) {
        throw eventError || new Error("Failed to create event");
      }

      toast({
        title: "Success",
        description: "Event created successfully",
      });

      setIsCreateEventOpen(false);
      setNewEvent({
        name: "",
        location: "",
        date: new Date().toISOString().split('T')[0],
      });
      
      // Navigate to upload page for the new event
      navigate(`/photographer/upload/${eventData.id}`);
      
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create event",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), "PPP");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const filteredEvents = events.filter((event) => {
    const dateFilter = date
      ? format(new Date(event.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
      : true;
    const searchFilter = event.name.toLowerCase().includes(searchQuery.toLowerCase());
    return dateFilter && searchFilter;
  });

  useEffect(() => {
    fetchEvents();
  }, [navigate, toast]);

  return (
    <div className="container mx-auto py-10 px-4 min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="glass-card p-8 rounded-2xl mb-8">
        <h1 className="text-3xl font-bold text-primary text-center mb-8">Manage Events</h1>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="md:w-[300px]"
            />
          </div>
          <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Create New Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Event Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter event name"
                    value={newEvent.name}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Enter event location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <Button 
                  className="w-full"
                  onClick={handleCreateEvent}
                  disabled={!newEvent.name || !newEvent.location || !newEvent.date}
                >
                  Create Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading events...</p>
        ) : (
          <div className="glass-card rounded-xl overflow-hidden">
            <Table>
              <TableCaption>A list of your events.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No events found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents.map((event) => (
                    <TableRow key={event.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{formatDate(event.date)}</TableCell>
                      <TableCell>{event.name}</TableCell>
                      <TableCell>{event.location}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/photographer/upload/${event.id}`)}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Media
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotographerEvents;

const cn = (...inputs: (string | boolean | undefined | null)[]): string => {
  return inputs.filter(Boolean).join(" ");
};
