/**
 * CoordinateFormatter - Formats coordinates as human-readable strings
 * 
 * Formats DD, UTM, and DMS coordinates for display.
 * Requirements: 20
 */

/**
 * Formats a coordinate to a string representation
 * Requirements: 20.1, 20.2, 20.3, 20.4
 * 
 * @param {Object} coordinate - Coordinate object (DD, UTM, or DMS)
 * @param {string} format - Format type ('DD', 'UTM', or 'DMS')
 * @param {number} precision - Decimal precision (optional, uses coordinate's precision if available)
 * @returns {string} Formatted coordinate string
 */
export function formatCoordinateString(coordinate, format, precision = null) {
  if (!coordinate) {
    return '';
  }
  
  switch (format) {
    case 'DD':
      return formatDD(coordinate, precision);
    case 'UTM':
      return formatUTM(coordinate, precision);
    case 'DMS':
      return formatDMS(coordinate, precision);
    default:
      return String(coordinate);
  }
}

/**
 * Formats DD coordinates
 * Format: "latitude°, longitude°"
 * Example: "40.416775°, -3.703790°"
 */
function formatDD(coordinate, precision = null) {
  const prec = precision !== null ? precision : (coordinate.precision || 6);
  const lat = coordinate.latitude.toFixed(prec);
  const lon = coordinate.longitude.toFixed(prec);
  return `${lat}°, ${lon}°`;
}

/**
 * Formats UTM coordinates
 * Format: "zone+band hemisphere easting m northing m"
 * Example: "30T N 440291.28 m 4474254.60 m"
 */
function formatUTM(coordinate, precision = null) {
  const prec = precision !== null ? precision : (coordinate.precision || 2);
  const easting = coordinate.easting.toFixed(prec);
  const northing = coordinate.northing.toFixed(prec);
  return `${coordinate.zone}${coordinate.band} ${coordinate.hemisphere} ${easting} m ${northing} m`;
}

/**
 * Formats DMS coordinates
 * Format: "degrees°minutes'seconds"direction"
 * Example: "40° 25' 0.39" N, 3° 42' 13.64" W"
 */
function formatDMS(coordinate, precision = null) {
  const prec = precision !== null ? precision : (coordinate.secondsPrecision || 3);
  
  const lat = formatDMSComponent(coordinate.latitude, prec);
  const lon = formatDMSComponent(coordinate.longitude, prec);
  
  return `${lat}, ${lon}`;
}

/**
 * Formats a single DMS component
 */
function formatDMSComponent(component, precision) {
  const seconds = component.seconds.toFixed(precision);
  return `${component.degrees}° ${component.minutes}' ${seconds}" ${component.direction}`;
}

/**
 * Formats coordinate for Excel export (simplified format)
 * @param {Object} coordinate - Coordinate object
 * @param {string} format - Format type
 * @returns {string} Simplified format for Excel
 */
export function formatForExcel(coordinate, format) {
  if (!coordinate) {
    return '';
  }
  
  switch (format) {
    case 'DD':
      return `${coordinate.latitude}, ${coordinate.longitude}`;
    case 'UTM':
      return `${coordinate.zone}${coordinate.band} ${coordinate.hemisphere} ${coordinate.easting} ${coordinate.northing}`;
    case 'DMS':
      return `${formatDMSComponent(coordinate.latitude, coordinate.secondsPrecision || 3)}, ${formatDMSComponent(coordinate.longitude, coordinate.secondsPrecision || 3)}`;
    default:
      return String(coordinate);
  }
}
