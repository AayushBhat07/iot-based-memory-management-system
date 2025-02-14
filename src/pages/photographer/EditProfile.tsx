
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Camera,
  Upload,
  Instagram,
  Linkedin,
  Facebook,
  Twitter,
  Loader2,
  MapPin,
  Phone,
  Globe,
  Mail,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Photography specialties options
const SPECIALTIES = [
  "Wedding",
  "Portrait",
  "Landscape",
  "Event",
  "Fashion",
  "Sports",
  "Wildlife",
  "Street",
  "Architecture",
  "Food",
] as const;

const formSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  professional_title: z.string().min(2, "Title must be at least 2 characters"),
  location: z.string().min(2, "Location is required"),
  contact_email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  website_url: z.string().url("Invalid URL").optional(),
  bio: z.string().max(1000, "Bio must be less than 1000 characters"),
  instagram_url: z.string().url("Invalid URL").optional(),
  linkedin_url: z.string().url("Invalid URL").optional(),
  facebook_url: z.string().url("Invalid URL").optional(),
  twitter_url: z.string().url("Invalid URL").optional(),
  specialties: z.array(z.string()),
  years_experience: z.number().min(0),
  events_completed: z.number().min(0),
});

const EditProfile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      professional_title: "",
      location: "",
      contact_email: "",
      phone: "",
      website_url: "",
      bio: "",
      instagram_url: "",
      linkedin_url: "",
      facebook_url: "",
      twitter_url: "",
      specialties: [],
      years_experience: 0,
      events_completed: 0,
    },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/photographer/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("photographer_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (profile) {
        form.reset(profile);
        setAvatarUrl(profile.avatar_url);
        setCoverPhotoUrl(profile.cover_photo_url);
        calculateProfileCompletion(profile);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load profile",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProfileCompletion = (profile: any) => {
    const fields = Object.keys(formSchema.shape);
    const filledFields = fields.filter(field => Boolean(profile[field]));
    const completion = (filledFields.length / fields.length) * 100;
    setProfileCompletion(Math.round(completion));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("photographer_profiles")
        .upsert({
          id: user.id,
          ...values,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully",
      });
      
      calculateProfileCompletion(values);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save changes",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${type}-${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('photographer-profiles')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('photographer-profiles')
        .getPublicUrl(fileName);

      if (type === 'avatar') {
        setAvatarUrl(publicUrl);
      } else {
        setCoverPhotoUrl(publicUrl);
      }

      const { error: updateError } = await supabase
        .from('photographer_profiles')
        .update({
          [`${type}_url`]: publicUrl,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "Image uploaded",
        description: `Your ${type} photo has been updated`,
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to upload ${type} photo`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary pb-12">
      {/* Cover Photo Section */}
      <div className="relative h-48 md:h-64 w-full overflow-hidden">
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${coverPhotoUrl || '/placeholder.svg'})`,
                transform: `translateY(${window.scrollY * 0.5}px)` 
              }}
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <label className="cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, 'cover')}
                />
                <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm
                               group-hover:bg-white/30 transition-all duration-300">
                  <Upload className="w-6 h-6 text-white" />
                </div>
              </label>
            </div>
          </>
        )}
      </div>

      <div className="container max-w-4xl px-4">
        {/* Profile Picture Section */}
        <div className="relative -mt-20 mb-6">
          <div className="w-32 h-32 mx-auto">
            {isLoading ? (
              <Skeleton className="w-full h-full rounded-full" />
            ) : (
              <div className="relative group">
                <img
                  src={avatarUrl || '/placeholder.svg'}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-4 border-background"
                />
                <label className="absolute inset-0 flex items-center justify-center
                                bg-black/50 rounded-full opacity-0 group-hover:opacity-100
                                transition-opacity duration-300 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'avatar')}
                  />
                  <Camera className="w-6 h-6 text-white" />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Profile Completion */}
        <Card className="p-4 mb-8 bg-white/10 backdrop-blur-md border-white/20">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Profile Completion</h3>
              <span className="text-sm text-muted-foreground">{profileCompletion}%</span>
            </div>
            <Progress value={profileCompletion} className="h-2" />
          </div>
        </Card>

        {/* Form */}
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20">
                  <h2 className="text-2xl font-semibold mb-6">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="professional_title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Professional Photographer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-9" placeholder="City, Country" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contact_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-9" placeholder="email@example.com" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-9" placeholder="+1 (123) 456-7890" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="website_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-9" placeholder="https://example.com" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>
              </motion.div>

              {/* Bio */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20">
                  <h2 className="text-2xl font-semibold mb-6">About Me</h2>
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about yourself and your photography style..."
                            className="min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-right">
                          {field.value?.length || 0}/1000 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>
              </motion.div>

              {/* Social Media */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20">
                  <h2 className="text-2xl font-semibold mb-6">Social Media</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="instagram_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Instagram className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-9" placeholder="Instagram URL" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="linkedin_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-9" placeholder="LinkedIn URL" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="facebook_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facebook</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Facebook className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-9" placeholder="Facebook URL" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="twitter_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twitter</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Twitter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input className="pl-9" placeholder="Twitter URL" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>
              </motion.div>

              {/* Professional Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20">
                  <h2 className="text-2xl font-semibold mb-6">Professional Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="years_experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="events_completed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Events Completed</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>
              </motion.div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="w-full md:w-auto"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
};

export default EditProfile;
