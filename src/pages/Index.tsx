import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import MatchCard from "@/components/MatchCard";
import { Trophy, Users, TrendingUp, Zap } from "lucide-react";
import heroImage from "@/assets/hero-sports.jpg";

const Index = () => {
  const featuredMatches = [
    {
      team1: { name: "Mumbai Tigers", logo: "🐅" },
      team2: { name: "Delhi Warriors", logo: "⚔️" },
      time: "6:00 PM Today",
      venue: "Wankhede Stadium",
      status: "live" as const,
      prize: "$10,000",
    },
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
  ];

  const features = [
    {
      icon: Trophy,
      title: "Compete & Win",
      description: "Join tournaments and win amazing prizes",
    },
    {
      icon: Users,
      title: "Create Your Team",
      description: "Build your dream team with top players",
    },
    {
      icon: TrendingUp,
      title: "Track Performance",
      description: "Real-time stats and leaderboards",
    },
    {
      icon: Zap,
      title: "Live Updates",
      description: "Get instant match updates and scores",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Play Fantasy Sports
            <br />
            Win Real Rewards
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200">
            Create your dream team, compete with millions, and win amazing prizes. Join the ultimate fantasy sports experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
            <Link to="/auth">
              <Button variant="hero" size="lg" className="text-lg px-8">
                Get Started Now
              </Button>
            </Link>
            <Link to="/matches">
              <Button variant="outline" size="lg" className="text-lg px-8">
                View Matches
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Matches */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Featured Matches
            </h2>
            <p className="text-muted-foreground">
              Join exciting contests and win big prizes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredMatches.map((match, index) => (
              <MatchCard key={index} {...match} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Why Choose Us?
            </h2>
            <p className="text-muted-foreground">
              Everything you need for the best fantasy sports experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[0_8px_30px_hsl(var(--primary)/0.2)]"
              >
                <div className="bg-gradient-to-br from-primary to-accent p-3 rounded-lg w-fit mb-4 group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)] transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-12 border border-border shadow-[0_8px_30px_hsl(var(--primary)/0.2)]">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Ready to Start Winning?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of players already winning real rewards
            </p>
            <Link to="/auth">
              <Button variant="hero" size="lg" className="text-lg px-12">
                Sign Up Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 FantasySports. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
