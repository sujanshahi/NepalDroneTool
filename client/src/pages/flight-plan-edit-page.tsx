import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FlightPlan } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FlightPlanForm } from "@/components/FlightPlanForm";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";

export default function EditFlightPlanPage() {
  const { id } = useParams();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for fetching the flight plan to edit
  const {
    data: flightPlan,
    isLoading,
    error
  } = useQuery<FlightPlan>({
    queryKey: ['/api/flight-plans', id],
    queryFn: async () => {
      const response = await fetch(`/api/flight-plans/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch flight plan');
      }
      return response.json();
    },
  });

  // Mutation for updating the flight plan
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PUT', `/api/flight-plans/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/flight-plans'] });
      toast({
        title: "Flight plan updated",
        description: "Your flight plan has been updated successfully",
      });
      setLocation("/flight-plans");
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
    // Preserve fields that might not be in the form
    const updatedValues = {
      ...flightPlan,
      ...values,
      userId: flightPlan?.userId,
      updatedAt: new Date().toISOString()
    };
    updateMutation.mutate(updatedValues);
  };

  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p>Loading flight plan...</p>
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
          <AlertDescription>Failed to load flight plan: {error.message}</AlertDescription>
        </Alert>
        <Button 
          className="mt-4" 
          onClick={() => setLocation("/flight-plans")}
        >
          Back to Flight Plans
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="p-0 mb-4" 
          onClick={() => setLocation("/flight-plans")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Flight Plans
        </Button>
        <h1 className="text-3xl font-bold">Edit Flight Plan</h1>
        <p className="text-muted-foreground">Update details of your flight plan</p>
      </div>
      
      {flightPlan && (
        <FlightPlanForm 
          initialValues={flightPlan}
          onSubmit={handleSubmit} 
          isLoading={updateMutation.isPending}
        />
      )}
    </div>
  );
}