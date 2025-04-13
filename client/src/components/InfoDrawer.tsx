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
  
  // Add styles on first render
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .info-drawer-backdrop {
        animation: fadeIn 0.3s ease-out forwards;
      }
    `;
    document.head.appendChild(styleEl);
    
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-start justify-end info-drawer-backdrop" 
      onClick={(e) => e.stopPropagation()}
      style={{
        pointerEvents: 'auto'
      }}
    >
      <div 
        ref={drawerRef}
        className="relative h-full w-full sm:w-3/4 md:w-96 bg-white shadow-lg overflow-y-auto info-drawer"
        style={{ 
          maxWidth: '100vw',
          maxHeight: '100vh',
          marginTop: '0',
          marginRight: '0',
          animation: 'slideIn 0.3s ease-out forwards',
          zIndex: 10000,
          position: 'relative',
          pointerEvents: 'auto'
        }}
      >
        <div className="sticky top-0 z-10 bg-white p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="font-heading font-semibold text-md truncate max-w-[250px]">
              {selectedZone ? selectedZone.name : "Airspace Information"}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700 ml-2 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="p-4 space-y-3">
          {selectedZone ? (
            <div className="border-b border-gray-200 pb-3">
              <div className="flex items-center mb-2">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ 
                    backgroundColor: selectedZone.type === "restricted" ? "#dc2626" : 
                                    selectedZone.type === "controlled" ? "#f97316" : 
                                    selectedZone.type === "advisory" ? "#3b82f6" : 
                                    "#22c55e" 
                  }}
                ></div>
                <h3 className="font-medium text-[#003893]">{selectedZone.type.charAt(0).toUpperCase() + selectedZone.type.slice(1)} Airspace</h3>
              </div>
              <p className="text-sm text-gray-700 mb-2">{selectedZone.description}</p>
              
              {selectedZone.type === "restricted" && (
                <div className="bg-red-600 bg-opacity-10 p-2 rounded-md text-xs">
                  <p className="font-medium text-red-600">⚠️ No drone operations allowed</p>
                  <p>Special authorization required from CAA Nepal.</p>
                </div>
              )}
              
              {selectedZone.type === "controlled" && (
                <div className="bg-orange-500 bg-opacity-10 p-2 rounded-md text-xs">
                  <p className="font-medium text-orange-600">⚠️ Permission required</p>
                  <p>Approval needed from airport authority and CAA Nepal.</p>
                </div>
              )}
              
              {selectedZone.type === "advisory" && (
                <div className="bg-blue-500 bg-opacity-10 p-2 rounded-md text-xs">
                  <p className="font-medium text-blue-600">ℹ️ Special considerations apply</p>
                  <p>Check additional requirements for this area.</p>
                </div>
              )}
              
              {selectedZone.type === "open" && (
                <div className="bg-green-500 bg-opacity-10 p-2 rounded-md text-xs">
                  <p className="font-medium text-green-600">✓ Open for operations</p>
                  <p>Standard regulations apply.</p>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="border-b border-gray-200 pb-3">
                <div className="flex items-center mb-1">
                  <div className="w-3 h-3 rounded-full mr-2 bg-red-600"></div>
                  <h3 className="font-medium text-[#003893]">Restricted Airspace</h3>
                </div>
                <p className="text-xs text-gray-700 mb-2">Flying prohibited without special authorization from CAA Nepal.</p>
                <div className="bg-red-600 bg-opacity-10 p-2 rounded-md text-xs">
                  <p className="font-medium text-red-600">⚠️ No drone operations allowed</p>
                  <p>Includes military areas and government facilities.</p>
                </div>
              </div>
              
              <div className="border-b border-gray-200 pb-3">
                <div className="flex items-center mb-1">
                  <div className="w-3 h-3 rounded-full mr-2 bg-orange-500"></div>
                  <h3 className="font-medium text-[#003893]">Controlled Airspace (CTR)</h3>
                </div>
                <p className="text-xs text-gray-700 mb-2">Areas surrounding airports requiring permission.</p>
                <div className="bg-orange-500 bg-opacity-10 p-2 rounded-md text-xs">
                  <p className="font-medium text-orange-600">⚠️ Permission required</p>
                  <p>Approval needed from airport authority and CAA Nepal.</p>
                </div>
              </div>
              
              <div className="border-b border-gray-200 pb-3">
                <div className="flex items-center mb-1">
                  <div className="w-3 h-3 rounded-full mr-2 bg-blue-500"></div>
                  <h3 className="font-medium text-[#003893]">Advisory Areas</h3>
                </div>
                <p className="text-xs text-gray-700 mb-2">Special considerations for drone pilots:</p>
                <ul className="list-disc pl-4 text-xs space-y-1">
                  <li>Wildlife sanctuaries</li>
                  <li>National parks</li>
                  <li>Cultural heritage sites</li>
                  <li>Temporary restricted zones</li>
                </ul>
              </div>
              
              <div className="border-b border-gray-200 pb-3">
                <div className="flex items-center mb-1">
                  <div className="w-3 h-3 rounded-full mr-2 bg-green-500"></div>
                  <h3 className="font-medium text-[#003893]">Open Airspace</h3>
                </div>
                <p className="text-xs text-gray-700 mb-2">Drone operations generally allowed.</p>
                <div className="bg-green-500 bg-opacity-10 p-2 rounded-md text-xs">
                  <p className="font-medium text-green-600">✓ Open for operations</p>
                  <p>Standard regulations still apply (altitude limits, VLOS).</p>
                </div>
              </div>
            </>
          )}
          
          <div className="border-b border-gray-200 pb-3">
            <h3 className="font-medium text-[#003893] mb-1 text-sm">Key Regulations</h3>
            <ul className="list-disc pl-4 text-xs space-y-1">
              <li>Maximum altitude: 120 meters AGL</li>
              <li>Visual line of sight must be maintained</li>
              <li>No flying within 5km of airports without permission</li>
              <li>No flying over crowds or populated areas</li>
              <li>All drones over 2kg must be registered</li>
            </ul>
          </div>
          
          <div>
            <p className="text-xs text-gray-500 mb-3">
              This information is for guidance only. Always refer to the latest CAA Nepal regulations.
            </p>
            <Button
              size="sm"
              className="w-full bg-[#003893] text-white hover:bg-[#003893]/90 text-xs py-1"
              onClick={() => window.open('https://caanepal.gov.np/', '_blank')}
            >
              Visit CAA Nepal Website
            </Button>
          </div>
        </div>
      </div>
      
      {/* Animation is handled through CSS classes */}
    </div>
  );
};

export default InfoDrawer;
