import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield, 
  TrendingUp, 
  Landmark, 
  Crosshair, 
  Truck, 
  Plane, 
  Target, 
  Zap, 
  DollarSign, 
  Factory, 
  Vote,
  Atom
} from "lucide-react";

interface ResearchModalProps {
  open: boolean;
  onClose: () => void;
  onStartResearch: (branch: string, technology: string) => void;
  researchPoints: number;
}

const MILITARY_TECH = [
  { id: "basic_infantry", name: "Basic Infantry", cost: 100, icon: Shield, description: "Unlock standard infantry units" },
  { id: "special_forces", name: "Special Forces", cost: 300, icon: Target, description: "Elite combat units with superior training" },
  { id: "tanks", name: "Tank Development", cost: 500, icon: Truck, description: "Unlock armored vehicle production" },
  { id: "aircraft", name: "Aviation Tech", cost: 800, icon: Plane, description: "Develop air force capabilities" },
  { id: "advanced_weapons", name: "Advanced Weapons", cost: 400, icon: Crosshair, description: "Better firearms and artillery" },
  { id: "tactical_doctrine", name: "Tactical Doctrine", cost: 600, icon: Zap, description: "Improved combat effectiveness" },
  { id: "nuclear_weapons", name: "Nuclear Weapons", cost: 2000, icon: Atom, description: "Develop nuclear warheads and delivery systems" },
];

const ECONOMIC_TECH = [
  { id: "banking_system", name: "Banking System", cost: 150, icon: DollarSign, description: "+20% money production" },
  { id: "industrial_efficiency", name: "Industrial Efficiency", cost: 250, icon: Factory, description: "+30% material production" },
  { id: "trade_routes", name: "Trade Routes", cost: 200, icon: TrendingUp, description: "Improved trading capabilities" },
  { id: "economic_policy", name: "Economic Policy", cost: 350, icon: TrendingUp, description: "+25% economic strength" },
  { id: "advanced_manufacturing", name: "Advanced Manufacturing", cost: 500, icon: Factory, description: "+40% production across all sectors" },
];

const POLITICAL_TECH = [
  { id: "basic_governance", name: "Basic Governance", cost: 100, icon: Landmark, description: "+10 stability" },
  { id: "democracy", name: "Democratic Systems", cost: 300, icon: Vote, description: "+20 stability, reduced coup risk" },
  { id: "propaganda", name: "Propaganda", cost: 200, icon: Landmark, description: "+15 stability during crises" },
  { id: "intelligence_agency", name: "Intelligence Agency", cost: 400, icon: Target, description: "Counter insurgency operations" },
  { id: "diplomacy", name: "Advanced Diplomacy", cost: 350, icon: Landmark, description: "Better trade deals and alliances" },
];

export function ResearchModal({ open, onClose, onStartResearch, researchPoints }: ResearchModalProps) {
  const [selectedBranch, setSelectedBranch] = useState<string>("military");
  const [selectedTech, setSelectedTech] = useState<string>("");

  const handleStartResearch = () => {
    if (selectedTech && selectedBranch) {
      onStartResearch(selectedBranch, selectedTech);
      setSelectedTech("");
      onClose();
    }
  };

  const getTechList = (branch: string) => {
    switch (branch) {
      case "military": return MILITARY_TECH;
      case "economic": return ECONOMIC_TECH;
      case "political": return POLITICAL_TECH;
      default: return [];
    }
  };

  const techList = getTechList(selectedBranch);
  const selectedTechData = techList.find(t => t.id === selectedTech);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Research & Development</DialogTitle>
          <DialogDescription>
            Invest research points to unlock new technologies
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
          <Zap className="w-5 h-5 text-yellow-600" />
          <span className="font-semibold">Available Research Points:</span>
          <Badge variant="secondary" className="ml-auto" data-testid="available-research-points">
            {researchPoints.toFixed(0)}
          </Badge>
        </div>

        <Tabs value={selectedBranch} onValueChange={setSelectedBranch} className="flex-1">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="military" data-testid="tab-military-research">
              <Shield className="w-4 h-4 mr-2" />
              Military
            </TabsTrigger>
            <TabsTrigger value="economic" data-testid="tab-economic-research">
              <TrendingUp className="w-4 h-4 mr-2" />
              Economic
            </TabsTrigger>
            <TabsTrigger value="political" data-testid="tab-political-research">
              <Landmark className="w-4 h-4 mr-2" />
              Political
            </TabsTrigger>
          </TabsList>

          {["military", "economic", "political"].map((branch) => (
            <TabsContent key={branch} value={branch} className="mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="grid grid-cols-2 gap-3">
                  {getTechList(branch).map((tech) => {
                    const canAfford = researchPoints >= tech.cost;
                    const isSelected = selectedTech === tech.id;
                    
                    return (
                      <Card 
                        key={tech.id}
                        className={`cursor-pointer transition-all ${isSelected ? "ring-2 ring-primary" : "hover-elevate"}`}
                        onClick={() => setSelectedTech(tech.id)}
                        data-testid={`research-tech-${tech.id}`}
                      >
                        <CardHeader className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <tech.icon className="w-5 h-5 text-primary" />
                              <CardTitle className="text-sm">{tech.name}</CardTitle>
                            </div>
                            <Badge 
                              variant={canAfford ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {tech.cost} RP
                            </Badge>
                          </div>
                          <CardDescription className="text-xs mt-2">
                            {tech.description}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="button-cancel-research">
            Cancel
          </Button>
          <Button 
            onClick={handleStartResearch} 
            disabled={!selectedTech || (selectedTechData ? researchPoints < selectedTechData.cost : true)}
            data-testid="button-confirm-research"
          >
            Start Research
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
