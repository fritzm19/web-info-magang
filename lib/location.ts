// Diskominfo Sulut Office Coordinates
export const OFFICE_LOCATION = {
  lat: 1.469940076052675,
  lng: 124.84486754110868
};

// Maximum allowed distance in meters
export const MAX_DISTANCE_METERS = 10000; 

/**
 * Calculates the distance between two points using the Haversine formula
 */
export const getDistanceFromLatLonInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // Earth radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};