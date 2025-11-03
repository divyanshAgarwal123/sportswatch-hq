import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, TrendingUp, Users, LogOut, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import StatsCard from "@/components/StatsCard";

const Profile = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [tokens, setTokens] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session) {
          navigate("/auth");
        } else {
          setUsername(session.user?.user_metadata?.username || "");
          setFullName(session.user?.user_metadata?.full_name || "");
          fetchUserTokens(session.user.id);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      } else {
        setUsername(session.user?.user_metadata?.username || "");
        setFullName(session.user?.user_metadata?.full_name || "");
        fetchUserTokens(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserTokens = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("tokens")
      .eq("id", userId)
      .single();
    if (data) setTokens(data.tokens);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate("/");
  };

  const handleUpdateProfile = async () => {
    if (!session) return;

    const { error } = await supabase.auth.updateUser({
      data: {
        username,
        full_name: fullName,
      },
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } else {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      setIsEditing(false);
    }
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const recentMatches = [
    { match: "Mumbai Tigers vs Delhi Warriors", points: 285, rank: 24, prize: "$50" },
    { match: "Chennai Knights vs Kolkata Kings", points: 312, rank: 12, prize: "$150" },
    { match: "Bangalore Bulls vs Hyderabad Hawks", points: 267, rank: 45, prize: "$25" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="p-8 mb-8 bg-gradient-to-br from-primary/10 via-card to-secondary/10">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="w-32 h-32 border-4 border-primary/20">
                <AvatarImage src="" />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  {getInitials(fullName || username || "User")}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {fullName || username || "User"}
                </h1>
                <p className="text-muted-foreground mb-1">{session?.user?.email}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Member since {new Date(session?.user?.created_at || "").toLocaleDateString()}
                </p>
                
                {/* Free Credits Display */}
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-accent/20 px-4 py-2 rounded-lg border border-primary/30">
                  <Trophy className="w-5 h-5 text-primary" />
                  <div className="text-left">
                    <div className="text-xs text-muted-foreground">Available Credits</div>
                    <div className="text-2xl font-bold text-primary">{tokens}</div>
                  </div>
                  {tokens >= 100 && (
                    <Badge className="bg-accent/20 text-accent border-accent/30">
                      Free Signup Bonus!
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
                <Button variant="outline" onClick={handleLogout} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </div>
          </Card>

          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stats">Statistics</TabsTrigger>
              <TabsTrigger value="recent">Recent Matches</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="stats" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                  title="Current Rank"
                  value="#342"
                  icon={TrendingUp}
                  trend="+58 positions"
                  trendUp={true}
                />
                <StatsCard
                  title="Total Winnings"
                  value="$2,450"
                  icon={Users}
                  trend="+$350 today"
                  trendUp={true}
                />
              </div>
            </TabsContent>

            <TabsContent value="recent" className="mt-6">
              <div className="space-y-4">
                {recentMatches.map((match, idx) => (
                  <Card key={idx} className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{match.match}</h3>
                        <p className="text-sm text-muted-foreground">
                          Rank #{match.rank} • {match.points} points
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{match.prize}</div>
                        <div className="text-sm text-muted-foreground">Prize Won</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-6">Profile Settings</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={session?.user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Choose a username"
                    />
                  </div>

                  {isEditing && (
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleUpdateProfile}>Save Changes</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
