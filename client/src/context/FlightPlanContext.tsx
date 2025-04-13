import React, { createContext, useState, useContext, ReactNode } from 'react';
import { FlightPlan, FlightIntent, Location, FlightDetails, FlightResults } from '../lib/types';
import { getZonesContainingPoint } from '../data/airspaceData';
import { getApplicableRegulations, getRequiredPermissions, isFlightPermittedInZone } from '../data/regulationsData';

// Initial flight plan state
const initialFlightPlan: FlightPlan = {
  step: 1,
  intent: undefined,
  location: undefined,
  flight: undefined,
  results: undefined
};

// Context type definition
interface FlightPlanContextType {
  flightPlan: FlightPlan;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateIntent: (intent: FlightIntent) => void;
  updateLocation: (location: Partial<Location>) => void;
  updateFlight: (flight: FlightDetails) => void;
  generateResults: () => void;
  isStepComplete: (step: number) => boolean;
  resetFlightPlan: () => void;
  activeLanguage: string;
  setActiveLanguage: (language: string) => void;
}

// Create context
export const FlightPlanContext = createContext<FlightPlanContextType | undefined>(undefined);

// Provider component
export const FlightPlanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [flightPlan, setFlightPlan] = useState<FlightPlan>(initialFlightPlan);
  const [activeLanguage, setActiveLanguage] = useState<string>("en");

  // Set current step
  const setStep = (step: number) => {
    if (step >= 1 && step <= 4) {
      setFlightPlan({ ...flightPlan, step });
    }
  };

  // Go to next step
  const nextStep = () => {
    if (flightPlan.step < 4) {
      setFlightPlan({ ...flightPlan, step: flightPlan.step + 1 });
    }
  };

  // Go to previous step
  const prevStep = () => {
    if (flightPlan.step > 1) {
      setFlightPlan({ ...flightPlan, step: flightPlan.step - 1 });
    }
  };

  // Update intent data
  const updateIntent = (intent: FlightIntent) => {
    setFlightPlan({ ...flightPlan, intent });
  };

  // Update location data
  const updateLocation = (locationUpdate: Partial<Location>) => {
    const updatedLocation = { 
      ...flightPlan.location,
      ...locationUpdate
    } as Location;
    
    // Determine airspace type if coordinates are present
    if (updatedLocation.coordinates && (!flightPlan.location?.coordinates || 
        flightPlan.location.coordinates[0] !== updatedLocation.coordinates[0] || 
        flightPlan.location.coordinates[1] !== updatedLocation.coordinates[1])) {
      
      // Get zones containing this point
      const zones = getZonesContainingPoint(
        updatedLocation.coordinates[0],
        updatedLocation.coordinates[1]
      );
      
      // Set the most restrictive airspace type
      if (zones.some(zone => zone.type === "restricted")) {
        updatedLocation.airspaceType = "restricted";
      } else if (zones.some(zone => zone.type === "controlled")) {
        updatedLocation.airspaceType = "controlled";
      } else if (zones.some(zone => zone.type === "advisory")) {
        updatedLocation.airspaceType = "advisory";
      } else {
        updatedLocation.airspaceType = "open";
      }
    }
    
    setFlightPlan({ ...flightPlan, location: updatedLocation });
  };

  // Update flight details
  const updateFlight = (flight: FlightDetails) => {
    setFlightPlan({ ...flightPlan, flight });
  };

  // Generate flight results based on current data
  const generateResults = () => {
    if (!flightPlan.intent || !flightPlan.location || !flightPlan.flight) {
      return;
    }
    
    const { intent, location, flight } = flightPlan;
    
    // Get all zones for the selected location
    const zones = location.coordinates 
      ? getZonesContainingPoint(location.coordinates[0], location.coordinates[1])
      : [];
    
    const zoneTypes = zones.map(zone => zone.type);
    
    // Check if flight is permitted based on the most restrictive zone
    const mostRestrictiveZone = zoneTypes.includes("restricted") 
      ? "restricted" 
      : zoneTypes.includes("controlled")
        ? "controlled"
        : zoneTypes.includes("advisory")
          ? "advisory"
          : "open";
    
    const isPermitted = isFlightPermittedInZone(mostRestrictiveZone);
    
    // Get required permissions
    const permissionsRequired = getRequiredPermissions(zoneTypes);
    
    // Get applicable regulations
    const applicableRegulations = getApplicableRegulations(
      intent.dronePilotType, 
      zoneTypes,
      {
        altitude: flight.altitude,
        isNightOperation: flight.isNightOperation,
        isOverPopulatedArea: location.locationType === "Built-up area (city, town)" || location.locationType === "Populated area (village, settlement)"
      }
    );
    
    // Generate advisory messages
    const advisoryMessages: string[] = [];
    
    if (flight.altitude > 120) {
      advisoryMessages.push("Your planned altitude exceeds the maximum allowed limit of 120 meters.");
    }
    
    if (flight.isNightOperation) {
      advisoryMessages.push("Night operations require special authorization from CAA Nepal.");
    }
    
    if (mostRestrictiveZone === "restricted") {
      advisoryMessages.push("This location is in a restricted zone. Flying is not permitted without special authorization.");
    } else if (mostRestrictiveZone === "controlled") {
      advisoryMessages.push("This location is in a controlled airspace. Permission required before flight.");
    } else if (mostRestrictiveZone === "advisory") {
      advisoryMessages.push("This location is in an advisory zone. Special considerations apply.");
    }
    
    if (intent.droneWeight === "Over 2kg") {
      advisoryMessages.push("Drones over 2kg must be registered with CAA Nepal.");
    }
    
    // Create results object
    const results: FlightResults = {
      isPermitted,
      permissionsRequired,
      regulationsApplicable: applicableRegulations.map(reg => reg.title),
      advisoryMessages
    };
    
    setFlightPlan({ ...flightPlan, results });
  };

  // Check if a step is complete
  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!flightPlan.intent?.purpose && !!flightPlan.intent?.dronePilotType && !!flightPlan.intent?.droneCategory;
      case 2:
        return !!flightPlan.location?.coordinates && !!flightPlan.location?.locationType;
      case 3:
        return !!flightPlan.flight?.date && !!flightPlan.flight?.time && !!flightPlan.flight?.altitude;
      case 4:
        return !!flightPlan.results;
      default:
        return false;
    }
  };

  // Reset the flight plan
  const resetFlightPlan = () => {
    setFlightPlan(initialFlightPlan);
  };

  return (
    <FlightPlanContext.Provider
      value={{
        flightPlan,
        setStep,
        nextStep,
        prevStep,
        updateIntent,
        updateLocation,
        updateFlight,
        generateResults,
        isStepComplete,
        resetFlightPlan,
        activeLanguage,
        setActiveLanguage
      }}
    >
      {children}
    </FlightPlanContext.Provider>
  );
};

// Custom hook for using the flight plan context
export const useFlightPlan = () => {
  const context = useContext(FlightPlanContext);
  if (context === undefined) {
    throw new Error('useFlightPlan must be used within a FlightPlanProvider');
  }
  return context;
};
