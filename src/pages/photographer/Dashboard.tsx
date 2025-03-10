import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Edit, Settings, Image, List, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/utils";
import { EventsBarChart } from "./components/EventsBarChart";
import { EventsLineChart } from "./components/EventsLineChart";
import { CompletionPieChart } from "./components/CompletionPieChart";
import { EventCalendar } from "./components/EventCalendar";
import { TodoList } from "./components/TodoList";
import { motion } from "framer-motion";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/photographer/login");
      }
    };
    checkSession();
  }, [navigate]);

  const { data: profile } = useQuery({
    queryKey: ["photographer-profile"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!existingProfile) {
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert([
            { 
              id: session.user.id,
              role: 'photographer',
            }
          ])
          .select()
          .single();

        if (insertError) throw insertError;
        return newProfile;
      }

      return existingProfile;
    },
  });

  const { data: statistics } = useQuery({
    queryKey: ["photographer-statistics"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from("photographer_statistics")
        .select("*")
        .eq("photographer_id", session.user.id)
        .order("month_year", { ascending: false })
        .limit(12);

      if (error) throw error;
      
      if (!data || data.length === 0) {
        const currentDate = new Date();
        const demoData = [];
        for (let i = 0; i < 12; i++) {
          const date = new Date(currentDate);
          date.setMonth(date.getMonth() - i);
          demoData.push({
            month_year: date.toISOString().slice(0, 7),
            events_created: Math.floor(Math.random() * 8) + 2,
            photos_uploaded: Math.floor(Math.random() * 200) + 100,
            completion_rate: Math.floor(Math.random() * 30) + 70,
            avg_photos_per_event: Math.floor(Math.random() * 30) + 20,
          });
        }
        return demoData;
      }

      return data;
    },
  });

  const { data: upcomingEvents } = useQuery({
    queryKey: ["upcoming-events"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gte("event_date", new Date().toISOString().split('T')[0])
        .order("event_date", { ascending: true })
        .limit(4);

      if (error) throw error;
      return data;
    },
  });

  const lastThreeMonths = (statistics || []).slice(0, 3);
  const calculateTrend = (current: number, previous: number) => {
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Photographer Dashboard</h1>
              <p className="text-muted-foreground">
                Member since {formatDate(profile?.created_at || new Date())}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button 
                size="lg"
                onClick={() => navigate("/photographer/upload")}
              >
                <Plus className="mr-2" />
                Create New Event
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{statistics?.[0]?.events_created || 0}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Photos Uploaded</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{statistics?.[0]?.photos_uploaded || 0}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{statistics?.[0]?.completion_rate || 0}%</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Avg Photos/Event</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{statistics?.[0]?.avg_photos_per_event || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Events Overview */}
        <Card className="glass-card mb-6 overflow-hidden">
          <CardHeader className="p-4 sm:p-6 border-b bg-card/50">
            <CardTitle>Events Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
              {/* Charts Section */}
              <div className="lg:col-span-8 grid gap-6">
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <EventsBarChart data={statistics || []} />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <EventsLineChart data={statistics || []} />
                  </motion.div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="w-full"
                >
                  <CompletionPieChart data={statistics || []} />
                </motion.div>
              </div>

              {/* Sidebar Section */}
              <div className="lg:col-span-4 grid gap-6">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <EventCalendar events={upcomingEvents} />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <TodoList />
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {upcomingEvents?.map((event) => (
            <Card key={event.id} className="glass-card hover:glass-card-hover transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg">{event.event_name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {formatDate(event.event_date)}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>Type: {event.event_type}</p>
                  <p>Location: {event.event_location}</p>
                  <p>Status: {event.status}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            icon={Edit}
            title="Edit Profile"
            onClick={() => navigate("/photographer/edit-profile")}
          />
          <QuickActionCard
            icon={List}
            title="View All Events"
            onClick={() => {/* TODO: Implement view all events */}}
          />
          <QuickActionCard
            icon={Image}
            title="Manage Portfolio"
            onClick={() => navigate("/photographer/portfolio")}
          />
          <QuickActionCard
            icon={Settings}
            title="Settings"
            onClick={() => {/* TODO: Implement settings */}}
          />
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ 
  title, 
  value, 
  className 
}: { 
  title: string; 
  value: number | string; 
  className?: string;
}) => (
  <Card className={`glass-card ${className}`}>
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-3xl font-bold">{value}</p>
    </CardContent>
  </Card>
);

const QuickActionCard = ({ 
  icon: Icon, 
  title, 
  onClick 
}: { 
  icon: React.ComponentType<any>;
  title: string;
  onClick: () => void;
}) => (
  <Card 
    className="glass-card hover:glass-card-hover transition-all duration-300 cursor-pointer"
    onClick={onClick}
  >
    <CardContent className="pt-6">
      <div className="flex flex-col items-center gap-4">
        <Icon className="h-8 w-8 text-primary" />
        <h3 className="font-semibold">{title}</h3>
      </div>
    </CardContent>
  </Card>
);

export default Dashboard;
