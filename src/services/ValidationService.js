/**
 * ValidationService - Validates coordinate inputs
 * 
 * Provides validation functions for DD, UTM, and DMS coordinates
 * with Spanish error messages.
 */

/**
 * Creates a ValidationResult object
 * @param {boolean} isValid - Whether the validation passed
 * @param {string[]} errors - Array of error messages (empty if valid)
 * @returns {ValidationResult}
 */
export function createValidationResult(isValid, errors = []) {
  return {
    isValid,
    errors
  };
}

/**
 * Validates Decimal Degrees coordinates
 * Requirements: 2.1, 2.2, 2.3, 2.4
 * @param {number} latitude - Latitude value
 * @param {number} longitude - Longitude value
 * @returns {ValidationResult}
 */
export function validateDD(latitude, longitude) {
  const errors = [];
  
  // Check if values are numbers
  if (typeof latitude !== 'number' || isNaN(latitude)) {
    errors.push('Latitud debe ser un número válido');
  } else {
    // Check latitude range
    if (latitude < -90 || latitude > 90) {
      errors.push('Latitud debe estar entre -90 y 90 grados');
    }
  }
  
  if (typeof longitude !== 'number' || isNaN(longitude)) {
    errors.push('Longitud debe ser un número válido');
  } else {
    // Check longitude range
    if (longitude < -180 || longitude > 180) {
      errors.push('Longitud debe estar entre -180 y 180 grados');
    }
  }
  
  return createValidationResult(errors.length === 0, errors);
}

/**
 * Validates UTM coordinates
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 * @param {number} zone - UTM zone [1, 60]
 * @param {string} hemisphere - Hemisphere ('N' or 'S')
 * @param {number} easting - Easting in meters
 * @param {number} northing - Northing in meters
 * @returns {ValidationResult}
 */
export function validateUTM(zone, hemisphere, easting, northing) {
  const errors = [];
  
  // Validate zone
  if (!Number.isInteger(zone) || zone < 1 || zone > 60) {
    errors.push('Zona UTM debe estar entre 1 y 60');
  }
  
  // Validate hemisphere
  if (hemisphere !== 'N' && hemisphere !== 'S') {
    errors.push('Hemisferio debe ser N o S');
  }
  
  // Validate easting
  if (typeof easting !== 'number' || isNaN(easting)) {
    errors.push('Este debe ser un número válido');
  } else if (easting < 100000 || easting > 900000) {
    errors.push('Este debe estar entre 100,000 y 900,000 metros');
  }
  
  // Validate northing
  if (typeof northing !== 'number' || isNaN(northing)) {
    errors.push('Norte debe ser un número válido');
  } else if (northing < 0 || northing > 10000000) {
    errors.push('Norte debe estar entre 0 y 10,000,000 metros');
  }
  
  return createValidationResult(errors.length === 0, errors);
}

/**
 * Validates DMS (Degrees Minutes Seconds) coordinates
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8
 * @param {Object} latDMS - Latitude DMS component {degrees, minutes, seconds, direction}
 * @param {Object} lonDMS - Longitude DMS component {degrees, minutes, seconds, direction}
 * @returns {ValidationResult}
 */
export function validateDMS(latDMS, lonDMS) {
  const errors = [];
  
  // Validate latitude component
  if (!latDMS || typeof latDMS !== 'object') {
    errors.push('Latitud DMS debe ser un objeto válido');
  } else {
    // Validate latitude degrees
    if (!Number.isInteger(latDMS.degrees) || latDMS.degrees < 0 || latDMS.degrees > 90) {
      errors.push('Grados de latitud deben ser un entero entre 0 y 90');
    }
    
    // Validate latitude minutes
    if (typeof latDMS.minutes !== 'number' || latDMS.minutes < 0 || latDMS.minutes >= 60) {
      errors.push('Minutos de latitud deben estar entre 0 y 59');
    }
    
    // Validate latitude seconds
    if (typeof latDMS.seconds !== 'number' || latDMS.seconds < 0 || latDMS.seconds >= 60) {
      errors.push('Segundos de latitud deben estar entre 0 y 60 (exclusivo)');
    }
    
    // Validate latitude direction
    if (latDMS.direction !== 'N' && latDMS.direction !== 'S') {
      errors.push('Dirección de latitud debe ser N o S');
    }
  }
  
  // Validate longitude component
  if (!lonDMS || typeof lonDMS !== 'object') {
    errors.push('Longitud DMS debe ser un objeto válido');
  } else {
    // Validate longitude degrees
    if (!Number.isInteger(lonDMS.degrees) || lonDMS.degrees < 0 || lonDMS.degrees > 180) {
      errors.push('Grados de longitud deben ser un entero entre 0 y 180');
    }
    
    // Validate longitude minutes
    if (typeof lonDMS.minutes !== 'number' || lonDMS.minutes < 0 || lonDMS.minutes >= 60) {
      errors.push('Minutos de longitud deben estar entre 0 y 59');
    }
    
    // Validate longitude seconds
    if (typeof lonDMS.seconds !== 'number' || lonDMS.seconds < 0 || lonDMS.seconds >= 60) {
      errors.push('Segundos de longitud deben estar entre 0 y 60 (exclusivo)');
    }
    
    // Validate longitude direction
    if (lonDMS.direction !== 'E' && lonDMS.direction !== 'W') {
      errors.push('Dirección de longitud debe ser E o W');
    }
  }
  
  return createValidationResult(errors.length === 0, errors);
}
