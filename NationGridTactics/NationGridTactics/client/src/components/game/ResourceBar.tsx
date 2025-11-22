import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  DollarSign, 
  Users, 
  Zap, 
  TrendingUp, 
  Shield, 
  Droplet, 
  Gem, 
  Package, 
  Wheat, 
  Atom 
} from "lucide-react";
import type { Resources } from "@shared/schema";

interface ResourceBarProps {
  resources: Resources | undefined;
}

export function ResourceBar({ resources }: ResourceBarProps) {
  const resourceItems = [
    { 
      icon: DollarSign, 
      label: "Money", 
      value: resources?.money?.toLocaleString() ?? "0", 
      color: "text-green-600 dark:text-green-400" 
    },
    { 
      icon: Users, 
      label: "Population", 
      value: resources?.population?.toLocaleString() ?? "0", 
      color: "text-blue-600 dark:text-blue-400" 
    },
    { 
      icon: TrendingUp, 
      label: "Manpower", 
      value: resources?.manpower?.toLocaleString() ?? "0", 
      color: "text-purple-600 dark:text-purple-400" 
    },
    { 
      icon: Zap, 
      label: "Research", 
      value: resources?.researchPoints?.toFixed(0) ?? "0", 
      color: "text-yellow-600 dark:text-yellow-400" 
    },
    { 
      icon: Shield, 
      label: "Stability", 
      value: `${resources?.stability?.toFixed(0) ?? "100"}%`, 
      color: resources && resources.stability < 50 
        ? "text-red-600 dark:text-red-400" 
        : "text-cyan-600 dark:text-cyan-400" 
    },
    { 
      icon: Droplet, 
      label: "Oil", 
      value: resources?.oil?.toFixed(0) ?? "0", 
      color: "text-amber-700 dark:text-amber-500" 
    },
    { 
      icon: Gem, 
      label: "Minerals", 
      value: resources?.minerals?.toFixed(0) ?? "0", 
      color: "text-gray-600 dark:text-gray-400" 
    },
    { 
      icon: Package, 
      label: "Materials", 
      value: resources?.materials?.toFixed(0) ?? "0", 
      color: "text-orange-600 dark:text-orange-400" 
    },
    { 
      icon: Wheat, 
      label: "Food", 
      value: resources?.food?.toFixed(0) ?? "0", 
      color: "text-lime-600 dark:text-lime-400" 
    },
    { 
      icon: Atom, 
      label: "Uranium", 
      value: resources?.uranium?.toFixed(0) ?? "0", 
      color: "text-emerald-600 dark:text-emerald-400" 
    },
  ];

  return (
    <div className="h-16 bg-card/95 backdrop-blur-sm border-b border-card-border flex items-center px-4 gap-4">
      <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary/10">
        <Shield className="w-5 h-5 text-primary" />
        <span className="font-display font-bold text-sm text-primary">COMMAND NATIONS</span>
      </div>
      <Separator orientation="vertical" className="h-8" />
      <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {resourceItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted/50 min-w-fit"
            data-testid={`resource-${item.label.toLowerCase()}`}
          >
            <item.icon className={`w-4 h-4 ${item.color}`} />
            <span className="text-xs font-medium text-muted-foreground">{item.label}:</span>
            <span className="text-sm font-bold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
