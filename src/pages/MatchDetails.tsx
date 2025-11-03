import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Clock, MapPin, Trophy, TrendingUp, Target, Zap, Users, BarChart3, Activity } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

interface Player {
  id: string;
  name: string;
  role: string;
  points: number;
  credits: number;
}

interface TeamStats {
  name: string;
  logo: string;
  players: Player[];
  winRate: number;
  avgScore: number;
  recentForm: string[];
  strengths: string[];
}

const MatchDetails = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [userTokens, setUserTokens] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [teamId, setTeamId] = useState<string | null>(null);
  const ENTRY_FEE = 1; // Credits required to join match

  useEffect(() => {
    fetchUserTokens();
  }, []);

  const fetchUserTokens = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("tokens")
        .eq("id", user.id)
        .single();
      if (data) setUserTokens(data.tokens);
    }
  };

  // Real cricket players data
  const matchData = {
    team1: {
      name: "India",
      logo: "🇮🇳",
      players: [
        { id: "1", name: "Rohit Sharma", role: "Batsman", points: 287, credits: 11.5 },
        { id: "2", name: "Virat Kohli", role: "Batsman", points: 312, credits: 12.0 },
        { id: "3", name: "KL Rahul", role: "Wicket-keeper", points: 245, credits: 10.0 },
        { id: "4", name: "Hardik Pandya", role: "All-rounder", points: 256, credits: 10.5 },
        { id: "5", name: "Ravindra Jadeja", role: "All-rounder", points: 234, credits: 9.5 },
        { id: "6", name: "Jasprit Bumrah", role: "Bowler", points: 198, credits: 10.0 },
        { id: "7", name: "Mohammed Shami", role: "Bowler", points: 176, credits: 9.0 },
        { id: "8", name: "Rishabh Pant", role: "Wicket-keeper", points: 267, credits: 10.5 },
        { id: "9", name: "Ravichandran Ashwin", role: "All-rounder", points: 223, credits: 9.5 },
        { id: "10", name: "Shubman Gill", role: "Batsman", points: 189, credits: 9.0 },
        { id: "11", name: "Axar Patel", role: "All-rounder", points: 167, credits: 8.5 },
      ],
      winRate: 72,
      avgScore: 285,
      recentForm: ["W", "W", "L", "W", "W"],
      strengths: ["Strong batting lineup", "World-class spinners", "Excellent fielding"],
    },
    team2: {
      name: "Australia",
      logo: "🇦🇺",
      players: [
        { id: "12", name: "Steve Smith", role: "Batsman", points: 298, credits: 11.5 },
        { id: "13", name: "David Warner", role: "Batsman", points: 276, credits: 11.0 },
        { id: "14", name: "Marnus Labuschagne", role: "Batsman", points: 254, credits: 10.0 },
        { id: "15", name: "Glenn Maxwell", role: "All-rounder", points: 243, credits: 10.5 },
        { id: "16", name: "Pat Cummins", role: "Bowler", points: 212, credits: 10.5 },
        { id: "17", name: "Mitchell Starc", role: "Bowler", points: 189, credits: 9.5 },
        { id: "18", name: "Josh Hazlewood", role: "Bowler", points: 178, credits: 9.0 },
        { id: "19", name: "Alex Carey", role: "Wicket-keeper", points: 198, credits: 9.0 },
        { id: "20", name: "Travis Head", role: "Batsman", points: 234, credits: 10.0 },
        { id: "21", name: "Cameron Green", role: "All-rounder", points: 201, credits: 9.5 },
        { id: "22", name: "Nathan Lyon", role: "Bowler", points: 167, credits: 8.5 },
      ],
      winRate: 68,
      avgScore: 272,
      recentForm: ["W", "L", "W", "W", "L"],
      strengths: ["Aggressive batting", "Pace attack", "Match-winning all-rounders"],
    },
    venue: "Melbourne Cricket Ground",
    time: "Live Now",
    prize: "$100,000",
  };

  const togglePlayerSelection = (player: Player) => {
    if (selectedPlayers.find(p => p.id === player.id)) {
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
    } else if (selectedPlayers.length < 11) {
      setSelectedPlayers([...selectedPlayers, player]);
    } else {
      toast.error("Maximum 11 players allowed");
    }
  };

  const totalCredits = selectedPlayers.reduce((sum, p) => sum + p.credits, 0);
  const maxCredits = 100;

  const handleJoinMatch = async () => {
    if (selectedPlayers.length !== 11) {
      toast.error("Please select exactly 11 players");
      return;
    }
    if (totalCredits > maxCredits) {
      toast.error(`Credits exceed limit (${totalCredits.toFixed(1)}/${maxCredits})`);
      return;
    }
    if (userTokens < ENTRY_FEE) {
      toast.error(`Insufficient tokens! You need ${ENTRY_FEE} tokens but have ${userTokens}`);
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to join match");
        navigate("/auth");
        return;
      }

      // Deduct entry fee
      const { data: deductResult, error: deductError } = await supabase.rpc(
        "deduct_tokens_for_team",
        { _user_id: user.id, _amount: ENTRY_FEE }
      );

      if (deductError || !deductResult) {
        toast.error("Failed to deduct tokens. Please try again.");
        return;
      }

      // Create team for this match
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .insert({
          user_id: user.id,
          team_name: `Team for ${matchId}`,
          match_id: matchId || "match-1",
        })
        .select()
        .single();

      if (teamError) {
        // Refund tokens if team creation fails
        await supabase.rpc("add_tokens", { _user_id: user.id, _amount: ENTRY_FEE });
        toast.error("Failed to join match. Please try again.");
        return;
      }

      // Add players to team
      const teamPlayers = selectedPlayers.map(player => ({
        team_id: team.id,
        player_name: player.name,
        player_role: player.role,
        points: 0,
      }));

      const { error: playersError } = await supabase
        .from("team_players")
        .insert(teamPlayers);

      if (playersError) {
        toast.error("Failed to add players. Please try again.");
        return;
      }

      toast.success(`Successfully joined the match! ${ENTRY_FEE} token deducted.`);
      setHasJoined(true);
      setTeamId(team.id);
      await fetchUserTokens(); // Refresh token balance
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const TeamAnalytics = ({ team }: { team: TeamStats }) => (
    <div className="space-y-6">
      {/* Team Overview */}
      <Card className="p-6 bg-gradient-to-br from-card to-card/80">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center text-3xl">
            {team.logo}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">{team.name}</h3>
            <p className="text-muted-foreground">Team Statistics</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>Win Rate</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">{team.winRate}%</span>
              </div>
              <Progress value={team.winRate} className="h-2" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="w-4 h-4" />
              <span>Avg Score</span>
            </div>
            <div className="text-2xl font-bold text-secondary">{team.avgScore}</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Zap className="w-4 h-4" />
            <span>Recent Form</span>
          </div>
          <div className="flex gap-2">
            {team.recentForm.map((result, idx) => (
              <Badge
                key={idx}
                className={result === "W" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}
              >
                {result}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="text-sm text-muted-foreground mb-2">Key Strengths</div>
          <div className="flex flex-wrap gap-2">
            {team.strengths.map((strength, idx) => (
              <Badge key={idx} variant="outline">{strength}</Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* Players List */}
      <div className="space-y-3">
        <h4 className="font-semibold text-foreground flex items-center gap-2">
          <Users className="w-4 h-4" />
          Squad Players
        </h4>
        {team.players.map((player) => {
          const isSelected = selectedPlayers.some(p => p.id === player.id);
          return (
            <Card
              key={player.id}
              className={`p-4 cursor-pointer transition-all hover:border-primary/50 ${
                isSelected ? "border-primary bg-primary/5" : ""
              }`}
              onClick={() => togglePlayerSelection(player)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-semibold text-foreground">{player.name}</h5>
                  <p className="text-sm text-muted-foreground">{player.role}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-primary">{player.points} pts</div>
                  <div className="text-xs text-muted-foreground">{player.credits} cr</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  // Player Analysis Component
  const PlayerAnalysis = () => {
    const playerPerformanceData = selectedPlayers.map(player => ({
      name: player.name.split(' ').pop(), // Last name for readability
      points: player.points,
      credits: player.credits * 20, // Scale for visibility
      value: (player.points / player.credits).toFixed(1),
    }));

    const roleDistribution = selectedPlayers.reduce((acc, player) => {
      acc[player.role] = (acc[player.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const roleData = Object.entries(roleDistribution).map(([role, count]) => ({
      role,
      count,
      fullMark: 6,
    }));

    const statsComparison = selectedPlayers.map(player => ({
      subject: player.name.split(' ').pop(),
      A: player.points,
      B: player.credits * 25,
      fullMark: 350,
    }));

    return (
      <div className="space-y-6 mt-6">
        <Card className="p-6 bg-gradient-to-br from-card to-card/80">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-primary to-accent p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">Team Analytics</h3>
              <p className="text-muted-foreground">Performance insights for your selected team</p>
            </div>
          </div>

          <Tabs defaultValue="performance" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="distribution">Role Distribution</TabsTrigger>
              <TabsTrigger value="comparison">Player Comparison</TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="mt-6">
              <div className="bg-background/50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Player Points vs Credits Analysis
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={playerPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="points" fill="hsl(var(--primary))" name="Points" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="credits" fill="hsl(var(--secondary))" name="Credits (x20)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="distribution" className="mt-6">
              <div className="bg-background/50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-foreground mb-4">Team Role Balance</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={roleData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="role" stroke="hsl(var(--foreground))" />
                    <PolarRadiusAxis stroke="hsl(var(--foreground))" />
                    <Radar name="Players" dataKey="count" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="comparison" className="mt-6">
              <div className="bg-background/50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-foreground mb-4">Player Stats Radar</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={statsComparison}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="subject" stroke="hsl(var(--foreground))" />
                    <PolarRadiusAxis stroke="hsl(var(--foreground))" />
                    <Radar name="Points" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                    <Radar name="Value" dataKey="B" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary))" fillOpacity={0.6} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="p-4 bg-primary/10 border-primary/20">
              <div className="text-sm text-muted-foreground mb-1">Total Players</div>
              <div className="text-2xl font-bold text-primary">{selectedPlayers.length}</div>
            </Card>
            <Card className="p-4 bg-secondary/10 border-secondary/20">
              <div className="text-sm text-muted-foreground mb-1">Average Points</div>
              <div className="text-2xl font-bold text-secondary">
                {(selectedPlayers.reduce((sum, p) => sum + p.points, 0) / selectedPlayers.length).toFixed(0)}
              </div>
            </Card>
            <Card className="p-4 bg-accent/10 border-accent/20">
              <div className="text-sm text-muted-foreground mb-1">Total Credits</div>
              <div className="text-2xl font-bold text-accent">{totalCredits.toFixed(1)}</div>
            </Card>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="hero" onClick={() => navigate("/dashboard")} className="flex-1">
              <Trophy className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={() => setHasJoined(false)} className="flex-1">
              Join Another Match
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  if (hasJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-6 mb-6 bg-gradient-to-br from-primary/10 via-card to-secondary/10">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full mb-4">
                <Trophy className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Successfully Joined!</h2>
              <p className="text-muted-foreground">Your team has been registered for {matchData.team1.name} vs {matchData.team2.name}</p>
            </div>
          </Card>
          <PlayerAnalysis />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Match Header */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-primary/10 via-card to-secondary/10">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <Badge className="bg-destructive text-destructive-foreground animate-pulse">
              🔴 LIVE NOW
            </Badge>
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg">
              <Trophy className="w-5 h-5 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">Your Tokens</div>
                <div className="text-xl font-bold text-primary">{userTokens}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{matchData.time}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{matchData.venue}</span>
              </div>
              <div className="flex items-center gap-1 bg-accent/20 px-3 py-1 rounded">
                <Trophy className="w-4 h-4 text-accent" />
                <span className="text-accent font-semibold">Entry: {ENTRY_FEE} tokens</span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-accent" />
                <span className="text-accent font-semibold">Prize: {matchData.prize}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center text-4xl mb-2">
                {matchData.team1.logo}
              </div>
              <h2 className="text-xl font-bold text-foreground">{matchData.team1.name}</h2>
            </div>
            <div className="text-2xl font-bold text-muted-foreground">VS</div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full flex items-center justify-center text-4xl mb-2">
                {matchData.team2.logo}
              </div>
              <h2 className="text-xl font-bold text-foreground">{matchData.team2.name}</h2>
            </div>
          </div>

          {/* Team Selection Summary */}
          <Card className="p-4 bg-card/50">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Selected Players</div>
                <div className="text-2xl font-bold text-foreground">
                  {selectedPlayers.length}/11
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Credits Used</div>
                <div className={`text-2xl font-bold ${totalCredits > maxCredits ? "text-destructive" : "text-primary"}`}>
                  {totalCredits.toFixed(1)}/{maxCredits}
                </div>
              </div>
              <Button
                size="lg"
                variant="hero"
                onClick={handleJoinMatch}
                disabled={loading || selectedPlayers.length !== 11 || totalCredits > maxCredits || userTokens < ENTRY_FEE}
                className="gap-2"
              >
                {loading ? "Joining..." : (
                  <>
                    <Trophy className="w-4 h-4" />
                    Join Match - {ENTRY_FEE} Tokens
                  </>
                )}
              </Button>
            </div>
            
            {/* Selected Players List */}
            {selectedPlayers.length > 0 && (
              <>
                <Progress 
                  value={(selectedPlayers.length / 11) * 100} 
                  className="mt-4 h-2"
                />
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Your Selected Team:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedPlayers.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between bg-primary/10 px-3 py-2 rounded-lg border border-primary/20"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-foreground text-sm">{player.name}</div>
                          <div className="text-xs text-muted-foreground">{player.role}</div>
                        </div>
                        <div className="text-right ml-2">
                          <div className="text-xs font-semibold text-primary">{player.credits} cr</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </Card>
        </Card>

        {/* Team Analytics Tabs */}
        <Tabs defaultValue="team1" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="team1">
              {matchData.team1.logo} {matchData.team1.name}
            </TabsTrigger>
            <TabsTrigger value="team2">
              {matchData.team2.logo} {matchData.team2.name}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="team1" className="mt-6">
            <TeamAnalytics team={matchData.team1} />
          </TabsContent>
          <TabsContent value="team2" className="mt-6">
            <TeamAnalytics team={matchData.team2} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MatchDetails;
