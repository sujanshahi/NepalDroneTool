import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet-draw";
import { NEPAL_CENTER, DEFAULT_ZOOM } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Trash2, Maximize2, Target } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface FlightPathDrawerProps {
  onPathChange: (path: any) => void;
  initialPath?: any;
  onPilotLocationChange?: (location: [number, number]) => void;
  initialPilotLocation?: [number, number];
}

export function FlightPathDrawer({ 
  onPathChange, 
  initialPath,
  onPilotLocationChange,
  initialPilotLocation 
}: FlightPathDrawerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const drawControlRef = useRef<L.Control.Draw | null>(null);
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);
  const pilotMarkerRef = useRef<L.Marker | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentDrawingMode, setCurrentDrawingMode] = useState<'polyline' | 'polygon'>('polyline');

  // Initialize the map
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      // Initialize the map
      const map = L.map(mapContainerRef.current).setView(NEPAL_CENTER, DEFAULT_ZOOM);
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      
      // Create feature group for drawn items
      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);
      featureGroupRef.current = drawnItems;
      
      // Initialize draw control
      const drawControl = new L.Control.Draw({
        draw: {
          rectangle: false,
          circle: false,
          circlemarker: false,
          marker: false,
          polyline: {
            shapeOptions: {
              color: '#3b82f6',
              weight: 4
            }
          },
          polygon: {
            allowIntersection: false,
            shapeOptions: {
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.2,
              weight: 3
            }
          }
        },
        edit: {
          featureGroup: drawnItems
        }
      });
      map.addControl(drawControl);
      drawControlRef.current = drawControl;
      
      // Event handler for created layers
      map.on(L.Draw.Event.CREATED, (event: any) => {
        const layer = event.layer;
        drawnItems.addLayer(layer);
        
        // Extract path data based on layer type
        if (layer instanceof L.Polyline || layer instanceof L.Polygon) {
          const coordinates = layer.getLatLngs();
          const pathData = {
            type: layer instanceof L.Polygon ? 'Polygon' : 'LineString',
            coordinates: extractCoordinates(coordinates, layer instanceof L.Polygon)
          };
          onPathChange(pathData);
        }
      });
      
      // Event handlers for edited/deleted layers
      map.on(L.Draw.Event.EDITED, (event: any) => {
        const layers = event.layers;
        // Get first layer since we only allow one path at a time
        let pathData = null;
        
        layers.eachLayer((layer: any) => {
          const coordinates = layer.getLatLngs();
          pathData = {
            type: layer instanceof L.Polygon ? 'Polygon' : 'LineString',
            coordinates: extractCoordinates(coordinates, layer instanceof L.Polygon)
          };
        });
        
        if (pathData) {
          onPathChange(pathData);
        }
      });
      
      map.on(L.Draw.Event.DELETED, () => {
        // If all layers are deleted, clear the path data
        if (drawnItems.getLayers().length === 0) {
          onPathChange(null);
        }
      });
      
      // Add pilot location marker functionality if callback provided
      if (onPilotLocationChange) {
        // Initialize marker with default or provided position
        const initialPos = initialPilotLocation || NEPAL_CENTER;
        
        const pilotIcon = L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
        
        const pilotMarker = L.marker(initialPos, { 
          draggable: true,
          icon: pilotIcon
        }).addTo(map);
        
        pilotMarker.bindPopup("Pilot Location").openPopup();
        
        pilotMarker.on('dragend', function(event) {
          const marker = event.target;
          const position = marker.getLatLng();
          if (onPilotLocationChange) {
            onPilotLocationChange([position.lat, position.lng]);
          }
        });
        
        pilotMarkerRef.current = pilotMarker;
        
        // Set initial pilot location
        if (initialPilotLocation) {
          pilotMarker.setLatLng(initialPilotLocation);
          onPilotLocationChange(initialPilotLocation);
        }
      }
      
      mapInstanceRef.current = map;
      setMapLoaded(true);
    }
    
    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        featureGroupRef.current = null;
        drawControlRef.current = null;
        pilotMarkerRef.current = null;
      }
    };
  }, []);
  
  // Load initial path data if provided
  useEffect(() => {
    if (mapLoaded && initialPath && featureGroupRef.current) {
      // Clear existing layers
      featureGroupRef.current.clearLayers();
      
      let layer;
      
      if (initialPath.type === 'Polygon') {
        // For polygons, the first array is the outer ring
        const coordinates = initialPath.coordinates.map((coord: any) => 
          Array.isArray(coord[0]) ? coord.map((point: any) => L.latLng(point[0], point[1])) 
          : L.latLng(coord[0], coord[1])
        );
        
        layer = L.polygon(coordinates, {
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.2,
          weight: 3
        });
      } else {
        // LineString
        const coordinates = initialPath.coordinates.map((coord: any) => 
          L.latLng(coord[0], coord[1])
        );
        
        layer = L.polyline(coordinates, {
          color: '#3b82f6',
          weight: 4
        });
      }
      
      featureGroupRef.current.addLayer(layer);
      
      // Fit bounds to show the entire path
      if (mapInstanceRef.current) {
        mapInstanceRef.current.fitBounds(layer.getBounds());
      }
    }
  }, [mapLoaded, initialPath]);

  // Handle drawing mode change
  useEffect(() => {
    // Update draw control options based on current mode
    if (mapInstanceRef.current && drawControlRef.current) {
      // Unfortunately, we can't directly update the draw control options
      // We would need to remove and recreate it, which is complex
      // For simplicity, we'll just show a message to the user
      if (featureGroupRef.current && featureGroupRef.current.getLayers().length > 0) {
        toast({
          title: "Drawing Mode Changed",
          description: `You've switched to ${currentDrawingMode === 'polyline' ? 'route' : 'area'} drawing mode. Clear the map first to use this mode.`,
        });
      }
    }
  }, [currentDrawingMode]);

  // Helper function to extract coordinates in the right format
  const extractCoordinates = (latLngs: any, isPolygon: boolean) => {
    if (isPolygon) {
      // For polygons, we need to handle nested arrays
      // and ensure the last point equals the first point
      if (Array.isArray(latLngs[0])) {
        // Handle multi-ring polygons
        return latLngs.map((ring: any) => 
          ring.map((point: any) => [point.lat, point.lng])
        );
      } else {
        // Single ring polygon
        const coords = latLngs.map((point: any) => [point.lat, point.lng]);
        // Ensure last point equals first point for valid GeoJSON
        if (coords.length > 0 && (coords[0][0] !== coords[coords.length-1][0] || 
                                 coords[0][1] !== coords[coords.length-1][1])) {
          coords.push([coords[0][0], coords[0][1]]);
        }
        return [coords];
      }
    } else {
      // For polylines
      return latLngs.map((point: any) => [point.lat, point.lng]);
    }
  };

  // Clear all drawn items
  const handleClear = () => {
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
      onPathChange(null);
    }
  };

  // Set map view to current location
  const handleLocateMe = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.locate({ setView: true, maxZoom: 16 });
      
      mapInstanceRef.current.on('locationfound', (e) => {
        // If we have a pilot marker, update its position
        if (pilotMarkerRef.current && onPilotLocationChange) {
          pilotMarkerRef.current.setLatLng(e.latlng);
          onPilotLocationChange([e.latlng.lat, e.latlng.lng]);
        }
      });
      
      mapInstanceRef.current.on('locationerror', () => {
        toast({
          title: "Location Error",
          description: "Unable to find your current location.",
          variant: "destructive"
        });
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Flight Path Planner</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="route" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="route" 
              onClick={() => setCurrentDrawingMode('polyline')}
            >
              Route (Line)
            </TabsTrigger>
            <TabsTrigger 
              value="area" 
              onClick={() => setCurrentDrawingMode('polygon')}
            >
              Area (Polygon)
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="route" className="mt-2">
            <p className="text-sm text-muted-foreground mb-2">
              Draw a route line showing the planned flight path of your drone.
            </p>
          </TabsContent>
          
          <TabsContent value="area" className="mt-2">
            <p className="text-sm text-muted-foreground mb-2">
              Draw an area polygon showing the planned operation zone of your drone.
            </p>
          </TabsContent>
        </Tabs>
        
        <div 
          ref={mapContainerRef} 
          className="h-[400px] rounded-md border border-border"
        ></div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClear}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLocateMe}
          >
            <Target className="mr-2 h-4 w-4" />
            Locate Me
          </Button>
          
          {pilotMarkerRef.current && (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => {
                if (mapInstanceRef.current && pilotMarkerRef.current) {
                  mapInstanceRef.current.setView(pilotMarkerRef.current.getLatLng(), 16);
                }
              }}
            >
              <Maximize2 className="mr-2 h-4 w-4" />
              Zoom to Pilot
            </Button>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          <ul className="list-disc pl-5 space-y-1">
            <li>Use the drawing tools in the top-right corner of the map</li>
            <li>Click to start drawing, click at each point, double-click to finish</li>
            <li>You can edit or delete drawn shapes using the edit tools</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}