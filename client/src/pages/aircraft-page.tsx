import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient, getQueryFn } from '@/lib/queryClient';
import Header from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import { insertAircraftSchema, Aircraft } from '@shared/schema';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, PlaneTakeoff, Plus, Pencil, Trash2 } from 'lucide-react';
import { z } from 'zod';

// Create a Zod schema for form validation
const aircraftFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, {message: "Name must be at least 2 characters"}),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  type: z.string().min(1, {message: "Aircraft type is required"}),
  weight: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().nonnegative().optional().nullable()
  ),
  maxFlightTime: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().nonnegative().optional().nullable()
  ),
});

// Aircraft types for Nepal
const AIRCRAFT_TYPES = [
  { value: 'micro', label: 'Micro (≤250g)' },
  { value: 'small', label: 'Small (251g-2kg)' },
  { value: 'medium', label: 'Medium (2kg-25kg)' },
  { value: 'large', label: 'Large (>25kg)' }
];

interface AircraftFormData {
  id?: number;
  name: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  type: string;
  weight?: number | null;
  maxFlightTime?: number | null;
}

const AircraftPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);
  const [formData, setFormData] = useState<AircraftFormData>({
    name: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    type: '',
    weight: 0,
    maxFlightTime: 0
  });

  // Fetch user's aircraft
  const { 
    data: aircraft = [], // provide default empty array to fix TypeScript errors
    isLoading, 
    isError 
  } = useQuery<Aircraft[]>({
    queryKey: ['/api/aircraft'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  // Log authentication status for debugging
  console.log('Auth state:', { user, isLoading, isError });

  // Create aircraft mutation
  const createAircraftMutation = useMutation({
    mutationFn: async (data: z.infer<typeof aircraftFormSchema>) => {
      console.log('Creating aircraft with data:', data);
      try {
        const res = await apiRequest('POST', '/api/aircraft', data);
        console.log('Aircraft creation response:', res);
        return await res.json();
      } catch (error) {
        console.error('Aircraft creation error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Aircraft successfully created:', data);
      toast({
        title: 'Aircraft Added',
        description: 'Your aircraft has been successfully added.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/aircraft'] });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      console.error('Aircraft creation mutation error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add aircraft',
        variant: 'destructive',
      });
    }
  });

  // Update aircraft mutation
  const updateAircraftMutation = useMutation({
    mutationFn: async (data: z.infer<typeof aircraftFormSchema>) => {
      const res = await apiRequest('PUT', `/api/aircraft/${data.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Aircraft Updated',
        description: 'Your aircraft has been successfully updated.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/aircraft'] });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update aircraft',
        variant: 'destructive',
      });
    }
  });

  // Delete aircraft mutation
  const deleteAircraftMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/aircraft/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Aircraft Deleted',
        description: 'Your aircraft has been successfully deleted.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/aircraft'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete aircraft',
        variant: 'destructive',
      });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Convert numeric fields
    if (name === 'weight' || name === 'maxFlightTime') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleTypeChange = (value: string) => {
    setFormData({
      ...formData,
      type: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data with Zod schema
    try {
      const validatedData = aircraftFormSchema.parse(formData);
      
      if (selectedAircraft) {
        updateAircraftMutation.mutate(validatedData);
      } else {
        createAircraftMutation.mutate(validatedData);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format and display validation errors
        const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        toast({
          title: 'Validation Error',
          description: errorMessages,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        });
      }
    }
  };

  const openEditDialog = (aircraft: Aircraft) => {
    setSelectedAircraft(aircraft);
    setFormData({
      id: aircraft.id,
      name: aircraft.name,
      manufacturer: aircraft.manufacturer || '',
      model: aircraft.model || '',
      serialNumber: aircraft.serialNumber || '',
      type: aircraft.type || '',
      weight: aircraft.weight || 0,
      maxFlightTime: aircraft.maxFlightTime || 0
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    resetForm();
    setSelectedAircraft(null);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      manufacturer: '',
      model: '',
      serialNumber: '',
      type: '',
      weight: 0,
      maxFlightTime: 0
    });
  };

  const handleDeleteAircraft = (id: number) => {
    if (confirm('Are you sure you want to delete this aircraft? This action cannot be undone.')) {
      deleteAircraftMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">My Aircraft</h1>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Aircraft
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center my-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <Card className="my-4">
              <CardContent className="py-8">
                <div className="text-center">
                  <p className="text-red-500 mb-2">Failed to load aircraft data</p>
                  <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/aircraft'] })}>
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : !user ? (
            <Card className="my-4">
              <CardContent className="py-12 flex flex-col items-center justify-center">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Authentication Required</h3>
                  <p className="text-gray-500 mb-6">Please log in to manage your aircraft.</p>
                  <Button onClick={() => navigate('/auth')}>
                    Login / Register
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : aircraft && aircraft.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Manufacturer</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Weight (g)</TableHead>
                    <TableHead>Max Flight Time (min)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aircraft.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        {AIRCRAFT_TYPES.find(t => t.value === item.type)?.label || item.type}
                      </TableCell>
                      <TableCell>{item.manufacturer}</TableCell>
                      <TableCell>{item.model}</TableCell>
                      <TableCell>{item.weight?.toString() || '-'}</TableCell>
                      <TableCell>{item.maxFlightTime?.toString() || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => openEditDialog(item)}
                          className="h-8 w-8 p-0 mr-1"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteAircraft(item.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Card className="my-4">
              <CardContent className="py-12 flex flex-col items-center justify-center">
                <PlaneTakeoff className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Aircraft Found</h3>
                <p className="text-gray-500 mb-6 text-center max-w-md">
                  You haven't added any aircraft yet. Add your first drone to start planning flights.
                </p>
                <Button onClick={openAddDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Aircraft
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Add/Edit Aircraft Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {selectedAircraft ? 'Edit Aircraft' : 'Add New Aircraft'}
                </DialogTitle>
                <DialogDescription>
                  {selectedAircraft 
                    ? 'Update your aircraft details below.' 
                    : 'Enter the details of your drone or aircraft.'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Aircraft Name*</Label>
                    <Input 
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="My Drone"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Aircraft Type*</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={handleTypeChange}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select aircraft type" />
                      </SelectTrigger>
                      <SelectContent>
                        {AIRCRAFT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="manufacturer">Manufacturer</Label>
                      <Input 
                        id="manufacturer"
                        name="manufacturer"
                        value={formData.manufacturer}
                        onChange={handleInputChange}
                        placeholder="DJI, Parrot, etc."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="model">Model</Label>
                      <Input 
                        id="model"
                        name="model"
                        value={formData.model}
                        onChange={handleInputChange}
                        placeholder="Mavic Air, etc."
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="serialNumber">Serial Number</Label>
                    <Input 
                      id="serialNumber"
                      name="serialNumber"
                      value={formData.serialNumber}
                      onChange={handleInputChange}
                      placeholder="Serial number or ID"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (g)</Label>
                      <Input 
                        id="weight"
                        name="weight"
                        type="number"
                        value={formData.weight?.toString() || ''}
                        onChange={handleInputChange}
                        placeholder="Weight in grams"
                        min={0}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="maxFlightTime">Max Flight Time (min)</Label>
                      <Input 
                        id="maxFlightTime"
                        name="maxFlightTime"
                        type="number"
                        value={formData.maxFlightTime?.toString() || ''}
                        onChange={handleInputChange}
                        placeholder="Flight time in minutes"
                        min={0}
                      />
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createAircraftMutation.isPending || updateAircraftMutation.isPending}
                  >
                    {(createAircraftMutation.isPending || updateAircraftMutation.isPending) ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {selectedAircraft ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      selectedAircraft ? 'Update Aircraft' : 'Add Aircraft'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default AircraftPage;