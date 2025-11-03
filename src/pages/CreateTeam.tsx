import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Trophy, Users } from "lucide-react";
import Navbar from "@/components/Navbar";

const AVAILABLE_PLAYERS = [
  { name: "Rohit Sharma", role: "Batsman", cost: 15 },
  { name: "Virat Kohli", role: "Batsman", cost: 15 },
  { name: "Jasprit Bumrah", role: "Bowler", cost: 12 },
  { name: "Ravindra Jadeja", role: "All-rounder", cost: 13 },
  { name: "KL Rahul", role: "Wicket-keeper", cost: 11 },
  { name: "Hardik Pandya", role: "All-rounder", cost: 12 },
  { name: "Mohammed Shami", role: "Bowler", cost: 10 },
  { name: "Shubman Gill", role: "Batsman", cost: 11 },
  { name: "Rishabh Pant", role: "Wicket-keeper", cost: 12 },
  { name: "Ravichandran Ashwin", role: "Bowler", cost: 10 },
  { name: "Shreyas Iyer", role: "Batsman", cost: 10 },
  { name: "Axar Patel", role: "All-rounder", cost: 9 },
];

const CreateTeam = () => {
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get("matchId") || "match-1";
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [teamName, setTeamName] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<typeof AVAILABLE_PLAYERS>([]);
  const [tokens, setTokens] = useState(0);
  const [loading, setLoading] = useState(false);

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
      if (data) setTokens(data.tokens);
    }
  };

  const totalCost = selectedPlayers.reduce((sum, player) => sum + player.cost, 0);
  const canAfford = totalCost <= tokens;

  const togglePlayer = (player: typeof AVAILABLE_PLAYERS[0]) => {
    if (selectedPlayers.find(p => p.name === player.name)) {
      setSelectedPlayers(selectedPlayers.filter(p => p.name !== player.name));
    } else {
      if (selectedPlayers.length >= 11) {
        toast({
          title: "Team Full",
          description: "You can only select 11 players",
          variant: "destructive",
        });
        return;
      }
      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      toast({
        title: "Team Name Required",
        description: "Please enter a team name",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlayers.length !== 11) {
      toast({
        title: "Select 11 Players",
        description: "You must select exactly 11 players",
        variant: "destructive",
      });
      return;
    }

    if (!canAfford) {
      toast({
        title: "Insufficient Tokens",
        description: `You need ${totalCost} tokens but only have ${tokens}`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Deduct tokens
      const { data: deductResult, error: deductError } = await supabase.rpc(
        "deduct_tokens_for_team",
        { _user_id: user.id, _amount: totalCost }
      );

      if (deductError || !deductResult) {
        throw new Error("Failed to deduct tokens");
      }

      // Create team
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .insert({
          user_id: user.id,
          team_name: teamName,
          match_id: matchId,
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Add players to team
      const teamPlayers = selectedPlayers.map(player => ({
        team_id: team.id,
        player_name: player.name,
        player_role: player.role,
      }));

      const { error: playersError } = await supabase
        .from("team_players")
        .insert(teamPlayers);

      if (playersError) throw playersError;

      toast({
        title: "Team Created!",
        description: `${teamName} has been created successfully`,
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Create Your Team</h1>
              <p className="text-muted-foreground">Select 11 players to build your fantasy team</p>
            </div>
            <Card className="p-4 bg-primary/10">
              <div className="text-center">
                <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{tokens}</div>
                <div className="text-sm text-muted-foreground">Tokens Available</div>
              </div>
            </Card>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card className="p-6 mb-6">
                <Input
                  placeholder="Enter Team Name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="text-lg"
                />
              </Card>

              <h2 className="text-2xl font-bold mb-4">Available Players</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {AVAILABLE_PLAYERS.map((player) => {
                  const isSelected = selectedPlayers.find(p => p.name === player.name);
                  return (
                    <Card
                      key={player.name}
                      className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                        isSelected ? "border-primary bg-primary/5" : ""
                      }`}
                      onClick={() => togglePlayer(player)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{player.name}</h3>
                          <Badge variant="secondary" className="mt-1">
                            {player.role}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            {player.cost}
                          </div>
                          <div className="text-xs text-muted-foreground">tokens</div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div>
              <Card className="p-6 sticky top-4">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5" />
                  <h2 className="text-xl font-bold">Selected Team</h2>
                </div>

                <div className="space-y-2 mb-6">
                  {selectedPlayers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No players selected yet
                    </p>
                  ) : (
                    selectedPlayers.map((player) => (
                      <div
                        key={player.name}
                        className="flex justify-between items-center p-2 bg-secondary/50 rounded"
                      >
                        <div>
                          <div className="font-medium text-sm">{player.name}</div>
                          <div className="text-xs text-muted-foreground">{player.role}</div>
                        </div>
                        <div className="text-sm font-semibold">{player.cost}</div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Players Selected:</span>
                    <span className="font-semibold">{selectedPlayers.length}/11</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Cost:</span>
                    <span className={`font-semibold ${!canAfford ? "text-destructive" : ""}`}>
                      {totalCost} tokens
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Remaining:</span>
                    <span className="font-semibold">{tokens - totalCost} tokens</span>
                  </div>
                </div>

                <Button
                  className="w-full mt-6"
                  onClick={handleCreateTeam}
                  disabled={loading || selectedPlayers.length !== 11 || !canAfford || !teamName.trim()}
                >
                  {loading ? "Creating..." : "Create Team"}
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTeam;
