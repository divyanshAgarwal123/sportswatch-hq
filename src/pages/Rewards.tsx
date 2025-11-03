import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Coins, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Reward {
  id: string;
  brand: string;
  title: string;
  description: string;
  couponCode: string;
  tokenCost: number;
  logo: string;
  discount: string;
}

const rewards: Reward[] = [
  {
    id: "1",
    brand: "Nike",
    title: "Nike Sports Gear",
    description: "Get 30% off on all sports equipment and apparel",
    couponCode: "NIKE30SPORTS",
    tokenCost: 100,
    logo: "🏃",
    discount: "30% OFF"
  },
  {
    id: "2",
    brand: "Adidas",
    title: "Adidas Athletics",
    description: "Save 25% on premium athletic wear and footwear",
    couponCode: "ADIDAS25SAVE",
    tokenCost: 80,
    logo: "👟",
    discount: "25% OFF"
  },
  {
    id: "3",
    brand: "Amazon",
    title: "Amazon Gift Card",
    description: "$50 Amazon gift card for your shopping needs",
    couponCode: "AMZ50GIFT2024",
    tokenCost: 200,
    logo: "🛒",
    discount: "$50 Value"
  },
  {
    id: "4",
    brand: "Spotify",
    title: "Spotify Premium",
    description: "3 months of Spotify Premium subscription",
    couponCode: "SPOT3MOPREM",
    tokenCost: 150,
    logo: "🎵",
    discount: "3 Months"
  },
  {
    id: "5",
    brand: "McDonald's",
    title: "McDonald's Meals",
    description: "Free Big Mac Meal with any purchase",
    couponCode: "MCD2024MEAL",
    tokenCost: 50,
    logo: "🍔",
    discount: "Free Meal"
  },
  {
    id: "6",
    brand: "Starbucks",
    title: "Starbucks Coffee",
    description: "Buy 1 Get 1 Free on any beverage",
    couponCode: "SBUX2024BOGO",
    tokenCost: 60,
    logo: "☕",
    discount: "BOGO"
  }
];

const Rewards = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState(0);
  const [redeemedRewards, setRedeemedRewards] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session) {
          navigate("/auth");
        } else {
          fetchUserTokens(session.user.id);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      } else {
        fetchUserTokens(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserTokens = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("tokens")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching tokens:", error);
      return;
    }

    if (data) {
      setTokens(data.tokens);
    }
  };

  const handleRedeem = async (reward: Reward) => {
    if (!session?.user?.id) return;

    if (tokens < reward.tokenCost) {
      toast({
        title: "Insufficient Tokens",
        description: `You need ${reward.tokenCost} tokens to redeem this reward. You have ${tokens} tokens.`,
        variant: "destructive",
      });
      return;
    }

    // Deduct tokens
    const { error } = await supabase
      .from("profiles")
      .update({ tokens: tokens - reward.tokenCost })
      .eq("id", session.user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to redeem reward. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setTokens(tokens - reward.tokenCost);
    setRedeemedRewards([...redeemedRewards, reward.id]);

    toast({
      title: "Reward Redeemed!",
      description: `You've successfully redeemed ${reward.brand} coupon!`,
    });
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Rewards Store
                </h1>
                <p className="text-muted-foreground">
                  Redeem your tokens for exclusive coupons and offers
                </p>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-br from-primary/20 to-accent/20 px-6 py-3 rounded-lg border border-primary/30">
                <Coins className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold text-foreground">{tokens}</span>
                <span className="text-sm text-muted-foreground">Tokens</span>
              </div>
            </div>
          </div>

          {/* Rewards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => {
              const isRedeemed = redeemedRewards.includes(reward.id);
              const canAfford = tokens >= reward.tokenCost;

              return (
                <Card key={reward.id} className="group relative overflow-hidden hover:shadow-[0_8px_30px_hsl(var(--primary)/0.2)] transition-all duration-300">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity" />
                  
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-5xl">{reward.logo}</div>
                      <Badge variant="secondary" className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                        {reward.discount}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{reward.brand}</CardTitle>
                    <CardDescription>{reward.title}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {reward.description}
                    </p>

                    <div className="relative">
                      <div className={`bg-gradient-to-r from-muted to-muted/50 p-4 rounded-lg border border-border ${!isRedeemed ? 'blur-sm select-none' : ''}`}>
                        <p className="text-xs text-muted-foreground mb-1">Coupon Code</p>
                        <p className="font-mono font-bold text-lg tracking-wider">
                          {reward.couponCode}
                        </p>
                      </div>
                      {!isRedeemed && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Gift className="w-8 h-8 text-primary" />
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-primary">
                      <Coins className="w-4 h-4" />
                      <span className="font-bold">{reward.tokenCost}</span>
                      <span className="text-xs text-muted-foreground">tokens</span>
                    </div>

                    {isRedeemed ? (
                      <Button disabled className="gap-2 bg-secondary hover:bg-secondary">
                        <Check className="w-4 h-4" />
                        Redeemed
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleRedeem(reward)}
                        disabled={!canAfford}
                        className="gap-2"
                      >
                        <Gift className="w-4 h-4" />
                        {canAfford ? 'Redeem' : 'Not Enough Tokens'}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rewards;
