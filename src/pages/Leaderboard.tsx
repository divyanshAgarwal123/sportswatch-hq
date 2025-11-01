import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Player {
  id: string;
  username: string;
  avatar_url: string | null;
  total_points: number;
  wins: number;
  matches_played: number;
}

const Leaderboard = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setCurrentUserId(session.user.id);
      await fetchLeaderboard();
    };

    checkAuth();
  }, [navigate]);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("total_points", { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data && data.length > 0) {
        setPlayers(data);
      } else {
        // Generate mock data if no players exist
        const mockPlayers = generateMockPlayers();
        setPlayers(mockPlayers);
      }
    } catch (error: any) {
      console.error("Error fetching leaderboard:", error);
      toast({
        title: "Error loading leaderboard",
        description: "Showing sample data instead",
        variant: "destructive",
      });
      const mockPlayers = generateMockPlayers();
      setPlayers(mockPlayers);
    } finally {
      setLoading(false);
    }
  };

  const generateMockPlayers = (): Player[] => {
    const names = [
      "CricketKing", "BattingMaster", "BowlingLegend", "FieldingPro",
      "PowerHitter", "SpinWizard", "FastBowler", "AllRounder",
      "CaptainCool", "MatchWinner", "BoundaryHunter", "WicketTaker",
      "RunMachine", "SixHitter", "DeathBowler", "OpenerChamp"
    ];

    return names.map((name, index) => ({
      id: `mock-${index}`,
      username: name,
      avatar_url: null,
      total_points: Math.floor(Math.random() * 5000) + 1000,
      wins: Math.floor(Math.random() * 50) + 5,
      matches_played: Math.floor(Math.random() * 100) + 20,
    })).sort((a, b) => b.total_points - a.total_points);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return null;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white";
    if (rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-900";
    if (rank === 3) return "bg-gradient-to-r from-amber-500 to-amber-600 text-white";
    return "bg-muted text-muted-foreground";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Leaderboard
            </h1>
            <p className="text-xl text-muted-foreground">
              Top players competing for glory
            </p>
          </div>

          <Card className="overflow-hidden border-border bg-card">
            <div className="divide-y divide-border">
              {players.map((player, index) => {
                const rank = index + 1;
                const isCurrentUser = player.id === currentUserId;

                return (
                  <div
                    key={player.id}
                    className={`p-4 hover:bg-accent/5 transition-colors ${
                      isCurrentUser ? "bg-primary/5 border-l-4 border-primary" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="flex items-center justify-center w-12">
                        {getRankIcon(rank) || (
                          <Badge className={getRankBadge(rank)}>
                            #{rank}
                          </Badge>
                        )}
                      </div>

                      {/* Avatar */}
                      <Avatar className="h-12 w-12 border-2 border-border">
                        <AvatarImage src={player.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20">
                          {player.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* Player Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground truncate">
                            {player.username}
                          </h3>
                          {isCurrentUser && (
                            <Badge variant="secondary" className="text-xs">
                              You
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {player.wins} wins • {player.matches_played} matches
                        </p>
                      </div>

                      {/* Points */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {player.total_points.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">points</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
