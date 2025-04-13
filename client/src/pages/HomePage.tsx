import React, { useState } from 'react';
import MapView from '@/components/MapView';
import InfoDrawer from '@/components/InfoDrawer';
import MapSidebar from '@/components/MapSidebar';
import { AirspaceZone } from '@/lib/types';
import { Layers, MapPin, Search, Settings, HelpCircle, Globe, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HomePage: React.FC = () => {
  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<AirspaceZone | undefined>(undefined);
  const [cursorPosition, setCursorPosition] = useState<[number, number] | null>(null);
  const [activeLayers, setActiveLayers] = useState({
    restricted: true,
    controlled: true,
    advisory: true,
    open: true
  });
  const [mapType, setMapType] = useState('default');
  const [showOnlyMap, setShowOnlyMap] = useState(false);
  const [showLayersPanel, setShowLayersPanel] = useState(false);

  const handleOpenInfoDrawer = (zone?: AirspaceZone) => {
    setSelectedZone(zone);
    setIsInfoDrawerOpen(true);
  };

  const handleCloseInfoDrawer = () => {
    setIsInfoDrawerOpen(false);
  };
  
  // Handle cursor position updates from MapView
  const handleCursorPositionChange = (position: [number, number] | null) => {
    setCursorPosition(position);
  };
  
  // Handle layer toggle
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

  // Handle center change from coordinates
  const handleCenterChange = (center: [number, number]) => {
    // This would need to be passed to the MapView component
    console.log('Center changed to:', center);
  };

  // Use browser geolocation
  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('User location:', latitude, longitude);
          // This would need to be passed to the MapView component
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
    <div className="h-screen flex overflow-hidden">
      {/* Left vertical sidebar like in the reference image */}
      {!showOnlyMap && (
        <div className="w-14 bg-white border-r border-gray-200 flex flex-col items-center py-4 shadow-sm z-10">
          <Button
            size="icon"
            variant="ghost"
            className="mb-6 hover:bg-gray-100 w-10 h-10"
            title="Menu"
          >
            <div className="space-y-1 flex flex-col items-center justify-center">
              <div className="w-5 h-0.5 bg-gray-600"></div>
              <div className="w-5 h-0.5 bg-gray-600"></div>
              <div className="w-5 h-0.5 bg-gray-600"></div>
            </div>
          </Button>
          
          <Button
            size="icon"
            variant="ghost"
            className="mb-6 hover:bg-gray-100 w-10 h-10"
            title="Layers"
            onClick={() => setShowLayersPanel(!showLayersPanel)}
          >
            <Layers className="h-5 w-5 text-gray-700" />
          </Button>
          
          <Button
            size="icon"
            variant="ghost"
            className="mb-6 hover:bg-gray-100 w-10 h-10"
            title="Location Search"
          >
            <Search className="h-5 w-5 text-gray-700" />
          </Button>
          
          <Button
            size="icon"
            variant="ghost"
            className="mb-6 hover:bg-gray-100 w-10 h-10"
            title="My Location"
            onClick={handleUseMyLocation}
          >
            <MapPin className="h-5 w-5 text-gray-700" />
          </Button>
          
          <Button
            size="icon"
            variant="ghost"
            className="mb-6 hover:bg-gray-100 w-10 h-10"
            title="Globe"
          >
            <Globe className="h-5 w-5 text-gray-700" />
          </Button>
          
          <div className="flex-grow"></div>
          
          <Button
            size="icon"
            variant="ghost"
            className="mb-6 hover:bg-gray-100 w-10 h-10"
            title="Settings"
          >
            <Settings className="h-5 w-5 text-gray-700" />
          </Button>
          
          <Button
            size="icon"
            variant="ghost"
            className="hover:bg-gray-100 w-10 h-10 mb-4"
            title="Help"
            onClick={() => handleOpenInfoDrawer()}
          >
            <HelpCircle className="h-5 w-5 text-gray-700" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="hover:bg-gray-100 w-10 h-10"
            title={showOnlyMap ? "Show UI" : "Map Only"}
            onClick={() => setShowOnlyMap(!showOnlyMap)}
          >
            {showOnlyMap ? <Minimize className="h-5 w-5 text-gray-700" /> : <Maximize className="h-5 w-5 text-gray-700" />}
          </Button>
        </div>
      )}
      
      {/* Main content area */}
      <div className="flex-grow flex flex-col">
        {/* Top navigation bar */}
        <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm">
          <h1 className="text-lg font-semibold">Nepal Drone Flight Planner</h1>
          {showOnlyMap && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOnlyMap(false)}
              className="ml-auto"
            >
              Show Full Interface
            </Button>
          )}
        </div>
        
        <div className="flex-grow flex overflow-hidden">
          {/* Layers panel (shown/hidden based on state) */}
          {showLayersPanel && !showOnlyMap && (
            <div className="w-64 bg-white border-r border-gray-200 shadow-md z-10 p-4 overflow-y-auto">
              <h2 className="font-semibold mb-4">Map Layers</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="layer-restricted" 
                    className="mr-2"
                    checked={activeLayers.restricted}
                    onChange={(e) => handleLayerToggle('restricted', e.target.checked)}
                  />
                  <label htmlFor="layer-restricted" className="text-sm">Restricted Airspace</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="layer-controlled" 
                    className="mr-2"
                    checked={activeLayers.controlled}
                    onChange={(e) => handleLayerToggle('controlled', e.target.checked)}
                  />
                  <label htmlFor="layer-controlled" className="text-sm">Controlled Airspace</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="layer-advisory" 
                    className="mr-2"
                    checked={activeLayers.advisory}
                    onChange={(e) => handleLayerToggle('advisory', e.target.checked)}
                  />
                  <label htmlFor="layer-advisory" className="text-sm">Advisory Areas</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="layer-open" 
                    className="mr-2"
                    checked={activeLayers.open}
                    onChange={(e) => handleLayerToggle('open', e.target.checked)}
                  />
                  <label htmlFor="layer-open" className="text-sm">Open Airspace</label>
                </div>
                
                <div className="pt-4 border-t border-gray-200 mt-4">
                  <h3 className="font-medium mb-2 text-sm">Map Type</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="map-default" 
                        name="mapType"
                        className="mr-2"
                        checked={mapType === 'default'}
                        onChange={() => handleMapTypeChange('default')}
                      />
                      <label htmlFor="map-default" className="text-sm">Default</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="map-satellite" 
                        name="mapType"
                        className="mr-2"
                        checked={mapType === 'satellite'}
                        onChange={() => handleMapTypeChange('satellite')}
                      />
                      <label htmlFor="map-satellite" className="text-sm">Satellite</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="map-terrain" 
                        name="mapType"
                        className="mr-2"
                        checked={mapType === 'terrain'}
                        onChange={() => handleMapTypeChange('terrain')}
                      />
                      <label htmlFor="map-terrain" className="text-sm">Terrain</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Central content with map */}
          <div className="flex-grow flex">
            {/* Map area */}
            <div className="flex-grow relative">
              <MapView 
                onOpenInfoDrawer={handleOpenInfoDrawer}
                onCursorPositionChange={handleCursorPositionChange}
              />
            </div>
            
            {/* Info drawer that shows on the right side of the map */}
            {!showOnlyMap && (
              <InfoDrawer 
                isOpen={isInfoDrawerOpen} 
                onClose={handleCloseInfoDrawer} 
                selectedZone={selectedZone}
              />
            )}
          </div>
          
          {/* Right sidebar with flight plan controls - only shown when not in map-only mode */}
          {!showOnlyMap && !isInfoDrawerOpen && (
            <div className="w-80 bg-white shadow-lg overflow-y-auto border-l border-gray-200">
              <MapSidebar
                cursorPosition={cursorPosition}
                onCenterChange={handleCenterChange}
                onLayerToggle={handleLayerToggle}
                onUseMyLocation={handleUseMyLocation}
                onMapTypeChange={handleMapTypeChange}
                activeLayers={activeLayers}
                mapType={mapType}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile-only InfoDrawer that shows as full-screen overlay */}
      {showOnlyMap && (
        <InfoDrawer 
          isOpen={isInfoDrawerOpen} 
          onClose={handleCloseInfoDrawer} 
          selectedZone={selectedZone}
        />
      )}
    </div>
  );
};

export default HomePage;
