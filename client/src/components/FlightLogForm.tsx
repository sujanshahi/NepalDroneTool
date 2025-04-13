import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Aircraft, FlightPlan } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Create a schema for flight log validation
const flightLogSchema = z.object({
  flightPlanId: z.number().optional().nullable(),
  aircraftId: z.number({
    required_error: "Please select an aircraft",
  }),
  pilotName: z.string().min(2, { 
    message: "Pilot name must be at least 2 characters", 
  }),
  observers: z.string().optional(),
  startTime: z.date({
    required_error: "Please select a start time",
  }),
  endTime: z.date({
    required_error: "Please select an end time",
  }),
  duration: z.number().optional().nullable(),
  weatherConditions: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
}).refine(data => data.endTime > data.startTime, {
  message: "End time must be after start time",
  path: ["endTime"]
});

// Type for our form values
type FlightLogFormValues = z.infer<typeof flightLogSchema>;

// Type for initial form values that can be passed in when editing
interface FlightLogFormProps {
  initialValues?: Partial<FlightLogFormValues>;
  onSubmit: (values: FlightLogFormValues) => void;
  isLoading?: boolean;
}

export function FlightLogForm({ initialValues, onSubmit, isLoading = false }: FlightLogFormProps) {
  const { user } = useAuth();
  const [calculatedDuration, setCalculatedDuration] = useState<number | null>(null);

  // Set up form with zod validation
  const form = useForm<FlightLogFormValues>({
    resolver: zodResolver(flightLogSchema),
    defaultValues: {
      flightPlanId: initialValues?.flightPlanId || null,
      aircraftId: initialValues?.aircraftId,
      pilotName: initialValues?.pilotName || user?.fullName || "",
      observers: initialValues?.observers ? 
        (Array.isArray(initialValues.observers) ? 
          initialValues.observers.join(", ") : 
          String(initialValues.observers)) : 
        "",
      startTime: initialValues?.startTime ? new Date(initialValues.startTime) : new Date(),
      endTime: initialValues?.endTime ? new Date(initialValues.endTime) : new Date(),
      duration: initialValues?.duration || 0,
      weatherConditions: initialValues?.weatherConditions || "",
      notes: initialValues?.notes || "",
    }
  });

  // Query for fetching flight plans
  const {
    data: flightPlans,
    isLoading: flightPlansLoading,
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

  // Query for fetching aircraft
  const {
    data: aircraft,
    isLoading: aircraftLoading,
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

  // Auto-calculate flight duration when start/end times change
  useEffect(() => {
    const startTime = form.watch('startTime');
    const endTime = form.watch('endTime');
    
    if (startTime && endTime && endTime > startTime) {
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationMinutes = Math.round(durationMs / (1000 * 60));
      setCalculatedDuration(durationMinutes);
      form.setValue('duration', durationMinutes);
    }
  }, [form.watch('startTime'), form.watch('endTime')]);

  // Handle form submission
  function handleFormSubmit(values: FlightLogFormValues) {
    // Submit values directly - observer is already a string
    onSubmit(values);
  }

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
          {/* Flight Plan selection (optional) */}
          <FormField
            control={form.control}
            name="flightPlanId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Flight Plan (Optional)</FormLabel>
                <Select
                  disabled={flightPlansLoading}
                  onValueChange={(value) => field.onChange(value ? parseInt(value, 10) : null)}
                  value={field.value?.toString() || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a flight plan (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">No flight plan</SelectItem>
                    {flightPlans?.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id.toString()}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Link this flight to an existing flight plan
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Aircraft selection (required) */}
          <FormField
            control={form.control}
            name="aircraftId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aircraft</FormLabel>
                <Select
                  disabled={aircraftLoading}
                  onValueChange={(value) => field.onChange(parseInt(value, 10))}
                  value={field.value?.toString() || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select aircraft" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {aircraft?.map((aircraft) => (
                      <SelectItem key={aircraft.id} value={aircraft.id.toString()}>
                        {aircraft.name} {aircraft.manufacturer ? `(${aircraft.manufacturer})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose the drone used for this flight
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Pilot name */}
          <FormField
            control={form.control}
            name="pilotName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pilot Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter pilot name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Observers (optional) */}
          <FormField
            control={form.control}
            name="observers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observers (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Comma-separated list of observers" {...field} />
                </FormControl>
                <FormDescription>
                  Enter names separated by commas
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Flight dates and times */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start time */}
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Time</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP p")
                          ) : (
                            <span>Pick a start date/time</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                      <div className="p-3 border-t border-border">
                        <Input
                          type="time"
                          value={field.value ? format(field.value, "HH:mm") : ""}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(':').map(Number);
                            const newDate = new Date(field.value);
                            newDate.setHours(hours);
                            newDate.setMinutes(minutes);
                            field.onChange(newDate);
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* End time */}
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Time</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP p")
                          ) : (
                            <span>Pick an end date/time</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                      <div className="p-3 border-t border-border">
                        <Input
                          type="time"
                          value={field.value ? format(field.value, "HH:mm") : ""}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(':').map(Number);
                            const newDate = new Date(field.value);
                            newDate.setHours(hours);
                            newDate.setMinutes(minutes);
                            field.onChange(newDate);
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Duration (calculated automatically) */}
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field}
                    value={field.value || calculatedDuration || ""}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                  />
                </FormControl>
                <FormDescription>
                  Automatically calculated from start and end time, but can be adjusted
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Weather conditions */}
          <FormField
            control={form.control}
            name="weatherConditions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weather Conditions (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., Clear skies, light wind" 
                    value={field.value === null ? '' : String(field.value || '')} 
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    name={field.name}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Flight Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Add any observations, incidents, or other notes about the flight"
                    className="min-h-24"
                    value={field.value === null ? '' : String(field.value || '')} 
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    name={field.name}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit button */}
          <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialValues?.pilotName ? "Update Flight Log" : "Create Flight Log"}
          </Button>
        </form>
      </Form>
    </Card>
  );
}