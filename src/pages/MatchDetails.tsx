import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Clock, MapPin, Trophy, TrendingUp, Target, Zap, Users } from "lucide-react";
import { toast } from "sonner";

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

  // Mock data - in real app, fetch based on matchId
  const matchData = {
    team1: {
      name: "Warriors",
      logo: "⚔️",
      players: [
        { id: "1", name: "Alex Storm", role: "Attacker", points: 245, credits: 10.5 },
        { id: "2", name: "Mike Thunder", role: "All-rounder", points: 198, credits: 9.0 },
        { id: "3", name: "Sam Shield", role: "Defender", points: 167, credits: 8.5 },
        { id: "4", name: "Chris Bolt", role: "Attacker", points: 221, credits: 10.0 },
        { id: "5", name: "Dave Rock", role: "All-rounder", points: 189, credits: 9.5 },
      ],
      winRate: 75,
      avgScore: 156,
      recentForm: ["W", "W", "L", "W", "W"],
      strengths: ["Strong attack", "Consistent performers", "High win rate"],
    },
    team2: {
      name: "Legends",
      logo: "🏆",
      players: [
        { id: "6", name: "John Blaze", role: "Attacker", points: 267, credits: 11.0 },
        { id: "7", name: "Ryan Swift", role: "All-rounder", points: 203, credits: 9.5 },
        { id: "8", name: "Tom Steel", role: "Defender", points: 178, credits: 8.0 },
        { id: "9", name: "Jake Fire", role: "Attacker", points: 234, credits: 10.5 },
        { id: "10", name: "Ben Wall", role: "Defender", points: 145, credits: 7.5 },
      ],
      winRate: 68,
      avgScore: 149,
      recentForm: ["W", "L", "W", "W", "L"],
      strengths: ["Balanced squad", "Strong defenders", "Good all-rounders"],
    },
    venue: "Arena Stadium",
    time: "Live Now",
    prize: "$50,000",
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

  const handleJoinMatch = () => {
    if (selectedPlayers.length !== 11) {
      toast.error("Please select exactly 11 players");
      return;
    }
    if (totalCredits > maxCredits) {
      toast.error(`Credits exceed limit (${totalCredits.toFixed(1)}/${maxCredits})`);
      return;
    }
    toast.success("Successfully joined the match!");
    navigate("/dashboard");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Match Header */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-primary/10 via-card to-secondary/10">
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-destructive text-destructive-foreground animate-pulse">
              🔴 LIVE NOW
            </Badge>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{matchData.time}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{matchData.venue}</span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-accent" />
                <span className="text-accent font-semibold">{matchData.prize}</span>
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
            <div className="flex items-center justify-between">
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
                onClick={handleJoinMatch}
                disabled={selectedPlayers.length !== 11 || totalCredits > maxCredits}
                className="gap-2"
              >
                <Trophy className="w-4 h-4" />
                Join Match
              </Button>
            </div>
            {selectedPlayers.length > 0 && (
              <Progress 
                value={(selectedPlayers.length / 11) * 100} 
                className="mt-4 h-2"
              />
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
