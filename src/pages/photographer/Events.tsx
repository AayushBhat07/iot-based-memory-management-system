
import { useState, useEffect } from "react";
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
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

type Event = Tables<"events">;

const PhotographerEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
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
          console.log("Fetched events:", data);
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

    fetchEvents();
  }, [navigate, toast]);

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
          <Button 
            onClick={() => navigate("/photographer/upload")}
            className="w-full md:w-auto"
          >
            Create New Event
          </Button>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No events found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents.map((event) => (
                    <TableRow key={event.id} className="hover:bg-muted/50 cursor-pointer">
                      <TableCell className="font-medium">{formatDate(event.date)}</TableCell>
                      <TableCell>{event.name}</TableCell>
                      <TableCell>{event.location}</TableCell>
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
