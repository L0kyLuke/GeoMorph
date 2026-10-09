/**
 * ColumnDetectionService - Intelligent column detection for Excel coordinate data
 * Uses pattern matching and fuzzy string matching to identify coordinate columns
 */

import { distance } from 'fastest-levenshtein';

/**
 * Pattern arrays for coordinate component matching
 */
const PATTERNS = {
  latitude: ['lat', 'latitude', 'latitud', 'y', 'northing', 'norte', 'norte_y', 'norte (y)'],
  longitude: ['lon', 'long', 'longitude', 'longitud', 'x', 'easting', 'este', 'este_x', 'este (x)'],
  utmEasting: ['easting', 'este', 'x', 'utm_x', 'utm_este', 'e', 'este (x)', 'este(x)', 'este_x', 'utm x'],
  utmNorthing: ['northing', 'norte', 'y', 'utm_y', 'utm_norte', 'n', 'norte (y)', 'norte(y)', 'norte_y', 'utm y'],
  utmZone: ['zone', 'zona', 'utm_zone', 'zona_utm', 'huso', 'utm zone'],
  utmHemisphere: ['hemisphere', 'hemisferio', 'hem', 'h', 'banda', 'band'],
  dmsDegrees: ['deg', 'degrees', 'grados', 'd', 'º'],
  dmsMinutes: ['min', 'minutes', 'minutos', 'm', "'"],
  dmsSeconds: ['sec', 'seconds', 'segundos', 's', '"'],
  dmsDirection: ['dir', 'direction', 'direccion', 'dirección', 'cardinal']
};

/**
 * Minimum confidence threshold for accepting a match
 */
const MIN_CONFIDENCE = 0.3;

/**
 * Fuzzy match similarity threshold (as percentage)
 */
const FUZZY_SIMILARITY_THRESHOLD = 0.7;

/**
 * Score a column header match against a pattern array
 * Returns confidence score from 0.0 to 1.0
 * 
 * @param {string} header - Column header to match
 * @param {string[]} patterns - Array of patterns to match against
 * @returns {number} Confidence score (0.0 to 1.0)
 */
function scoreColumnMatch(header, patterns) {
  // Handle null, undefined, or empty headers
  if (!header || header === null || header === undefined) {
    return 0;
  }
  
  const normalizedHeader = String(header).toLowerCase().trim()
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .replace(/[()]/g, ''); // Remove parentheses for matching
  
  // Handle empty string after normalization
  if (normalizedHeader === '') {
    return 0;
  }
  
  // Normalize patterns too
  const normalizedPatterns = patterns.map(p => 
    p.toLowerCase().replace(/\s+/g, ' ').replace(/[()]/g, '')
  );
  
  // Exact match → confidence 1.0
  if (normalizedPatterns.includes(normalizedHeader)) {
    return 1.0;
  }
  
  // Contains pattern or pattern contains header → confidence 0.9
  for (let i = 0; i < normalizedPatterns.length; i++) {
    const pattern = normalizedPatterns[i];
    if (normalizedHeader.includes(pattern)) {
      return 0.9;
    }
    if (pattern.includes(normalizedHeader) && normalizedHeader.length >= 3) {
      return 0.85;
    }
  }
  
  // Check original patterns without normalization for exact matches
  for (const pattern of patterns) {
    const normalizedPattern = pattern.toLowerCase().trim();
    const originalHeader = String(header).toLowerCase().trim();
    if (originalHeader === normalizedPattern) {
      return 1.0;
    }
  }
  
  // Fuzzy match using Levenshtein distance
  let bestSimilarity = 0;
  for (const pattern of normalizedPatterns) {
    const maxLength = Math.max(normalizedHeader.length, pattern.length);
    const editDistance = distance(normalizedHeader, pattern);
    const similarity = 1 - (editDistance / maxLength);
    
    if (similarity > bestSimilarity) {
      bestSimilarity = similarity;
    }
  }
  
  // If similarity > threshold, return confidence = similarity × 0.6
  if (bestSimilarity >= FUZZY_SIMILARITY_THRESHOLD) {
    return bestSimilarity * 0.6;
  }
  
  return 0;
}

