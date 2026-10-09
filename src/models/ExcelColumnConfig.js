/**
 * ExcelColumnConfig - Configuration for Excel column mapping
 * 
 * Defines how Excel columns map to coordinate components and
 * fixed values for bulk conversion processing.
 */

import { CoordinateFormat } from './ConversionConfig.js';

/**
 * Creates a DDColumnMapping object
 * @param {string} latColumn - Column name for latitude
 * @param {string} lonColumn - Column name for longitude
 * @returns {DDColumnMapping}
 */
export function createDDColumnMapping(latColumn, lonColumn) {
  return {
    type: 'DD',
    latColumn,
    lonColumn
  };
}

/**
 * Creates a UTMColumnMapping object
 * @param {string} eastingColumn - Column name for easting
 * @param {string} northingColumn - Column name for northing
 * @param {string|null} zoneColumn - Column name for zone (or null if using fixed value)
 * @param {string|null} hemisphereColumn - Column name for hemisphere (or null if using fixed value)
 * @returns {UTMColumnMapping}
 */
export function createUTMColumnMapping(eastingColumn, northingColumn, zoneColumn = null, hemisphereColumn = null) {
  return {
    type: 'UTM',
    eastingColumn,
    northingColumn,
    zoneColumn,
    hemisphereColumn
  };
}

/**
 * Creates a DMSColumnMapping object for single-column format
 * @param {string} latColumn - Column name for latitude DMS string
 * @param {string} lonColumn - Column name for longitude DMS string
 * @returns {DMSColumnMapping}
 */
export function createDMSSingleColumnMapping(latColumn, lonColumn) {
  return {
    type: 'DMS',
    variant: 'single',
    latColumn,
    lonColumn
  };
}

/**
 * Creates a DMSColumnMapping object for multi-column format
 * @param {string} latDegreesColumn - Column name for latitude degrees
 * @param {string} latMinutesColumn - Column name for latitude minutes
 * @param {string} latSecondsColumn - Column name for latitude seconds
 * @param {string} latDirectionColumn - Column name for latitude direction
 * @param {string} lonDegreesColumn - Column name for longitude degrees
 * @param {string} lonMinutesColumn - Column name for longitude minutes
 * @param {string} lonSecondsColumn - Column name for longitude seconds
 * @param {string} lonDirectionColumn - Column name for longitude direction
 * @returns {DMSColumnMapping}
 */
export function createDMSMultiColumnMapping(
  latDegreesColumn,
  latMinutesColumn,
  latSecondsColumn,
  latDirectionColumn,
  lonDegreesColumn,
  lonMinutesColumn,
  lonSecondsColumn,
  lonDirectionColumn
) {
  return {
    type: 'DMS',
    variant: 'multi',
    latDegreesColumn,
    latMinutesColumn,
    latSecondsColumn,
    latDirectionColumn,
    lonDegreesColumn,
    lonMinutesColumn,
    lonSecondsColumn,
    lonDirectionColumn
  };
}

/**
 * Creates a FixedValues object for UTM conversion
 * @param {number|null} zone - Fixed zone value (or null)
 * @param {string|null} hemisphere - Fixed hemisphere value (or null)
 * @returns {FixedValues}
 */
export function createFixedValues(zone = null, hemisphere = null) {
  return {
    zone,
    hemisphere
  };
}

/**
 * Creates an ExcelColumnConfig object
 * @param {string} sourceFormat - Source coordinate format (DD, UTM, or DMS)
 * @param {string} targetFormat - Target coordinate format (DD, UTM, or DMS)
 * @param {DDColumnMapping|UTMColumnMapping|DMSColumnMapping} columnMapping - Column mapping configuration
 * @param {FixedValues|null} [fixedValues=null] - Fixed values for UTM conversion
 * @returns {ExcelColumnConfig}
 */
export function createExcelColumnConfig(sourceFormat, targetFormat, columnMapping, fixedValues = null) {
  return {
    sourceFormat,
    targetFormat,
    columnMapping,
    fixedValues
  };
}

/**
 * Validates an ExcelColumnConfig object
 * @param {ExcelColumnConfig} config - The config to validate
 * @param {string[]} headers - Available Excel column headers
 * @returns {boolean} True if valid
 * @throws {Error} If validation fails
 */
