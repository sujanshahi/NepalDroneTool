import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useFlightPlan } from '@/context/FlightPlanContext';
import { 
  NEPAL_CENTER, 
  DEFAULT_ZOOM, 
  ZONE_STYLES, 
  MAP_LAYERS 
} from '@/lib/constants';
import { airspaceZones } from '@/data/airspaceData';
import { AirspaceZone, MapControls } from '@/lib/types';
import { setupCustomMarkerIcon, createZoneCircle, fetchNepalOutline, reverseGeocode } from '@/lib/mapUtils';
import { 
  Layers, HelpCircle, Focus, Maximize, Minimize, Search, 
  Crosshair, Ruler, CircleDashed, MapPin, FileText, 
  ImageIcon, Share2, LocateFixed, Home, Download, Printer, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
//import MapSidebar from '@/components/MapSidebar';

interface MapViewProps {
  onOpenInfoDrawer: (zone?: AirspaceZone) => void;
  onCursorPositionChange?: (position: [number, number] | null) => void;
}

const MapView: React.FC<MapViewProps> = ({ 
  onOpenInfoDrawer,
  onCursorPositionChange
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup>(new L.LayerGroup());
  const zonesLayerRef = useRef<L.LayerGroup>(new L.LayerGroup());
  const nepalOutlineRef = useRef<L.GeoJSON | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  const { flightPlan, updateLocation } = useFlightPlan();
  
  const [mapControls, setMapControls] = useState<MapControls>({
    layers: {
      restricted: true,
      controlled: true,
      advisory: true,
      open: true
    },
    isDrawerOpen: false
  });
  
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<[number, number] | null>(null);
  const [activeLayers, setActiveLayers] = useState({
    airspace: true,
    aerodromes: false,
    nationalParks: false
  });
  const [mapType, setMapType] = useState('default');
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  
  // Map tile URLs for different map types
  const mapTiles = {
    default: {
      url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      attribution: 'Map data &copy; Google'
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    },
    terrain: {
      url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
      attribution: 'Map data &copy; Google'
    }
  };
  
  // Initialize map on component mount
  useEffect(() => {
    if (!mapRef.current) {
      // Create map instance
      const map = L.map('map', {
        center: NEPAL_CENTER,
        zoom: DEFAULT_ZOOM
      });
      
      // Add default map tile layer
      tileLayerRef.current = L.tileLayer(mapTiles.default.url, {
        attribution: mapTiles.default.attribution,
        maxZoom: 19
      }).addTo(map);
      
      // Initialize layers
      markersLayerRef.current = L.layerGroup().addTo(map);
      zonesLayerRef.current = L.layerGroup().addTo(map);
      
      // We're disabling the Nepal outline to improve interface clarity
  // If needed, a more subtle outline can be re-enabled later
      
      // Store map reference
      mapRef.current = map;
      
      // Add click handler to map for location selection
      map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        
        // Add marker at clicked location
        await handleLocationSelect([lat, lng]);
      });
      
      // Track cursor position on mouse move
      map.on('mousemove', (e) => {
        const { lat, lng } = e.latlng;
        const position: [number, number] = [lat, lng];
        setCursorPosition(position);
        if (onCursorPositionChange) {
          onCursorPositionChange(position);
        }
      });
      
      // Clear cursor position when mouse leaves the map
      map.on('mouseout', () => {
        setCursorPosition(null);
        if (onCursorPositionChange) {
          onCursorPositionChange(null);
        }
      });
    }
    
    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // We removed the Nepal outline glow effect to improve performance
  
  // Update map size when fullscreen state changes
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 100);
    }
  }, [isFullScreen]);
  
  // Update map with airspace zones
  useEffect(() => {
    if (!mapRef.current || !zonesLayerRef.current) return;
    
    // Clear existing zones
    zonesLayerRef.current.clearLayers();
    
    // Add zones based on current visibility settings
    airspaceZones.forEach(zone => {
      if (!mapControls.layers[zone.type as keyof typeof mapControls.layers]) {
        return; // Skip if this layer type is turned off
      }
      
      // Convert all zones to circular representation
      const circleLayer = createZoneCircle(zone, handleZoneClick);
      if (circleLayer) zonesLayerRef.current.addLayer(circleLayer);
    });
    
  }, [mapControls.layers]);
  
  // Update marker when location changes
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;
    
    if (flightPlan.location?.coordinates) {
      // Clear existing markers
      markersLayerRef.current.clearLayers();
      
      // Add marker at selected location
      const icon = setupCustomMarkerIcon();
      const marker = L.marker(flightPlan.location.coordinates, {
        icon,
        draggable: true
      }).addTo(markersLayerRef.current);
      
      // Add popup to marker
      marker.bindPopup(`
        <b>Selected Location</b><br>
        ${flightPlan.location.address || 'Unknown address'}<br>
        <a href="#" class="text-[#003893]" onclick="document.getElementById('setAsLocation').click(); return false;">Set as takeoff point</a>
      `).openPopup();
      
      // Handle marker drag
      marker.on('dragend', async () => {
        const position = marker.getLatLng();
        await handleLocationSelect([position.lat, position.lng]);
      });
      
      // Create a hidden button that the popup can trigger
      const hiddenButton = document.createElement('button');
      hiddenButton.id = 'setAsLocation';
      hiddenButton.style.display = 'none';
      hiddenButton.onclick = () => {
        // This function would be called when the link in the popup is clicked
        console.log('Location confirmed by user');
        // Any additional actions...
      };
      document.body.appendChild(hiddenButton);
      
      return () => {
        // Cleanup hidden button
        hiddenButton.remove();
      };
    }
  }, [flightPlan.location?.coordinates]);
  
  // Handle location selection (either by map click or marker drag)
  const handleLocationSelect = async (coordinates: [number, number]) => {
    try {
      // Perform reverse geocoding
      const locationInfo = await reverseGeocode(coordinates);
      
      // Update location in flight plan
      updateLocation({
        coordinates,
        address: locationInfo.address,
        district: locationInfo.district
      });
      
    } catch (error) {
      console.error('Error selecting location:', error);
    }
  };
  
  // Handle airspace zone click
  const handleZoneClick = (zone: AirspaceZone) => {
    setMapControls(prev => ({
      ...prev,
      selectedZone: zone
    }));
    
    onOpenInfoDrawer(zone);
  };
  
  // Toggle layer visibility
  const toggleLayer = (layerType: keyof typeof mapControls.layers) => {
    setMapControls(prev => ({
      ...prev,
      layers: {
        ...prev.layers,
        [layerType]: !prev.layers[layerType]
      }
    }));
  };
  
  // Center map on Nepal
  const centerOnNepal = () => {
    if (mapRef.current) {
      mapRef.current.setView(NEPAL_CENTER, DEFAULT_ZOOM);
    }
  };
  
  // Show help/info drawer
  const showHelp = () => {
    onOpenInfoDrawer();
  };
  
  // Toggle fullscreen mode
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Handle sidebar layer toggle
  const handleLayerToggle = (layerName: string, checked: boolean) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerName]: checked
    }));
  };

  // Handle map type change
  const handleMapTypeChange = (type: string) => {
    setMapType(type);
  };
  
  // Effect to update map type when it changes
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;
    
    // Remove current tile layer
    tileLayerRef.current.remove();
    
    // Add new tile layer based on selected map type
    const selectedTile = mapTiles[mapType as keyof typeof mapTiles] || mapTiles.default;
    tileLayerRef.current = L.tileLayer(selectedTile.url, {
      attribution: selectedTile.attribution,
      maxZoom: 19
    }).addTo(mapRef.current);
    
  }, [mapType]);

  // Handle center change from coordinates
  const handleCenterChange = (center: [number, number]) => {
    if (mapRef.current) {
      mapRef.current.setView(center, mapRef.current.getZoom());
    }
  };

  // Use browser geolocation
  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 15);
            handleLocationSelect([latitude, longitude]);
          }
        },
        (error) => {
          console.error('Error getting current location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser');
    }
  };
  
  // Define new states for map tools
  const [activeMapTool, setActiveMapTool] = useState<string | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [drawingEnabled, setDrawingEnabled] = useState(false);
  const [measurementMode, setMeasurementMode] = useState(false);

  // Function to activate a map tool
  const activateMapTool = (toolName: string) => {
    if (activeMapTool === toolName) {
      // If tool is already active, deactivate it
      setActiveMapTool(null);
    } else {
      // Activate the new tool and deactivate any other active tool
      setActiveMapTool(toolName);
    }
  };

  return (
    <div className={`h-full ${isFullScreen ? 'fixed inset-0 z-50' : ''}`}>
      <div 
        ref={mapContainerRef}
        className={`map-container bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-all duration-300 h-full ${
          isFullScreen 
            ? 'rounded-none' 
            : ''
        }`}
      >
        <div className="p-3 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h2 className="font-heading font-semibold text-gray-700">Drone Flight Planner</h2>
            <div className="flex">
              <Button
                variant="outline"
                size="sm"
                className={`rounded-l-md ${mapType === 'default' ? 'bg-gray-200' : ''}`}
                onClick={() => handleMapTypeChange('default')}
              >
                Map
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`rounded-none border-l-0 ${mapType === 'satellite' ? 'bg-gray-200' : ''}`}
                onClick={() => handleMapTypeChange('satellite')}
              >
                Satellite
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`rounded-r-md border-l-0 ${mapType === 'terrain' ? 'bg-gray-200' : ''}`}
                onClick={() => handleMapTypeChange('terrain')}
              >
                Terrain
              </Button>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              size="icon"
              variant="outline"
              className="p-2 rounded-md hover:bg-gray-200 flex items-center"
              onClick={centerOnNepal}
            >
              <Home className="h-4 w-4 text-gray-700" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="p-2 rounded-md hover:bg-gray-200 flex items-center"
              onClick={handleUseMyLocation}
            >
              <LocateFixed className="h-4 w-4 text-gray-700" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="p-2 rounded-md hover:bg-gray-200 flex items-center"
              onClick={toggleFullScreen}
            >
              {isFullScreen ? (
                <Minimize className="h-4 w-4 text-gray-700" />
              ) : (
                <Maximize className="h-4 w-4 text-gray-700" />
              )}
            </Button>
          </div>
        </div>

        {/* Map Tools Panel - Vertical on left side like in reference image */}
        <div className="flex h-full relative">
          <div className="absolute left-3 top-3 bg-white rounded-md shadow-md z-10">
            <TooltipProvider>
              <div className="flex flex-col gap-1 p-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="icon" 
                      variant={activeMapTool === 'layers' ? 'default' : 'ghost'}
                      className="h-8 w-8 p-1"
                      onClick={() => setMapControls(prev => ({ ...prev, isDrawerOpen: !prev.isDrawerOpen }))}
                    >
                      <Layers className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Toggle Map Layers</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="icon" 
                      variant={activeMapTool === 'search' ? 'default' : 'ghost'}
                      className="h-8 w-8 p-1"
                      onClick={() => activateMapTool('search')}
                    >
                      <Search className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Search Location</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="icon" 
                      variant={activeMapTool === 'marker' ? 'default' : 'ghost'}
                      className="h-8 w-8 p-1"
                      onClick={() => activateMapTool('marker')}
                    >
                      <MapPin className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Place Marker</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="icon" 
                      variant={activeMapTool === 'measure' ? 'default' : 'ghost'}
                      className="h-8 w-8 p-1"
                      onClick={() => activateMapTool('measure')}
                    >
                      <Ruler className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Measure Distance</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="icon" 
                      variant={activeMapTool === 'circle' ? 'default' : 'ghost'}
                      className="h-8 w-8 p-1"
                      onClick={() => activateMapTool('circle')}
                    >
                      <CircleDashed className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Draw Circle</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="icon" 
                      variant={activeMapTool === 'export' ? 'default' : 'ghost'}
                      className="h-8 w-8 p-1"
                      onClick={() => activateMapTool('export')}
                    >
                      <Download className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Export Map</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="icon" 
                      variant={activeMapTool === 'print' ? 'default' : 'ghost'}
                      className="h-8 w-8 p-1"
                      onClick={() => activateMapTool('print')}
                    >
                      <Printer className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Print Map</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="icon" 
                      variant="ghost"
                      className="h-8 w-8 p-1"
                      onClick={showHelp}
                    >
                      <HelpCircle className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Help</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>

          {/* Layer control panel */}
          {mapControls.isDrawerOpen && (
            <div className="absolute left-16 top-3 bg-white shadow-md rounded-md p-3 z-10 w-64 border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-sm">Map Layers</h3>
                <Button 
                  size="icon" 
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => setMapControls(prev => ({ ...prev, isDrawerOpen: false }))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="border-b pb-2">
                  <h4 className="text-xs font-medium text-gray-500 mb-2">AIRSPACE ZONES</h4>
                  <div className="space-y-2">
                    <label className="flex items-center text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mapControls.layers.restricted}
                        onChange={() => toggleLayer('restricted')}
                        className="mr-2"
                      />
                      <div className="w-4 h-4 mr-2 rounded-sm bg-[#e74c3c]"></div>
                      {MAP_LAYERS.RESTRICTED}
                    </label>
                    
                    <label className="flex items-center text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mapControls.layers.controlled}
                        onChange={() => toggleLayer('controlled')}
                        className="mr-2"
                      />
                      <div className="w-4 h-4 mr-2 rounded-sm bg-[#e67e22]"></div>
                      {MAP_LAYERS.CONTROLLED}
                    </label>
                    
                    <label className="flex items-center text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mapControls.layers.advisory}
                        onChange={() => toggleLayer('advisory')}
                        className="mr-2"
                      />
                      <div className="w-4 h-4 mr-2 rounded-sm bg-[#3498db]"></div>
                      {MAP_LAYERS.ADVISORY}
                    </label>
                    
                    <label className="flex items-center text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mapControls.layers.open}
                        onChange={() => toggleLayer('open')}
                        className="mr-2"
                      />
                      <div className="w-4 h-4 mr-2 rounded-sm bg-[#2ecc71]"></div>
                      {MAP_LAYERS.OPEN}
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-medium text-gray-500 mb-2">OTHER FEATURES</h4>
                  <div className="space-y-2">
                    <label className="flex items-center text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activeLayers.aerodromes}
                        onChange={(e) => handleLayerToggle('aerodromes', e.target.checked)}
                        className="mr-2"
                      />
                      Aerodromes
                    </label>
                    
                    <label className="flex items-center text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activeLayers.nationalParks}
                        onChange={(e) => handleLayerToggle('nationalParks', e.target.checked)}
                        className="mr-2"
                      />
                      National Parks
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div id="map" className="flex-grow" style={{ minHeight: isFullScreen ? 'calc(100vh - 140px)' : 'calc(100vh - 164px)' }}>
          {/* Map will be initialized here via Leaflet */}
        </div>
        
        <div className="p-3 border-t border-gray-200 bg-white">
          <div className="flex flex-wrap items-center justify-between text-xs">
            <div className="flex gap-3">
              <div className="flex items-center px-1.5 py-1 bg-[#e74c3c] text-white rounded-sm">
                <span>Restricted Airspace</span>
              </div>
              <div className="flex items-center px-1.5 py-1 bg-[#e67e22] text-white rounded-sm">
                <span>Controlled Airspace</span>
              </div>
              <div className="flex items-center px-1.5 py-1 bg-[#3498db] text-white rounded-sm">
                <span>Advisory Area</span>
              </div>
              <div className="flex items-center px-1.5 py-1 bg-[#2ecc71] text-white rounded-sm">
                <span>Open Airspace</span>
              </div>
              <div className="flex items-center px-1.5 py-1 bg-gray-100 rounded-sm">
                <img src="https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png" alt="Marker" style={{ width: '16px', height: '16px' }} className="mr-1" />
                <span>Selected Location</span>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <span>© Leaflet | Map data © Google</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
