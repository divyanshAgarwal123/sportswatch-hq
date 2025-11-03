import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Users, Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Player {
  id: string;
  username: string;
  avatar_url: string | null;
  total_points: number;
  wins: number;
  matches_played: number;
  tokens: number;
}

const Leaderboard = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      // Allow viewing leaderboard without authentication
      if (session) {
        setCurrentUserId(session.user.id);
      }
      await fetchLeaderboard();
    };

    checkAuth();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      // Get total count
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: 'exact', head: true });
      
      setTotalPlayers(count || 0);

      // Fetch top players
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, total_points, wins, matches_played, tokens")
        .order("total_points", { ascending: false })
        .limit(100);

      if (error) throw error;

      if (data && data.length > 0) {
        setPlayers(data);
      } else {
        // No players yet
        setPlayers([]);
      }
    } catch (error: any) {
      console.error("Error fetching leaderboard:", error);
      toast({
        title: "Error loading leaderboard",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Global Leaderboard
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Top players competing for glory
            </p>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
              <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10">
                <div className="flex items-center justify-center gap-3">
                  <Users className="w-8 h-8 text-primary" />
                  <div className="text-left">
                    <div className="text-3xl font-bold text-foreground">{totalPlayers}</div>
                    <div className="text-sm text-muted-foreground">Total Players</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-gradient-to-br from-accent/10 to-primary/10">
                <div className="flex items-center justify-center gap-3">
                  <Trophy className="w-8 h-8 text-accent" />
                  <div className="text-left">
                    <div className="text-3xl font-bold text-foreground">
                      {players.length > 0 ? players[0].total_points.toLocaleString() : 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Top Score</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {players.length === 0 ? (
            <Card className="p-12 text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Players Yet</h3>
              <p className="text-muted-foreground">Be the first to join and compete!</p>
            </Card>
          ) : (
            <Card className="overflow-hidden border-border bg-card">
              <div className="divide-y divide-border">{players.map((player, index) => {
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

                      {/* Stats */}
                      <div className="flex gap-6 items-center">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {player.total_points.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">points</div>
                        </div>
                        
                        <div className="text-right bg-accent/10 px-3 py-2 rounded-lg">
                          <div className="flex items-center gap-1 text-accent font-bold text-lg">
                            <Coins className="w-4 h-4" />
                            {player.tokens}
                          </div>
                          <div className="text-xs text-muted-foreground">tokens</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
