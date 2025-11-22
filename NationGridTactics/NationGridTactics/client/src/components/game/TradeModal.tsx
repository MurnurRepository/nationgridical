import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Country } from "@shared/schema";

interface TradeModalProps {
  open: boolean;
  onClose: () => void;
  onProposeTrade: (targetCountryId: string, offer: any, request: any) => void;
  countries: Country[];
  currentCountryId: string;
}

const RESOURCE_TYPES = [
  { value: "money", label: "Money" },
  { value: "oil", label: "Oil" },
  { value: "minerals", label: "Minerals" },
  { value: "materials", label: "Materials" },
  { value: "food", label: "Food" },
  { value: "uranium", label: "Uranium" },
];

export function TradeModal({ open, onClose, onProposeTrade, countries, currentCountryId }: TradeModalProps) {
  const [targetCountryId, setTargetCountryId] = useState<string>("");
  const [offerResource, setOfferResource] = useState<string>("");
  const [offerAmount, setOfferAmount] = useState<string>("");
  const [requestResource, setRequestResource] = useState<string>("");
  const [requestAmount, setRequestAmount] = useState<string>("");

  const availableCountries = countries.filter(c => c.id !== currentCountryId);

  const handlePropose = () => {
    if (targetCountryId && offerResource && offerAmount && requestResource && requestAmount) {
      const offer = { [offerResource]: parseFloat(offerAmount) };
      const request = { [requestResource]: parseFloat(requestAmount) };
      onProposeTrade(targetCountryId, offer, request);
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setTargetCountryId("");
    setOfferResource("");
    setOfferAmount("");
    setRequestResource("");
    setRequestAmount("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Propose Trade</DialogTitle>
          <DialogDescription>
            Exchange resources with other nations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="target-country">Trade Partner</Label>
            <Select value={targetCountryId} onValueChange={setTargetCountryId}>
              <SelectTrigger data-testid="select-trade-partner">
                <SelectValue placeholder="Select a nation" />
              </SelectTrigger>
              <SelectContent>
                {availableCountries.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-base">You Offer</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="offer-resource">Resource</Label>
                  <Select value={offerResource} onValueChange={setOfferResource}>
                    <SelectTrigger data-testid="select-offer-resource">
                      <SelectValue placeholder="Select resource" />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOURCE_TYPES.map((resource) => (
                        <SelectItem key={resource.value} value={resource.value}>
                          {resource.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offer-amount">Amount</Label>
                  <Input
                    id="offer-amount"
                    data-testid="input-offer-amount"
                    type="number"
                    placeholder="0"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    min="0"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-base">You Request</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="request-resource">Resource</Label>
                  <Select value={requestResource} onValueChange={setRequestResource}>
                    <SelectTrigger data-testid="select-request-resource">
                      <SelectValue placeholder="Select resource" />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOURCE_TYPES.map((resource) => (
                        <SelectItem key={resource.value} value={resource.value}>
                          {resource.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="request-amount">Amount</Label>
                  <Input
                    id="request-amount"
                    data-testid="input-request-amount"
                    type="number"
                    placeholder="0"
                    value={requestAmount}
                    onChange={(e) => setRequestAmount(e.target.value)}
                    min="0"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="button-cancel-trade">
            Cancel
          </Button>
          <Button 
            onClick={handlePropose}
            disabled={!targetCountryId || !offerResource || !offerAmount || !requestResource || !requestAmount}
            data-testid="button-propose-trade"
          >
            Propose Trade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
