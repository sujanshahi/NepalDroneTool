import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { AirspaceZone } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface InfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedZone?: AirspaceZone;
}

const InfoDrawer: React.FC<InfoDrawerProps> = ({ isOpen, onClose, selectedZone }) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  
  // Close drawer when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Handle escape key to close drawer
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-end" onClick={(e) => e.stopPropagation()}>
      <div 
        ref={drawerRef}
        className="relative right-0 top-0 h-full w-full md:w-96 bg-white shadow-lg overflow-y-auto"
        style={{ 
          maxWidth: '100vw',
          animation: 'slideIn 0.3s ease-out'
        }}
      >
        <div className="sticky top-0 z-10 bg-white p-5 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="font-heading font-semibold text-lg">
              {selectedZone ? selectedZone.name : "Airspace Information"}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="p-5 space-y-4">
          {selectedZone ? (
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-medium text-[#003893] mb-2">{selectedZone.type.charAt(0).toUpperCase() + selectedZone.type.slice(1)} Airspace</h3>
              <p className="text-sm text-gray-700 mb-2">{selectedZone.description}</p>
              
              {selectedZone.type === "restricted" && (
                <div className="bg-red-600 bg-opacity-10 p-3 rounded-md text-sm">
                  <p className="font-medium text-red-600">No drone operations allowed</p>
                  <p>Special authorization required from CAA Nepal.</p>
                </div>
              )}
              
              {selectedZone.type === "controlled" && (
                <div className="bg-orange-500 bg-opacity-10 p-3 rounded-md text-sm">
                  <p className="font-medium text-orange-600">Permission required</p>
                  <p>You must obtain approval from both the airport authority and CAA Nepal before flying in these areas.</p>
                </div>
              )}
              
              {selectedZone.type === "advisory" && (
                <div className="bg-blue-500 bg-opacity-10 p-3 rounded-md text-sm">
                  <p className="font-medium text-blue-600">Special considerations apply</p>
                  <p>Additional permissions may be required depending on the specific area.</p>
                </div>
              )}
              
              {selectedZone.type === "open" && (
                <div className="bg-green-500 bg-opacity-10 p-3 rounded-md text-sm">
                  <p className="font-medium text-green-600">Open for operations</p>
                  <p>General drone regulations still apply, but no specific zone restrictions.</p>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-medium text-[#003893] mb-2">Restricted Airspace</h3>
                <p className="text-sm text-gray-700 mb-2">Flying in restricted airspace is prohibited without special authorization from CAA Nepal.</p>
                <div className="bg-red-600 bg-opacity-10 p-3 rounded-md text-sm">
                  <p className="font-medium text-red-600">No drone operations allowed</p>
                  <p>Includes military areas, government facilities, and other sensitive locations.</p>
                </div>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-medium text-[#003893] mb-2">Controlled Airspace (CTR)</h3>
                <p className="text-sm text-gray-700 mb-2">Controlled airspace surrounds airports and requires permission before flight.</p>
                <div className="bg-orange-500 bg-opacity-10 p-3 rounded-md text-sm">
                  <p className="font-medium text-orange-600">Permission required</p>
                  <p>You must obtain approval from both the airport authority and CAA Nepal before flying in these areas.</p>
                </div>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-medium text-[#003893] mb-2">Advisory Areas</h3>
                <p className="text-sm text-gray-700 mb-2">Areas with special considerations that drone pilots should be aware of.</p>
                <ul className="list-disc pl-5 text-sm">
                  <li>Wildlife sanctuaries</li>
                  <li>National parks</li>
                  <li>Cultural heritage sites</li>
                  <li>Temporary restricted zones</li>
                </ul>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-medium text-[#003893] mb-2">Open Airspace</h3>
                <p className="text-sm text-gray-700 mb-2">Areas where drone operations are generally allowed following standard regulations.</p>
                <div className="bg-green-500 bg-opacity-10 p-3 rounded-md text-sm">
                  <p className="font-medium text-green-600">Open for operations</p>
                  <p>General drone regulations still apply, including altitude limits and visual line of sight requirements.</p>
                </div>
              </div>
            </>
          )}
          
          <div>
            <h3 className="font-medium text-[#003893] mb-2">Regulations Overview</h3>
            <p className="text-sm text-gray-700 mb-2">Key regulations for drone operations in Nepal:</p>
            <ul className="list-disc pl-5 text-sm">
              <li>Maximum altitude: 120 meters AGL</li>
              <li>Visual line of sight must be maintained</li>
              <li>No flying within 5km of airports without permission</li>
              <li>No flying over crowds or populated areas without specific authorization</li>
              <li>All drones over 2kg must be registered with CAA Nepal</li>
            </ul>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              This information is provided for guidance only. Always refer to the latest CAA Nepal regulations for official requirements.
            </p>
            <Button
              className="w-full mt-4 bg-[#003893] text-white hover:bg-[#003893]/90"
              onClick={() => window.open('https://caanepal.gov.np/', '_blank')}
            >
              Visit CAA Nepal Website
            </Button>
          </div>
        </div>
      </div>
      
      {/* Animation is handled through inline styles */}
    </div>
  );
};

export default InfoDrawer;
