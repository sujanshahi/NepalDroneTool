import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FlightPathDrawer } from "@/components/FlightPathDrawer";
import { Loader2 } from "lucide-react";

// Create a schema for flight plan validation
const flightPlanSchema = z.object({
  name: z.string().min(3, {
    message: "Name must be at least 3 characters",
  }),
  category: z.enum(["Micro", "Basic", "Advanced"], {
    required_error: "Please select a category",
  }),
  notes: z.string().optional(),
  status: z.enum(["draft", "planned", "completed", "cancelled"], {
    required_error: "Please select a status",
  }),
  // We'll handle path and pilot location separately
});

// Type for our form values
type FlightPlanFormValues = z.infer<typeof flightPlanSchema>;

// Type for initial form values that can be passed in when editing
interface FlightPlanFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  isLoading?: boolean;
}

export function FlightPlanForm({ initialValues, onSubmit, isLoading = false }: FlightPlanFormProps) {
  const { user } = useAuth();
  const [path, setPath] = useState<any>(initialValues?.path || null);
  const [pilotLocation, setPilotLocation] = useState<[number, number] | undefined>(
    initialValues?.pilotLocation ? 
      [initialValues.pilotLocation[0], initialValues.pilotLocation[1]] : 
      undefined
  );

  // Set up form with zod validation
  const form = useForm<FlightPlanFormValues>({
    resolver: zodResolver(flightPlanSchema),
    defaultValues: {
      name: initialValues?.name || "",
      category: initialValues?.category || "Basic",
      notes: initialValues?.notes || "",
      status: initialValues?.status || "draft",
    }
  });

  // Handle form submission
  function handleFormSubmit(values: FlightPlanFormValues) {
    // Combine form values with path and pilot location
    const completeValues = {
      ...values,
      path,
      pilotLocation,
      // Include other necessary values from initialValues 
      // that aren't part of the form but should be preserved
      step: initialValues?.step || 1,
      createdAt: initialValues?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmit(completeValues);
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plan name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flight Plan Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter a name for this flight plan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Micro">Micro (Under 250g)</SelectItem>
                          <SelectItem value="Basic">Basic Operations</SelectItem>
                          <SelectItem value="Advanced">Advanced Operations</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the operational category for this flight
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="planned">Planned</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Current status of this flight plan
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any details, special considerations, or other notes for this flight plan"
                        className="min-h-24"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Flight path drawer (this is outside the form card) */}
          <div className="py-4">
            <h3 className="text-lg font-medium mb-4">Flight Path Planning</h3>
            <FlightPathDrawer 
              onPathChange={setPath}
              initialPath={path}
              onPilotLocationChange={setPilotLocation}
              initialPilotLocation={pilotLocation}
            />
          </div>

          {/* Submit button */}
          <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialValues?.name ? "Update Flight Plan" : "Create Flight Plan"}
          </Button>
        </form>
      </Form>
    </div>
  );
}