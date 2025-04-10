import L from 'leaflet';
import { AirspaceZone } from './types';
import { ZONE_STYLES } from './constants';

// Set up custom marker icon to fix the Leaflet icon path issue
export const setupCustomMarkerIcon = () => {
  const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
  const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';
  
  return L.icon({
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// Create a circle layer for a circular airspace zone
export const createCircleZone = (
  zone: AirspaceZone,
  onZoneClick: (zone: AirspaceZone) => void
) => {
  if (zone.geometry.type !== 'Circle' || !Array.isArray(zone.geometry.coordinates) && zone.geometry.radius) {
    console.error('Invalid circle zone data:', zone);
    return null;
  }
  
  // Handle different coordinate formats
  const center = Array.isArray(zone.geometry.coordinates[0]) 
    ? [zone.geometry.coordinates[0][1], zone.geometry.coordinates[0][0]]
    : [zone.geometry.coordinates[1], zone.geometry.coordinates[0]];
  
  const circle = L.circle(center as L.LatLngExpression, {
    radius: zone.geometry.radius,
    ...ZONE_STYLES[zone.type]
  });
  
  circle.bindPopup(`
    <div class="text-sm">
      <h3 class="font-medium">${zone.name}</h3>
      <p>${zone.description}</p>
    </div>
  `);
  
  circle.on('click', () => {
    onZoneClick(zone);
  });
  
  return circle;
};

// Create a polygon layer for a polygon airspace zone
export const createPolygonZone = (
  zone: AirspaceZone,
  onZoneClick: (zone: AirspaceZone) => void
) => {
  if (zone.geometry.type !== 'Polygon' || !Array.isArray(zone.geometry.coordinates)) {
    console.error('Invalid polygon zone data:', zone);
    return null;
  }
  
  // Convert coordinates to Leaflet format [lat, lng]
  const latlngs = zone.geometry.coordinates.map(coord => 
    Array.isArray(coord[0]) 
      ? coord.map(point => [point[1], point[0]]) 
      : [coord[1], coord[0]]
  );
  
  const polygon = L.polygon(latlngs as L.LatLngExpression[][]);
  
  polygon.setStyle(ZONE_STYLES[zone.type]);
  
  polygon.bindPopup(`
    <div class="text-sm">
      <h3 class="font-medium">${zone.name}</h3>
      <p>${zone.description}</p>
    </div>
  `);
  
  polygon.on('click', () => {
    onZoneClick(zone);
  });
  
  return polygon;
};

// Check if a point is within a zone (basic implementation)
export const isPointInZone = (
  point: [number, number],
  zone: AirspaceZone,
  map: L.Map
): boolean => {
  if (zone.geometry.type === 'Circle') {
    const center = Array.isArray(zone.geometry.coordinates[0])
      ? [zone.geometry.coordinates[0][1], zone.geometry.coordinates[0][0]]
      : [zone.geometry.coordinates[1], zone.geometry.coordinates[0]];
    
    const distance = map.distance(
      [point[0], point[1]],
      center as L.LatLngExpression
    );
    
    return distance <= (zone.geometry.radius || 0);
  }
  
  // For polygon zones, we'd need a more complex algorithm
  // This is a simplification
  return false;
};

// Fetch the GeoJSON outline for Nepal
export const fetchNepalOutline = async (): Promise<GeoJSON.Feature> => {
  try {
    // Hardcoded simplified Nepal GeoJSON to avoid external API issues
    const nepalFeature = {
      "type": "Feature",
      "properties": {
        "ADMIN": "Nepal",
        "ISO_A3": "NPL"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [80.088, 28.794], [80.476, 29.729], [81.112, 30.183], [81.546, 30.423], 
            [82.327, 30.334], [83.337, 29.463], [84.125, 29.288], [84.675, 28.549], 
            [85.251, 28.323], [85.661, 28.203], [86.100, 27.926], [86.730, 27.989], 
            [87.227, 27.882], [87.771, 27.647], [88.089, 27.446], [88.175, 26.810], 
            [88.043, 26.414], [87.106, 26.536], [86.696, 26.563], [85.251, 26.726], 
            [84.667, 27.041], [83.305, 27.364], [82.247, 27.364], [81.112, 27.926], 
            [80.476, 28.104], [80.088, 28.794]
          ]
        ]
      }
    };
    
    return nepalFeature as GeoJSON.Feature;
  } catch (error) {
    console.error('Error fetching Nepal outline:', error);
    throw error;
  }
};

// Reverse geocoding function (would connect to a geocoding service in production)
export const reverseGeocode = async (
  coordinates: [number, number]
): Promise<{ address: string, district: string }> => {
  // For now, return mock data based on coordinates
  // In a real implementation, this would call a geocoding API
  
  // Kathmandu area check (very simplified)
  if (coordinates[0] > 27.6 && coordinates[0] < 27.8 && 
      coordinates[1] > 85.2 && coordinates[1] < 85.4) {
    return {
      address: `Lat: ${coordinates[0].toFixed(4)}°, Lng: ${coordinates[1].toFixed(4)}°`,
      district: "Kathmandu"
    };
  }
  
  // Pokhara area check (very simplified)
  if (coordinates[0] > 28.1 && coordinates[0] < 28.3 && 
      coordinates[1] > 83.9 && coordinates[1] < 84.1) {
    return {
      address: `Lat: ${coordinates[0].toFixed(4)}°, Lng: ${coordinates[1].toFixed(4)}°`,
      district: "Kaski"
    };
  }
  
  // Default fallback
  return {
    address: `Lat: ${coordinates[0].toFixed(4)}°, Lng: ${coordinates[1].toFixed(4)}°`,
    district: "Unknown"
  };
};
