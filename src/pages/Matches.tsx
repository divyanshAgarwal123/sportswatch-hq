import Navbar from "@/components/Navbar";
import MatchCard from "@/components/MatchCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Matches = () => {
  // Real cricket matches with actual team names
  const liveMatches = [
    {
      team1: { name: "India", logo: "🇮🇳", score: 287 },
      team2: { name: "Australia", logo: "🇦🇺", score: 245 },
      time: "Live Now - Day 3",
      venue: "Melbourne Cricket Ground",
      status: "live" as const,
      prize: "$100,000",
    },
    {
      team1: { name: "England", logo: "🏴󐁧󐁢󐁥󐁮󐁧󐁿", score: 312 },
      team2: { name: "Pakistan", logo: "🇵🇰", score: 298 },
      time: "Live Now - 2nd Innings",
      venue: "Lord's Cricket Ground",
      status: "live" as const,
      prize: "$85,000",
    },
  ];

  const upcomingMatches = [
    {
      team1: { name: "New Zealand", logo: "🇳🇿" },
      team2: { name: "South Africa", logo: "🇿🇦" },
      time: "Tomorrow 2:00 PM",
      venue: "Eden Park, Auckland",
      status: "upcoming" as const,
      prize: "$75,000",
    },
    {
      team1: { name: "West Indies", logo: "🏝️" },
      team2: { name: "Sri Lanka", logo: "🇱🇰" },
      time: "Dec 5, 10:00 AM",
      venue: "Kensington Oval",
      status: "upcoming" as const,
      prize: "$65,000",
    },
    {
      team1: { name: "Bangladesh", logo: "🇧🇩" },
      team2: { name: "Afghanistan", logo: "🇦🇫" },
      time: "Dec 7, 3:30 PM",
      venue: "Shere Bangla Stadium",
      status: "upcoming" as const,
      prize: "$50,000",
    },
  ];

  const completedMatches = [
    {
      team1: { name: "India", logo: "🇮🇳", score: 356 },
      team2: { name: "England", logo: "🏴󐁧󐁢󐁥󐁮󐁧󐁿", score: 287 },
      time: "Completed - India won by 69 runs",
      venue: "Wankhede Stadium",
      status: "completed" as const,
      prize: "$120,000",
    },
    {
      team1: { name: "Australia", logo: "🇦🇺", score: 298 },
      team2: { name: "South Africa", logo: "🇿🇦", score: 265 },
      time: "Completed - Australia won by 33 runs",
      venue: "Sydney Cricket Ground",
      status: "completed" as const,
      prize: "$95,000",
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
