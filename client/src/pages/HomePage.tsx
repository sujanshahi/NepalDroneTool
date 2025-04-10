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
      
      <main className="container mx-auto px-4 py-4 flex-grow flex flex-col md:flex-row">
        <SidePanel />
        <MapView onOpenInfoDrawer={handleOpenInfoDrawer} />
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
