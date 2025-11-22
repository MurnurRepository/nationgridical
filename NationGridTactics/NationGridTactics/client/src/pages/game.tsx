import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useWebSocket } from "@/lib/websocket";
import { useToast } from "@/hooks/use-toast";
import { ResourceBar } from "@/components/game/ResourceBar";
import { GridMap } from "@/components/game/GridMap";
import { LeftPanel } from "@/components/game/LeftPanel";
import { RightPanel } from "@/components/game/RightPanel";
import { StructureModal } from "@/components/game/StructureModal";
import { ResearchModal } from "@/components/game/ResearchModal";
import { TradeModal } from "@/components/game/TradeModal";
import { UnitModal } from "@/components/game/UnitModal";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useLocation } from "wouter";
import type { Country, Resources, Territory, Structure, Unit, Research, Event } from "@shared/schema";

export default function Game() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { sendMessage } = useWebSocket();
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string | undefined>();
  const [structureModalOpen, setStructureModalOpen] = useState(false);
  const [researchModalOpen, setResearchModalOpen] = useState(false);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [unitModalOpen, setUnitModalOpen] = useState(false);

  const { data: country } = useQuery<Country>({
    queryKey: ["/api/country"],
  });

  const { data: resources } = useQuery<Resources>({
    queryKey: ["/api/resources"],
  });

  const { data: territories = [] } = useQuery<Territory[]>({
    queryKey: ["/api/territories"],
  });

  const { data: structures = [] } = useQuery<Structure[]>({
    queryKey: ["/api/structures"],
  });

  const { data: units = [] } = useQuery<Unit[]>({
    queryKey: ["/api/units"],
  });

  const { data: research = [] } = useQuery<Research[]>({
    queryKey: ["/api/research"],
  });

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: countries = [] } = useQuery<Country[]>({
    queryKey: ["/api/countries"],
  });

  const buildStructureMutation = useMutation({
    mutationFn: async (data: { territoryId: string; structureType: string }) => {
      return await apiRequest("POST", "/api/structures", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/structures"] });
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      sendMessage({ type: "structure_update" });
      toast({ title: "Structure built successfully" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Failed to build structure", description: error.message });
    },
  });

  const createUnitMutation = useMutation({
    mutationFn: async (data: { unitType: string; quantity: number }) => {
      return await apiRequest("POST", "/api/units", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      sendMessage({ type: "unit_update" });
      toast({ title: "Units trained successfully" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Failed to train units", description: error.message });
    },
  });

  const startResearchMutation = useMutation({
    mutationFn: async (data: { branch: string; technology: string }) => {
      return await apiRequest("POST", "/api/research", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/research"] });
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      toast({ title: "Research started" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Failed to start research", description: error.message });
    },
  });

  const proposeTradeMutation = useMutation({
    mutationFn: async (data: { toCountryId: string; offer: any; request: any }) => {
      return await apiRequest("POST", "/api/trades", data);
    },
    onSuccess: () => {
      toast({ title: "Trade proposed successfully" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Failed to propose trade", description: error.message });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      setLocation("/");
    },
  });

  const handleBuildStructure = (structureType: string) => {
    if (!selectedTerritoryId) {
      toast({ variant: "destructive", title: "Please select a territory first" });
      return;
    }
    buildStructureMutation.mutate({ territoryId: selectedTerritoryId, structureType });
  };

  const handleCreateUnit = (unitType: string, quantity: number) => {
    createUnitMutation.mutate({ unitType, quantity });
  };

  const handleStartResearch = (branch: string, technology: string) => {
    startResearchMutation.mutate({ branch, technology });
  };

  const handleProposeTrade = (toCountryId: string, offer: any, request: any) => {
    proposeTradeMutation.mutate({ toCountryId, offer, request });
  };

  const handleTerritoryClick = (territory: Territory) => {
    if (territory.countryId === country?.id) {
      setSelectedTerritoryId(territory.id);
    } else {
      toast({ 
        variant: "destructive", 
        title: "Cannot select enemy territory",
        description: "You can only build on your own territories"
      });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <ResourceBar resources={resources} />
      
      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 flex-shrink-0">
          <LeftPanel
            structures={structures}
            units={units}
            onBuildStructure={() => {
              if (!selectedTerritoryId) {
                toast({ variant: "destructive", title: "Please select a territory first" });
                return;
              }
              setStructureModalOpen(true);
            }}
            onCreateUnit={() => setUnitModalOpen(true)}
          />
        </div>

        <div className="flex-1 flex flex-col">
          <div className="p-2 border-b border-border bg-card/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="font-display font-bold text-lg" data-testid="country-name">
                {country?.name || "Loading..."}
              </h1>
              {selectedTerritoryId && (
                <span className="text-sm text-muted-foreground">
                  Territory selected - Ready to build
                </span>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => logoutMutation.mutate()}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <GridMap
              territories={territories}
              structures={structures}
              onTerritoryClick={handleTerritoryClick}
              selectedTerritoryId={selectedTerritoryId}
              playerCountryId={country?.id || ""}
            />
          </div>
        </div>

        <div className="w-80 flex-shrink-0">
          <RightPanel
            research={research}
            events={events}
            countries={countries}
            onStartResearch={() => setResearchModalOpen(true)}
            onOpenTrade={() => setTradeModalOpen(true)}
          />
        </div>
      </div>

      <StructureModal
        open={structureModalOpen}
        onClose={() => setStructureModalOpen(false)}
        onBuild={handleBuildStructure}
        resources={resources}
      />

      <ResearchModal
        open={researchModalOpen}
        onClose={() => setResearchModalOpen(false)}
        onStartResearch={handleStartResearch}
        researchPoints={resources?.researchPoints || 0}
      />

      <TradeModal
        open={tradeModalOpen}
        onClose={() => setTradeModalOpen(false)}
        onProposeTrade={handleProposeTrade}
        countries={countries}
        currentCountryId={country?.id || ""}
      />

      <UnitModal
        open={unitModalOpen}
        onClose={() => setUnitModalOpen(false)}
        onCreateUnit={handleCreateUnit}
        resources={resources}
      />
    </div>
  );
}
