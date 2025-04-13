import L from 'leaflet';

// Minimum distance needed between position updates (in meters)
const MIN_MOVEMENT_THRESHOLD = 5;
// Number of historical positions to keep for smoothing
const POSITION_HISTORY_SIZE = 3;

// Store position history
export class LocationSmoother {
  private positionHistory: Array<{lat: number, lng: number}> = [];
  
  /**
   * Calculate distance between two coordinates in meters using Haversine formula
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  /**
   * Should a position update be applied based on movement threshold
   */
  shouldUpdatePosition(newLat: number, newLng: number): boolean {
    if (this.positionHistory.length === 0) return true;
    
    const lastPos = this.positionHistory[this.positionHistory.length - 1];
    const distance = this.calculateDistance(
      lastPos.lat, lastPos.lng,
      newLat, newLng
    );
    
    return distance > MIN_MOVEMENT_THRESHOLD;
  }
  
  /**
   * Add a new position to history
   */
  addPosition(lat: number, lng: number): void {
    this.positionHistory.push({lat, lng});
    
    // Maintain history size
    if (this.positionHistory.length > POSITION_HISTORY_SIZE) {
      this.positionHistory.shift();
    }
  }
  
  /**
   * Calculate smoothed position from history using weighted average
   */
  getSmoothedPosition(): L.LatLng | null {
    if (this.positionHistory.length === 0) return null;
    
    // If only one position, return it directly
    if (this.positionHistory.length === 1) {
      const pos = this.positionHistory[0];
      return L.latLng(pos.lat, pos.lng);
    }
    
    // Apply weighted average - more recent positions have higher weight
    let totalWeight = 0;
    let weightedLat = 0;
    let weightedLng = 0;
    
    this.positionHistory.forEach((pos, index) => {
      const weight = index + 1; // Weight increases for more recent positions
      totalWeight += weight;
      weightedLat += pos.lat * weight;
      weightedLng += pos.lng * weight; 
    });
    
    return L.latLng(weightedLat / totalWeight, weightedLng / totalWeight);
  }
  
  /**
   * Reset position history
   */
  reset(): void {
    this.positionHistory = [];
  }
}

export default new LocationSmoother();