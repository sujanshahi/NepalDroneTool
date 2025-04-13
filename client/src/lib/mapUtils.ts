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

// Create a circle layer for any airspace zone - converts all zones to circular representation
export const createZoneCircle = (
  zone: AirspaceZone,
  onZoneClick: (zone: AirspaceZone) => void
) => {
  let center: L.LatLngExpression;
  let radius: number;
  
  if (zone.geometry.type === 'Circle') {
    // For circle zones, use the provided center and radius
    if (!Array.isArray(zone.geometry.coordinates)) {
      console.error('Invalid circle coordinates:', zone);
      return null;
    }
    
    if (Array.isArray(zone.geometry.coordinates[0])) {
      center = [zone.geometry.coordinates[0][1], zone.geometry.coordinates[0][0]] as L.LatLngExpression;
    } else {
      center = [
        zone.geometry.coordinates[1] as number, 
        zone.geometry.coordinates[0] as number
      ] as L.LatLngExpression;
    }
    
    radius = zone.geometry.radius || 1000; // Default 1km if radius is missing
  } else {
    // For polygon zones, calculate the centroid and use a radius based on complexity
    // This is a simplified approach - converting polygons to circles
    if (!Array.isArray(zone.geometry.coordinates)) {
      console.error('Invalid polygon coordinates:', zone);
      return null;
    }
    
    // Calculate a simple centroid
    let totalLat = 0;
    let totalLng = 0;
    let pointCount = 0;
    
    // Handle both single array and nested arrays
    if (Array.isArray(zone.geometry.coordinates[0])) {
      if (Array.isArray(zone.geometry.coordinates[0][0])) {
        // Nested arrays: [[lat, lng], [lat, lng], ...]
        zone.geometry.coordinates[0].forEach(point => {
          if (Array.isArray(point)) {
            totalLng += point[0];
            totalLat += point[1];
            pointCount++;
          }
        });
      } else {
        // Single array: [lat, lng]
        totalLng += zone.geometry.coordinates[0][0];
        totalLat += zone.geometry.coordinates[0][1];
        pointCount = 1;
      }
    }
    
    // Default to center of Nepal if we couldn't calculate a centroid
    if (pointCount === 0) {
      center = [28.3949, 84.124];
      console.warn('Using default center for zone:', zone.name);
    } else {
      center = [totalLat / pointCount, totalLng / pointCount];
    }
    
    // Set a default radius based on zone type
    radius = 5000; // 5km default radius
    
    // Adjust radius based on zone type
    if (zone.type === 'restricted') radius = 3000;
    else if (zone.type === 'controlled') radius = 5000;
    else if (zone.type === 'advisory') radius = 4000;
    else if (zone.type === 'open') radius = 6000;
  }
  
  // Create the circle with correct params
  const circle = L.circle(center, {
    ...ZONE_STYLES[zone.type],
    radius: radius,
    stroke: true,
    weight: 1.5,
    opacity: 0.7,
    fillOpacity: 0.25
  });
  
  // Add pulse effect for restricted zones
  if (zone.type === 'restricted') {
    const pulseOptions = {
      ...ZONE_STYLES[zone.type],
      radius: radius + 50,
      fillOpacity: 0,
      weight: 3,
      opacity: 0.3,
      className: 'pulse-circle'
    };
    const pulseCircle = L.circle(center, pulseOptions);
    return L.layerGroup([circle, pulseCircle]);
  }
  
  circle.bindPopup(`
    <div class="text-sm">
      <h3 class="font-medium">${zone.name}</h3>
      <p>${zone.description}</p>
      <p class="text-xs mt-1 font-bold">${zone.type.toUpperCase()}</p>
    </div>
  `);
  
  circle.on('click', () => {
    onZoneClick(zone);
  });
  
  return circle;
};

// Check if a point is within a zone (circular implementation for all zones)
export const isPointInZone = (
  point: [number, number],
  zone: AirspaceZone,
  map: L.Map
): boolean => {
  let center: L.LatLngExpression;
  let radius: number;
  
  if (zone.geometry.type === 'Circle') {
    if (!Array.isArray(zone.geometry.coordinates)) {
      return false;
    }
    
    if (Array.isArray(zone.geometry.coordinates[0])) {
      center = [zone.geometry.coordinates[0][1], zone.geometry.coordinates[0][0]] as L.LatLngExpression;
    } else {
      center = [
        zone.geometry.coordinates[1] as number, 
        zone.geometry.coordinates[0] as number
      ] as L.LatLngExpression;
    }
    
    radius = zone.geometry.radius || 1000;
  } else {
    // For consistency, use the same calculation as in createZoneCircle
    // This is a simplified version - all polygon zones are treated as circles
    let totalLat = 0;
    let totalLng = 0;
    let pointCount = 0;
    
    if (Array.isArray(zone.geometry.coordinates) && Array.isArray(zone.geometry.coordinates[0])) {
      if (Array.isArray(zone.geometry.coordinates[0][0])) {
        zone.geometry.coordinates[0].forEach(point => {
          if (Array.isArray(point)) {
            totalLng += point[0];
            totalLat += point[1];
            pointCount++;
          }
        });
      } else {
        totalLng += zone.geometry.coordinates[0][0];
        totalLat += zone.geometry.coordinates[0][1];
        pointCount = 1;
      }
    }
    
    if (pointCount === 0) {
      return false;
    }
    
    center = [totalLat / pointCount, totalLng / pointCount] as L.LatLngExpression;
    
    // Use the same radius determination as in createZoneCircle
    radius = 5000;
    if (zone.type === 'restricted') radius = 3000;
    else if (zone.type === 'controlled') radius = 5000;
    else if (zone.type === 'advisory') radius = 4000;
    else if (zone.type === 'open') radius = 6000;
  }
  
  const distance = map.distance(
    [point[0], point[1]],
    center
  );
  
  return distance <= radius;
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
