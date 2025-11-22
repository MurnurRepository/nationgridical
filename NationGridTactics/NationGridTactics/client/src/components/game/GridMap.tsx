import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Territory, Structure } from "@shared/schema";
import { 
  Building2, 
  Factory, 
  Landmark, 
  Users, 
  Shield, 
  Droplet, 
  Gem, 
  FlaskConical, 
  Rocket, 
  Atom, 
  Wheat 
} from "lucide-react";

interface GridMapProps {
  territories: Territory[];
  structures: Structure[];
  onTerritoryClick: (territory: Territory) => void;
  selectedTerritoryId?: string;
  playerCountryId: string;
}

const GRID_SIZE = 50;

const STRUCTURE_ICONS: Record<string, any> = {
  bank: DollarSign,
  farm: Wheat,
  political_office: Landmark,
  city: Users,
  factory: Factory,
  military_base: Shield,
  oil_rig: Droplet,
  mine: Gem,
  research_center: FlaskConical,
  missile_silo: Rocket,
  rocket_silo: Rocket,
  nuclear_power_plant: Atom,
};

import { DollarSign } from "lucide-react";

export function GridMap({ territories, structures, onTerritoryClick, selectedTerritoryId, playerCountryId }: GridMapProps) {
  const [hoveredTerritoryId, setHoveredTerritoryId] = useState<string | null>(null);

  const gridData = useMemo(() => {
    const grid: Map<string, { territory: Territory; structure?: Structure }> = new Map();
    
    territories.forEach((territory) => {
      const key = `${territory.x},${territory.y}`;
      grid.set(key, { territory });
    });

    structures.forEach((structure) => {
      const territory = territories.find((t) => t.id === structure.territoryId);
      if (territory) {
        const key = `${territory.x},${territory.y}`;
        const existing = grid.get(key);
        if (existing) {
          grid.set(key, { ...existing, structure });
        }
      }
    });

    return grid;
  }, [territories, structures]);

  const { minX, maxX, minY, maxY } = useMemo(() => {
    if (territories.length === 0) {
      return { minX: 0, maxX: 10, minY: 0, maxY: 10 };
    }
    const xs = territories.map(t => t.x);
    const ys = territories.map(t => t.y);
    return {
      minX: Math.min(...xs) - 5,
      maxX: Math.max(...xs) + 5,
      minY: Math.min(...ys) - 5,
      maxY: Math.max(...ys) + 5,
    };
  }, [territories]);

  const rows = [];
  for (let y = minY; y <= maxY; y++) {
    const cells = [];
    for (let x = minX; x <= maxX; x++) {
      const key = `${x},${y}`;
      const data = gridData.get(key);
      const isOwned = data?.territory?.countryId === playerCountryId;
      const isSelected = data?.territory?.id === selectedTerritoryId;
      const isHovered = data?.territory?.id === hoveredTerritoryId;
      
      const StructureIcon = data?.structure ? STRUCTURE_ICONS[data.structure.type] : null;

      cells.push(
        <button
          key={key}
          data-testid={`grid-cell-${x}-${y}`}
          onClick={() => data?.territory && onTerritoryClick(data.territory)}
          onMouseEnter={() => data?.territory && setHoveredTerritoryId(data.territory.id)}
          onMouseLeave={() => setHoveredTerritoryId(null)}
          className={cn(
            "aspect-square border transition-all relative group",
            data?.territory 
              ? isOwned 
                ? "bg-primary/20 border-primary/40 hover:bg-primary/30 cursor-pointer" 
                : "bg-destructive/10 border-destructive/30 hover:bg-destructive/20 cursor-pointer"
              : "bg-muted/20 border-border/30 cursor-default",
            isSelected && "ring-4 ring-primary ring-offset-2 ring-offset-background",
            isHovered && !isSelected && "scale-105 ring-2 ring-primary/50"
          )}
        >
          {data?.structure && StructureIcon && (
            <div className="absolute inset-0 flex items-center justify-center">
              <StructureIcon className={cn(
                "w-4 h-4",
                isOwned ? "text-primary" : "text-destructive"
              )} />
            </div>
          )}
          {data?.territory?.cityName && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full border border-background" 
                 title={data.territory.cityName} />
          )}
        </button>
      );
    }
    rows.push(
      <div key={y} className="grid grid-cols-[repeat(auto-fit,minmax(24px,1fr))] gap-0.5">
        {cells}
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto p-4 bg-background">
      <div className="inline-block min-w-full">
        <div className="grid gap-0.5">
          {rows}
        </div>
      </div>
    </div>
  );
}
