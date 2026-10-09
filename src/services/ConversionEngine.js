/**
 * ConversionEngine - Core coordinate transformation algorithms
 * 
 * Supports bidirectional conversions between DD, UTM, and DMS formats
 * using WGS84/EPSG:4326 datum.
 */

import proj4 from 'proj4';
import { createDDCoordinate } from '../models/DDCoordinate.js';
import { createUTMCoordinate } from '../models/UTMCoordinate.js';
import { createDMSCoordinate } from '../models/DMSCoordinate.js';
import { createDMSComponent } from '../models/DMSComponent.js';


// Valid UTM band letters
const UTM_BANDS = ['C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X'];

/**
 * Calculates UTM band based on latitude
 * Requirements: 26.1, 26.2, 26.3, 26.4
 * @param {number} latitude - Latitude in degrees
 * @returns {string} UTM band letter
 * @throws {Error} If latitude is outside UTM range [-80, 84]
 */
export function calculateUTMBand(latitude) {
  if (latitude < -80 || latitude > 84) {
    throw new Error('Latitud fuera del rango del sistema UTM [-80, 84]');
  }
  
  // Special case for Svalbard (72-84° uses band X)
  if (latitude >= 72 && latitude <= 84) {
    return 'X';
  }
  
  // UTM bands with 8-degree intervals
  // Each band starts at its lower boundary (inclusive) and ends just before the next
  // Special handling: band boundaries are at multiples of 8 starting from -80
  // But the band assignment is: latitude in [-80+8*i, -80+8*(i+1))
  // Exception: -72 is in C (not D), so upper boundaries are inclusive
  
  if (latitude <= -72) return 'C';
  if (latitude <= -64) return 'D';
  if (latitude <= -56) return 'E';
  if (latitude <= -48) return 'F';
  if (latitude <= -40) return 'G';
  if (latitude <= -32) return 'H';
  if (latitude <= -24) return 'J';
  if (latitude <= -16) return 'K';
  if (latitude <= -8) return 'L';
  if (latitude < 0) return 'M';  // Note: < not <=, because 0 is in N
  if (latitude < 8) return 'N';
  if (latitude < 16) return 'P';
  if (latitude < 24) return 'Q';
  if (latitude < 32) return 'R';
  if (latitude < 40) return 'S';
  if (latitude < 48) return 'T';
  if (latitude < 56) return 'U';
  if (latitude < 64) return 'V';
  if (latitude < 72) return 'W';
  
  return 'X'; // 72-84
}

/**
 * Converts Decimal Degrees to UTM coordinates
 * Requirements: 5.1, 5.2, 5.3, 5.5, 5.6, 5.7, 5.8
 * @param {number} latitude - Latitude in decimal degrees [-90, 90]
 * @param {number} longitude - Longitude in decimal degrees [-180, 180]
 * @param {number} [precision=2] - Number of decimal places for easting/northing
 * @returns {UTMCoordinate}
 */
export function convertDDtoUTM(latitude, longitude, precision = 2) {
  // Calculate UTM zone
  const zone = Math.floor((longitude + 180) / 6) + 1;
  
  // Determine hemisphere
  const hemisphere = latitude >= 0 ? 'N' : 'S';
  
  // Calculate UTM band
  const band = calculateUTMBand(latitude);
  
  // Define UTM projection for this zone
  const utmProj = `+proj=utm +zone=${zone}${hemisphere === 'S' ? ' +south' : ''} +datum=WGS84 +units=m +no_defs`;
  const wgs84Proj = '+proj=longlat +datum=WGS84 +no_defs';
  
  // Convert coordinates using proj4
  const [easting, northing] = proj4(wgs84Proj, utmProj, [longitude, latitude]);
  
  // Apply precision
  const roundedEasting = parseFloat(easting.toFixed(precision));
  const roundedNorthing = parseFloat(northing.toFixed(precision));
  
  return createUTMCoordinate(zone, band, hemisphere, roundedEasting, roundedNorthing, precision);
}

/**
 * Converts UTM coordinates to Decimal Degrees
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7
 * @param {number} zone - UTM zone [1, 60]
 * @param {string} hemisphere - Hemisphere ('N' or 'S')
 * @param {number} easting - Easting in meters
 * @param {number} northing - Northing in meters
 * @param {number} [precision=6] - Number of decimal places for lat/lon
 * @returns {DDCoordinate}
 */
export function convertUTMtoDD(zone, hemisphere, easting, northing, precision = 6) {
  // Define UTM projection for this zone
  const utmProj = `+proj=utm +zone=${zone}${hemisphere === 'S' ? ' +south' : ''} +datum=WGS84 +units=m +no_defs`;
  const wgs84Proj = '+proj=longlat +datum=WGS84 +no_defs';
  
  // Convert coordinates using proj4
  const [longitude, latitude] = proj4(utmProj, wgs84Proj, [easting, northing]);
  
  // Apply precision
  const roundedLatitude = parseFloat(latitude.toFixed(precision));
  const roundedLongitude = parseFloat(longitude.toFixed(precision));
  
  return createDDCoordinate(roundedLatitude, roundedLongitude, precision);
}

