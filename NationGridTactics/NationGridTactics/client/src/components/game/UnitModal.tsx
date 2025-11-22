import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Target, Truck, Plane, Rocket, AlertCircle } from "lucide-react";

interface UnitModalProps {
  open: boolean;
  onClose: () => void;
  onCreateUnit: (unitType: string, quantity: number) => void;
  resources: any;
}

const UNIT_TYPES = {
  infantry: { 
    name: "Infantry", 
    manpowerCost: 100, 
    moneyCost: 1000, 
    icon: Shield, 
    color: "text-blue-600",
    description: "Standard ground forces" 
  },
  special_forces: { 
    name: "Special Forces", 
    manpowerCost: 50, 
    moneyCost: 5000, 
    icon: Target, 
    color: "text-purple-600",
    description: "Elite combat units" 
  },
  tank: { 
    name: "Tank", 
    manpowerCost: 20, 
    moneyCost: 15000, 
    materialsCost: 50, 
    oilCost: 20, 
    icon: Truck, 
    color: "text-gray-600",
    description: "Armored vehicles" 
  },
  apc: { 
    name: "APC", 
    manpowerCost: 15, 
    moneyCost: 10000, 
    materialsCost: 30, 
    oilCost: 15, 
    icon: Truck, 
    color: "text-orange-600",
    description: "Armored personnel carrier" 
  },
  aircraft: { 
    name: "Aircraft", 
    manpowerCost: 10, 
    moneyCost: 50000, 
    materialsCost: 100, 
    oilCost: 50, 
    icon: Plane, 
    color: "text-cyan-600",
    description: "Air superiority fighters" 
  },
  missile: { 
    name: "Missile", 
    manpowerCost: 5, 
    moneyCost: 100000, 
    materialsCost: 200, 
    uraniumCost: 10, 
    icon: Rocket, 
    color: "text-red-600",
    description: "Long-range missiles" 
  },
};

export function UnitModal({ open, onClose, onCreateUnit, resources }: UnitModalProps) {
  const [selectedType, setSelectedType] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");

  const canAfford = (type: string, qty: number) => {
    const unit = UNIT_TYPES[type as keyof typeof UNIT_TYPES];
    if (!unit || !resources) return false;
    
    if (unit.manpowerCost && resources.manpower < unit.manpowerCost * qty) return false;
    if (unit.moneyCost && resources.money < unit.moneyCost * qty) return false;
    if (unit.materialsCost && resources.materials < unit.materialsCost * qty) return false;
    if (unit.oilCost && resources.oil < unit.oilCost * qty) return false;
    if (unit.uraniumCost && resources.uranium < unit.uraniumCost * qty) return false;
    
    return true;
  };

  const handleCreate = () => {
    const qty = parseInt(quantity);
    if (selectedType && qty > 0 && canAfford(selectedType, qty)) {
      onCreateUnit(selectedType, qty);
      setSelectedType("");
      setQuantity("1");
      onClose();
    }
  };

  const selectedUnit = selectedType ? UNIT_TYPES[selectedType as keyof typeof UNIT_TYPES] : null;
  const qty = parseInt(quantity) || 1;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Train Units</DialogTitle>
          <DialogDescription>
            Create military forces to defend and expand your nation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unit-type">Unit Type</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger data-testid="select-unit-type">
                <SelectValue placeholder="Choose a unit type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(UNIT_TYPES).map(([key, { name, icon: Icon, color }]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span>{name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              data-testid="input-unit-quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          {selectedUnit && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <selectedUnit.icon className={`w-6 h-6 ${selectedUnit.color}`} />
                  <div>
                    <CardTitle>{selectedUnit.name}</CardTitle>
                    <CardDescription>{selectedUnit.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Cost per unit (Total for {qty}):</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Manpower: </span>
                      <span className={resources?.manpower >= selectedUnit.manpowerCost * qty ? "text-green-600" : "text-destructive"}>
                        {selectedUnit.manpowerCost} ({selectedUnit.manpowerCost * qty})
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Money: </span>
                      <span className={resources?.money >= selectedUnit.moneyCost * qty ? "text-green-600" : "text-destructive"}>
                        ${selectedUnit.moneyCost.toLocaleString()} (${(selectedUnit.moneyCost * qty).toLocaleString()})
                      </span>
                    </div>
                    {selectedUnit.materialsCost && (
                      <div>
                        <span className="text-muted-foreground">Materials: </span>
                        <span className={resources?.materials >= selectedUnit.materialsCost * qty ? "text-green-600" : "text-destructive"}>
                          {selectedUnit.materialsCost} ({selectedUnit.materialsCost * qty})
                        </span>
                      </div>
                    )}
                    {selectedUnit.oilCost && (
                      <div>
                        <span className="text-muted-foreground">Oil: </span>
                        <span className={resources?.oil >= selectedUnit.oilCost * qty ? "text-green-600" : "text-destructive"}>
                          {selectedUnit.oilCost} ({selectedUnit.oilCost * qty})
                        </span>
                      </div>
                    )}
                    {selectedUnit.uraniumCost && (
                      <div>
                        <span className="text-muted-foreground">Uranium: </span>
                        <span className={resources?.uranium >= selectedUnit.uraniumCost * qty ? "text-green-600" : "text-destructive"}>
                          {selectedUnit.uraniumCost} ({selectedUnit.uraniumCost * qty})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {!canAfford(selectedType, qty) && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Insufficient resources to train {qty} {selectedUnit.name}(s)
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="button-cancel-unit">
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={!selectedType || qty <= 0 || !canAfford(selectedType, qty)}
            data-testid="button-confirm-unit"
          >
            Train Units
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
