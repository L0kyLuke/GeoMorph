/**
 * DMSComponent - Degrees Minutes Seconds component model
 * 
 * Represents a single coordinate component (latitude or longitude)
 * in degrees, minutes, seconds format with direction.
 */

/**
 * Creates a DMSComponent object
 * @param {number} degrees - Degrees (integer)
 * @param {number} minutes - Minutes [0, 59]
 * @param {number} seconds - Seconds [0, 60)
 * @param {string} direction - Direction ('N', 'S', 'E', 'W')
 * @returns {DMSComponent}
 */
export function createDMSComponent(degrees, minutes, seconds, direction) {
  return {
    degrees,
    minutes,
    seconds,
    direction
  };
}

/**
 * Validates a DMSComponent object for latitude
 * @param {DMSComponent} component - The component to validate
 * @returns {boolean} True if valid
 * @throws {Error} If validation fails
 */
export function validateDMSLatitude(component) {
  if (!Number.isInteger(component.degrees) || component.degrees < 0 || component.degrees > 90) {
    throw new Error('Grados de latitud deben ser un entero entre 0 y 90');
  }
  
  if (typeof component.minutes !== 'number' || component.minutes < 0 || component.minutes >= 60) {
    throw new Error('Minutos deben estar entre 0 y 59');
  }
  
  if (typeof component.seconds !== 'number' || component.seconds < 0 || component.seconds >= 60) {
    throw new Error('Segundos deben estar entre 0 y 60 (exclusivo)');
  }
  
  if (component.direction !== 'N' && component.direction !== 'S') {
    throw new Error('Dirección de latitud debe ser N o S');
  }
  
  return true;
}

/**
 * Validates a DMSComponent object for longitude
 * @param {DMSComponent} component - The component to validate
 * @returns {boolean} True if valid
 * @throws {Error} If validation fails
 */
export function validateDMSLongitude(component) {
  if (!Number.isInteger(component.degrees) || component.degrees < 0 || component.degrees > 180) {
    throw new Error('Grados de longitud deben ser un entero entre 0 y 180');
  }
  
  if (typeof component.minutes !== 'number' || component.minutes < 0 || component.minutes >= 60) {
    throw new Error('Minutos deben estar entre 0 y 59');
  }
  
  if (typeof component.seconds !== 'number' || component.seconds < 0 || component.seconds >= 60) {
    throw new Error('Segundos deben estar entre 0 y 60 (exclusivo)');
  }
  
  if (component.direction !== 'E' && component.direction !== 'W') {
    throw new Error('Dirección de longitud debe ser E o W');
  }
  
  return true;
}

/**
 * Clones a DMSComponent object
 * @param {DMSComponent} component - The component to clone
 * @returns {DMSComponent}
 */
export function cloneDMSComponent(component) {
  return {
    degrees: component.degrees,
    minutes: component.minutes,
    seconds: component.seconds,
    direction: component.direction
  };
}
