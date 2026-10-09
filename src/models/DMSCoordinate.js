/**
 * DMSCoordinate - Degrees Minutes Seconds coordinate model
 * 
 * Represents geographic coordinates in degrees, minutes, seconds format
 * with validation rules and precision configuration.
 */

import { validateDMSLatitude, validateDMSLongitude, cloneDMSComponent } from './DMSComponent.js';

/**
 * Creates a DMSCoordinate object
 * @param {DMSComponent} latitude - Latitude component with degrees, minutes, seconds, direction
 * @param {DMSComponent} longitude - Longitude component with degrees, minutes, seconds, direction
 * @param {number} [secondsPrecision=3] - Number of decimal places for seconds [0, 10]
 * @returns {DMSCoordinate}
 */
export function createDMSCoordinate(latitude, longitude, secondsPrecision = 3) {
  return {
    latitude,
    longitude,
    secondsPrecision
  };
}

/**
 * Validates a DMSCoordinate object
 * @param {DMSCoordinate} coord - The coordinate to validate
 * @returns {boolean} True if valid
 * @throws {Error} If validation fails
 */
export function validateDMSCoordinate(coord) {
  if (!coord.latitude || typeof coord.latitude !== 'object') {
    throw new Error('Latitud debe ser un componente DMS válido');
  }
  
  if (!coord.longitude || typeof coord.longitude !== 'object') {
    throw new Error('Longitud debe ser un componente DMS válido');
  }
  
  // Validate latitude component
  validateDMSLatitude(coord.latitude);
  
  // Validate longitude component
  validateDMSLongitude(coord.longitude);
  
  // Validate seconds precision
  if (coord.secondsPrecision !== undefined) {
    if (!Number.isInteger(coord.secondsPrecision) || coord.secondsPrecision < 0 || coord.secondsPrecision > 10) {
      throw new Error('Precisión de segundos debe ser un entero entre 0 y 10');
    }
  }
  
  return true;
}

/**
 * Clones a DMSCoordinate object
 * @param {DMSCoordinate} coord - The coordinate to clone
 * @returns {DMSCoordinate}
 */
export function cloneDMSCoordinate(coord) {
  return {
    latitude: cloneDMSComponent(coord.latitude),
    longitude: cloneDMSComponent(coord.longitude),
    secondsPrecision: coord.secondsPrecision
  };
}
