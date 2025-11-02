import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Trophy } from "lucide-react";

interface Team {
  name: string;
  logo: string;
  score?: number;
}

interface MatchCardProps {
  team1: Team;
  team2: Team;
  time: string;
  venue: string;
  status: "live" | "upcoming" | "completed";
  prize?: string;
}

const MatchCard = ({ team1, team2, time, venue, status, prize }: MatchCardProps) => {
  const navigate = useNavigate();
  
  const statusColors = {
    live: "bg-destructive text-destructive-foreground animate-pulse",
    upcoming: "bg-secondary text-secondary-foreground",
    completed: "bg-muted text-muted-foreground",
  };

  return (
    <Card className="group relative overflow-hidden bg-gradient-to-br from-card to-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[0_8px_30px_hsl(var(--primary)/0.2)]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="p-6 relative">
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-4">
          <Badge className={statusColors[status]}>
            {status === "live" && "🔴 "}
            {status.toUpperCase()}
          </Badge>
          {prize && (
            <span className="text-sm font-semibold text-accent">
              Prize Pool: {prize}
            </span>
          )}
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between mb-6">
          {/* Team 1 */}
          <div className="flex flex-col items-center flex-1">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-2 border-2 border-border group-hover:border-primary/50 transition-colors">
              <span className="text-2xl font-bold">{team1.logo}</span>
            </div>
            <h3 className="text-sm font-semibold text-foreground text-center">{team1.name}</h3>
            {team1.score !== undefined && (
              <p className="text-2xl font-bold text-primary mt-1">{team1.score}</p>
            )}
          </div>

          {/* VS */}
          <div className="px-4">
            <span className="text-muted-foreground font-bold text-lg">VS</span>
          </div>

          {/* Team 2 */}
          <div className="flex flex-col items-center flex-1">
            <div className="w-16 h-16 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full flex items-center justify-center mb-2 border-2 border-border group-hover:border-primary/50 transition-colors">
              <span className="text-2xl font-bold">{team2.logo}</span>
            </div>
            <h3 className="text-sm font-semibold text-foreground text-center">{team2.name}</h3>
            {team2.score !== undefined && (
              <p className="text-2xl font-bold text-secondary mt-1">{team2.score}</p>
            )}
          </div>
        </div>

        {/* Match Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4 pb-4 border-b border-border">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span className="truncate max-w-[120px]">{venue}</span>
          </div>
        </div>

        {/* Action Buttons */}
        {status === "completed" ? (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="default" className="w-full" size="lg">
              View Results
            </Button>
            <Button 
              variant="outline" 
              className="w-full gap-2" 
              size="lg"
              onClick={() => navigate("/leaderboard")}
            >
              <Trophy className="w-4 h-4" />
              Leaderboard
            </Button>
          </div>
        ) : (
          <Button 
            variant={status === "live" ? "premium" : "default"} 
            className="w-full"
            size="lg"
            onClick={() => navigate(`/match/${team1.name}-vs-${team2.name}`)}
          >
            {status === "live" ? "Join Now" : "Create Team"}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default MatchCard;
