import { AirspaceZone } from "../lib/types";

// Mock airspace data for Nepal - in a production app, this would come from an API
export const airspaceZones: AirspaceZone[] = [
  // Restricted Airspaces
  {
    id: "r1",
    name: "Tribhuvan International Airport Restricted Zone",
    description: "No drone operations allowed without special authorization from CAA Nepal",
    type: "restricted",
    geometry: {
      type: "Circle",
      coordinates: [85.3592, 27.6989],
      radius: 5000 // 5km radius from airport center
    }
  },
  {
    id: "r2",
    name: "Military Restricted Zone - Kathmandu",
    description: "Military facility - No drone operations allowed",
    type: "restricted",
    geometry: {
      type: "Polygon",
      coordinates: [
        [85.2, 27.65],
        [85.3, 27.65],
        [85.3, 27.75],
        [85.2, 27.75],
        [85.2, 27.65]
      ]
    }
  },
  {
    id: "r3",
    name: "Pokhara Airport Restricted Zone",
    description: "No drone operations allowed without special authorization",
    type: "restricted",
    geometry: {
      type: "Circle",
      coordinates: [84.0008, 28.2003],
      radius: 3000 // 3km radius
    }
  },
  
  // Controlled Airspaces
  {
    id: "c1",
    name: "Tribhuvan International Airport CTR",
    description: "Permission required from airport authority and CAA Nepal",
    type: "controlled",
    geometry: {
      type: "Circle",
      coordinates: [85.3592, 27.6989],
      radius: 10000 // 10km radius
    }
  },
  {
    id: "c2",
    name: "Pokhara Airport Control Zone",
    description: "Permission required from airport authority",
    type: "controlled",
    geometry: {
      type: "Circle",
      coordinates: [84.0008, 28.2003],
      radius: 8000 // 8km radius
    }
  },
  {
    id: "c3",
    name: "Gautam Buddha Airport Control Zone",
    description: "Permission required before flight",
    type: "controlled",
    geometry: {
      type: "Circle",
      coordinates: [83.4244, 27.5051],
      radius: 5000 // 5km radius
    }
  },
  
  // Advisory Areas
  {
    id: "a1",
    name: "Pashupatinath Temple",
    description: "Cultural heritage site - drone operations discouraged",
    type: "advisory",
    geometry: {
      type: "Circle",
      coordinates: [85.3569, 27.7105],
      radius: 1000 // 1km radius
    }
  },
  {
    id: "a2",
    name: "Chitwan National Park",
    description: "Wildlife conservation area - special considerations apply",
    type: "advisory",
    geometry: {
      type: "Polygon",
      coordinates: [
        [84.20, 27.50],
        [84.50, 27.50],
        [84.50, 27.70],
        [84.20, 27.70],
        [84.20, 27.50]
      ]
    }
  },
  {
    id: "a3",
    name: "Annapurna Conservation Area",
    description: "Protected natural area - special permissions advised",
    type: "advisory",
    geometry: {
      type: "Polygon",
      coordinates: [
        [83.80, 28.50],
        [84.20, 28.50],
        [84.20, 28.80],
        [83.80, 28.80],
        [83.80, 28.50]
      ]
    }
  },
  {
    id: "a4",
    name: "Sagarmatha National Park",
    description: "Mount Everest region - special considerations for altitude and wildlife",
    type: "advisory",
    geometry: {
      type: "Polygon",
      coordinates: [
        [86.60, 27.80],
        [87.00, 27.80],
        [87.00, 28.10],
        [86.60, 28.10],
        [86.60, 27.80]
      ]
    }
  }
];

// Get zones by type
export const getZonesByType = (type: string): AirspaceZone[] => {
  return airspaceZones.filter(zone => zone.type === type);
};

// Find zones that contain a specific point
export const getZonesContainingPoint = (lat: number, lng: number): AirspaceZone[] => {
  // This is a simplified implementation
  // In a real app, this would use proper geospatial calculations
  
  // For now, just return some zones based on specific locations
  
  // Near Kathmandu
  if (lat > 27.6 && lat < 27.8 && lng > 85.2 && lng < 85.4) {
    return airspaceZones.filter(zone => 
      zone.id === "r1" || zone.id === "c1" || zone.id === "a1"
    );
  }
  
  // Near Pokhara
  if (lat > 28.1 && lat < 28.3 && lng > 83.9 && lng < 84.1) {
    return airspaceZones.filter(zone => 
      zone.id === "r3" || zone.id === "c2"
    );
  }
  
  // Near Chitwan
  if (lat > 27.5 && lat < 27.7 && lng > 84.2 && lng < 84.5) {
    return airspaceZones.filter(zone => 
      zone.id === "a2"
    );
  }
  
  // Default - return empty array if not in any known zone
  return [];
};

export const getZoneById = (id: string): AirspaceZone | undefined => {
  return airspaceZones.find(zone => zone.id === id);
};
