import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FlightLog } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FlightLogForm } from "@/components/FlightLogForm";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";

export default function EditFlightLogPage() {
  const { id } = useParams();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for fetching the flight log to edit
  const {
    data: flightLog,
    isLoading,
    error
  } = useQuery<FlightLog>({
    queryKey: ['/api/flight-logs', id],
    queryFn: async () => {
      const response = await fetch(`/api/flight-logs/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch flight log');
      }
      return response.json();
    },
  });

  // Mutation for updating the flight log
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PUT', `/api/flight-logs/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/flight-logs'] });
      toast({
        title: "Flight log updated",
        description: "Your flight log has been updated successfully",
      });
      setLocation("/flight-logs");
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (values: any) => {
    // Format dates as ISO strings and convert observers to array
    const formattedValues = {
      ...values,
      startTime: values.startTime.toISOString(),
      endTime: values.endTime.toISOString(),
      // Convert comma-separated observers to array for JSONB field
      observers: values.observers ? values.observers.split(',').map((o: string) => o.trim()).filter(Boolean) : []
    };
    updateMutation.mutate(formattedValues);
  };

  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p>Loading flight log...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load flight log: {error.message}</AlertDescription>
        </Alert>
        <Button 
          className="mt-4" 
          onClick={() => setLocation("/flight-logs")}
        >
          Back to Flight Logs
        </Button>
      </div>
    );
  }

  // Transform the data for the form
  const formInitialValues = flightLog ? {
    ...flightLog,
    // Form expects Date objects for these fields
    startTime: new Date(flightLog.startTime),
    endTime: new Date(flightLog.endTime),
    // Convert observers from array (JSONB) to comma-separated string for the form
    observers: Array.isArray(flightLog.observers) ? flightLog.observers.join(', ') : ''
  } : undefined;

  return (
    <div className="container py-8 max-w-3xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="p-0 mb-4" 
          onClick={() => setLocation("/flight-logs")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Flight Logs
        </Button>
        <h1 className="text-3xl font-bold">Edit Flight Log</h1>
        <p className="text-muted-foreground">Update details of your recorded flight</p>
      </div>
      
      {flightLog && (
        <FlightLogForm 
          initialValues={formInitialValues}
          onSubmit={handleSubmit} 
          isLoading={updateMutation.isPending}
        />
      )}
    </div>
  );
}