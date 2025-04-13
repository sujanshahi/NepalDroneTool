import React, { useState } from 'react';
import Header from '@/components/Header';
import SidePanel from '@/components/SidePanel';
import MapView from '@/components/MapView';
import InfoDrawer from '@/components/InfoDrawer';
import { AirspaceZone } from '@/lib/types';

const HomePage: React.FC = () => {
  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<AirspaceZone | undefined>(undefined);

  const handleOpenInfoDrawer = (zone?: AirspaceZone) => {
    setSelectedZone(zone);
    setIsInfoDrawerOpen(true);
  };

  const handleCloseInfoDrawer = () => {
    setIsInfoDrawerOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      
      <main className="flex-grow flex flex-col">
        <div className="flex flex-col md:flex-row h-full">
          <div className="w-full">
            <MapView onOpenInfoDrawer={handleOpenInfoDrawer} />
          </div>
        </div>
        <div className="container mx-auto px-4 py-4">
          <SidePanel />
        </div>
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
