
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Event {
  id: string;
  event_name: string;
  event_date: string;
  event_location: string;
}

interface EventSelectProps {
  onEventSelect: (eventId: string) => void;
}

export const EventSelect = ({ onEventSelect }: EventSelectProps) => {
  const { data: events = [] } = useQuery({
    queryKey: ['photographer-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, event_name, event_date, event_location')
        .eq('photographer_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('status', 'published');

      if (error) throw error;
      return data as Event[];
    }
  });

  return (
    <div className="space-y-4">
      <Select onValueChange={onEventSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select an event" />
        </SelectTrigger>
        <SelectContent>
          {events.map((event) => (
            <SelectItem key={event.id} value={event.id}>
              <div className="flex flex-col gap-1">
                <span className="font-medium">{event.event_name}</span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(event.event_date).toLocaleDateString()}</span>
                  <MapPin className="h-3 w-3 ml-2" />
                  <span>{event.event_location}</span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
