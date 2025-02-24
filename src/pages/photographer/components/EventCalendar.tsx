
import { Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { motion } from "framer-motion";
import { useState } from "react";

interface Event {
  event_date: string;
  event_name: string;
}

interface EventCalendarProps {
  events?: Event[];
}

export function EventCalendar({ events = [] }: EventCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const eventDates = events?.map(event => new Date(event.event_date)) || [];

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="p-4">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-lg">Event Calendar</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            modifiers={{
              event: eventDates,
            }}
            modifiersStyles={{
              event: {
                color: 'hsl(var(--primary))',
                fontWeight: 'bold'
              }
            }}
            className="rounded-md border shadow-sm"
          />
        </motion.div>
      </CardContent>
    </Card>
  );
}