export function validateExcelColumnConfig(config, headers) {
  const validFormats = [CoordinateFormat.DD, CoordinateFormat.UTM, CoordinateFormat.DMS];
  
  if (!validFormats.includes(config.sourceFormat)) {
    throw new Error('Formato de origen debe ser DD, UTM o DMS');
  }
  
  if (!validFormats.includes(config.targetFormat)) {
    throw new Error('Formato de destino debe ser DD, UTM o DMS');
  }
  
  if (config.sourceFormat === config.targetFormat) {
    throw new Error('Formato de origen y destino no pueden ser iguales');
  }
  
  if (!config.columnMapping || typeof config.columnMapping !== 'object') {
    throw new Error('Configuración de columnas debe ser un objeto válido');
  }
  
  // Validate column mapping based on source format
  const mapping = config.columnMapping;
  
  if (mapping.type === 'DD') {
    if (!mapping.latColumn || !headers.includes(mapping.latColumn)) {
      throw new Error('Columna de latitud no existe en el archivo Excel');
    }
    if (!mapping.lonColumn || !headers.includes(mapping.lonColumn)) {
      throw new Error('Columna de longitud no existe en el archivo Excel');
    }
  } else if (mapping.type === 'UTM') {
    if (!mapping.eastingColumn || !headers.includes(mapping.eastingColumn)) {
      throw new Error('Columna de este no existe en el archivo Excel');
    }
    if (!mapping.northingColumn || !headers.includes(mapping.northingColumn)) {
      throw new Error('Columna de norte no existe en el archivo Excel');
    }
    
    // Validate zone: must have either column or fixed value
    if (!mapping.zoneColumn && (!config.fixedValues || config.fixedValues.zone === null)) {
      throw new Error('Debe especificar una columna de zona o un valor fijo de zona');
    }
    if (mapping.zoneColumn && !headers.includes(mapping.zoneColumn)) {
      throw new Error('Columna de zona no existe en el archivo Excel');
    }
    
    // Validate hemisphere: must have either column or fixed value
    if (!mapping.hemisphereColumn && (!config.fixedValues || config.fixedValues.hemisphere === null)) {
      throw new Error('Debe especificar una columna de hemisferio o un valor fijo de hemisferio');
    }
    if (mapping.hemisphereColumn && !headers.includes(mapping.hemisphereColumn)) {
      throw new Error('Columna de hemisferio no existe en el archivo Excel');
    }
  } else if (mapping.type === 'DMS') {
    if (mapping.variant === 'single') {
      if (!mapping.latColumn || !headers.includes(mapping.latColumn)) {
        throw new Error('Columna de latitud DMS no existe en el archivo Excel');
      }
      if (!mapping.lonColumn || !headers.includes(mapping.lonColumn)) {
        throw new Error('Columna de longitud DMS no existe en el archivo Excel');
      }
    } else if (mapping.variant === 'multi') {
      const requiredColumns = [
        { name: 'latDegreesColumn', label: 'grados de latitud' },
        { name: 'latMinutesColumn', label: 'minutos de latitud' },
        { name: 'latSecondsColumn', label: 'segundos de latitud' },
        { name: 'latDirectionColumn', label: 'dirección de latitud' },
        { name: 'lonDegreesColumn', label: 'grados de longitud' },
        { name: 'lonMinutesColumn', label: 'minutos de longitud' },
        { name: 'lonSecondsColumn', label: 'segundos de longitud' },
        { name: 'lonDirectionColumn', label: 'dirección de longitud' }
      ];
      
      for (const col of requiredColumns) {
        if (!mapping[col.name] || !headers.includes(mapping[col.name])) {
          throw new Error(`Columna de ${col.label} no existe en el archivo Excel`);
        }
      }
    }
  }
  
  // Validate fixed values if provided
  if (config.fixedValues) {
    if (config.fixedValues.zone !== null) {
      if (!Number.isInteger(config.fixedValues.zone) || config.fixedValues.zone < 1 || config.fixedValues.zone > 60) {
        throw new Error('Valor fijo de zona debe estar entre 1 y 60');
      }
    }
    
    if (config.fixedValues.hemisphere !== null) {
      if (config.fixedValues.hemisphere !== 'N' && config.fixedValues.hemisphere !== 'S') {
        throw new Error('Valor fijo de hemisferio debe ser N o S');
      }
    }
  }
  
  return true;
}

/**
 * Clones an ExcelColumnConfig object
 * @param {ExcelColumnConfig} config - The config to clone
 * @returns {ExcelColumnConfig}
 */
export function cloneExcelColumnConfig(config) {
  return {
    sourceFormat: config.sourceFormat,
    targetFormat: config.targetFormat,
    columnMapping: { ...config.columnMapping },
    fixedValues: config.fixedValues ? { ...config.fixedValues } : null
  };
}
