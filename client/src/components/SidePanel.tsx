import React, { useState, useEffect } from 'react';
import { useFlightPlan } from '@/context/FlightPlanContext';
import { FLIGHT_PLAN_STEPS } from '@/lib/constants';
import { reverseGeocode } from '@/lib/mapUtils';
import { 
  ArrowLeft, 
  ArrowRight, 
  AlertTriangle,
  CheckCircle2,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const SidePanel: React.FC = () => {
  const { 
    flightPlan, 
    nextStep, 
    prevStep, 
    updateIntent,
    updateLocation,
    updateFlight,
    generateResults,
    isStepComplete
  } = useFlightPlan();
  
  // State for address search input
  const [searchInput, setSearchInput] = useState('');
  
  // Form validation states
  const [isFormValid, setIsFormValid] = useState(false);
  
  // Check form validity whenever flightPlan changes
  useEffect(() => {
    setIsFormValid(isStepComplete(flightPlan.step));
  }, [flightPlan, isStepComplete]);
  
  // Handle next button click
  const handleNext = () => {
    if (flightPlan.step === 3) {
      // Call generateResults before moving to the next step
      // This ensures flight assessment is created before showing results page
      generateResults();
      
      // Add delay to ensure results are generated before UI transition
      setTimeout(() => {
        nextStep();
      }, 300);
    } else {
      // For other steps, just move to the next step
      nextStep();
    }
    
    // Debug output
    console.log("Moving to next step. Current step:", flightPlan.step);
    console.log("Flight plan data:", flightPlan);
  };
  
  // Handle intent form changes
  const handleIntentChange = (field: string, value: string) => {
    updateIntent({
      ...flightPlan.intent,
      [field]: value
    } as any);
  };
  
  // Handle location form changes
  const handleLocationChange = (field: string, value: string) => {
    updateLocation({
      ...flightPlan.location,
      [field]: value
    } as any);
  };
  
  // Handle flight form changes
  const handleFlightChange = (field: string, value: any) => {
    updateFlight({
      ...flightPlan.flight,
      [field]: value
    } as any);
  };
  
  // State for manual coordinate input
  const [manualLatitude, setManualLatitude] = useState<string>('');
  const [manualLongitude, setManualLongitude] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  
  // Function to determine if a string is a valid coordinate value
  const isValidCoordinate = (value: string): boolean => {
    // Allow empty string for incomplete input
    if (value === '') return true;
    // Use regex to check valid format (allow decimal points and negative signs)
    return /^-?\d*\.?\d*$/.test(value);
  };

  // Handle manual coordinate change with validation
  const handleLatitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isValidCoordinate(value)) {
      setManualLatitude(value);
    }
  };
  
  const handleLongitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isValidCoordinate(value)) {
      setManualLongitude(value);
    }
  };
  
  // Handle submitting manual coordinates
  const handleManualCoordinateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate coordinates
    const lat = parseFloat(manualLatitude);
    const lng = parseFloat(manualLongitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      alert('Please enter valid latitude and longitude values');
      return;
    }
    
    // Check coordinate range
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert('Latitude must be between -90 and 90, and longitude must be between -180 and 180');
      return;
    }
    
    try {
      // Perform reverse geocoding to get address info
      const locationInfo = await reverseGeocode([lat, lng]);
      
      // Update location in flight plan
      updateLocation({
        coordinates: [lat, lng],
        address: locationInfo.address,
        district: locationInfo.district
      });
      
      // Clear manual input fields
      setManualLatitude('');
      setManualLongitude('');
      setShowManualInput(false);
    } catch (error) {
      console.error('Error with manual coordinates:', error);
      alert('There was an error processing your coordinates. Please try again.');
    }
  };
  
  // Handle address search
  const handleAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchInput.trim()) {
      alert('Please enter a location to search');
      return;
    }
    
    try {
      // This would typically connect to a geocoding service
      // For Nepal, we need to implement a service that converts place names to coordinates
      
      let coordinates: [number, number];
      let address = '';
      let district = '';
      
      // Simple mapping of common Nepal locations (would be replaced with actual geocoding service)
      if (searchInput.toLowerCase().includes('kathmandu')) {
        coordinates = [27.7172, 85.3240];
        address = "Kathmandu, Nepal";
        district = "Kathmandu";
      } else if (searchInput.toLowerCase().includes('pokhara')) {
        coordinates = [28.2096, 83.9856];
        address = "Pokhara, Nepal";
        district = "Kaski";
      } else if (searchInput.toLowerCase().includes('chitwan')) {
        coordinates = [27.5291, 84.3542];
        address = "Chitwan, Nepal";
        district = "Chitwan";
      } else if (searchInput.toLowerCase().includes('lumbini')) {
        coordinates = [27.4833, 83.2767];
        address = "Lumbini, Nepal";
        district = "Rupandehi";
      } else if (searchInput.toLowerCase().includes('everest') || searchInput.toLowerCase().includes('sagarmatha')) {
        coordinates = [27.9881, 86.9250];
        address = "Mount Everest, Nepal";
        district = "Solukhumbu";
      } else {
        // Fallback for unknown locations (would be replaced with proper geocoding)
        alert('Location not found. Please try another search term or use manual coordinates.');
        return;
      }
      
      // Update location in flight plan
      updateLocation({
        coordinates,
        address,
        district
      });
      
      // Clear search input
      setSearchInput('');
      
    } catch (error) {
      console.error('Error searching for location:', error);
      alert('There was an error searching for this location. Please try again or use manual coordinates.');
    }
  };
  
  // Render step indicators
  const renderStepIndicator = () => {
    return (
      <div className="step-indicator mb-6 flex justify-between relative">
        {/* Line connecting steps */}
        <div className="absolute top-[14px] left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>
        
        {FLIGHT_PLAN_STEPS.map((step) => {
          let status = "pending";
          if (flightPlan.step === step.id) {
            status = "active";
          } else if (flightPlan.step > step.id || isStepComplete(step.id)) {
            status = "completed";
          }
          
          return (
            <div key={step.id} className={`step text-center ${status === "active" ? "active" : ""} ${status === "completed" ? "completed" : ""}`}>
              <div className={`step-circle w-7 h-7 rounded-full flex items-center justify-center border-2 ${
                status === "active" ? "bg-[#E81E25] border-[#E81E25] text-white" : 
                status === "completed" ? "bg-green-500 border-green-500 text-white" : 
                "bg-white border-gray-200 text-gray-700"
              } font-bold mb-1.5`}>
                {step.id}
              </div>
              <div className="step-label text-xs">{step.name}</div>
            </div>
          );
        })}
      </div>
    );
  };
  
  // Render intent step content
  const renderIntentContent = () => {
    return (
      <>
        <h2 className="font-heading font-semibold text-lg text-gray-700 mb-4">
          What is the purpose of your drone flight?
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          This information helps determine which regulations apply to your flight.
        </p>
        
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-2">Purpose of Flight</Label>
          <RadioGroup 
            value={flightPlan.intent?.purpose || ""}
            onValueChange={(value) => handleIntentChange('purpose', value)}
            className="grid grid-cols-1 gap-2"
          >
            <Label className="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-100 cursor-pointer">
              <RadioGroupItem value="Recreational" className="mr-2" />
              <span>Recreational / Hobby</span>
            </Label>
            <Label className="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-100 cursor-pointer">
              <RadioGroupItem value="Photography" className="mr-2" />
              <span>Photography / Videography</span>
            </Label>
            <Label className="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-100 cursor-pointer">
              <RadioGroupItem value="Commercial" className="mr-2" />
              <span>Commercial Operation</span>
            </Label>
            <Label className="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-100 cursor-pointer">
              <RadioGroupItem value="Mapping" className="mr-2" />
              <span>Mapping / Surveying</span>
            </Label>
          </RadioGroup>
        </div>
        
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-2">Drone Pilot Type</Label>
          <RadioGroup 
            value={flightPlan.intent?.dronePilotType || ""}
            onValueChange={(value) => handleIntentChange('dronePilotType', value)}
            className="grid grid-cols-1 gap-2"
          >
            <Label className="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-100 cursor-pointer">
              <RadioGroupItem value="recreational" className="mr-2" />
              <span>Recreational Pilot</span>
            </Label>
            <Label className="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-100 cursor-pointer">
              <RadioGroupItem value="commercial" className="mr-2" />
              <span>Commercial Pilot</span>
            </Label>
            <Label className="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-100 cursor-pointer">
              <RadioGroupItem value="government" className="mr-2" />
              <span>Government / Agency</span>
            </Label>
          </RadioGroup>
        </div>
        
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-2">Drone Category</Label>
          <RadioGroup 
            value={flightPlan.intent?.droneCategory || ""}
            onValueChange={(value) => handleIntentChange('droneCategory', value)}
            className="grid grid-cols-1 gap-2"
          >
            <Label className="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-100 cursor-pointer">
              <RadioGroupItem value="Micro" className="mr-2" />
              <span>Micro (under 250g)</span>
            </Label>
            <Label className="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-100 cursor-pointer">
              <RadioGroupItem value="Small" className="mr-2" />
              <span>Small (250g to 2kg)</span>
            </Label>
            <Label className="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-100 cursor-pointer">
              <RadioGroupItem value="Medium" className="mr-2" />
              <span>Medium (2kg to 25kg)</span>
            </Label>
            <Label className="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-100 cursor-pointer">
              <RadioGroupItem value="Large" className="mr-2" />
              <span>Large (over 25kg)</span>
            </Label>
          </RadioGroup>
        </div>
        
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-2">Drone Weight</Label>
          <RadioGroup 
            value={flightPlan.intent?.droneWeight || ""}
            onValueChange={(value) => handleIntentChange('droneWeight', value)}
            className="grid grid-cols-1 gap-2"
          >
            <Label className="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-100 cursor-pointer">
              <RadioGroupItem value="Under 250g" className="mr-2" />
              <span>Under 250g</span>
            </Label>
            <Label className="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-100 cursor-pointer">
              <RadioGroupItem value="250g to 2kg" className="mr-2" />
              <span>250g to 2kg</span>
            </Label>
            <Label className="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-100 cursor-pointer">
              <RadioGroupItem value="Over 2kg" className="mr-2" />
              <span>Over 2kg</span>
            </Label>
          </RadioGroup>
        </div>
      </>
    );
  };
  
  // Render location step content
  const renderLocationContent = () => {
    return (
      <>
        <h2 className="font-heading font-semibold text-lg text-gray-700 mb-4">
          Select Your Flight Location
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Drag the marker on the map to your intended take-off location or search for a specific address.
        </p>
        
        <div className="mb-4">
          <Label htmlFor="address-search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Location
          </Label>
          <form onSubmit={handleAddressSearch} className="flex">
            <Input
              type="text"
              id="address-search"
              placeholder="Enter address or place name"
              className="flex-grow rounded-r-none"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Button 
              type="submit" 
              className="bg-[#003893] text-white hover:bg-[#003893]/90 rounded-l-none flex items-center"
            >
              <span className="material-icons text-sm mr-1">search</span>
              <span>Search</span>
            </Button>
          </form>
          <div className="mt-2 flex items-center">
            <Button 
              type="button" 
              variant="outline"
              size="sm"
              onClick={() => setShowManualInput(!showManualInput)}
              className="text-xs flex items-center"
            >
              <MapPin className="h-3 w-3 mr-1" />
              {showManualInput ? 'Hide Coordinate Input' : 'Enter Coordinates Manually'}
            </Button>
          </div>
        </div>
        
        {showManualInput && (
          <div className="mb-4 p-3 border border-gray-200 rounded-md bg-gray-50">
            <h3 className="font-medium text-gray-700 text-sm mb-2">Manual Coordinate Input</h3>
            <form onSubmit={handleManualCoordinateSubmit}>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <Label htmlFor="manual-lat" className="block text-xs font-medium text-gray-700 mb-1">
                    Latitude (°N)
                  </Label>
                  <Input
                    type="text"
                    id="manual-lat"
                    placeholder="27.7172"
                    value={manualLatitude}
                    onChange={handleLatitudeChange}
                    className="text-sm"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="manual-lng" className="block text-xs font-medium text-gray-700 mb-1">
                    Longitude (°E)
                  </Label>
                  <Input
                    type="text"
                    id="manual-lng"
                    placeholder="85.3240"
                    value={manualLongitude}
                    onChange={handleLongitudeChange}
                    className="text-sm"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  size="sm"
                  className="bg-[#003893] text-white hover:bg-[#003893]/90 text-xs"
                >
                  Set Location
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Enter decimal coordinates (e.g., 27.7172, 85.3240)
              </p>
            </form>
          </div>
        )}
        
        {flightPlan.location?.coordinates && (
          <Card className="bg-gray-100 p-3 rounded-md mb-4">
            <h3 className="font-medium text-gray-700 mb-2">Selected Location</h3>
            <div className="text-sm">
              <p><span className="font-medium">Coordinates:</span> {flightPlan.location.coordinates[0].toFixed(4)}° N, {flightPlan.location.coordinates[1].toFixed(4)}° E</p>
              <p><span className="font-medium">Address:</span> {flightPlan.location.address || 'Unknown'}</p>
              <p><span className="font-medium">District:</span> {flightPlan.location.district || 'Unknown'}</p>
            </div>
          </Card>
        )}
        
        {flightPlan.location?.airspaceType && (
          <Card className="bg-gray-100 p-3 rounded-md mb-4">
            <h3 className="font-medium text-gray-700 mb-2">Airspace Information</h3>
            <div className="text-sm">
              {flightPlan.location.airspaceType === "restricted" && (
                <p className="flex items-center text-red-600 mb-1">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Within restricted airspace
                </p>
              )}
              {flightPlan.location.airspaceType === "controlled" && (
                <p className="flex items-center text-orange-500 mb-1">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Within controlled airspace (CTR)
                </p>
              )}
              {flightPlan.location.airspaceType === "advisory" && (
                <p className="flex items-center text-blue-500 mb-1">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Within advisory area
                </p>
              )}
              {flightPlan.location.airspaceType === "open" && (
                <p className="flex items-center text-green-600 mb-1">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Within open airspace
                </p>
              )}
              
              {flightPlan.location.airspaceType === "restricted" && (
                <p>This location is within restricted airspace. Drone operations are not permitted without special authorization.</p>
              )}
              {flightPlan.location.airspaceType === "controlled" && (
                <p>This location is within controlled airspace. Permission from the airport authority and CAA Nepal is required.</p>
              )}
              {flightPlan.location.airspaceType === "advisory" && (
                <p>This location is within an advisory area. Special considerations may apply for drone operations.</p>
              )}
              {flightPlan.location.airspaceType === "open" && (
                <p>This location is in open airspace. Standard drone regulations apply.</p>
              )}
            </div>
          </Card>
        )}
        
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-2">Type of Location</Label>
          <RadioGroup 
            value={flightPlan.location?.locationType || ""}
            onValueChange={(value) => handleLocationChange('locationType', value)}
            className="grid grid-cols-1 gap-2"
          >
            <Label className="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-100 cursor-pointer">
              <RadioGroupItem value="Built-up area (city, town)" className="mr-2" />
              <span>Built-up area (city, town)</span>
            </Label>
            <Label className="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-100 cursor-pointer">
              <RadioGroupItem value="Populated area (village, settlement)" className="mr-2" />
              <span>Populated area (village, settlement)</span>
            </Label>
            <Label className="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-100 cursor-pointer">
              <RadioGroupItem value="Rural/unpopulated area" className="mr-2" />
              <span>Rural/unpopulated area</span>
            </Label>
            <Label className="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-100 cursor-pointer">
              <RadioGroupItem value="National park or protected area" className="mr-2" />
              <span>National park or protected area</span>
            </Label>
          </RadioGroup>
        </div>
      </>
    );
  };
  
  // Render flight step content
  const renderFlightContent = () => {
    return (
      <>
        <h2 className="font-heading font-semibold text-lg text-gray-700 mb-4">
          Flight Details
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Provide details about your planned drone flight.
        </p>
        
        <div className="mb-4">
          <Label htmlFor="flight-date" className="block text-sm font-medium text-gray-700 mb-1">
            Planned Flight Date
          </Label>
          <Input
            type="date"
            id="flight-date"
            value={flightPlan.flight?.date || ""}
            onChange={(e) => handleFlightChange('date', e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="mb-4">
          <Label htmlFor="flight-time" className="block text-sm font-medium text-gray-700 mb-1">
            Planned Flight Time
          </Label>
          <Input
            type="time"
            id="flight-time"
            value={flightPlan.flight?.time || ""}
            onChange={(e) => handleFlightChange('time', e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="mb-4">
          <Label htmlFor="flight-duration" className="block text-sm font-medium text-gray-700 mb-1">
            Estimated Duration (minutes)
          </Label>
          <Input
            type="number"
            id="flight-duration"
            min="1"
            max="120"
            value={flightPlan.flight?.duration || ""}
            onChange={(e) => handleFlightChange('duration', parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div className="mb-4">
          <Label htmlFor="flight-altitude" className="block text-sm font-medium text-gray-700 mb-1">
            Maximum Altitude (meters AGL)
          </Label>
          <Input
            type="number"
            id="flight-altitude"
            min="0"
            max="500"
            value={flightPlan.flight?.altitude || ""}
            onChange={(e) => handleFlightChange('altitude', parseInt(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            CAA Nepal limit is 120 meters AGL (above ground level).
          </p>
        </div>
        
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-2">Visual Line of Sight</Label>
          <RadioGroup 
            value={flightPlan.flight?.maintainsVlos ? "yes" : "no"}
            onValueChange={(value) => handleFlightChange('maintainsVlos', value === "yes")}
            className="grid grid-cols-1 gap-2"
          >
            <Label className="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-100 cursor-pointer">
              <RadioGroupItem value="yes" className="mr-2" />
              <span>Yes, I will maintain visual line of sight at all times</span>
            </Label>
            <Label className="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-100 cursor-pointer">
              <RadioGroupItem value="no" className="mr-2" />
              <span>No, this will be a BVLOS operation (special permission required)</span>
            </Label>
          </RadioGroup>
        </div>
        
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-2">Night Operation</Label>
          <RadioGroup 
            value={flightPlan.flight?.isNightOperation ? "yes" : "no"}
            onValueChange={(value) => handleFlightChange('isNightOperation', value === "yes")}
            className="grid grid-cols-1 gap-2"
          >
            <Label className="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-100 cursor-pointer">
              <RadioGroupItem value="yes" className="mr-2" />
              <span>Yes, this will be a night operation (special permission required)</span>
            </Label>
            <Label className="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-100 cursor-pointer">
              <RadioGroupItem value="no" className="mr-2" />
              <span>No, this will be a daytime operation</span>
            </Label>
          </RadioGroup>
        </div>
      </>
    );
  };
  
  // Render results step content
  const renderResultsContent = () => {
    // Debug the state of the flight plan results
    console.log("Rendering results content, flightPlan:", flightPlan);
    
    // Check if results are missing or still being generated
    if (!flightPlan.results) {
      console.log("No results available, showing loading state");
      
      // Force results generation again if we're on this step but have no results
      if (flightPlan.step === 4 && flightPlan.intent && flightPlan.location && flightPlan.flight) {
        console.log("Regenerating results as we're on step 4 with all required data");
        setTimeout(() => generateResults(), 100); // Try regenerating results
      }
      
      return (
        <div className="text-center py-8">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-10 w-10 bg-gray-300 rounded-full mb-4"></div>
            <div className="h-4 w-40 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 w-64 bg-gray-300 rounded"></div>
          </div>
          <p className="text-gray-500 mt-4">Generating your flight assessment...</p>
          <p className="text-xs text-gray-400 mt-2">This may take a few moments</p>
        </div>
      );
    }
    
    console.log("Results available, rendering assessment");
    
    return (
      <>
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h2 className="font-heading font-semibold text-xl text-gray-800 mb-2">
            Flight Assessment Results
          </h2>
          <p className="text-sm text-gray-600">
            Assessment based on your flight plan details and Nepal drone regulations
          </p>
        </div>
        
        <Card className={`p-4 mb-6 shadow-md border-l-4 ${
          flightPlan.results.isPermitted ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'
        }`}>
          <div className="flex items-start">
            <div className="mr-3">
              {flightPlan.results.isPermitted ? (
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              ) : (
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {flightPlan.results.isPermitted ? (
                  <span className="text-green-700">Flight May Be Permitted</span>
                ) : (
                  <span className="text-red-700">Special Authorization Required</span>
                )}
              </h3>
              
              <p className="text-sm mt-1">
                {flightPlan.results.isPermitted
                  ? "Based on your inputs, your planned drone flight may be permitted, but you may need to obtain specific permissions as detailed below."
                  : "Based on your inputs, your planned drone flight is not permitted without special authorization due to regulatory restrictions."}
              </p>
            </div>
          </div>
        </Card>
        
        <div className="space-y-6">
          {flightPlan.results.permissionsRequired.length > 0 && (
            <Card className="p-4 shadow-sm border border-gray-200">
              <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                <div className="p-1 bg-blue-100 rounded-full mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                Required Permissions
              </h3>
              <ul className="list-disc pl-5 text-sm space-y-2">
                {flightPlan.results.permissionsRequired.map((permission, index) => (
                  <li key={index} className="text-gray-700">{permission}</li>
                ))}
              </ul>
            </Card>
          )}
          
          {flightPlan.results.advisoryMessages.length > 0 && (
            <Card className="p-4 shadow-sm border-l-4 border-l-yellow-400 bg-yellow-50">
              <h3 className="font-medium text-yellow-800 mb-3 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Advisory Notices
              </h3>
              <ul className="list-disc pl-5 text-sm space-y-2">
                {flightPlan.results.advisoryMessages.map((message, index) => (
                  <li key={index} className="text-gray-700">{message}</li>
                ))}
              </ul>
            </Card>
          )}
          
          <Card className="p-4 shadow-sm border border-gray-200">
            <h3 className="font-medium text-gray-800 mb-3 flex items-center">
              <div className="p-1 bg-gray-100 rounded-full mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              Applicable Regulations
            </h3>
            <ul className="list-disc pl-5 text-sm space-y-2">
              {flightPlan.results.regulationsApplicable.map((regulation, index) => (
                <li key={index} className="text-gray-700">{regulation}</li>
              ))}
            </ul>
            <p className="text-xs text-gray-500 mt-3 italic">
              Source: CAA Nepal Drone Regulations
            </p>
          </Card>
          
          <Card className="p-5 shadow-md bg-blue-50 border border-blue-100">
            <h3 className="font-medium text-blue-800 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mr-2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              What's Next?
            </h3>
            <p className="text-sm text-blue-900">
              This assessment is for informational purposes only and does not constitute official permission to fly.
            </p>
            <ul className="list-disc pl-5 text-sm mt-3 space-y-2 text-blue-800">
              <li>Contact CAA Nepal for official verification and permissions</li>
              <li>Submit required documentation well in advance of your flight</li>
              <li>Check for NOTAM (Notice to Airmen) before your flight</li>
              <li>Always follow CAA Nepal regulations and guidelines</li>
            </ul>
          </Card>
        </div>
        
        <div className="mt-6 space-y-3">
          <Button
            onClick={() => window.open('https://caanepal.gov.np/', '_blank')}
            className="w-full bg-[#003893] text-white hover:bg-[#003893]/90 py-2"
          >
            Visit CAA Nepal Website
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="w-full py-2 border-[#003893] text-[#003893]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Print Assessment
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {
              // Reset to step 1
              flightPlan.step = 1;
              window.location.reload();
            }}
            className="w-full py-2"
          >
            Start New Assessment
          </Button>
        </div>
      </>
    );
  };
  
  // Render content based on current step
  const renderStepContent = () => {
    switch (flightPlan.step) {
      case 1:
        return renderIntentContent();
      case 2:
        return renderLocationContent();
      case 3:
        return renderFlightContent();
      case 4:
        return renderResultsContent();
      default:
        return null;
    }
  };
  
  return (
    <div className="side-panel w-full md:w-2/5 lg:w-1/3 bg-white p-5 rounded-lg shadow-md mr-0 md:mr-4 mb-4 md:mb-0 overflow-y-auto">
      {/* Step indicator */}
      {renderStepIndicator()}
      
      {/* Current step content */}
      <div id="step-content" className="mb-6">
        {renderStepContent()}
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={flightPlan.step === 1}
          className="px-4 py-2 flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Previous</span>
        </Button>
        
        {flightPlan.step < 4 ? (
          <Button
            onClick={handleNext}
            disabled={!isFormValid}
            className="px-4 py-2 bg-[#E81E25] text-white hover:bg-[#E81E25]/90 flex items-center"
          >
            <span>Next</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#003893] text-white hover:bg-[#003893]/90"
          >
            Start New Plan
          </Button>
        )}
      </div>
    </div>
  );
};

export default SidePanel;
