import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FlaskConical, 
  TrendingUp, 
  Users as UsersIcon, 
  Bell, 
  ArrowLeftRight 
} from "lucide-react";
import type { Research, Event, Country } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface RightPanelProps {
  research: Research[];
  events: Event[];
  countries: Country[];
  onStartResearch: () => void;
  onOpenTrade: () => void;
}

export function RightPanel({ research, events, countries, onStartResearch, onOpenTrade }: RightPanelProps) {
  const researchByBranch = research.reduce((acc, r) => {
    if (!acc[r.branch]) acc[r.branch] = [];
    acc[r.branch].push(r);
    return acc;
  }, {} as Record<string, Research[]>);

  const recentEvents = events.slice(0, 10);

  return (
    <div className="h-full flex flex-col border-l border-border bg-card/50">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-display font-bold uppercase tracking-wide">Intelligence</h2>
      </div>
      <Tabs defaultValue="research" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-4 mx-4 my-2">
          <TabsTrigger value="research" data-testid="tab-research">
            <FlaskConical className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="trade" data-testid="tab-trade">
            <ArrowLeftRight className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="events" data-testid="tab-events">
            <Bell className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="players" data-testid="tab-players">
            <UsersIcon className="w-4 h-4" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="research" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <Button onClick={onStartResearch} className="w-full" data-testid="button-start-research">
                <FlaskConical className="w-4 h-4 mr-2" />
                Research Technology
              </Button>
              
              {["military", "economic", "political"].map((branch) => (
                <Card key={branch}>
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm capitalize">{branch} Research</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-2">
                    {researchByBranch[branch]?.map((r) => (
                      <div key={r.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium">{r.technology}</span>
                          <Badge variant="outline" className="text-xs">Lv {r.level}</Badge>
                        </div>
                        {r.inProgress && (
                          <Progress value={r.progress} className="h-1" />
                        )}
                      </div>
                    )) || (
                      <p className="text-xs text-muted-foreground">No research started</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="trade" className="flex-1 m-0">
          <div className="p-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Trade Resources</CardTitle>
                <CardDescription>Exchange goods with other nations</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={onOpenTrade} className="w-full" data-testid="button-open-trade">
                  <ArrowLeftRight className="w-4 h-4 mr-2" />
                  Initiate Trade
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {recentEvents.map((event) => (
                <Card key={event.id} className="hover-elevate" data-testid={`event-${event.id}`}>
                  <CardHeader className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm">{event.message}</CardTitle>
                      <Badge 
                        variant={event.severity === "high" ? "destructive" : event.severity === "medium" ? "default" : "secondary"}
                        className="text-xs shrink-0"
                      >
                        {event.severity}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
              {recentEvents.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Bell className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No recent events</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="players" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {countries.map((country) => (
                <Card key={country.id} className="hover-elevate" data-testid={`country-${country.id}`}>
                  <CardHeader className="p-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{country.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {formatDistanceToNow(new Date(country.createdAt), { addSuffix: true })}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      Capital: {country.capitalCityName}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
