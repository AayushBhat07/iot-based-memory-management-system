
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
import { Calendar, Plus, Upload, Image as ImageIcon, Video } from "lucide-react";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Event = Tables<"events">;

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

const PhotographerEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [newEvent, setNewEvent] = useState({
    name: "",
    location: "",
    date: new Date().toISOString().split('T')[0],
    type: "custom" as const,
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
        .eq('photographer_id', sessionData.session.user.id)
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
          type: newEvent.type,
          photographer_id: sessionData.session.user.id
        })
        .select()
        .single();

      if (eventError) {
        throw eventError;
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
        type: "custom",
      });
      
      fetchEvents(); // Refresh the events list
      
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create event",
        variant: "destructive",
      });
    }
  };

  const handleUpload = async () => {
    if (!files || files.length === 0 || !selectedEvent) {
      toast({
        title: "No files selected",
        description: "Please select files to upload",
        variant: "destructive",
      });
      return;
    }

    const filesToUpload: UploadingFile[] = Array.from(files).map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    }));
    setUploadingFiles(filesToUpload);

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i].file;
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !sessionData.session) {
          throw new Error("You must be logged in to upload files");
        }

        const mediaType = file.type.startsWith('image/') ? 'image' : 
                       file.type.startsWith('video/') ? 'video' : null;

        if (!mediaType) {
          throw new Error(`Unsupported file type: ${file.type}`);
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${selectedEvent.id}/${Date.now()}-${i}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('event-media')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from('event-media')
          .getPublicUrl(fileName);

        const { error: mediaError } = await supabase
          .from('media')
          .insert({
            event_id: selectedEvent.id,
            url: publicUrlData.publicUrl,
            media_type: mediaType,
            filename: file.name,
            size: file.size,
            mime_type: file.type,
            metadata: {
              originalName: file.name,
              uploadedBy: sessionData.session.user.id
            }
          });

        if (mediaError) {
          throw mediaError;
        }

        setUploadingFiles(prev => prev.map((item, index) => 
          index === i ? { ...item, progress: 100, status: 'completed' } : item
        ));

      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        setUploadingFiles(prev => prev.map((item, index) => 
          index === i ? { ...item, status: 'error' } : item
        ));

        toast({
          title: "Upload Error",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }
    }

    const successfulUploads = uploadingFiles.filter(f => f.status === 'completed').length;
    if (successfulUploads > 0) {
      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${successfulUploads} files`,
      });
      setFiles(null);
      setUploadingFiles([]);
    }
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsUploadModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
      setUploadingFiles([]);
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
                  <Label htmlFor="type">Event Type</Label>
                  <Select
                    value={newEvent.type}
                    onValueChange={(value: typeof newEvent.type) => 
                      setNewEvent(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wedding">Wedding</SelectItem>
                      <SelectItem value="birthday">Birthday</SelectItem>
                      <SelectItem value="conference">Conference</SelectItem>
                      <SelectItem value="formal_event">Formal Event</SelectItem>
                      <SelectItem value="college_event">College Event</SelectItem>
                      <SelectItem value="photoshoot">Photoshoot</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No events found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents.map((event) => (
                    <TableRow key={event.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{formatDate(event.date)}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleEventClick(event)}
                          className="text-left hover:text-primary transition-colors"
                        >
                          {event.name}
                        </button>
                      </TableCell>
                      <TableCell>{event.location}</TableCell>
                      <TableCell className="capitalize">{event.type?.replace('_', ' ')}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEventClick(event)}
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

      {/* Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Upload Media - {selectedEvent?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-12 h-12 mb-4 text-primary" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Images (JPG, PNG) and Videos (MP4, MOV)
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  disabled={uploadingFiles.some(f => f.status === 'uploading')}
                />
              </label>
            </div>

            {files && files.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  <span>{files.length} files selected</span>
                </div>
                
                {uploadingFiles.map((file, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate">{file.file.name}</span>
                      <span className={cn(
                        "text-xs",
                        file.status === 'completed' ? "text-green-500" :
                        file.status === 'error' ? "text-red-500" :
                        "text-muted-foreground"
                      )}>
                        {file.status === 'completed' ? 'Completed' :
                         file.status === 'error' ? 'Failed' :
                         'Uploading...'}
                      </span>
                    </div>
                    <Progress value={file.progress} />
                  </div>
                ))}

                <Button
                  onClick={handleUpload}
                  disabled={uploadingFiles.some(f => f.status === 'uploading')}
                  className="w-full"
                >
                  {uploadingFiles.some(f => f.status === 'uploading')
                    ? "Uploading..."
                    : "Upload Files"}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhotographerEvents;

const cn = (...inputs: (string | boolean | undefined | null)[]): string => {
  return inputs.filter(Boolean).join(" ");
};