/**
 * Converts Decimal Degrees to Degrees Minutes Seconds
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9
 * @param {number} latitude - Latitude in decimal degrees
 * @param {number} longitude - Longitude in decimal degrees
 * @param {number} [secondsPrecision=3] - Number of decimal places for seconds
 * @returns {DMSCoordinate}
 */
export function convertDDtoDMS(latitude, longitude, secondsPrecision = 3) {
  // Convert latitude
  const latDirection = latitude >= 0 ? 'N' : 'S';
  const latAbs = Math.abs(latitude);
  
  let latDegrees = Math.floor(latAbs);
  const latMinutesDecimal = (latAbs - latDegrees) * 60;
  let latMinutes = Math.floor(latMinutesDecimal);
  let latSeconds = (latMinutesDecimal - latMinutes) * 60;
  latSeconds = parseFloat(latSeconds.toFixed(secondsPrecision));
  
  // Handle rollover: seconds = 60
  if (latSeconds >= 60) {
    latSeconds = 0;
    latMinutes += 1;
    if (latMinutes >= 60) {
      latMinutes = 0;
      latDegrees += 1;
    }
  }
  
  const latDMS = createDMSComponent(latDegrees, latMinutes, latSeconds, latDirection);
  
  // Convert longitude
  const lonDirection = longitude >= 0 ? 'E' : 'W';
  const lonAbs = Math.abs(longitude);
  
  let lonDegrees = Math.floor(lonAbs);
  const lonMinutesDecimal = (lonAbs - lonDegrees) * 60;
  let lonMinutes = Math.floor(lonMinutesDecimal);
  let lonSeconds = (lonMinutesDecimal - lonMinutes) * 60;
  lonSeconds = parseFloat(lonSeconds.toFixed(secondsPrecision));
  
  // Handle rollover: seconds = 60
  if (lonSeconds >= 60) {
    lonSeconds = 0;
    lonMinutes += 1;
    if (lonMinutes >= 60) {
      lonMinutes = 0;
      lonDegrees += 1;
    }
  }
  
  const lonDMS = createDMSComponent(lonDegrees, lonMinutes, lonSeconds, lonDirection);
  
  return createDMSCoordinate(latDMS, lonDMS, secondsPrecision);
}

/**
 * Converts Degrees Minutes Seconds to Decimal Degrees
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 * @param {DMSComponent} latDMS - Latitude DMS component
 * @param {DMSComponent} lonDMS - Longitude DMS component
 * @param {number} [precision=6] - Number of decimal places for DD
 * @returns {DDCoordinate}
 */
export function convertDMStoDD(latDMS, lonDMS, precision = 6) {
  // Calculate latitude
  let latitude = latDMS.degrees + (latDMS.minutes / 60) + (latDMS.seconds / 3600);
  
  if (latDMS.direction === 'S') {
    latitude = -latitude;
  }
  
  latitude = parseFloat(latitude.toFixed(precision));
  
  // Calculate longitude
  let longitude = lonDMS.degrees + (lonDMS.minutes / 60) + (lonDMS.seconds / 3600);
  
  if (lonDMS.direction === 'W') {
    longitude = -longitude;
  }
  
  longitude = parseFloat(longitude.toFixed(precision));
  
  return createDDCoordinate(latitude, longitude, precision);
}

/**
 * Converts UTM to DMS (chained conversion: UTM → DD → DMS)
 * Requirements: 27.1, 27.2, 27.3, 27.4
 * @param {number} zone - UTM zone
 * @param {string} hemisphere - Hemisphere ('N' or 'S')
 * @param {number} easting - Easting in meters
 * @param {number} northing - Northing in meters
 * @param {number} [secondsPrecision=3] - Number of decimal places for seconds
 * @returns {DMSCoordinate}
 */
export function convertUTMtoDMS(zone, hemisphere, easting, northing, secondsPrecision = 3) {
  // Use higher intermediate precision to minimize rounding errors
  const ddCoord = convertUTMtoDD(zone, hemisphere, easting, northing, 10);
  return convertDDtoDMS(ddCoord.latitude, ddCoord.longitude, secondsPrecision);
}

/**
 * Converts DMS to UTM (chained conversion: DMS → DD → UTM)
 * Requirements: 27.1, 27.2, 27.3, 27.4
 * @param {DMSComponent} latDMS - Latitude DMS component
 * @param {DMSComponent} lonDMS - Longitude DMS component
 * @param {number} [precision=2] - Number of decimal places for easting/northing
 * @returns {UTMCoordinate}
 */
export function convertDMStoUTM(latDMS, lonDMS, precision = 2) {
  // Use higher intermediate precision to minimize rounding errors
  const ddCoord = convertDMStoDD(latDMS, lonDMS, 10);
  return convertDDtoUTM(ddCoord.latitude, ddCoord.longitude, precision);
}