/**
 * Find best matching column for a pattern array
 * 
 * @param {string[]} headers - Array of column headers
 * @param {string[]} patterns - Pattern array to match
 * @returns {{columnName: string|null, confidence: number}} Best match or null
 */
function findBestMatch(headers, patterns) {
  let bestMatch = null;
  let bestConfidence = 0;
  
  for (const header of headers) {
    const confidence = scoreColumnMatch(header, patterns);
    if (confidence > bestConfidence && confidence >= MIN_CONFIDENCE) {
      bestConfidence = confidence;
      bestMatch = header;
    }
  }
  
  return {
    columnName: bestMatch,
    confidence: bestConfidence
  };
}

/**
 * Detect DD (Decimal Degrees) column mapping
 * 
 * @param {string[]} headers - Array of column headers from Excel file
 * @returns {{latitude: {columnName: string|null, confidence: number}, longitude: {columnName: string|null, confidence: number}, avgConfidence: number}} DD column mapping with confidence scores
 */
export function detectForDD(headers) {
  const latMatch = findBestMatch(headers, PATTERNS.latitude);
  const lonMatch = findBestMatch(headers, PATTERNS.longitude);
  
  // Calculate average confidence (only count detected columns)
  const detectedCount = (latMatch.columnName ? 1 : 0) + (lonMatch.columnName ? 1 : 0);
  const totalConfidence = latMatch.confidence + lonMatch.confidence;
  const avgConfidence = detectedCount > 0 ? totalConfidence / detectedCount : 0;
  
  return {
    latitude: latMatch,
    longitude: lonMatch,
    avgConfidence
  };
}

/**
 * Detect UTM column mapping
 * 
 * @param {string[]} headers - Array of column headers from Excel file
 * @returns {{easting: {columnName: string|null, confidence: number}, northing: {columnName: string|null, confidence: number}, zone: {columnName: string|null, confidence: number}, hemisphere: {columnName: string|null, confidence: number}, avgConfidence: number}} UTM column mapping with confidence scores
 */
export function detectForUTM(headers) {
  const eastingMatch = findBestMatch(headers, PATTERNS.utmEasting);
  const northingMatch = findBestMatch(headers, PATTERNS.utmNorthing);
  const zoneMatch = findBestMatch(headers, PATTERNS.utmZone);
  const hemisphereMatch = findBestMatch(headers, PATTERNS.utmHemisphere);
  
  // Calculate average confidence (zone and hemisphere are optional, so don't penalize if not found)
  const eastingConf = eastingMatch.columnName ? eastingMatch.confidence : 0;
  const northingConf = northingMatch.columnName ? northingMatch.confidence : 0;
  const zoneConf = zoneMatch.columnName ? zoneMatch.confidence : 0;
  const hemisphereConf = hemisphereMatch.columnName ? hemisphereMatch.confidence : 0;
  
  // If easting and northing found, include them in average
  let detectedCount = 0;
  let totalConfidence = 0;
  
  if (eastingMatch.columnName) {
    detectedCount++;
    totalConfidence += eastingConf;
  }
  
  if (northingMatch.columnName) {
    detectedCount++;
    totalConfidence += northingConf;
  }
  
  // Zone and hemisphere are optional but included if found
  if (zoneMatch.columnName) {
    detectedCount++;
    totalConfidence += zoneConf;
  }
  
  if (hemisphereMatch.columnName) {
    detectedCount++;
    totalConfidence += hemisphereConf;
  }
  
  const avgConfidence = detectedCount > 0 ? totalConfidence / detectedCount : 0;
  
  return {
    easting: eastingMatch,
    northing: northingMatch,
    zone: zoneMatch,
    hemisphere: hemisphereMatch,
    avgConfidence
  };
}

/**
 * Detect DMS (Degrees, Minutes, Seconds) column mapping
 * Attempts to detect both single-column and multi-column DMS formats
 * 
 * @param {string[]} headers - Array of column headers from Excel file
 * @returns {{format: 'single'|'multi'|null, columns: Object, avgConfidence: number}} DMS column mapping with format variant
 */
