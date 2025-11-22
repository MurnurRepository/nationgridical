import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Swords, 
  Plus, 
  Factory, 
  Landmark, 
  Users, 
  Shield, 
  Droplet, 
  Gem, 
  FlaskConical, 
  Rocket, 
  Atom, 
  Wheat,
  DollarSign
} from "lucide-react";
import type { Structure, Unit } from "@shared/schema";

interface LeftPanelProps {
  structures: Structure[];
  units: Unit[];
  onBuildStructure: () => void;
  onCreateUnit: () => void;
}

const STRUCTURE_DISPLAY: Record<string, { icon: any; label: string; color: string }> = {
  bank: { icon: DollarSign, label: "Bank", color: "text-green-600" },
  farm: { icon: Wheat, label: "Farm", color: "text-lime-600" },
  political_office: { icon: Landmark, label: "Political Office", color: "text-purple-600" },
  city: { icon: Users, label: "City", color: "text-blue-600" },
  factory: { icon: Factory, label: "Factory", color: "text-orange-600" },
  military_base: { icon: Shield, label: "Military Base", color: "text-red-600" },
  oil_rig: { icon: Droplet, label: "Oil Rig", color: "text-amber-600" },
  mine: { icon: Gem, label: "Mine", color: "text-gray-600" },
  research_center: { icon: FlaskConical, label: "Research Center", color: "text-cyan-600" },
  missile_silo: { icon: Rocket, label: "Missile Silo", color: "text-red-700" },
  rocket_silo: { icon: Rocket, label: "Rocket Silo", color: "text-red-800" },
  nuclear_power_plant: { icon: Atom, label: "Nuclear Plant", color: "text-emerald-600" },
};

export function LeftPanel({ structures, units, onBuildStructure, onCreateUnit }: LeftPanelProps) {
  const structureCounts = structures.reduce((acc, s) => {
    acc[s.type] = (acc[s.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const unitCounts = units.reduce((acc, u) => {
    acc[u.type] = (acc[u.type] || 0) + u.quantity;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="h-full flex flex-col border-r border-border bg-card/50">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-display font-bold uppercase tracking-wide">Command Center</h2>
      </div>
      <Tabs defaultValue="buildings" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-3 mx-4 my-2">
          <TabsTrigger value="buildings" data-testid="tab-buildings">
            <Building2 className="w-4 h-4 mr-2" />
            Buildings
          </TabsTrigger>
          <TabsTrigger value="units" data-testid="tab-units">
            <Swords className="w-4 h-4 mr-2" />
            Units
          </TabsTrigger>
          <TabsTrigger value="deploy" data-testid="tab-deploy">
            <Plus className="w-4 h-4 mr-2" />
            Deploy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buildings" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {Object.entries(STRUCTURE_DISPLAY).map(([type, { icon: Icon, label, color }]) => {
                const count = structureCounts[type] || 0;
                return (
                  <Card key={type} className="hover-elevate">
                    <CardHeader className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-5 h-5 ${color}`} />
                          <CardTitle className="text-sm">{label}</CardTitle>
                        </div>
                        <Badge variant="secondary" data-testid={`structure-count-${type}`}>
                          {count}
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="units" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {Object.entries(unitCounts).map(([type, count]) => (
                <Card key={type} className="hover-elevate">
                  <CardHeader className="p-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm capitalize">{type.replace("_", " ")}</CardTitle>
                      <Badge variant="secondary" data-testid={`unit-count-${type}`}>
                        {count}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))}
              {Object.keys(unitCounts).length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Swords className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No units deployed yet</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="deploy" className="flex-1 m-0">
          <div className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Build Structure</CardTitle>
                <CardDescription>Construct new buildings in your territory</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={onBuildStructure} 
                  className="w-full"
                  data-testid="button-build-structure"
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Build Structure
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Train Units</CardTitle>
                <CardDescription>Create military forces</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={onCreateUnit} 
                  className="w-full"
                  data-testid="button-create-unit"
                >
                  <Swords className="w-4 h-4 mr-2" />
                  Train Units
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
