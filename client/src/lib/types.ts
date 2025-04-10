// Types for the flight planning application

export interface FlightPlan {
  step: number;
  intent?: FlightIntent;
  location?: Location;
  flight?: FlightDetails;
  results?: FlightResults;
}

export interface FlightIntent {
  purpose: string;
  dronePilotType: string;
  droneCategory: string;
  droneWeight: string;
}

export interface Location {
  coordinates: [number, number];
  address?: string;
  district?: string;
  locationType?: string;
  airspaceType?: string;
}

export interface FlightDetails {
  date: string;
  time: string;
  duration: number;
  altitude: number;
  maintainsVlos: boolean; // Visual Line of Sight
  isNightOperation: boolean;
}

export interface FlightResults {
  permissionsRequired: string[];
  regulationsApplicable: string[];
  isPermitted: boolean;
  advisoryMessages: string[];
}

export interface AirspaceZone {
  id: string;
  name: string;
  description: string;
  type: "restricted" | "controlled" | "advisory" | "open";
  geometry: {
    type: "Polygon" | "Circle";
    coordinates: [number, number][] | [number, number]; // Polygon points or circle center
    radius?: number; // For Circle geometries only
  };
}

export interface MapControls {
  layers: {
    restricted: boolean;
    controlled: boolean;
    advisory: boolean;
    open: boolean;
  };
  isDrawerOpen: boolean;
  selectedZone?: AirspaceZone;
}

export interface LocationSearchResult {
  name: string;
  coordinates: [number, number];
  address: string;
  district: string;
}

export type FlightPlanStep = 
  | "intent" 
  | "location" 
  | "flight" 
  | "results";

export interface Regulation {
  id: string;
  title: string;
  description: string;
  applicableTo: string[];
  source: string;
  zoneDependant: boolean;
  applicableZones?: string[];
}

export interface StepProgress {
  step: number;
  status: "pending" | "active" | "completed";
}