export function detectForDMS(headers) {
  // Try to detect single-column DMS format first
  // Look for columns that might contain complete DMS strings
  const dmsPatterns = ['dms', 'coordenada', 'coordinate', 'coord', 'gms'];
  
  let singleColumnMatch = null;
  let singleColumnConfidence = 0;
  
  for (const header of headers) {
    const confidence = scoreColumnMatch(header, dmsPatterns);
    if (confidence > singleColumnConfidence && confidence >= MIN_CONFIDENCE) {
      singleColumnConfidence = confidence;
      singleColumnMatch = header;
    }
  }
  
  // Try to detect multi-column DMS format
  // Look for separate columns for degrees, minutes, seconds for both lat/lon
  const latDegreesMatch = findBestMatch(headers, [...PATTERNS.latitude, ...PATTERNS.dmsDegrees]);
  const latMinutesMatch = findBestMatch(headers, [...PATTERNS.latitude, ...PATTERNS.dmsMinutes]);
  const latSecondsMatch = findBestMatch(headers, [...PATTERNS.latitude, ...PATTERNS.dmsSeconds]);
  const latDirectionMatch = findBestMatch(headers, [...PATTERNS.latitude, ...PATTERNS.dmsDirection]);
  
  const lonDegreesMatch = findBestMatch(headers, [...PATTERNS.longitude, ...PATTERNS.dmsDegrees]);
  const lonMinutesMatch = findBestMatch(headers, [...PATTERNS.longitude, ...PATTERNS.dmsMinutes]);
  const lonSecondsMatch = findBestMatch(headers, [...PATTERNS.longitude, ...PATTERNS.dmsSeconds]);
  const lonDirectionMatch = findBestMatch(headers, [...PATTERNS.longitude, ...PATTERNS.dmsDirection]);
  
  // Calculate multi-column confidence
  const multiColumnMatches = [
    latDegreesMatch, latMinutesMatch, latSecondsMatch, latDirectionMatch,
    lonDegreesMatch, lonMinutesMatch, lonSecondsMatch, lonDirectionMatch
  ];
  
  const detectedMultiColumns = multiColumnMatches.filter(m => m.columnName !== null);
  const multiColumnConfidence = detectedMultiColumns.length > 0
    ? detectedMultiColumns.reduce((sum, m) => sum + m.confidence, 0) / detectedMultiColumns.length
    : 0;
  
  // Decide which format is more likely
  if (singleColumnMatch && singleColumnConfidence > multiColumnConfidence) {
    return {
      format: 'single',
      columns: {
        latLonColumn: { columnName: singleColumnMatch, confidence: singleColumnConfidence }
      },
      avgConfidence: singleColumnConfidence
    };
  } else if (detectedMultiColumns.length >= 4) {
    // Need at least 4 columns detected for multi-column format
    return {
      format: 'multi',
      columns: {
        latDegrees: latDegreesMatch,
        latMinutes: latMinutesMatch,
        latSeconds: latSecondsMatch,
        latDirection: latDirectionMatch,
        lonDegrees: lonDegreesMatch,
        lonMinutes: lonMinutesMatch,
        lonSeconds: lonSecondsMatch,
        lonDirection: lonDirectionMatch
      },
      avgConfidence: multiColumnConfidence
    };
  }
  
  // No format detected
  return {
    format: null,
    columns: {},
    avgConfidence: 0
  };
}

/**
 * Auto-detect the most likely coordinate format in the Excel file
 * Returns the format with the highest confidence
 * 
 * @param {string[]} headers - Array of column headers from Excel file
 * @returns {{format: 'DD'|'UTM'|'DMS'|null, confidence: number, detection: Object}} Best format match
 */
export function autoDetectFormat(headers) {
  const ddDetection = detectForDD(headers);
  const utmDetection = detectForUTM(headers);
  const dmsDetection = detectForDMS(headers);
  
  const formats = [
    { format: 'DD', confidence: ddDetection.avgConfidence, detection: ddDetection },
    { format: 'UTM', confidence: utmDetection.avgConfidence, detection: utmDetection },
    { format: 'DMS', confidence: dmsDetection.avgConfidence, detection: dmsDetection }
  ];
  
  // Sort by confidence descending
  formats.sort((a, b) => b.confidence - a.confidence);
  
  const best = formats[0];
  
  return {
    format: best.confidence >= MIN_CONFIDENCE ? best.format : null,
    confidence: best.confidence,
    detection: best.detection
  };
}
