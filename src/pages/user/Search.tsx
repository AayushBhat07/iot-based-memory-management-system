
import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Search, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { motion, AnimatePresence } from "framer-motion";

interface SearchFormValues {
  eventName: string;
  location: string;
  date: Date | undefined;
  referencePhoto: FileList | null;
}

const UserSearch = () => {
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const form = useForm<SearchFormValues>({
    defaultValues: {
      eventName: "",
      location: "",
      date: undefined,
      referencePhoto: null,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setIsPreviewVisible(true);
      form.setValue("referencePhoto", e.target.files);
    }
  };

  const onSubmit = (data: SearchFormValues) => {
    console.log("Search form submitted:", data);
    // Here you would typically make an API call to search for photos
  };

  const isFormValid = form.watch("eventName") && form.watch("date");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl font-semibold bg-gradient-to-r from-primary via-primary/80 to-primary/60 
                      bg-clip-text text-transparent">
            Find Your Photos
          </h1>
          <p className="text-muted-foreground">
            Search through our collection using event details
          </p>
        </div>

        {/* Main Dashboard */}
        <div className="glass-card p-8 rounded-xl backdrop-blur-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Event Name */}
                <FormField
                  control={form.control}
                  name="eventName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter event name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter event location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date Picker */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Event Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Reference Photo Upload */}
                <FormField
                  control={form.control}
                  name="referencePhoto"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>Reference Photo</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="file"
                            accept=".jpg,.jpeg,.png,.heic"
                            onChange={handleImageChange}
                            className="hidden"
                            id="photo-upload"
                            {...field}
                          />
                          <label
                            htmlFor="photo-upload"
                            className="flex min-h-[40px] w-full cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:bg-accent hover:text-accent-foreground"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Drag & Drop or Browse
                          </label>
                          {isPreviewVisible && previewUrl && (
                            <div className="mt-2">
                              <img
                                src={previewUrl}
                                alt="Preview"
                                className="h-20 w-20 rounded object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Search Button */}
              <AnimatePresence>
                {isFormValid && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="flex justify-center mt-8"
                  >
                    <Button
                      type="submit"
                      size="lg"
                      className="bg-primary hover:bg-primary/90 transition-all duration-200 transform hover:scale-105"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Search Photos
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </Form>
        </div>

        {/* Results Section */}
        <div className="mt-16 text-center space-y-8">
          <div className="glass-card p-8 rounded-xl">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-primary to-primary/60 
                         bg-clip-text text-transparent">
              Your Matched Photos Will Appear Here
            </h2>
            <p className="text-muted-foreground mt-2">
              Start your search to discover your photos
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
            {/* Photo results will be rendered here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSearch;
