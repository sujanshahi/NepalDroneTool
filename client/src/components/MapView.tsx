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
  
  // Keep track of measurement points and line
  const measurePointsRef = useRef<L.Marker[]>([]);
  const measureLineRef = useRef<L.Polyline | null>(null);
  const measureTooltipRef = useRef<L.Tooltip | null>(null);
  
  // Define new states for map tools
  const [activeMapTool, setActiveMapTool] = useState<string | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [drawingEnabled, setDrawingEnabled] = useState(false);
  const [measurementMode, setMeasurementMode] = useState(false);
  const [measurementResult, setMeasurementResult] = useState<string | null>(null);

  // Function to activate a map tool
  const activateMapTool = (toolName: string) => {
    // First, clean up any active tools
    cleanupActiveTool();
    
    if (activeMapTool === toolName) {
      // If tool is already active, deactivate it
      setActiveMapTool(null);
    } else {
      // Activate the new tool and deactivate any other active tool
      setActiveMapTool(toolName);
      
      // Initialize the tool
      if (toolName === 'measure') {
        startMeasurement();
      } else if (toolName === 'marker') {
        enableMarkerPlacement();
      } else if (toolName === 'circle') {
        enableCircleDrawing();
      }
    }
  };
  
  // Clean up active tool resources
  const cleanupActiveTool = () => {
    // Clean up measurement
    if (activeMapTool === 'measure') {
      cleanupMeasurement();
    }
    
    // Reset all tool states
    setMeasurementMode(false);
    setDrawingEnabled(false);
    setMeasurementResult(null);
  };
  
  // Start measurement mode
  const startMeasurement = () => {
    if (!mapRef.current) return;
    
    setMeasurementMode(true);
    setMeasurementResult('Click on the map to start measuring');
    
    // Create custom click handler for measurements
    const mapInstance = mapRef.current;
    
    // Remove existing click handler
    mapInstance.off('click');
    
    // Add measurement click handler
    mapInstance.on('click', handleMeasurementClick);
  };
  
  // Handle clicks during measurement
  const handleMeasurementClick = (e: L.LeafletMouseEvent) => {
    if (!mapRef.current) return;
    
    const { lat, lng } = e.latlng;
    
    // Create marker at clicked point
    const marker = L.marker([lat, lng], {
      icon: L.divIcon({
        className: 'measure-point',
        html: '<div class="w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>',
        iconSize: [10, 10],
        iconAnchor: [5, 5]
      })
    }).addTo(mapRef.current);
    
    // Add marker to our array
    measurePointsRef.current.push(marker);
    
    // If we have at least 2 points, draw/update the line
    if (measurePointsRef.current.length >= 2) {
      const points = measurePointsRef.current.map(m => m.getLatLng());
      
      // Calculate total distance
      let totalDistance = 0;
      for (let i = 1; i < points.length; i++) {
        totalDistance += points[i-1].distanceTo(points[i]);
      }
      
      // Format distance
      const distanceText = totalDistance < 1000 
        ? `${totalDistance.toFixed(1)} m` 
        : `${(totalDistance / 1000).toFixed(2)} km`;
      
      // Update or create line
      if (measureLineRef.current) {
        measureLineRef.current.setLatLngs(points);
      } else {
        measureLineRef.current = L.polyline(points, {
          color: '#3b82f6',
          weight: 3,
          dashArray: '5, 5',
          opacity: 0.7
        }).addTo(mapRef.current);
      }
      
      // Update distance tooltip
      if (measureTooltipRef.current) {
        measureTooltipRef.current.setLatLng(points[points.length - 1]);
        measureTooltipRef.current.setContent(`Distance: ${distanceText}`);
      } else {
        measureTooltipRef.current = L.tooltip({
          permanent: true,
          direction: 'top',
          className: 'bg-white px-2 py-1 rounded shadow text-xs',
          offset: [0, -10]
        })
        .setLatLng(points[points.length - 1])
        .setContent(`Distance: ${distanceText}`)
        .addTo(mapRef.current);
      }
      
      // Update the measurement result
      setMeasurementResult(`Measured distance: ${distanceText}`);
    } else {
      setMeasurementResult('Click again to measure distance');
    }
  };
  
  // Clean up measurement
  const cleanupMeasurement = () => {
    if (!mapRef.current) return;
    
    // Remove markers
    measurePointsRef.current.forEach(marker => {
      marker.remove();
    });
    measurePointsRef.current = [];
    
    // Remove line
    if (measureLineRef.current) {
      measureLineRef.current.remove();
      measureLineRef.current = null;
    }
    
    // Remove tooltip
    if (measureTooltipRef.current) {
      measureTooltipRef.current.remove();
      measureTooltipRef.current = null;
    }
    
    // Reset click handler
    mapRef.current.off('click');
    mapRef.current.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      await handleLocationSelect([lat, lng]);
    });
    
    setMeasurementResult(null);
  };
  
  // Marker placement variables
  const [markerPlacementStatus, setMarkerPlacementStatus] = useState<string>('');
  const customMarkerRef = useRef<L.Marker | null>(null);
  
  // Enable marker placement mode
  const enableMarkerPlacement = () => {
    if (!mapRef.current) return;
    
    setMarkerPlacementStatus('Click on the map to place a marker');
    
    // Remove existing click handler
    mapRef.current.off('click');
    
    // Add marker placement click handler
    mapRef.current.on('click', handleMarkerPlacement);
  };
  
  // Handle marker placement
  const handleMarkerPlacement = (e: L.LeafletMouseEvent) => {
    if (!mapRef.current) return;
    
    const { lat, lng } = e.latlng;
    
    // Remove existing custom marker if exists
    if (customMarkerRef.current) {
      customMarkerRef.current.remove();
    }
    
    // Create custom marker icon
    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="relative">
          <div class="w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">
            M
          </div>
          <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 border-solid border-t-red-500 border-t-8 border-x-transparent border-x-4 border-b-0"></div>
        </div>
      `,
      iconSize: [24, 36],
      iconAnchor: [12, 36]
    });
    
    // Create a new marker
    customMarkerRef.current = L.marker([lat, lng], {
      icon: customIcon,
      draggable: true
    }).addTo(mapRef.current);
    
    // Add a popup to the marker
    customMarkerRef.current.bindPopup(`
      <div class="p-1">
        <p class="text-sm font-medium">Custom Marker</p>
        <p class="text-xs">${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
      </div>
    `);
    
    // Update status
    setMarkerPlacementStatus('Marker placed. You can drag it to adjust position.');
    
    // Add drag end event to update popup content with new coordinates
    customMarkerRef.current.on('dragend', () => {
      if (customMarkerRef.current) {
        const newPos = customMarkerRef.current.getLatLng();
        customMarkerRef.current.setPopupContent(`
          <div class="p-1">
            <p class="text-sm font-medium">Custom Marker</p>
            <p class="text-xs">${newPos.lat.toFixed(6)}, ${newPos.lng.toFixed(6)}</p>
          </div>
        `);
      }
    });
    
    // Reset to normal click behavior after a short delay
    setTimeout(() => {
      setActiveMapTool(null);
      setMarkerPlacementStatus('');
      
      if (mapRef.current) {
        mapRef.current.off('click', handleMarkerPlacement);
        mapRef.current.on('click', async (e) => {
          const { lat, lng } = e.latlng;
          await handleLocationSelect([lat, lng]);
        });
      }
    }, 2000);
  };
  
  // Circle drawing references
  const circleMarkerRef = useRef<L.Marker | null>(null);
  const circleDrawingRef = useRef<L.Circle | null>(null);
  const circleCenterRef = useRef<[number, number] | null>(null);
  const [circleRadius, setCircleRadius] = useState<number>(0);
  const [circleDrawingStatus, setCircleDrawingStatus] = useState<string>('');
  
  // Enable circle drawing mode
  const enableCircleDrawing = () => {
    if (!mapRef.current) return;
    
    setCircleDrawingStatus('Click on the map to set the circle center');
    
    // Remove existing click handler
    mapRef.current.off('click');
    
    // Add circle center click handler
    mapRef.current.on('click', handleCircleCenterClick);
  };
  
  // Handle setting the circle center
  const handleCircleCenterClick = (e: L.LeafletMouseEvent) => {
    if (!mapRef.current) return;
    
    const { lat, lng } = e.latlng;
    circleCenterRef.current = [lat, lng];
    
    // Create or move the center marker
    if (circleMarkerRef.current) {
      circleMarkerRef.current.setLatLng([lat, lng]);
    } else {
      circleMarkerRef.current = L.marker([lat, lng], {
        icon: L.divIcon({
          className: 'circle-center-point',
          html: '<div class="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })
      }).addTo(mapRef.current);
    }
    
    // Create circle with initial radius of 100 meters
    const initialRadius = 100;
    setCircleRadius(initialRadius);
    
    if (circleDrawingRef.current) {
      circleDrawingRef.current.setLatLng([lat, lng]);
      circleDrawingRef.current.setRadius(initialRadius);
    } else {
      circleDrawingRef.current = L.circle([lat, lng], {
        radius: initialRadius,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.2,
        weight: 2
      }).addTo(mapRef.current);
    }
    
    setCircleDrawingStatus('Move the cursor to set the radius, click to confirm');
    
    // Remove click handler and add mousemove handler
    mapRef.current.off('click');
    mapRef.current.on('mousemove', handleCircleRadiusMove);
    mapRef.current.on('click', handleCircleRadiusClick);
  };
  
  // Handle moving the mouse to set circle radius
  const handleCircleRadiusMove = (e: L.LeafletMouseEvent) => {
    if (!mapRef.current || !circleCenterRef.current || !circleDrawingRef.current) return;
    
    const { lat, lng } = e.latlng;
    const center = L.latLng(circleCenterRef.current[0], circleCenterRef.current[1]);
    const cursorLatLng = L.latLng(lat, lng);
    
    // Calculate distance between center and cursor position
    const radius = center.distanceTo(cursorLatLng);
    setCircleRadius(radius);
    
    // Update circle radius
    circleDrawingRef.current.setRadius(radius);
    
    // Update status message
    setCircleDrawingStatus(`Current radius: ${radius.toFixed(0)} meters. Click to confirm.`);
  };
  
  // Handle click to confirm circle radius
  const handleCircleRadiusClick = (e: L.LeafletMouseEvent) => {
    if (!mapRef.current || !circleCenterRef.current || !circleDrawingRef.current) return;
    
    // Calculate the final radius
    const { lat, lng } = e.latlng;
    const center = L.latLng(circleCenterRef.current[0], circleCenterRef.current[1]);
    const cursorLatLng = L.latLng(lat, lng);
    const finalRadius = center.distanceTo(cursorLatLng);
    
    // Finalize the circle with the calculated radius
    circleDrawingRef.current.setRadius(finalRadius);
    
    // Update status message
    setCircleDrawingStatus(`Circle with radius ${finalRadius.toFixed(0)} meters created`);
    
    // Reset handlers to default
    mapRef.current.off('mousemove', handleCircleRadiusMove);
    mapRef.current.off('click', handleCircleRadiusClick);
    
    // Restore default click behavior
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.on('click', async (e) => {
          const { lat, lng } = e.latlng;
          await handleLocationSelect([lat, lng]);
        });
      }
    }, 100);
    
    // Clean up the circle after a few seconds
    setTimeout(() => {
      cleanupCircleDrawing();
      setActiveMapTool(null);
    }, 5000);
  };
  
  // Clean up circle drawing
  const cleanupCircleDrawing = () => {
    if (!mapRef.current) return;
    
    // Remove circle and marker
    if (circleDrawingRef.current) {
      circleDrawingRef.current.remove();
      circleDrawingRef.current = null;
    }
    
    if (circleMarkerRef.current) {
      circleMarkerRef.current.remove();
      circleMarkerRef.current = null;
    }
    
    // Reset state
    circleCenterRef.current = null;
    setCircleRadius(0);
    setCircleDrawingStatus('');
    
    // Reset handlers
    mapRef.current.off('mousemove', handleCircleRadiusMove);
    mapRef.current.off('click', handleCircleRadiusClick);
    mapRef.current.off('click', handleCircleCenterClick);
    
    // Restore default click behavior
    mapRef.current.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      await handleLocationSelect([lat, lng]);
    });
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
                      onClick={() => setSearchModalOpen(true)}
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
        
        <div className="relative flex-grow">
          {/* Display measurement result or tool status */}
          {(measurementResult || activeMapTool) && (
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-white shadow-md rounded-md px-3 py-2 z-10 text-sm flex items-center">
              {measurementResult && (
                <div className="flex items-center">
                  <Ruler className="h-4 w-4 mr-2 text-blue-500" />
                  <span>{measurementResult}</span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-6 w-6 p-0 ml-2"
                    onClick={cleanupActiveTool}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {!measurementResult && activeMapTool === 'marker' && markerPlacementStatus && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-red-500" />
                  <span>{markerPlacementStatus}</span>
                </div>
              )}
              {!measurementResult && activeMapTool === 'circle' && circleDrawingStatus && (
                <div className="flex items-center">
                  <CircleDashed className="h-4 w-4 mr-2 text-green-500" />
                  <span>{circleDrawingStatus}</span>
                </div>
              )}
            </div>
          )}
          
          <div id="map" className="w-full h-full" style={{ minHeight: isFullScreen ? 'calc(100vh - 140px)' : 'calc(100vh - 164px)' }}>
            {/* Map will be initialized here via Leaflet */}
          </div>
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

      {/* Search Location Modal */}
      <Dialog open={searchModalOpen} onOpenChange={setSearchModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Search Location</DialogTitle>
            <DialogDescription>
              Enter a place name, address, or coordinates to find on the map.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="search-location">Location</Label>
              <div className="flex gap-2">
                <Input 
                  id="search-location" 
                  placeholder="E.g., Kathmandu, Nepal or 27.70, 85.32" 
                  className="flex-grow"
                />
                <Button 
                  type="submit"
                  onClick={() => {
                    // Simple demo search - ideally this would use a geocoding service
                    // For demonstration, we'll search for Kathmandu
                    if (mapRef.current) {
                      mapRef.current.setView([27.7172, 85.3240], 13);
                      // Place a marker
                      handleLocationSelect([27.7172, 85.3240]);
                      setSearchModalOpen(false);
                    }
                  }}
                >
                  Search
                </Button>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Search Tips:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                <li>Enter a place name (e.g., "Pokhara")</li>
                <li>Enter an address (e.g., "Durbar Marg, Kathmandu")</li>
                <li>Enter coordinates (e.g., "27.70, 85.32")</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MapView;
