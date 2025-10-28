import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

const StatsCard = ({ title, value, icon: Icon, trend, trendUp }: StatsCardProps) => {
  return (
    <Card className="group relative overflow-hidden bg-gradient-to-br from-card to-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-[0_8px_30px_hsl(var(--primary)/0.2)]">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity" />
      
      <div className="p-6 relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-foreground mb-2">{value}</h3>
            {trend && (
              <p className={`text-sm font-medium ${trendUp ? 'text-secondary' : 'text-destructive'}`}>
                {trendUp ? '↗' : '↘'} {trend}
              </p>
            )}
          </div>
          <div className="bg-gradient-to-br from-primary to-accent p-3 rounded-lg group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)] transition-all duration-300">
            <Icon className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;
