import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Edit, Settings, Image, List, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/utils";

const Dashboard = () => {
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/photographer/login");
      }
    };
    checkSession();
  }, [navigate]);

  // Fetch photographer profile
  const { data: profile } = useQuery({
    queryKey: ["photographer-profile"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      // First try to get the existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      // If profile doesn't exist, create it
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

  // Fetch statistics with demo data fallback
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
      
      // If no data, return demo data
      if (!data || data.length === 0) {
        const currentDate = new Date();
        const demoData = [];
        for (let i = 0; i < 12; i++) {
          const date = new Date(currentDate);
          date.setMonth(date.getMonth() - i);
          demoData.push({
            month_year: date.toISOString().slice(0, 7), // Format: YYYY-MM
            events_created: Math.floor(Math.random() * 8) + 2, // Random number between 2-10
            photos_uploaded: Math.floor(Math.random() * 200) + 100, // Random number between 100-300
            completion_rate: Math.floor(Math.random() * 30) + 70, // Random number between 70-100
            avg_photos_per_event: Math.floor(Math.random() * 30) + 20, // Random number between 20-50
          });
        }
        return demoData;
      }

      return data;
    },
  });

  // Fetch upcoming events
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
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Photographer Dashboard</h1>
              <p className="text-muted-foreground">
                Member since {formatDate(profile?.created_at || new Date())}
              </p>
            </div>
            <Button 
              size="lg"
              onClick={() => navigate("/photographer/upload")}
            >
              <Plus className="mr-2" />
              Create New Event
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Statistics Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Events"
            value={statistics?.[0]?.events_created || 0}
            className="bg-purple-50 dark:bg-purple-900/10"
          />
          <StatCard
            title="Photos Uploaded"
            value={statistics?.[0]?.photos_uploaded || 0}
            className="bg-blue-50 dark:bg-blue-900/10"
          />
          <StatCard
            title="Completion Rate"
            value={`${statistics?.[0]?.completion_rate || 0}%`}
            className="bg-green-50 dark:bg-green-900/10"
          />
          <StatCard
            title="Avg Photos/Event"
            value={statistics?.[0]?.avg_photos_per_event || 0}
            className="bg-orange-50 dark:bg-orange-900/10"
          />
        </div>

        {/* Events Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Events Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {lastThreeMonths.map((stat, index) => {
                const prevMonth = lastThreeMonths[index + 1];
                const trend = prevMonth 
                  ? calculateTrend(stat.events_created, prevMonth.events_created)
                  : 0;

                return (
                  <Card key={stat.month_year} className="border-none shadow-none bg-muted/30">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            {new Date(stat.month_year).toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                          </p>
                          <h3 className="text-2xl font-bold mt-1">
                            {stat.events_created} Events
                          </h3>
                          {prevMonth && (
                            <p className={`text-sm mt-1 flex items-center gap-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                              {Math.abs(trend).toFixed(1)}% from previous month
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {upcomingEvents?.map((event) => (
            <Card key={event.id}>
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

        {/* Quick Actions */}
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
  <Card className={className}>
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
    className="transition-transform hover:scale-105 cursor-pointer"
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
