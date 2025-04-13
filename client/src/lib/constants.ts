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

// Airspace zone styling - Similar to the Canadian reference tool
export const ZONE_STYLES = {
  restricted: {
    color: "#e74c3c",      // Red color like in the reference image
    fillColor: "#e74c3c",
    fillOpacity: 0.25,     // More transparent to see the map below
    weight: 2,             // Thinner border to match reference
    dashArray: ''          // Solid line like in the reference
  },
  controlled: {
    color: "#e67e22",      // Orange color like in the reference image
    fillColor: "#e67e22",
    fillOpacity: 0.25,
    weight: 2
  },
  advisory: {
    color: "#3498db",      // Blue color like in the reference image
    fillColor: "#3498db",
    fillOpacity: 0.25,
    weight: 2
  },
  open: {
    color: "#2ecc71",      // Green color like in the reference image
    fillColor: "#2ecc71",
    fillOpacity: 0.25,
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
