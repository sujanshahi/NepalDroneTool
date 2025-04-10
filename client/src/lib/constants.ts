// Nepal geographic center coordinates and default zoom level
export const NEPAL_CENTER = [28.3949, 84.124] as [number, number];
export const DEFAULT_ZOOM = 7;

// Steps for the flight planning process
export const FLIGHT_PLAN_STEPS = [
  { id: 1, name: "Intent" },
  { id: 2, name: "Location" },
  { id: 3, name: "Flight" },
  { id: 4, name: "Results" }
];

// Map layer options
export const MAP_LAYERS = {
  RESTRICTED: "Restricted Airspace",
  CONTROLLED: "Controlled Airspace",
  ADVISORY: "Advisory Area",
  OPEN: "Open Airspace"
};

// Airspace zone styling
export const ZONE_STYLES = {
  restricted: {
    color: "#F44336",
    fillColor: "#F44336",
    fillOpacity: 0.4,
    weight: 2
  },
  controlled: {
    color: "#FF9800",
    fillColor: "#FF9800",
    fillOpacity: 0.4,
    weight: 2
  },
  advisory: {
    color: "#2196F3",
    fillColor: "#2196F3",
    fillOpacity: 0.4,
    weight: 2
  },
  open: {
    color: "#4CAF50",
    fillColor: "#4CAF50",
    fillOpacity: 0.4,
    weight: 2
  }
};

// Language options
export const LANGUAGES = {
  ENGLISH: "English",
  NEPALI: "नेपाली"
};

// Drone flight altitude limits in Nepal (in meters)
export const ALTITUDE_LIMITS = {
  MAX_ALTITUDE: 120, // 120 meters AGL
  RESTRICTED_ZONE_ALTITUDE: 0, // No flying in restricted zones
  CONTROLLED_ZONE_ALTITUDE: 50 // Limited altitude in controlled zones
};

// Nepal regulations URLs
export const REGULATIONS_URLS = {
  CAA_NEPAL: "https://caanepal.gov.np/",
  DRONE_REGULATIONS: "https://caanepal.gov.np/drone-regulations"
};
