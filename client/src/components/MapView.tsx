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
import { Layers, HelpCircle, Focus, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MapSidebar from '@/components/MapSidebar';

const MapView: React.FC<{ onOpenInfoDrawer: (zone?: AirspaceZone) => void }> = ({ onOpenInfoDrawer }) => {
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
  const [mapType, setMapType] = useState('satellite');
  
  // Initialize map on component mount
  useEffect(() => {
    if (!mapRef.current) {
      // Create map instance
      const map = L.map('map', {
        center: NEPAL_CENTER,
        zoom: DEFAULT_ZOOM
      });
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);
      
      // Initialize layers
      markersLayerRef.current = L.layerGroup().addTo(map);
      zonesLayerRef.current = L.layerGroup().addTo(map);
      
      // Load Nepal outline
      fetchNepalOutline()
        .then(nepalFeature => {
          nepalOutlineRef.current = L.geoJSON(nepalFeature, {
            style: {
              color: '#003893',
              weight: 3,
              fillOpacity: 0.1,
              fillColor: '#DC143C',
              opacity: 0.8,
              dashArray: '5, 5',
              className: 'nepal-border-glow'
            }
          }).addTo(map);
        })
        .catch(error => console.error('Error loading Nepal outline:', error));
      
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
        setCursorPosition([lat, lng]);
      });
      
      // Clear cursor position when mouse leaves the map
      map.on('mouseout', () => {
        setCursorPosition(null);
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

  // Add CSS for Nepal outline glow effect
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .nepal-border-glow {
        filter: drop-shadow(0 0 6px #DC143C);
        animation: glowing 2s infinite alternate;
      }
      @keyframes glowing {
        from { filter: drop-shadow(0 0 2px #DC143C); }
        to { filter: drop-shadow(0 0 8px #DC143C); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
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
    // If we were to implement this fully, we would change the map layer here
  };

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
  
  return (
    <div className={`flex ${isFullScreen ? 'fixed inset-0 z-50' : 'min-h-[600px]'}`}>
      {/* Map Sidebar */}
      <MapSidebar 
        cursorPosition={cursorPosition}
        onCenterChange={handleCenterChange}
        onLayerToggle={handleLayerToggle}
        onUseMyLocation={handleUseMyLocation}
        onMapTypeChange={handleMapTypeChange}
        activeLayers={activeLayers}
        mapType={mapType}
      />

      <div 
        ref={mapContainerRef}
        className={`map-container bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-all duration-300 ${
          isFullScreen 
            ? 'flex-1 rounded-none' 
            : 'flex-1'
        }`}
      >
        <div className="p-3 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-heading font-semibold text-gray-700">Interactive Map</h2>
          <div className="flex space-x-2">
            <Button
              size="icon"
              variant="outline"
              className="p-2 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center"
              title="Center Map on Nepal"
              onClick={centerOnNepal}
            >
              <Focus className="h-5 w-5 text-gray-700" />
            </Button>
            
            <div className="relative">
              <Button
                size="icon"
                variant="outline"
                className="p-2 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center"
                title="Toggle Layers"
                onClick={() => setMapControls(prev => ({ ...prev, isDrawerOpen: !prev.isDrawerOpen }))}
              >
                <Layers className="h-5 w-5 text-gray-700" />
              </Button>
              
              {mapControls.isDrawerOpen && (
                <div className="absolute right-0 top-10 bg-white shadow-md rounded-md p-3 z-10 w-48">
                  <h3 className="font-medium text-sm mb-2">Toggle Layers</h3>
                  
                  <div className="space-y-2">
                    <label className="flex items-center text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mapControls.layers.restricted}
                        onChange={() => toggleLayer('restricted')}
                        className="mr-2"
                      />
                      <div className="w-3 h-3 mr-1" style={{ backgroundColor: ZONE_STYLES.restricted.fillColor, opacity: 0.4, border: `1px solid ${ZONE_STYLES.restricted.color}` }}></div>
                      {MAP_LAYERS.RESTRICTED}
                    </label>
                    
                    <label className="flex items-center text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mapControls.layers.controlled}
                        onChange={() => toggleLayer('controlled')}
                        className="mr-2"
                      />
                      <div className="w-3 h-3 mr-1" style={{ backgroundColor: ZONE_STYLES.controlled.fillColor, opacity: 0.4, border: `1px solid ${ZONE_STYLES.controlled.color}` }}></div>
                      {MAP_LAYERS.CONTROLLED}
                    </label>
                    
                    <label className="flex items-center text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mapControls.layers.advisory}
                        onChange={() => toggleLayer('advisory')}
                        className="mr-2"
                      />
                      <div className="w-3 h-3 mr-1" style={{ backgroundColor: ZONE_STYLES.advisory.fillColor, opacity: 0.4, border: `1px solid ${ZONE_STYLES.advisory.color}` }}></div>
                      {MAP_LAYERS.ADVISORY}
                    </label>
                    
                    <label className="flex items-center text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mapControls.layers.open}
                        onChange={() => toggleLayer('open')}
                        className="mr-2"
                      />
                      <div className="w-3 h-3 mr-1" style={{ backgroundColor: ZONE_STYLES.open.fillColor, opacity: 0.4, border: `1px solid ${ZONE_STYLES.open.color}` }}></div>
                      {MAP_LAYERS.OPEN}
                    </label>
                  </div>
                </div>
              )}
            </div>
            
            <Button
              size="icon"
              variant="outline"
              className="p-2 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center"
              title="Help"
              onClick={showHelp}
            >
              <HelpCircle className="h-5 w-5 text-gray-700" />
            </Button>
            
            <Button
              size="icon"
              variant="outline"
              className="p-2 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center"
              title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
              onClick={toggleFullScreen}
            >
              {isFullScreen ? (
                <Minimize className="h-5 w-5 text-gray-700" />
              ) : (
                <Maximize className="h-5 w-5 text-gray-700" />
              )}
            </Button>
          </div>
        </div>
        
        <div id="map" className="flex-grow" style={{ minHeight: isFullScreen ? 'calc(100vh - 140px)' : '400px' }}>
          {/* Map will be initialized here via Leaflet */}
        </div>
        
        <div className="p-3 border-t border-gray-200 bg-white">
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
            <div className="flex items-center">
              <div className="w-4 h-4 mr-2" style={{ backgroundColor: ZONE_STYLES.restricted.fillColor, opacity: 0.4, border: `1px solid ${ZONE_STYLES.restricted.color}`, borderRadius: '2px' }}></div>
              <span>Restricted Airspace</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 mr-2" style={{ backgroundColor: ZONE_STYLES.controlled.fillColor, opacity: 0.4, border: `1px solid ${ZONE_STYLES.controlled.color}`, borderRadius: '2px' }}></div>
              <span>Controlled Airspace</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 mr-2" style={{ backgroundColor: ZONE_STYLES.advisory.fillColor, opacity: 0.4, border: `1px solid ${ZONE_STYLES.advisory.color}`, borderRadius: '2px' }}></div>
              <span>Advisory Area</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 mr-2" style={{ backgroundColor: ZONE_STYLES.open.fillColor, opacity: 0.4, border: `1px solid ${ZONE_STYLES.open.color}`, borderRadius: '2px' }}></div>
              <span>Open Airspace</span>
            </div>
            <div className="flex items-center">
              <img src="https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png" alt="Marker" style={{ width: '16px', height: '16px' }} className="mr-2" />
              <span>Selected Location</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
