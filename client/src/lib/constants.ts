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

// Airspace zone styling - Enhanced for better visibility on satellite imagery
export const ZONE_STYLES = {
  restricted: {
    color: "#FF1744",      // Brighter red
    fillColor: "#FF1744",
    fillOpacity: 0.3,      // Slightly more transparent
    weight: 3,             // Slightly thicker border
    dashArray: '5, 5'      // Dashed line for restricted zones
  },
  controlled: {
    color: "#FF9100",      // Bright orange
    fillColor: "#FF9100",
    fillOpacity: 0.3,
    weight: 2
  },
  advisory: {
    color: "#2979FF",      // Bright blue
    fillColor: "#2979FF",
    fillOpacity: 0.2,
    weight: 2
  },
  open: {
    color: "#00E676",      // Bright green
    fillColor: "#00E676",
    fillOpacity: 0.2,
    weight: 2
  }
};

// Language options
export const LANGUAGES = {
  en: {
    code: "en",
    native: "English",
    english: "English",
    flag: "🇬🇧"
  },
  ne: {
    code: "ne",
    native: "नेपाली",
    english: "Nepali",
    flag: "🇳🇵"
  }
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
