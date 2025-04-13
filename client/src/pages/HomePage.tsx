import React, { useState } from 'react';
import Header from '@/components/Header';
import MapView from '@/components/MapView';
import InfoDrawer from '@/components/InfoDrawer';
import MapSidebar from '@/components/MapSidebar';
import { AirspaceZone } from '@/lib/types';

const HomePage: React.FC = () => {
  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<AirspaceZone | undefined>(undefined);
  const [cursorPosition, setCursorPosition] = useState<[number, number] | null>(null);
  const [activeLayers, setActiveLayers] = useState({
    airspace: true,
    aerodromes: false,
    nationalParks: false
  });
  const [mapType, setMapType] = useState('satellite');

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
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      
      <main className="flex-grow flex flex-col overflow-hidden">
        <div className="flex flex-col md:flex-row h-[calc(100vh-64px)]">
          <div className="md:w-80 w-full bg-white shadow-lg overflow-y-auto">
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
          <div className="flex-1">
            <MapView 
              onOpenInfoDrawer={handleOpenInfoDrawer}
              onCursorPositionChange={handleCursorPositionChange}
            />
          </div>
        </div>
        {/* Hide the SidePanel for now, we'll add it back as needed */}
        {/* <div className="container mx-auto px-4 py-4">
          <SidePanel />
        </div> */}
      </main>
      
      <InfoDrawer 
        isOpen={isInfoDrawerOpen} 
        onClose={handleCloseInfoDrawer} 
        selectedZone={selectedZone}
      />
    </div>
  );
};

export default HomePage;
