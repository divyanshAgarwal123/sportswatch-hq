import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import MatchCard from "@/components/MatchCard";
import StatsCard from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Target, TrendingUp, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const liveMatches = [
    {
      team1: { name: "India", logo: "🇮🇳", score: 287 },
      team2: { name: "Australia", logo: "🇦🇺", score: 245 },
      time: "Live Now - Day 3",
      venue: "Melbourne Cricket Ground",
      status: "live" as const,
      prize: "$100,000",
    },
  ];

  const upcomingMatches = [
    {
      team1: { name: "England", logo: "🏴󐁧󐁢󐁥󐁮󐁧󐁿" },
      team2: { name: "Pakistan", logo: "🇵🇰" },
      time: "Tomorrow 2:00 PM",
      venue: "Lord's Cricket Ground",
      status: "upcoming" as const,
      prize: "$85,000",
    },
    {
      team1: { name: "New Zealand", logo: "🇳🇿" },
      team2: { name: "South Africa", logo: "🇿🇦" },
      time: "Dec 5, 10:00 AM",
      venue: "Eden Park, Auckland",
      status: "upcoming" as const,
      prize: "$75,000",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Welcome back, {session?.user?.user_metadata?.full_name || "Champion"}!
              </h1>
              <p className="text-muted-foreground">
                Track your performance and join new contests
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatsCard
              title="Total Points"
              value="12,458"
              icon={Trophy}
              trend="+12.5%"
              trendUp={true}
            />
            <StatsCard
              title="Contests Joined"
              value="47"
              icon={Target}
              trend="+3 this week"
              trendUp={true}
            />
            <StatsCard
              title="Rank"
              value="#342"
              icon={TrendingUp}
              trend="+58 positions"
              trendUp={true}
            />
            <StatsCard
              title="Winnings"
              value="$2,450"
              icon={Users}
              trend="+$350 today"
              trendUp={true}
            />
          </div>

          {/* Live Matches */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Live Matches</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveMatches.map((match, index) => (
                <MatchCard key={index} {...match} />
              ))}
            </div>
          </div>

          {/* Upcoming Matches */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Upcoming Matches</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingMatches.map((match, index) => (
                <MatchCard key={index} {...match} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
