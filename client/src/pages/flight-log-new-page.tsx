import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FlightLogForm } from "@/components/FlightLogForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewFlightLogPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation for creating a new flight log
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/flight-logs', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/flight-logs'] });
      toast({
        title: "Flight log created",
        description: "Your flight log has been saved successfully",
      });
      setLocation("/flight-logs");
    },
    onError: (error: Error) => {
      toast({
        title: "Creation failed",
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
    createMutation.mutate(formattedValues);
  };

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
        <h1 className="text-3xl font-bold">New Flight Log</h1>
        <p className="text-muted-foreground">Record details of a completed drone flight</p>
      </div>
      
      <FlightLogForm 
        onSubmit={handleSubmit} 
        isLoading={createMutation.isPending}
      />
    </div>
  );
}