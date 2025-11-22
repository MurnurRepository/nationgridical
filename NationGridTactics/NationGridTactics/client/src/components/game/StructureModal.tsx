import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DollarSign, 
  Wheat, 
  Landmark, 
  Users, 
  Factory, 
  Shield, 
  Droplet, 
  Gem, 
  FlaskConical, 
  Rocket, 
  Atom, 
  Package, 
  AlertCircle 
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StructureModalProps {
  open: boolean;
  onClose: () => void;
  onBuild: (structureType: string) => void;
  resources: any;
}

const STRUCTURE_REQUIREMENTS = {
  bank: { materials: 100, money: 5000, icon: DollarSign, color: "text-green-600", description: "Generates money over time" },
  farm: { materials: 50, money: 2000, food: 20, icon: Wheat, color: "text-lime-600", description: "Produces food and increases population" },
  political_office: { materials: 80, money: 8000, icon: Landmark, color: "text-purple-600", description: "Increases stability and unlocks policies" },
  city: { materials: 200, money: 15000, food: 100, icon: Users, color: "text-blue-600", description: "Major population and manpower boost" },
  factory: { materials: 150, money: 10000, oil: 50, icon: Factory, color: "text-orange-600", description: "Produces materials and advanced goods" },
  military_base: { materials: 180, money: 12000, icon: Shield, color: "text-red-600", description: "Trains units and stores military equipment" },
  oil_rig: { materials: 120, money: 8000, icon: Droplet, color: "text-amber-600", description: "Extracts oil from the ground" },
  mine: { materials: 100, money: 6000, icon: Gem, color: "text-gray-600", description: "Extracts minerals from the earth" },
  research_center: { materials: 200, money: 20000, icon: FlaskConical, color: "text-cyan-600", description: "Generates research points" },
  missile_silo: { materials: 300, money: 50000, uranium: 10, icon: Rocket, color: "text-red-700", description: "Launches conventional missiles" },
  rocket_silo: { materials: 350, money: 60000, uranium: 15, icon: Rocket, color: "text-red-800", description: "Launches long-range rockets" },
  nuclear_power_plant: { materials: 500, money: 100000, uranium: 50, icon: Atom, color: "text-emerald-600", description: "Generates massive energy and money" },
};

export function StructureModal({ open, onClose, onBuild, resources }: StructureModalProps) {
  const [selectedType, setSelectedType] = useState<string>("");

  const canAfford = (type: string) => {
    const req = STRUCTURE_REQUIREMENTS[type as keyof typeof STRUCTURE_REQUIREMENTS];
    if (!req || !resources) return false;
    
    if (req.materials && resources.materials < req.materials) return false;
    if (req.money && resources.money < req.money) return false;
    if (req.food && resources.food < req.food) return false;
    if (req.oil && resources.oil < req.oil) return false;
    if (req.uranium && resources.uranium < req.uranium) return false;
    
    return true;
  };

  const handleBuild = () => {
    if (selectedType && canAfford(selectedType)) {
      onBuild(selectedType);
      setSelectedType("");
      onClose();
    }
  };

  const selectedStructure = selectedType ? STRUCTURE_REQUIREMENTS[selectedType as keyof typeof STRUCTURE_REQUIREMENTS] : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Build Structure</DialogTitle>
          <DialogDescription>
            Select a structure to build on your selected territory
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="structure-type">Structure Type</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger data-testid="select-structure-type">
                <SelectValue placeholder="Choose a structure" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STRUCTURE_REQUIREMENTS).map(([key, { icon: Icon, color }]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span className="capitalize">{key.replace(/_/g, " ")}</span>
                      {!canAfford(key) && (
                        <span className="text-xs text-destructive">(Can't afford)</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStructure && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <selectedStructure.icon className={`w-6 h-6 ${selectedStructure.color}`} />
                  <div>
                    <CardTitle className="capitalize">{selectedType.replace(/_/g, " ")}</CardTitle>
                    <CardDescription>{selectedStructure.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Requirements:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedStructure.materials && (
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="w-4 h-4 text-orange-600" />
                        <span>Materials: </span>
                        <span className={resources?.materials >= selectedStructure.materials ? "text-green-600" : "text-destructive"}>
                          {selectedStructure.materials}
                        </span>
                      </div>
                    )}
                    {selectedStructure.money && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span>Money: </span>
                        <span className={resources?.money >= selectedStructure.money ? "text-green-600" : "text-destructive"}>
                          ${selectedStructure.money.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedStructure.food && (
                      <div className="flex items-center gap-2 text-sm">
                        <Wheat className="w-4 h-4 text-lime-600" />
                        <span>Food: </span>
                        <span className={resources?.food >= selectedStructure.food ? "text-green-600" : "text-destructive"}>
                          {selectedStructure.food}
                        </span>
                      </div>
                    )}
                    {selectedStructure.oil && (
                      <div className="flex items-center gap-2 text-sm">
                        <Droplet className="w-4 h-4 text-amber-600" />
                        <span>Oil: </span>
                        <span className={resources?.oil >= selectedStructure.oil ? "text-green-600" : "text-destructive"}>
                          {selectedStructure.oil}
                        </span>
                      </div>
                    )}
                    {selectedStructure.uranium && (
                      <div className="flex items-center gap-2 text-sm">
                        <Atom className="w-4 h-4 text-emerald-600" />
                        <span>Uranium: </span>
                        <span className={resources?.uranium >= selectedStructure.uranium ? "text-green-600" : "text-destructive"}>
                          {selectedStructure.uranium}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {!canAfford(selectedType) && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Insufficient resources to build this structure
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="button-cancel-build">
            Cancel
          </Button>
          <Button 
            onClick={handleBuild} 
            disabled={!selectedType || !canAfford(selectedType)}
            data-testid="button-confirm-build"
          >
            Build Structure
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
