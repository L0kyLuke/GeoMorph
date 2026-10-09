/**
 * DDCoordinate - Decimal Degrees coordinate model
 * 
 * Represents geographic coordinates in decimal degrees format
 * with validation rules and precision configuration.
 */

/**
 * Creates a DDCoordinate object
 * @param {number} latitude - Latitude in decimal degrees [-90, 90]
 * @param {number} longitude - Longitude in decimal degrees [-180, 180]
 * @param {number} [precision=6] - Number of decimal places [0, 10]
 * @returns {DDCoordinate}
 */
export function createDDCoordinate(latitude, longitude, precision = 6) {
  return {
    latitude,
    longitude,
    precision
  };
}

/**
 * Validates a DDCoordinate object
 * @param {DDCoordinate} coord - The coordinate to validate
 * @returns {boolean} True if valid
 * @throws {Error} If validation fails
 */
export function validateDDCoordinate(coord) {
  if (typeof coord.latitude !== 'number' || isNaN(coord.latitude)) {
    throw new Error('Latitud debe ser un número válido');
  }
  
  if (typeof coord.longitude !== 'number' || isNaN(coord.longitude)) {
    throw new Error('Longitud debe ser un número válido');
  }
  
  if (coord.latitude < -90 || coord.latitude > 90) {
    throw new Error('Latitud debe estar entre -90 y 90 grados');
  }
  
  if (coord.longitude < -180 || coord.longitude > 180) {
    throw new Error('Longitud debe estar entre -180 y 180 grados');
  }
  
  if (coord.precision !== undefined) {
    if (!Number.isInteger(coord.precision) || coord.precision < 0 || coord.precision > 10) {
      throw new Error('Precisión debe ser un entero entre 0 y 10');
    }
  }
  
  return true;
}

/**
 * Clones a DDCoordinate object
 * @param {DDCoordinate} coord - The coordinate to clone
 * @returns {DDCoordinate}
 */
export function cloneDDCoordinate(coord) {
  return {
    latitude: coord.latitude,
    longitude: coord.longitude,
    precision: coord.precision
  };
}
