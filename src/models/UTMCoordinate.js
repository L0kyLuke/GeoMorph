/**
 * UTMCoordinate - Universal Transverse Mercator coordinate model
 * 
 * Represents geographic coordinates in UTM format with validation rules
 * and precision configuration.
 */

/**
 * Valid UTM band letters (excluding I and O)
 */
const VALID_UTM_BANDS = ['C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X'];

/**
 * Creates a UTMCoordinate object
 * @param {number} zone - UTM zone [1, 60]
 * @param {string} band - UTM band letter (C-X, excluding I and O)
 * @param {string} hemisphere - Hemisphere ('N' or 'S')
 * @param {number} easting - Easting in meters [100000, 900000]
 * @param {number} northing - Northing in meters [0, 10000000]
 * @param {number} [precision=2] - Number of decimal places [0, 10]
 * @returns {UTMCoordinate}
 */
export function createUTMCoordinate(zone, band, hemisphere, easting, northing, precision = 2) {
  return {
    zone,
    band,
    hemisphere,
    easting,
    northing,
    precision
  };
}

/**
 * Validates a UTMCoordinate object
 * @param {UTMCoordinate} coord - The coordinate to validate
 * @returns {boolean} True if valid
 * @throws {Error} If validation fails
 */
export function validateUTMCoordinate(coord) {
  if (!Number.isInteger(coord.zone) || coord.zone < 1 || coord.zone > 60) {
    throw new Error('Zona UTM debe estar entre 1 y 60');
  }
  
  if (typeof coord.band !== 'string' || !VALID_UTM_BANDS.includes(coord.band.toUpperCase())) {
    throw new Error('Banda UTM debe ser una letra válida (C-X, excluyendo I y O)');
  }
  
  if (coord.hemisphere !== 'N' && coord.hemisphere !== 'S') {
    throw new Error('Hemisferio debe ser N o S');
  }
  
  if (typeof coord.easting !== 'number' || isNaN(coord.easting)) {
    throw new Error('Este debe ser un número válido');
  }
  
  if (coord.easting < 100000 || coord.easting > 900000) {
    throw new Error('Este debe estar entre 100,000 y 900,000 metros');
  }
  
  if (typeof coord.northing !== 'number' || isNaN(coord.northing)) {
    throw new Error('Norte debe ser un número válido');
  }
  
  if (coord.northing < 0 || coord.northing > 10000000) {
    throw new Error('Norte debe estar entre 0 y 10,000,000 metros');
  }
  
  if (coord.precision !== undefined) {
    if (!Number.isInteger(coord.precision) || coord.precision < 0 || coord.precision > 10) {
      throw new Error('Precisión debe ser un entero entre 0 y 10');
    }
  }
  
  return true;
}

/**
 * Clones a UTMCoordinate object
 * @param {UTMCoordinate} coord - The coordinate to clone
 * @returns {UTMCoordinate}
 */
export function cloneUTMCoordinate(coord) {
  return {
    zone: coord.zone,
    band: coord.band,
    hemisphere: coord.hemisphere,
    easting: coord.easting,
    northing: coord.northing,
    precision: coord.precision
  };
}

/**
 * Gets the list of valid UTM band letters
 * @returns {string[]}
 */
export function getValidUTMBands() {
  return [...VALID_UTM_BANDS];
}
