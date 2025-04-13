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

// Import CSS for Leaflet
import 'leaflet/dist/leaflet.css';

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
  
  // Initialize map on component mount
  // Get the basemap parameter from URL
  const getUrlBasemap = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('basemap');
  };
  
  // Keep track of the currently active basemap layers
  const basemapLayersRef = useRef<{
    map: L.TileLayer;
    satellite: L.TileLayer;
    terrain: L.TileLayer;
  } | null>(null);
  
  useEffect(() => {
    if (!mapRef.current) {
      // Create map instance
      const map = L.map('map', {
        center: NEPAL_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: false // We'll add custom zoom control
      });
      
      // Add multiple tile layers for basemaps and add layer controls
      const mapLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      });
      
      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19
      });
      
      const terrainLayer = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abcd',
        maxZoom: 18
      });
      
      // Set the basemap based on URL parameter
      const urlBasemap = getUrlBasemap();
      if (urlBasemap === 'satellite') {
        satelliteLayer.addTo(map);
      } else if (urlBasemap === 'terrain') {
        terrainLayer.addTo(map);
      } else {
        // Default to map layer
        mapLayer.addTo(map);
      }
      
      // Add basemap controls to top right
      const baseMaps = {
        "Map": mapLayer,
        "Satellite": satelliteLayer,
        "Terrain": terrainLayer
      };
      
      L.control.layers(baseMaps, {}, {position: 'topright'}).addTo(map);
      
      // Add custom zoom control to top left
      L.control.zoom({position: 'topleft'}).addTo(map);
      
      // Add scale control
      L.control.scale({position: 'bottomleft', imperial: false}).addTo(map);
      
      // Initialize layers
      markersLayerRef.current = L.layerGroup().addTo(map);
      zonesLayerRef.current = L.layerGroup().addTo(map);
      
      // Remove Nepal outline to make the map clearer
      // We're commenting this out as per user request to remove the outline
      /*
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
      */
      
      // Store map reference
      mapRef.current = map;
      
      // Add click handler to map for location selection
      map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        
        // Add marker at clicked location
        await handleLocationSelect([lat, lng]);
      });
      
      // Add fullscreen control
      map.addControl(new (L.Control.extend({
        options: { position: 'topleft' },
        onAdd: function() {
          const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
          const button = L.DomUtil.create('a', 'leaflet-control-fullscreen', container);
          button.innerHTML = '⤢';
          button.href = '#';
          button.title = 'Full Screen';
          button.style.fontWeight = 'bold';
          button.style.fontSize = '18px';
          button.style.lineHeight = '24px';
          button.style.textAlign = 'center';
          button.style.width = '30px';
          button.style.height = '30px';
          
          L.DomEvent.on(button, 'click', function(e) {
            L.DomEvent.stopPropagation(e);
            L.DomEvent.preventDefault(e);
            toggleFullScreen();
          });
          
          return container;
        }
      }))());
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
      
      // Add popup to marker with improved styling
      marker.bindPopup(`
        <div class="text-sm">
          <h3 class="font-bold text-gray-800 mb-1">Selected Location</h3>
          <p class="text-gray-600 mb-2">${flightPlan.location.address || 'Unknown address'}</p>
          <a href="#" class="inline-block text-blue-600 font-medium hover:text-blue-800 transition-colors" 
             onclick="document.getElementById('setAsLocation').click(); return false;">
             Set as takeoff point
          </a>
        </div>
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
    setIsFullScreen(prevState => {
      const newFullscreenState = !prevState;
      
      if (mapRef.current) {
        if (newFullscreenState) {
          // If entering fullscreen
          if (mapContainerRef.current && mapContainerRef.current.requestFullscreen) {
            mapContainerRef.current.requestFullscreen()
              .catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
              });
          }
        } else {
          // If exiting fullscreen
          if (document.exitFullscreen && document.fullscreenElement) {
            document.exitFullscreen()
              .catch(err => {
                console.error(`Error attempting to exit fullscreen: ${err.message}`);
              });
          }
        }
        
        // Invalidate map size to ensure proper display in new size
        setTimeout(() => {
          mapRef.current?.invalidateSize();
        }, 200);
      }
      
      return newFullscreenState;
    });
  };
  
  // Add CSS to fix z-index issues
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      /* Fix z-index ordering for map components */
      .leaflet-map-pane {
        z-index: 2 !important;
      }
      .leaflet-overlay-pane {
        z-index: 4 !important; 
      }
      .leaflet-marker-pane {
        z-index: 5 !important;
      }
      .leaflet-popup-pane {
        z-index: 7 !important;
      }
      .leaflet-tooltip-pane {
        z-index: 7 !important;
      }
      .leaflet-control {
        z-index: 8 !important;
      }
    `;
    document.head.appendChild(styleEl);
    
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  return (
    <div 
      ref={mapContainerRef}
      className={`map-container bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-all duration-300 ${
        isFullScreen 
          ? 'fixed inset-0 z-40 rounded-none' 
          : 'w-full md:w-3/5 lg:w-2/3'
      }`}
      style={{ position: 'relative', zIndex: 1 }}
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
              <div className="absolute right-0 top-10 bg-white shadow-lg rounded-md p-3 z-10 w-52 border border-gray-200 info-drawer-backdrop">
                <div className="flex justify-between items-center mb-3 border-b pb-2">
                  <h3 className="font-semibold text-sm">Airspace Layers</h3>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 w-6 p-0"
                    onClick={() => setMapControls(prev => ({ ...prev, isDrawerOpen: false }))}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
                      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                    </svg>
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center text-sm cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={mapControls.layers.restricted}
                      onChange={() => toggleLayer('restricted')}
                      className="mr-2"
                    />
                    <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: ZONE_STYLES.restricted.fillColor, opacity: 0.5, border: `1px solid ${ZONE_STYLES.restricted.color}` }}></div>
                    <span className="text-gray-800">{MAP_LAYERS.RESTRICTED}</span>
                  </label>
                  
                  <label className="flex items-center text-sm cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={mapControls.layers.controlled}
                      onChange={() => toggleLayer('controlled')}
                      className="mr-2"
                    />
                    <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: ZONE_STYLES.controlled.fillColor, opacity: 0.5, border: `1px solid ${ZONE_STYLES.controlled.color}` }}></div>
                    <span className="text-gray-800">{MAP_LAYERS.CONTROLLED}</span>
                  </label>
                  
                  <label className="flex items-center text-sm cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={mapControls.layers.advisory}
                      onChange={() => toggleLayer('advisory')}
                      className="mr-2"
                    />
                    <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: ZONE_STYLES.advisory.fillColor, opacity: 0.5, border: `1px solid ${ZONE_STYLES.advisory.color}` }}></div>
                    <span className="text-gray-800">{MAP_LAYERS.ADVISORY}</span>
                  </label>
                  
                  <label className="flex items-center text-sm cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={mapControls.layers.open}
                      onChange={() => toggleLayer('open')}
                      className="mr-2"
                    />
                    <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: ZONE_STYLES.open.fillColor, opacity: 0.5, border: `1px solid ${ZONE_STYLES.open.color}` }}></div>
                    <span className="text-gray-800">{MAP_LAYERS.OPEN}</span>
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
        <div className="text-xs text-gray-500 mb-2 font-medium">Map Legend</div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
          <div className="flex items-center px-2 py-1 bg-gray-50 rounded-md">
            <div className="w-4 h-4 mr-2 rounded-sm" style={{ 
              backgroundColor: ZONE_STYLES.restricted.fillColor, 
              opacity: 0.5, 
              border: `1px solid ${ZONE_STYLES.restricted.color}`,
              boxShadow: '0 0 0 1px rgba(0,0,0,0.05)' 
            }}></div>
            <span className="text-gray-800 font-medium">Restricted Airspace</span>
          </div>
          <div className="flex items-center px-2 py-1 bg-gray-50 rounded-md">
            <div className="w-4 h-4 mr-2 rounded-sm" style={{ 
              backgroundColor: ZONE_STYLES.controlled.fillColor, 
              opacity: 0.5, 
              border: `1px solid ${ZONE_STYLES.controlled.color}`,
              boxShadow: '0 0 0 1px rgba(0,0,0,0.05)' 
            }}></div>
            <span className="text-gray-800 font-medium">Controlled Airspace</span>
          </div>
          <div className="flex items-center px-2 py-1 bg-gray-50 rounded-md">
            <div className="w-4 h-4 mr-2 rounded-sm" style={{ 
              backgroundColor: ZONE_STYLES.advisory.fillColor, 
              opacity: 0.5, 
              border: `1px solid ${ZONE_STYLES.advisory.color}`,
              boxShadow: '0 0 0 1px rgba(0,0,0,0.05)' 
            }}></div>
            <span className="text-gray-800 font-medium">Advisory Area</span>
          </div>
          <div className="flex items-center px-2 py-1 bg-gray-50 rounded-md">
            <div className="w-4 h-4 mr-2 rounded-sm" style={{ 
              backgroundColor: ZONE_STYLES.open.fillColor, 
              opacity: 0.5, 
              border: `1px solid ${ZONE_STYLES.open.color}`,
              boxShadow: '0 0 0 1px rgba(0,0,0,0.05)' 
            }}></div>
            <span className="text-gray-800 font-medium">Open Airspace</span>
          </div>
          <div className="flex items-center px-2 py-1 bg-gray-50 rounded-md">
            <img 
              src="https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png" 
              alt="Marker" 
              style={{ width: '16px', height: '16px' }} 
              className="mr-2"
            />
            <span className="text-gray-800 font-medium">Selected Location</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
