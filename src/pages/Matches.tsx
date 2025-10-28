import Navbar from "@/components/Navbar";
import MatchCard from "@/components/MatchCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Matches = () => {
  const liveMatches = [
    {
      team1: { name: "Mumbai Tigers", logo: "🐅", score: 185 },
      team2: { name: "Delhi Warriors", logo: "⚔️", score: 142 },
      time: "Live Now",
      venue: "Wankhede Stadium",
      status: "live" as const,
      prize: "$10,000",
    },
    {
      team1: { name: "Punjab Strikers", logo: "⚡" },
      team2: { name: "Rajasthan Royals", logo: "👑" },
      time: "Live Now",
      venue: "PCA Stadium",
      status: "live" as const,
      prize: "$8,000",
    },
  ];

  const upcomingMatches = [
    {
      team1: { name: "Chennai Knights", logo: "🛡️" },
      team2: { name: "Kolkata Kings", logo: "👑" },
      time: "8:00 PM Today",
      venue: "Eden Gardens",
      status: "upcoming" as const,
      prize: "$15,000",
    },
    {
      team1: { name: "Bangalore Bulls", logo: "🐂" },
      team2: { name: "Hyderabad Hawks", logo: "🦅" },
      time: "Tomorrow 3:00 PM",
      venue: "Chinnaswamy Stadium",
      status: "upcoming" as const,
      prize: "$12,000",
    },
    {
      team1: { name: "Gujarat Giants", logo: "🦁" },
      team2: { name: "Lucknow Lions", logo: "🦁" },
      time: "Tomorrow 7:00 PM",
      venue: "Narendra Modi Stadium",
      status: "upcoming" as const,
      prize: "$20,000",
    },
  ];

  const completedMatches = [
    {
      team1: { name: "Chennai Knights", logo: "🛡️", score: 195 },
      team2: { name: "Mumbai Tigers", logo: "🐅", score: 188 },
      time: "Yesterday",
      venue: "MA Chidambaram",
      status: "completed" as const,
      prize: "$10,000",
    },
    {
      team1: { name: "Delhi Warriors", logo: "⚔️", score: 176 },
      team2: { name: "Kolkata Kings", logo: "👑", score: 180 },
      time: "2 days ago",
      venue: "Arun Jaitley Stadium",
      status: "completed" as const,
      prize: "$12,000",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              All Matches
            </h1>
            <p className="text-xl text-muted-foreground">
              Join contests and compete with millions of players
            </p>
          </div>

          <Tabs defaultValue="live" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8 bg-card border border-border">
              <TabsTrigger value="live" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Live
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Completed
              </TabsTrigger>
            </TabsList>

            <TabsContent value="live" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveMatches.map((match, index) => (
                  <MatchCard key={index} {...match} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="upcoming" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingMatches.map((match, index) => (
                  <MatchCard key={index} {...match} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedMatches.map((match, index) => (
                  <MatchCard key={index} {...match} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Matches;
