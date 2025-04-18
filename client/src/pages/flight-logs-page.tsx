import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { FlightLog, Aircraft } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  Clock, 
  CloudSun, 
  PlaneTakeoff, 
  Eye, 
  FileText, 
  MapPin, 
  Pencil, 
  Plus, 
  Search, 
  Trash2, 
  User 
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function FlightLogsPage() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Query for fetching flight logs
  const {
    data: flightLogs,
    isLoading: logsLoading,
    error: logsError
  } = useQuery<FlightLog[]>({
    queryKey: ['/api/flight-logs'],
    queryFn: async () => {
      const response = await fetch('/api/flight-logs');
      if (!response.ok) {
        throw new Error('Failed to fetch flight logs');
      }
      return response.json();
    },
    enabled: !!user?.id
  });

  // Query for fetching aircraft to display names instead of just IDs
  const {
    data: aircraft,
    isLoading: aircraftLoading,
    error: aircraftError
  } = useQuery<Aircraft[]>({
    queryKey: ['/api/aircraft'],
    queryFn: async () => {
      const response = await fetch('/api/aircraft');
      if (!response.ok) {
        throw new Error('Failed to fetch aircraft');
      }
      return response.json();
    },
    enabled: !!user?.id
  });

  // Mutation for deleting a flight log
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/flight-logs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/flight-logs'] });
      toast({
        title: "Flight log deleted",
        description: "Your flight log has been removed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this flight log? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  // Filter logs based on search term
  const filteredLogs = flightLogs?.filter(log => {
    if (!searchTerm) return true;
    
    const searchTermLower = searchTerm.toLowerCase();
    return (
      log.pilotName.toLowerCase().includes(searchTermLower) ||
      (log.notes && log.notes.toLowerCase().includes(searchTermLower)) ||
      (log.weatherConditions && log.weatherConditions.toLowerCase().includes(searchTermLower))
    );
  });

  // Get aircraft name by ID
  const getAircraftName = (aircraftId: number) => {
    const found = aircraft?.find(a => a.id === aircraftId);
    return found ? found.name : `Aircraft #${aircraftId}`;
  };

  // Format date/time
  const formatDateTime = (isoDate: string) => {
    try {
      return format(parseISO(isoDate), 'PPP \'at\' p');
    } catch (e) {
      return isoDate;
    }
  };

  return (
    <div className="mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-semibold">My Flight Logs</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your drone flight history</p>
        </div>
        <Button size="sm" className="bg-red-500 hover:bg-red-600" onClick={() => setLocation("/flight-logs/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Flight Log
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search flight logs..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4 flex flex-wrap overflow-x-auto">
          <TabsTrigger value="all">All Logs</TabsTrigger>
          <TabsTrigger value="recent">Recent (30 days)</TabsTrigger>
          <TabsTrigger value="with-plan">With Flight Plan</TabsTrigger>
          <TabsTrigger value="no-plan">Without Flight Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {renderFlightLogList(filteredLogs, logsLoading || aircraftLoading, 
            logsError || aircraftError, handleDelete, getAircraftName)}
        </TabsContent>
        
        <TabsContent value="recent">
          {renderFlightLogList(
            filteredLogs?.filter(log => {
              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              return new Date(log.startTime) >= thirtyDaysAgo;
            }),
            logsLoading || aircraftLoading, 
            logsError || aircraftError, 
            handleDelete, 
            getAircraftName
          )}
        </TabsContent>
        
        <TabsContent value="with-plan">
          {renderFlightLogList(
            filteredLogs?.filter(log => log.flightPlanId !== null),
            logsLoading || aircraftLoading, 
            logsError || aircraftError, 
            handleDelete, 
            getAircraftName
          )}
        </TabsContent>
        
        <TabsContent value="no-plan">
          {renderFlightLogList(
            filteredLogs?.filter(log => log.flightPlanId === null),
            logsLoading || aircraftLoading, 
            logsError || aircraftError, 
            handleDelete, 
            getAircraftName
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function renderFlightLogList(
  flightLogs: FlightLog[] | undefined,
  isLoading: boolean,
  error: Error | null,
  handleDelete: (id: number) => void,
  getAircraftName: (id: number) => string
) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load flight logs: {error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!flightLogs || flightLogs.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 flex flex-col items-center justify-center text-center">
          <FileText className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No flight logs found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            Record your drone flights to keep track of your flight history and maintain compliance with regulations.
          </p>
          <Button className="mt-4 bg-red-500 hover:bg-red-600" size="sm" asChild>
            <Link to="/flight-logs/new">
              <Plus className="mr-2 h-4 w-4" /> Add Flight Log
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Format duration in minutes to hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 
      ? `${hours}h ${mins > 0 ? `${mins}m` : ''}`
      : `${mins}m`;
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {flightLogs.map((log) => (
        <Card key={log.id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
              <div>
                <CardTitle className="flex items-center">
                  <PlaneTakeoff className="mr-2 h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{getAircraftName(log.aircraftId)}</span>
                </CardTitle>
                <CardDescription className="mt-1">
                  {log.flightPlanId ? (
                    <Link to={`/flight-plans/${log.flightPlanId}`} className="underline underline-offset-2">
                      View associated flight plan
                    </Link>
                  ) : (
                    "No associated flight plan"
                  )}
                </CardDescription>
              </div>
              <div className="text-sm sm:text-right">
                <div className="font-medium">
                  {new Date(log.startTime).toLocaleDateString()}
                </div>
                {log.duration && (
                  <div className="text-muted-foreground">
                    Duration: {formatDuration(log.duration)}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-start">
                  <User className="mr-2 h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Pilot</div>
                    <div className="truncate">{log.pilotName}</div>
                  </div>
                </div>
                
                {log.observers && (
                  <div className="flex items-start">
                    <Eye className="mr-2 h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Observers</div>
                      <div className="line-clamp-2">
                        {(() => {
                          if (Array.isArray(log.observers)) {
                            return log.observers.join(', ');
                          } else if (typeof log.observers === 'string') {
                            return log.observers;
                          } else if (log.observers && typeof log.observers === 'object') {
                            try {
                              return JSON.stringify(log.observers);
                            } catch (e) {
                              return '';
                            }
                          }
                          return '';
                        })()}
                      </div>
                    </div>
                  </div>
                )}
                
                {log.weatherConditions && (
                  <div className="flex items-start">
                    <CloudSun className="mr-2 h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Weather</div>
                      <div className="line-clamp-2">{log.weatherConditions}</div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-start">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Date & Time</div>
                    <div>From: {new Date(log.startTime).toLocaleString()}</div>
                    <div>To: {new Date(log.endTime).toLocaleString()}</div>
                  </div>
                </div>
                
                {log.notes && (
                  <div className="flex items-start">
                    <FileText className="mr-2 h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Notes</div>
                      <div className="text-sm line-clamp-3">{log.notes}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap justify-end gap-2 pt-2">
            <Button variant="outline" asChild size="sm">
              <Link to={`/flight-logs/${log.id}`}>
                <Eye className="mr-2 h-4 w-4" /> View
              </Link>
            </Button>
            <Button variant="outline" asChild size="sm">
              <Link to={`/flight-logs/${log.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Link>
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => handleDelete(log.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}