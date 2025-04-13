import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { FlightPlanForm } from "@/components/FlightPlanForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewFlightPlanPage() {
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation for creating a new flight plan
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const fullData = {
        ...data,
        userId: user?.id,
      };
      const response = await apiRequest('POST', '/api/flight-plans', fullData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/flight-plans'] });
      toast({
        title: "Flight plan created",
        description: "Your flight plan has been saved successfully",
      });
      setLocation("/flight-plans");
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
    createMutation.mutate(values);
  };

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
        <h1 className="text-3xl font-bold">New Flight Plan</h1>
        <p className="text-muted-foreground">Create a detailed plan for your drone flight</p>
      </div>
      
      <FlightPlanForm 
        onSubmit={handleSubmit} 
        isLoading={createMutation.isPending}
      />
    </div>
  );
}