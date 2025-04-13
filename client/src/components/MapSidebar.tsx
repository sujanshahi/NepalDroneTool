import React, { useState } from 'react';
import { useFlightPlan } from '@/context/FlightPlanContext';
import {
  Layers,
  Settings,
  Map,
  Search,
  Crosshair,
  MapPin,
  Ruler,
  Info,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Save,
  RefreshCw,
  SlidersHorizontal,
  Plane
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CoordinateValues {
  lat: string;
  lng: string;
}

interface MapSidebarProps {
  cursorPosition: [number, number] | null;
  onCenterChange: (center: [number, number]) => void;
  onLayerToggle: (layerName: string, checked: boolean) => void;
  onUseMyLocation: () => void;
  onMapTypeChange: (mapType: string) => void;
  activeLayers: Record<string, boolean>;
  mapType: string;
}

const MapSidebar: React.FC<MapSidebarProps> = ({
  cursorPosition,
  onCenterChange,
  onLayerToggle,
  onUseMyLocation,
  onMapTypeChange,
  activeLayers,
  mapType
}) => {
  // State for coordinate inputs
  const [coordinates, setCoordinates] = useState<CoordinateValues>({ lat: '', lng: '' });
  const [locationSearch, setLocationSearch] = useState('');
  const [pilotSearch, setPilotSearch] = useState('');
  const [pilotCoordinates, setPilotCoordinates] = useState<CoordinateValues>({ lat: '', lng: '' });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showMeasurementTool, setShowMeasurementTool] = useState(false);
  const [showOperationTools, setShowOperationTools] = useState(false);
  const [mapControls, setMapControls] = useState({
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: true,
    fullscreenControl: true,
    showLegend: true,
    showSidebarHelp: false
  });

  // Handle coordinate entry
  const handleCoordinateChange = (field: 'lat' | 'lng', value: string) => {
    setCoordinates({ ...coordinates, [field]: value });
  };

  // Handle pilot coordinate entry
  const handlePilotCoordinateChange = (field: 'lat' | 'lng', value: string) => {
    setPilotCoordinates({ ...pilotCoordinates, [field]: value });
  };

  // Handle center map by coordinates
  const handleCenterByCoordinates = () => {
    const lat = parseFloat(coordinates.lat);
    const lng = parseFloat(coordinates.lng);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      onCenterChange([lat, lng]);
    }
  };

  // Handle layer toggle
  const handleLayerToggle = (layerName: string, checked: boolean) => {
    onLayerToggle(layerName, checked);
  };

  // Handle map control toggle
  const handleMapControlToggle = (controlName: keyof typeof mapControls, checked: boolean) => {
    setMapControls({ ...mapControls, [controlName]: checked });
  };

  // Handle saving current settings as default
  const handleSaveDefaults = () => {
    // Save current settings to localStorage
    localStorage.setItem('mapDefaults', JSON.stringify({
      mapType,
      activeLayers,
      mapControls
    }));
  };

  // Handle restoring defaults
  const handleRestoreDefaults = () => {
    localStorage.removeItem('mapDefaults');
    // Implement reset to original defaults
  };

  return (
    <div className="h-full overflow-y-auto bg-white shadow-md border-r border-gray-200 w-72 flex flex-col">
      <div className="p-4 flex-1 overflow-y-auto">
        <h2 className="text-lg font-semibold text-center mb-4">Map Tools</h2>
        
        <Accordion type="multiple" defaultValue={['layers', 'mapCenter', 'pilotLocation']}>
          {/* LAYERS SECTION */}
          <AccordionItem value="layers">
            <AccordionTrigger className="py-2 text-sm font-medium flex items-center">
              <Layers className="h-4 w-4 mr-2" />
              <span>LAYERS</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pl-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="airspaceLayer" className="text-sm font-normal">
                    Airspace Layer
                  </Label>
                  <Switch 
                    id="airspaceLayer" 
                    checked={activeLayers.airspace || false}
                    onCheckedChange={(checked) => handleLayerToggle('airspace', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="aerodromesLayer" className="text-sm font-normal">
                    Aerodromes Layer
                  </Label>
                  <Switch 
                    id="aerodromesLayer" 
                    checked={activeLayers.aerodromes || false}
                    onCheckedChange={(checked) => handleLayerToggle('aerodromes', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="nationalParksLayer" className="text-sm font-normal">
                    National Parks Layer
                  </Label>
                  <Switch 
                    id="nationalParksLayer" 
                    checked={activeLayers.nationalParks || false}
                    onCheckedChange={(checked) => handleLayerToggle('nationalParks', checked)}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* MAP CONTROLS SECTION */}
          <AccordionItem value="mapControls">
            <AccordionTrigger className="py-2 text-sm font-medium flex items-center">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              <span>MAP CONTROLS</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pl-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="zoomControl" className="text-sm font-normal">
                    Zoom Control
                  </Label>
                  <Switch 
                    id="zoomControl" 
                    checked={mapControls.zoomControl}
                    onCheckedChange={(checked) => handleMapControlToggle('zoomControl', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="streetViewControl" className="text-sm font-normal">
                    Street View Control
                  </Label>
                  <Switch 
                    id="streetViewControl" 
                    checked={mapControls.streetViewControl}
                    onCheckedChange={(checked) => handleMapControlToggle('streetViewControl', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mapTypeControl" className="text-sm font-normal">
                    Map Type Control
                  </Label>
                  <Switch 
                    id="mapTypeControl" 
                    checked={mapControls.mapTypeControl}
                    onCheckedChange={(checked) => handleMapControlToggle('mapTypeControl', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="fullscreenControl" className="text-sm font-normal">
                    Fullscreen Control
                  </Label>
                  <Switch 
                    id="fullscreenControl" 
                    checked={mapControls.fullscreenControl}
                    onCheckedChange={(checked) => handleMapControlToggle('fullscreenControl', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="showLegend" className="text-sm font-normal">
                    Show Legend
                  </Label>
                  <Switch 
                    id="showLegend" 
                    checked={mapControls.showLegend}
                    onCheckedChange={(checked) => handleMapControlToggle('showLegend', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="showSidebarHelp" className="text-sm font-normal">
                    Show Sidebar Help
                  </Label>
                  <Switch 
                    id="showSidebarHelp" 
                    checked={mapControls.showSidebarHelp}
                    onCheckedChange={(checked) => handleMapControlToggle('showSidebarHelp', checked)}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* MAP DEFAULTS SECTION */}
          <AccordionItem value="mapDefaults">
            <AccordionTrigger className="py-2 text-sm font-medium flex items-center">
              <Map className="h-4 w-4 mr-2" />
              <span>MAP DEFAULTS</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pl-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full flex items-center justify-center"
                  onClick={handleSaveDefaults}
                >
                  <Save className="h-4 w-4 mr-2" />
                  <span className="text-xs">Save Current Settings as Default</span>
                </Button>
                <p className="text-xs text-gray-500">
                  (Zoom level, Center, Map Type)
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full flex items-center justify-center"
                  onClick={handleRestoreDefaults}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  <span className="text-xs">Restore Original NRC Defaults</span>
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* MAP CENTER SECTION */}
          <AccordionItem value="mapCenter">
            <AccordionTrigger className="py-2 text-sm font-medium flex items-center">
              <Crosshair className="h-4 w-4 mr-2" />
              <span>MAP CENTRE</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pl-6">
                <div>
                  <Label htmlFor="locationSearch" className="text-sm font-normal block mb-1">
                    Search Location
                  </Label>
                  <div className="flex gap-1">
                    <Input 
                      id="locationSearch" 
                      placeholder="Enter location" 
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      className="text-sm"
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                            <Search className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Search location</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full flex items-center justify-center"
                  onClick={onUseMyLocation}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-xs">My Position / Geolocation</span>
                </Button>

                <div>
                  <p className="text-sm font-normal mb-1">Enter Coordinates</p>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <Label htmlFor="latitude" className="text-xs block mb-1">
                        Latitude:
                      </Label>
                      <Input 
                        id="latitude" 
                        placeholder="e.g., 27.7172" 
                        className="text-sm"
                        value={coordinates.lat}
                        onChange={(e) => handleCoordinateChange('lat', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="longitude" className="text-xs block mb-1">
                        Longitude:
                      </Label>
                      <Input 
                        id="longitude" 
                        placeholder="e.g., 85.3240" 
                        className="text-sm"
                        value={coordinates.lng}
                        onChange={(e) => handleCoordinateChange('lng', e.target.value)}
                      />
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={handleCenterByCoordinates}
                  >
                    Go to Location
                  </Button>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Cursor Position (Live)</p>
                  <p className="text-sm bg-gray-100 p-2 rounded">
                    Lat: {cursorPosition ? cursorPosition[0].toFixed(4) : '0.0000'}, 
                    Lng: {cursorPosition ? cursorPosition[1].toFixed(4) : '0.0000'}
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* OPERATION DETAILS SECTION */}
          <AccordionItem value="operationDetails">
            <AccordionTrigger className="py-2 text-sm font-medium flex items-center">
              <Plane className="h-4 w-4 mr-2" />
              <span>OPERATION DETAILS</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pl-6">
                <div>
                  <Label className="text-sm font-normal block mb-1">
                    Select Category:
                  </Label>
                  <RadioGroup 
                    value={selectedCategory || ''} 
                    onValueChange={setSelectedCategory as (value: string) => void}
                    className="space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="micro" id="micro" />
                      <Label htmlFor="micro" className="text-sm font-normal">MICRO (&lt;250g)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="basic" id="basic" />
                      <Label htmlFor="basic" className="text-sm font-normal">BASIC</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="advanced" id="advanced" />
                      <Label htmlFor="advanced" className="text-sm font-normal">ADVANCED</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label 
                    htmlFor="showOperationTools" 
                    className="text-sm font-normal"
                  >
                    Show Operation Design Tools
                  </Label>
                  <Switch 
                    id="showOperationTools" 
                    checked={showOperationTools}
                    onCheckedChange={setShowOperationTools}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label 
                    htmlFor="showMeasurementTool" 
                    className="text-sm font-normal"
                  >
                    Show Measurement Tool
                  </Label>
                  <Switch 
                    id="showMeasurementTool" 
                    checked={showMeasurementTool}
                    onCheckedChange={setShowMeasurementTool}
                  />
                </div>
                
                {showMeasurementTool && (
                  <p className="text-xs text-gray-500">
                    Place two markers and measure distance
                  </p>
                )}
                
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Operation Bounds Display</p>
                  <Card className="bg-gray-100">
                    <CardContent className="p-2">
                      <p className="text-xs">
                        N: 00.0000°, E: 00.0000°<br />
                        S: 00.0000°, W: 00.0000°
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* PILOT LOCATION SECTION */}
          <AccordionItem value="pilotLocation">
            <AccordionTrigger className="py-2 text-sm font-medium flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              <span>PILOT LOCATION</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pl-6">
                <div>
                  <Label htmlFor="pilotSearch" className="text-sm font-normal block mb-1">
                    Search
                  </Label>
                  <div className="flex gap-1">
                    <Input 
                      id="pilotSearch" 
                      placeholder="Enter location" 
                      value={pilotSearch}
                      onChange={(e) => setPilotSearch(e.target.value)}
                      className="text-sm"
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                            <Search className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Search location</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full flex items-center justify-center"
                  onClick={onUseMyLocation}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-xs">Use My Location</span>
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full flex items-center justify-center"
                >
                  <Crosshair className="h-4 w-4 mr-2" />
                  <span className="text-xs">Click on Map to Set</span>
                </Button>

                <div>
                  <p className="text-sm font-normal mb-1">Manual Entry</p>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <Label htmlFor="pilotLatitude" className="text-xs block mb-1">
                        Latitude:
                      </Label>
                      <Input 
                        id="pilotLatitude" 
                        placeholder="e.g., 27.7172" 
                        className="text-sm"
                        value={pilotCoordinates.lat}
                        onChange={(e) => handlePilotCoordinateChange('lat', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="pilotLongitude" className="text-xs block mb-1">
                        Longitude:
                      </Label>
                      <Input 
                        id="pilotLongitude" 
                        placeholder="e.g., 85.3240" 
                        className="text-sm"
                        value={pilotCoordinates.lng}
                        onChange={(e) => handlePilotCoordinateChange('lng', e.target.value)}
                      />
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                  >
                    Set Pilot Location
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* FAQ / HELP SECTION */}
          <AccordionItem value="faq">
            <AccordionTrigger className="py-2 text-sm font-medium flex items-center">
              <HelpCircle className="h-4 w-4 mr-2" />
              <span>FAQ / HELP</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pl-6">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-xs"
                >
                  How to apply for drone permission?
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-xs"
                >
                  Understanding airspace layers
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-xs"
                >
                  Map control explanations
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-xs"
                >
                  Distance tool tutorial
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* SETTINGS SECTION */}
          <AccordionItem value="settings">
            <AccordionTrigger className="py-2 text-sm font-medium flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              <span>SETTINGS</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pl-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Toggle dark/light mode</span>
                  <Switch id="darkMode" />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs"
                >
                  Language preference
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs"
                >
                  Clear saved preferences
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="w-full text-xs"
                >
                  Feedback
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      {/* Footer with copyright */}
      <div className="px-4 py-2 border-t border-gray-200 text-center text-xs text-gray-500">
        Nepal Drone Flight Planner &copy; 2023
      </div>
    </div>
  );
};

export default MapSidebar;