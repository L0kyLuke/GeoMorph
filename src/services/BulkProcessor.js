/**
 * BulkProcessor - Process multiple coordinates from Excel data
 * Handles row-by-row conversion with error handling and progress tracking
 */

import { CoordinateFormat } from '../models/ConversionConfig.js';
import { convertDDtoUTM, convertDDtoDMS, convertUTMtoDD, convertUTMtoDMS, convertDMStoDD, convertDMStoUTM } from './ConversionEngine.js';
import { validateDD, validateUTM, validateDMS } from './ValidationService.js';
import { formatCoordinateString } from '../utils/CoordinateFormatter.js';

/**
 * Validate if a row contains valid coordinate data for the specified format
 * @param {Object} row - Excel row object
 * @param {Object} columnMapping - Column mapping configuration
 * @param {string} sourceFormat - Source coordinate format
 * @returns {boolean} True if row contains valid coordinates
 */
function isValidCoordinateRow(row, columnMapping, sourceFormat) {
  if (sourceFormat === CoordinateFormat.DD) {
    const latColumn = columnMapping.latitude;
    const lonColumn = columnMapping.longitude;
    
    if (!latColumn || !lonColumn) {
      return false;
    }
    
    const latValue = row[latColumn];
    const lonValue = row[lonColumn];
    
    // Both must exist and not be empty
    if (latValue === '' || latValue === null || latValue === undefined ||
        lonValue === '' || lonValue === null || lonValue === undefined) {
      return false;
    }
    
    // Parse as numbers
    const latStr = String(latValue).trim().replace(',', '.');
    const lonStr = String(lonValue).trim().replace(',', '.');
    const latNum = parseFloat(latStr);
    const lonNum = parseFloat(lonStr);
    
    // Both must be valid numbers
    if (isNaN(latNum) || !isFinite(latNum) || isNaN(lonNum) || !isFinite(lonNum)) {
      return false;
    }
    
    // Must have decimal separator (DD always has decimals)
    const hasLatDecimals = String(latValue).includes('.') || String(latValue).includes(',');
    const hasLonDecimals = String(lonValue).includes('.') || String(lonValue).includes(',');
    
    if (!hasLatDecimals || !hasLonDecimals) {
      return false;
    }
    
    // Lat must be in range -90 to 90, Lon must be in range -180 to 180
    const isValidLat = latNum >= -90 && latNum <= 90;
    const isValidLon = lonNum >= -180 && lonNum <= 180;
    
    return isValidLat && isValidLon;
    
  } else if (sourceFormat === CoordinateFormat.UTM) {
    const eastingColumn = columnMapping.easting;
    const northingColumn = columnMapping.northing;
    
    if (!eastingColumn || !northingColumn) {
      return false;
    }
    
    const eastValue = row[eastingColumn];
    const northValue = row[northingColumn];
    
    // Both must exist and not be empty
    if (eastValue === '' || eastValue === null || eastValue === undefined ||
        northValue === '' || northValue === null || northValue === undefined) {
      return false;
    }
    
    // Parse as numbers
    const eastStr = String(eastValue).trim().replace(',', '.');
    const northStr = String(northValue).trim().replace(',', '.');
    const eastNum = parseFloat(eastStr);
    const northNum = parseFloat(northStr);
    
    // Both must be valid numbers
    if (isNaN(eastNum) || !isFinite(eastNum) || isNaN(northNum) || !isFinite(northNum)) {
      return false;
    }
    
    // Easting must be in typical UTM range (100,000 to 900,000)
    // Northing must be in typical UTM range (0 to 10,000,000)
    const isValidEasting = eastNum >= 100000 && eastNum <= 900000;
    const isValidNorthing = northNum >= 0 && northNum <= 10000000;
    
    return isValidEasting && isValidNorthing;
    
  } else if (sourceFormat === CoordinateFormat.DMS) {
    // For DMS, check if values match the DMS pattern
    const hasDMSValue = Object.values(row).some(value => {
      if (value === '' || value === null || value === undefined) {
        return false;
      }
      const str = String(value).trim();
      const dmsPattern = /(\d+)[°º]\s*(\d+)['′]\s*([\d,\.]+)["″]\s*([NSEW])/i;
      return dmsPattern.test(str);
    });
    
    return hasDMSValue;
  }
  
  return false;
}

/**
 * Parse a numeric value that may use comma as decimal separator
 * @param {any} value - Value to parse
 * @returns {number} Parsed number
 */
function parseNumericValue(value) {
  if (typeof value === 'number') {
    return value;
  }
  
  // Convert to string and replace comma with dot
  const str = String(value).trim().replace(',', '.');
  return parseFloat(str);
}

/**
 * Extract coordinate from a row based on column mapping
 * 
 * @param {Object} row - Excel row object with column values
 * @param {Object} columnMapping - Column mapping configuration
 * @param {string} sourceFormat - Source coordinate format (DD, UTM, DMS)
 * @returns {Object} Coordinate object in the appropriate format
 * @throws {Error} If required columns are missing or values are invalid
 */
export function extractCoordinateFromRow(row, columnMapping, sourceFormat) {
  if (sourceFormat === CoordinateFormat.DD) {
    const latColumn = columnMapping.latitude;
    const lonColumn = columnMapping.longitude;
    
    if (!latColumn || !lonColumn) {
      throw new Error('Configuración de columnas incompleta: se requieren columnas de latitud y longitud');
    }
    
    const latitude = row[latColumn];
    const longitude = row[lonColumn];
    
    if (latitude === '' || latitude === null || latitude === undefined) {
      throw new Error(`Valor de latitud vacío en columna "${latColumn}"`);
    }
    
    if (longitude === '' || longitude === null || longitude === undefined) {
      throw new Error(`Valor de longitud vacío en columna "${lonColumn}"`);
    }
    
    return {
      latitude: parseNumericValue(latitude),
      longitude: parseNumericValue(longitude)
    };
    
  } else if (sourceFormat === CoordinateFormat.UTM) {
    const eastingColumn = columnMapping.easting;
    const northingColumn = columnMapping.northing;
    
    if (!eastingColumn || !northingColumn) {
      throw new Error('Configuración de columnas incompleta: se requieren columnas de easting y northing');
    }
    
    const easting = row[eastingColumn];
    const northing = row[northingColumn];
    
    if (easting === '' || easting === null || easting === undefined) {
      throw new Error(`Valor de easting vacío en columna "${eastingColumn}"`);
    }
    
    if (northing === '' || northing === null || northing === undefined) {
      throw new Error(`Valor de northing vacío en columna "${northingColumn}"`);
    }
    
    // Zone and hemisphere can come from columns or fixed values
    let zone, hemisphere;
    
    if (columnMapping.zone && row[columnMapping.zone]) {
      zone = parseInt(row[columnMapping.zone], 10);
    } else if (columnMapping.fixedZone) {
      zone = columnMapping.fixedZone;
    } else {
      throw new Error('Se requiere zona UTM: no se especificó columna ni valor fijo');
    }
    
    if (columnMapping.hemisphere && row[columnMapping.hemisphere]) {
      const hemValue = String(row[columnMapping.hemisphere]).toUpperCase().trim();
      
      // Check if it's already N or S
      if (hemValue === 'N' || hemValue === 'S') {
        hemisphere = hemValue;
      } else if (hemValue.length === 1 && /[A-Z]/.test(hemValue)) {
        // It's a UTM band letter - convert to hemisphere
        // Bands C-M are South (0°S to 80°S), N-X are North (0°N to 84°N)
        hemisphere = 'CDEFGHJKLM'.includes(hemValue) ? 'S' : 'N';
      } else {
        hemisphere = hemValue.charAt(0);
      }
    } else if (columnMapping.fixedHemisphere) {
      hemisphere = columnMapping.fixedHemisphere;
    } else {
      throw new Error('Se requiere hemisferio UTM: no se especificó columna ni valor fijo');
    }
    
    return {
      zone,
      hemisphere,
      easting: parseNumericValue(easting),
      northing: parseNumericValue(northing)
    };
    
  } else if (sourceFormat === CoordinateFormat.DMS) {
    // DMS can be single-column or multi-column
    if (columnMapping.format === 'single') {
      // Single-column format - not implemented in this version
      throw new Error('Formato DMS de columna única no está implementado aún');
    } else if (columnMapping.format === 'multi') {
      // Multi-column format
      const latDegCol = columnMapping.latDegrees;
      const latMinCol = columnMapping.latMinutes;
      const latSecCol = columnMapping.latSeconds;
      const latDirCol = columnMapping.latDirection;
      const lonDegCol = columnMapping.lonDegrees;
      const lonMinCol = columnMapping.lonMinutes;
      const lonSecCol = columnMapping.lonSeconds;
      const lonDirCol = columnMapping.lonDirection;
      
      if (!latDegCol || !latMinCol || !latSecCol || !latDirCol || !lonDegCol || !lonMinCol || !lonSecCol || !lonDirCol) {
        throw new Error('Configuración de columnas incompleta para formato DMS multi-columna');
      }
      
      return {
        latitude: {
          degrees: parseInt(row[latDegCol], 10),
          minutes: parseInt(row[latMinCol], 10),
          seconds: parseFloat(row[latSecCol]),
          direction: String(row[latDirCol]).toUpperCase().charAt(0)
        },
        longitude: {
          degrees: parseInt(row[lonDegCol], 10),
          minutes: parseInt(row[lonMinCol], 10),
          seconds: parseFloat(row[lonSecCol]),
          direction: String(row[lonDirCol]).toUpperCase().charAt(0)
        }
      };
    } else {
      throw new Error('Formato DMS no especificado');
    }
  } else {
    throw new Error(`Formato de origen no soportado: ${sourceFormat}`);
  }
}

/**
 * Process all Excel rows and convert coordinates
 * 
 * @param {Object[]} rows - Array of Excel row objects
 * @param {Object} columnMapping - Column mapping configuration
 * @param {string} sourceFormat - Source coordinate format
 * @param {string} targetFormat - Target coordinate format
 * @param {Function} progressCallback - Callback function for progress updates (current, total, percentage)
 * @returns {Object} Processing result with results array and summary
 */
export function processExcelRows(rows, columnMapping, sourceFormat, targetFormat, progressCallback = null) {
  // First, filter out rows that don't contain valid coordinates for the selected format
  const validRows = rows.filter(row => isValidCoordinateRow(row, columnMapping, sourceFormat));
  
  const results = [];
  let successCount = 0;
  let errorCount = 0;
  
  const totalRows = validRows.length;
  
  for (let i = 0; i < totalRows; i++) {
    const row = validRows[i];
    const rowIndex = i + 2; // +2 because Excel is 1-indexed and first row is headers
    
    // Create clean result row with ONLY essential columns
    const resultRow = {};
    
    try {
      // Extract coordinate from row
      const coordinate = extractCoordinateFromRow(row, columnMapping, sourceFormat);
      
      // Validate coordinate
      let validationResult;
      if (sourceFormat === CoordinateFormat.DD) {
        validationResult = validateDD(coordinate.latitude, coordinate.longitude);
      } else if (sourceFormat === CoordinateFormat.UTM) {
        validationResult = validateUTM(coordinate.zone, coordinate.hemisphere, coordinate.easting, coordinate.northing);
      } else if (sourceFormat === CoordinateFormat.DMS) {
        validationResult = validateDMS(coordinate.latitude, coordinate.longitude);
      }
      
      if (!validationResult.isValid) {
        throw new Error(validationResult.errors.join('; '));
      }
      
      // Convert to target format
      let converted;
      if (sourceFormat === CoordinateFormat.DD && targetFormat === CoordinateFormat.UTM) {
        converted = convertDDtoUTM(coordinate.latitude, coordinate.longitude);
      } else if (sourceFormat === CoordinateFormat.DD && targetFormat === CoordinateFormat.DMS) {
        converted = convertDDtoDMS(coordinate.latitude, coordinate.longitude);
      } else if (sourceFormat === CoordinateFormat.UTM && targetFormat === CoordinateFormat.DD) {
        converted = convertUTMtoDD(coordinate.zone, coordinate.hemisphere, coordinate.easting, coordinate.northing);
      } else if (sourceFormat === CoordinateFormat.UTM && targetFormat === CoordinateFormat.DMS) {
        converted = convertUTMtoDMS(coordinate.zone, coordinate.hemisphere, coordinate.easting, coordinate.northing);
      } else if (sourceFormat === CoordinateFormat.DMS && targetFormat === CoordinateFormat.DD) {
        converted = convertDMStoDD(coordinate.latitude, coordinate.longitude);
      } else if (sourceFormat === CoordinateFormat.DMS && targetFormat === CoordinateFormat.UTM) {
        converted = convertDMStoUTM(coordinate.latitude, coordinate.longitude);
      } else if (sourceFormat === targetFormat) {
        // Same format - no conversion needed
        converted = coordinate;
      } else {
        throw new Error(`Conversión no soportada: ${sourceFormat} a ${targetFormat}`);
      }
      
      // Build clean output with ONLY 5 columns for UTM to DD conversion
      if (sourceFormat === CoordinateFormat.UTM && targetFormat === CoordinateFormat.DD) {
        // Column 1: Este (UTM) - original value with comma separator
        const eastingColumn = columnMapping.easting;
        resultRow['Este (UTM)'] = row[eastingColumn];
        
        // Column 2: Norte (UTM) - original value with comma separator
        const northingColumn = columnMapping.northing;
        resultRow['Norte (UTM)'] = row[northingColumn];
        
        // Column 3: Zona UTM - format as "17S"
        resultRow['Zona UTM'] = `${coordinate.zone}${coordinate.hemisphere}`;
        
        // Column 4: Latitud decimal - 8 decimal places
        resultRow['Latitud decimal'] = converted.latitude.toFixed(8);
        
        // Column 5: Longitud decimal - 8 decimal places
        resultRow['Longitud decimal'] = converted.longitude.toFixed(8);
      } else {
        // For other conversions, keep original behavior (can be customized later)
        // Format original coordinate as string
        const originalFormatted = formatCoordinateString(coordinate, sourceFormat);
        const convertedFormatted = formatCoordinateString(converted, targetFormat);
        
        resultRow.COORDENADA_ORIGINAL = originalFormatted;
        resultRow.COORDENADA_CONVERTIDA = convertedFormatted;
        resultRow.ERROR = '';
      }
      
      successCount++;
      
    } catch (error) {
      // Handle error: create clean error row
      if (sourceFormat === CoordinateFormat.UTM && targetFormat === CoordinateFormat.DD) {
        const eastingColumn = columnMapping.easting;
        const northingColumn = columnMapping.northing;
        
        resultRow['Este (UTM)'] = row[eastingColumn] || '';
        resultRow['Norte (UTM)'] = row[northingColumn] || '';
        resultRow['Zona UTM'] = '';
        resultRow['Latitud decimal'] = `ERROR: ${error.message}`;
        resultRow['Longitud decimal'] = '';
      } else {
        resultRow.COORDENADA_ORIGINAL = '';
        resultRow.COORDENADA_CONVERTIDA = '';
        resultRow.ERROR = `Fila ${rowIndex}: ${error.message}`;
      }
      
      errorCount++;
    }
    
    results.push(resultRow);
    
    // Call progress callback
    if (progressCallback) {
      const percentage = Math.round(((i + 1) / totalRows) * 100);
      progressCallback(i + 1, totalRows, percentage);
    }
  }
  
  return {
    results,
    summary: {
      total: totalRows,
      success: successCount,
      errors: errorCount
    }
  };
}
