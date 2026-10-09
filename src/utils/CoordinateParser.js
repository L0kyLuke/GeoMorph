/**
 * CoordinateParser - Parses coordinate strings into structured formats
 * 
 * Supports parsing DMS strings in various formats.
 * Requirements: 9
 */

import { createDMSComponent } from '../models/DMSComponent.js';

/**
 * Parses a DMS string into a DMSComponent
 * Supports multiple formats:
 * - "40°25'00.39"N"
 * - "40 25 00.39 N"
 * - "40° 25' 00.39\" N"
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
 * @param {string} dmsString - DMS string to parse
 * @param {boolean} isLatitude - Whether this is a latitude (true) or longitude (false)
 * @returns {DMSComponent}
 * @throws {Error} If string cannot be parsed
 */
export function parseDMSString(dmsString, isLatitude = true) {
  if (!dmsString || typeof dmsString !== 'string') {
    throw new Error('Coordenada DMS debe ser una cadena de texto válida');
  }
  
  // Remove extra whitespace
  const trimmed = dmsString.trim();
  
  // Try multiple regex patterns
  const patterns = [
    // Pattern 1: 40°25'00.39"N or 40° 25' 00.39" N (with dot or comma as decimal)
    /^(\d+)[°º\s]+(\d+)['\s]+([0-9.,]+)["'\s]*([NSEW])$/i,
    // Pattern 2: 40 25 00.39 N (with dot or comma as decimal)
    /^(\d+)\s+(\d+)\s+([0-9.,]+)\s+([NSEW])$/i,
    // Pattern 3: 40°25'00.39"N (no spaces, with dot or comma as decimal)
    /^(\d+)°(\d+)'([0-9.,]+)"([NSEW])$/i,
    // Pattern 4: 40d25m00.39sN (alternative notation, with dot or comma as decimal)
    /^(\d+)d(\d+)m([0-9.,]+)s([NSEW])$/i
  ];
  
  let match = null;
  for (const pattern of patterns) {
    match = trimmed.match(pattern);
    if (match) break;
  }
  
  if (!match) {
    throw new Error(`No se pudo interpretar la coordenada DMS: "${dmsString}". Use formato como "40° 25' 00.39\" N"`);
  }
  
  const degrees = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  // Replace comma with dot for parsing
  const seconds = parseFloat(match[3].replace(',', '.'));
  const direction = match[4].toUpperCase();
  
  // Validate direction
  const validDirections = isLatitude ? ['N', 'S'] : ['E', 'W'];
  if (!validDirections.includes(direction)) {
    throw new Error(`Dirección inválida "${direction}". ${isLatitude ? 'Use N o S para latitud' : 'Use E o W para longitud'}`);
  }
  
  // Validate ranges
  const maxDegrees = isLatitude ? 90 : 180;
  if (degrees > maxDegrees) {
    throw new Error(`Grados fuera de rango: ${degrees}. Máximo ${maxDegrees} para ${isLatitude ? 'latitud' : 'longitud'}`);
  }
  
  if (minutes >= 60) {
    throw new Error(`Minutos fuera de rango: ${minutes}. Debe estar entre 0 y 59`);
  }
  
  if (seconds >= 60) {
    throw new Error(`Segundos fuera de rango: ${seconds}. Debe estar entre 0 y 60 (exclusivo)`);
  }
  
  return createDMSComponent(degrees, minutes, seconds, direction);
}

/**
 * Attempts to parse a coordinate string and detect its format
 * @param {string} coordString - Coordinate string
 * @returns {Object} {format: 'DD'|'UTM'|'DMS', value: parsed value}
 */
export function detectCoordinateFormat(coordString) {
  // Try DMS first (most specific pattern)
  try {
    parseDMSString(coordString, true);
    return { format: 'DMS', value: coordString };
  } catch (e) {
    // Not DMS
  }
  
  // Try decimal degrees (simple number)
  const ddMatch = coordString.match(/^-?\d+\.?\d*$/);
  if (ddMatch) {
    return { format: 'DD', value: parseFloat(coordString) };
  }
  
  // Default to unknown
  return { format: 'UNKNOWN', value: null };
}
