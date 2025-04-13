import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { FlightPlan } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, ClipboardList, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { formatDistance } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function FlightPlansPage() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for fetching flight plans
  const {
    data: flightPlans,
    isLoading,
    error
  } = useQuery<FlightPlan[]>({
    queryKey: ['/api/flight-plans', { userId: user?.id }],
    queryFn: async () => {
      const response = await fetch(`/api/flight-plans?userId=${user?.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch flight plans');
      }
      return response.json();
    },
    enabled: !!user?.id
  });

  // Mutation for deleting a flight plan
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/flight-plans/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/flight-plans'] });
      toast({
        title: "Flight plan deleted",
        description: "Your flight plan has been removed successfully",
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
    if (confirm("Are you sure you want to delete this flight plan? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="container py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Flight Plans</h1>
          <p className="text-muted-foreground">Manage your drone flight plans</p>
        </div>
        <Button onClick={() => setLocation("/flight-plans/new")}>
          <Plus className="mr-2 h-4 w-4" /> New Flight Plan
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Plans</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="planned">Planned</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {renderFlightPlanList(flightPlans, isLoading, error, handleDelete)}
        </TabsContent>
        
        <TabsContent value="draft">
          {renderFlightPlanList(
            flightPlans?.filter(plan => plan.status === 'draft'),
            isLoading,
            error,
            handleDelete
          )}
        </TabsContent>
        
        <TabsContent value="planned">
          {renderFlightPlanList(
            flightPlans?.filter(plan => plan.status === 'planned'),
            isLoading,
            error,
            handleDelete
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {renderFlightPlanList(
            flightPlans?.filter(plan => plan.status === 'completed'),
            isLoading,
            error,
            handleDelete
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function renderFlightPlanList(
  flightPlans: FlightPlan[] | undefined,
  isLoading: boolean,
  error: Error | null,
  handleDelete: (id: number) => void
) {
  // Status badge styling
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      "draft": { variant: "secondary", label: "Draft" },
      "planned": { variant: "default", label: "Planned" },
      "completed": { variant: "outline", label: "Completed" },
      "cancelled": { variant: "destructive", label: "Cancelled" }
    };

    const config = statusMap[status] || { variant: "secondary", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };
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
        <AlertDescription>Failed to load flight plans: {error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!flightPlans || flightPlans.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 flex flex-col items-center justify-center text-center">
          <ClipboardList className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No flight plans found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            Create a new flight plan to visualize your drone missions and check for regulatory compliance.
          </p>
          <Button className="mt-4" asChild>
            <Link to="/flight-plans/new">
              <Plus className="mr-2 h-4 w-4" /> Create Flight Plan
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {flightPlans.map((plan) => (
        <Card key={plan.id} className="flex flex-col h-full">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="mr-2 text-lg">{plan.name}</CardTitle>
              {plan.status && getStatusBadge(plan.status)}
            </div>
            <CardDescription className="flex items-center text-sm">
              <CalendarIcon className="mr-1 h-3 w-3" />
              {formatDistance(new Date(plan.createdAt), new Date(), { addSuffix: true })}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="space-y-2 text-sm">
              {plan.location && (
                <div className="flex items-start">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>
                    {plan.location && typeof plan.location === 'object' && plan.location !== null
                      ? (plan.location.address 
                         ? String(plan.location.address)
                         : 'Location coordinates set')
                      : 'Location set'}
                  </span>
                </div>
              )}
              {plan.flight && (
                <div>
                  <span className="text-muted-foreground">Altitude:</span>{' '}
                  {plan.flight && typeof plan.flight === 'object' && plan.flight !== null && plan.flight.altitude
                    ? `${plan.flight.altitude}m`
                    : 'Set'}
                </div>
              )}
              {plan.category && (
                <div>
                  <span className="text-muted-foreground">Category:</span> {plan.category}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="grid grid-cols-2 gap-2">
            <Button variant="outline" asChild className="w-full">
              <Link to={`/flight-plans/${plan.id}`}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Link>
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => handleDelete(plan.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}