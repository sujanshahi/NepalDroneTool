import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FlightLog, Aircraft } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  CloudSun, 
  PlaneTakeoff, 
  Eye, 
  FileText, 
  User, 
  Pencil, 
  Trash2, 
  MapPin 
} from "lucide-react";
import { Link } from "wouter";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function FlightLogViewPage() {
  const { id } = useParams<{ id: string }>();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for fetching flight log details
  const {
    data: flightLog,
    isLoading: logLoading,
    error: logError
  } = useQuery<FlightLog>({
    queryKey: [`/api/flight-logs/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/flight-logs/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch flight log details');
      }
      return response.json();
    }
  });

  // Query for fetching aircraft details
  const {
    data: aircraft,
    isLoading: aircraftLoading,
    error: aircraftError
  } = useQuery<Aircraft[]>({
    queryKey: ['/api/aircraft'],
    queryFn: async () => {
      const response = await fetch('/api/aircraft');
      if (!response.ok) {
        throw new Error('Failed to fetch aircraft data');
      }
      return response.json();
    }
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
        description: "The flight log has been removed successfully",
      });
      setLocation("/flight-logs");
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this flight log? This action cannot be undone.")) {
      if (flightLog) {
        deleteMutation.mutate(flightLog.id);
      }
    }
  };

  // Get aircraft name by ID
  const getAircraftName = (aircraftId: number) => {
    const found = aircraft?.find(a => a.id === aircraftId);
    return found ? found.name : `Aircraft #${aircraftId}`;
  };

  // Format duration in minutes to hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 
      ? `${hours}h ${mins > 0 ? `${mins}m` : ''}`
      : `${mins}m`;
  };

  // Format date/time
  const formatDateTime = (isoDate: string) => {
    try {
      return format(parseISO(isoDate), 'PPP \'at\' p');
    } catch (e) {
      return isoDate;
    }
  };

  if (logLoading || aircraftLoading) {
    return (
      <div className="container py-8 max-w-4xl">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (logError || aircraftError) {
    return (
      <div className="container py-8 max-w-4xl">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {logError 
              ? `Failed to load flight log: ${logError.message}` 
              : `Failed to load aircraft data: ${aircraftError?.message}`}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!flightLog) {
    return (
      <div className="container py-8 max-w-4xl">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Flight log not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="p-0 mb-4" 
          onClick={() => setLocation("/flight-logs")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Flight Logs
        </Button>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <PlaneTakeoff className="mr-2 h-6 w-6" />
            {getAircraftName(flightLog.aircraftId)}
          </h1>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button 
              variant="outline" 
              asChild
            >
              <Link to={`/flight-logs/${id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Link>
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDelete}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Flight Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="mr-2 h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-lg">Date & Time</div>
                  <div>Started: {formatDateTime(flightLog.startTime)}</div>
                  <div>Ended: {formatDateTime(flightLog.endTime)}</div>
                  <div className="mt-1">
                    <Badge>Duration: {formatDuration(flightLog.duration)}</Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <User className="mr-2 h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-lg">Pilot</div>
                  <div>{flightLog.pilotName}</div>
                </div>
              </div>

              {flightLog.flightPlanId !== null && (
                <div className="flex items-start">
                  <FileText className="mr-2 h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-lg">Flight Plan</div>
                    <Link 
                      to={`/flight-plans/${flightLog.flightPlanId}`} 
                      className="text-blue-600 hover:underline"
                    >
                      View associated flight plan
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {flightLog.location && typeof flightLog.location === 'object' && flightLog.location !== null && (
                <div className="flex items-start">
                  <MapPin className="mr-2 h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-lg">Location</div>
                    <div>
                      {(() => {
                        const loc = flightLog.location as Record<string, any>;
                        return loc.address 
                          ? String(loc.address) 
                          : loc.latitude && loc.longitude
                            ? `Latitude: ${loc.latitude}, Longitude: ${loc.longitude}`
                            : 'Location coordinates set';
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {flightLog.weatherConditions && (
                <div className="flex items-start">
                  <CloudSun className="mr-2 h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-lg">Weather Conditions</div>
                    <div>{flightLog.weatherConditions}</div>
                  </div>
                </div>
              )}

              {flightLog.observers && (
                <div className="flex items-start">
                  <Eye className="mr-2 h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-lg">Observers</div>
                    <div>
                      {(() => {
                        if (Array.isArray(flightLog.observers)) {
                          return flightLog.observers.join(', ');
                        } else if (typeof flightLog.observers === 'string') {
                          return flightLog.observers;
                        } else if (flightLog.observers && typeof flightLog.observers === 'object') {
                          try {
                            return JSON.stringify(flightLog.observers);
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
            </div>
          </CardContent>
        </Card>

        {flightLog.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line">{flightLog.notes}</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}