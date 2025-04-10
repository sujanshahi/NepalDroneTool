import { Regulation } from '../lib/types';

// Nepal drone regulations data
export const regulations: Regulation[] = [
  {
    id: "reg1",
    title: "Drone Registration",
    description: "All drones weighing over 2kg must be registered with CAA Nepal prior to flight.",
    applicableTo: ["recreational", "commercial"],
    source: "CAA Nepal Drone Regulations, Section 3.1",
    zoneDependant: false
  },
  {
    id: "reg2",
    title: "Maximum Altitude",
    description: "Drone flights must maintain a maximum altitude of 120 meters (400 feet) above ground level.",
    applicableTo: ["recreational", "commercial"],
    source: "CAA Nepal Drone Regulations, Section 4.2",
    zoneDependant: false
  },
  {
    id: "reg3",
    title: "Visual Line of Sight",
    description: "Operators must maintain visual line of sight with the drone at all times during flight.",
    applicableTo: ["recreational", "commercial"],
    source: "CAA Nepal Drone Regulations, Section 4.3",
    zoneDependant: false
  },
  {
    id: "reg4",
    title: "Airport Proximity",
    description: "No drone operations within 5km of an airport without specific authorization from CAA Nepal and the airport authority.",
    applicableTo: ["recreational", "commercial"],
    source: "CAA Nepal Drone Regulations, Section 5.1",
    zoneDependant: true,
    applicableZones: ["restricted", "controlled"]
  },
  {
    id: "reg5",
    title: "Populated Areas",
    description: "Operations over crowds or densely populated areas require special permission.",
    applicableTo: ["recreational", "commercial"],
    source: "CAA Nepal Drone Regulations, Section 5.2",
    zoneDependant: false
  },
  {
    id: "reg6",
    title: "Commercial Operations",
    description: "Commercial drone operations require an operator's certificate issued by CAA Nepal.",
    applicableTo: ["commercial"],
    source: "CAA Nepal Drone Regulations, Section 6.1",
    zoneDependant: false
  },
  {
    id: "reg7",
    title: "Night Operations",
    description: "Flying drones after sunset and before sunrise requires special authorization.",
    applicableTo: ["recreational", "commercial"],
    source: "CAA Nepal Drone Regulations, Section 4.5",
    zoneDependant: false
  },
  {
    id: "reg8",
    title: "Cultural and Religious Sites",
    description: "Drone operations over cultural heritage sites, temples, and religious gatherings require permission from both CAA Nepal and site authorities.",
    applicableTo: ["recreational", "commercial"],
    source: "CAA Nepal Drone Regulations, Section 5.4",
    zoneDependant: true,
    applicableZones: ["advisory"]
  },
  {
    id: "reg9",
    title: "Protected Areas",
    description: "Drone flights in national parks, wildlife reserves, and conservation areas require permission from both CAA Nepal and the Department of National Parks and Wildlife Conservation.",
    applicableTo: ["recreational", "commercial"],
    source: "CAA Nepal Drone Regulations, Section 5.5",
    zoneDependant: true,
    applicableZones: ["advisory"]
  },
  {
    id: "reg10",
    title: "Restricted Airspace",
    description: "No drone operations allowed in restricted airspace, including military installations, government facilities, and other sensitive locations.",
    applicableTo: ["recreational", "commercial"],
    source: "CAA Nepal Drone Regulations, Section 5.3",
    zoneDependant: true,
    applicableZones: ["restricted"]
  }
];

// Get applicable regulations for a specific flight profile
export const getApplicableRegulations = (
  operatorType: string,
  zoneTypes: string[],
  flightParameters: {
    altitude?: number;
    isNightOperation?: boolean;
    isOverPopulatedArea?: boolean;
  }
): Regulation[] => {
  let applicableRegs = regulations.filter(reg => {
    // Check if this regulation applies to this type of operator
    if (!reg.applicableTo.includes(operatorType)) {
      return false;
    }
    
    // If zone-dependent, check if the zone type is applicable
    if (reg.zoneDependant && reg.applicableZones) {
      // If none of the current zones match this regulation's applicable zones, skip it
      if (!zoneTypes.some(zone => reg.applicableZones?.includes(zone))) {
        return false;
      }
    }
    
    // Additional checks based on flight parameters
    if (reg.id === "reg2" && flightParameters.altitude && flightParameters.altitude > 120) {
      return true; // Altitude regulation is applicable
    }
    
    if (reg.id === "reg7" && flightParameters.isNightOperation) {
      return true; // Night operation regulation is applicable
    }
    
    if (reg.id === "reg5" && flightParameters.isOverPopulatedArea) {
      return true; // Populated area regulation is applicable
    }
    
    // For all other regulations, return based on operator type and zone
    return true;
  });
  
  return applicableRegs;
};

// Check if flying is permitted in a specific zone type
export const isFlightPermittedInZone = (zoneType: string): boolean => {
  switch(zoneType) {
    case "restricted":
      return false; // No flights permitted in restricted zones without special authorization
    case "controlled":
      return true; // Flights permitted but with restrictions
    case "advisory":
      return true; // Flights permitted but with advisories
    case "open":
      return true; // Flights permitted
    default:
      return true;
  }
};

// Get permissions required for flying in a specific zone
export const getRequiredPermissions = (zoneTypes: string[]): string[] => {
  const permissions: string[] = [];
  
  if (zoneTypes.includes("restricted")) {
    permissions.push("Special authorization from CAA Nepal");
    permissions.push("Military clearance (for military zones)");
  }
  
  if (zoneTypes.includes("controlled")) {
    permissions.push("Permission from airport authority");
    permissions.push("Flight plan submission to CAA Nepal");
  }
  
  if (zoneTypes.includes("advisory") && zoneTypes.find(zone => zone === "advisory")) {
    const advisoryZone = zoneTypes.find(zone => zone === "advisory");
    if (advisoryZone?.includes("park") || advisoryZone?.includes("conservation")) {
      permissions.push("Department of National Parks and Wildlife Conservation permission");
    }
    if (advisoryZone?.includes("temple") || advisoryZone?.includes("cultural")) {
      permissions.push("Cultural site authority permission");
    }
  }
  
  return permissions;
};
