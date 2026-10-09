/**
 * ConversionConfig - Configuration for coordinate conversion
 * 
 * Defines source and target formats, and precision settings
 * for coordinate conversions.
 */

/**
 * Coordinate format enumeration
 */
export const CoordinateFormat = {
  DD: 'DD',
  UTM: 'UTM',
  DMS: 'DMS'
};

/**
 * Creates a PrecisionConfig object
 * @param {number} [ddPrecision=6] - Decimal places for DD format [0, 10]
 * @param {number} [utmPrecision=2] - Decimal places for UTM format [0, 10]
 * @param {number} [dmsSecondsPrecision=3] - Decimal places for DMS seconds [0, 10]
 * @returns {PrecisionConfig}
 */
export function createPrecisionConfig(ddPrecision = 6, utmPrecision = 2, dmsSecondsPrecision = 3) {
  return {
    ddPrecision,
    utmPrecision,
    dmsSecondsPrecision
  };
}

/**
 * Creates a ConversionConfig object
 * @param {string} sourceFormat - Source coordinate format (DD, UTM, or DMS)
 * @param {string} targetFormat - Target coordinate format (DD, UTM, or DMS)
 * @param {PrecisionConfig} [precision] - Precision configuration (uses defaults if not provided)
 * @returns {ConversionConfig}
 */
export function createConversionConfig(sourceFormat, targetFormat, precision = null) {
  return {
    sourceFormat,
    targetFormat,
    precision: precision || createPrecisionConfig()
  };
}

/**
 * Validates a ConversionConfig object
 * @param {ConversionConfig} config - The config to validate
 * @returns {boolean} True if valid
 * @throws {Error} If validation fails
 */
export function validateConversionConfig(config) {
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
  
  // Validate precision config
  if (config.precision) {
    const { ddPrecision, utmPrecision, dmsSecondsPrecision } = config.precision;
    
    if (ddPrecision !== undefined && (!Number.isInteger(ddPrecision) || ddPrecision < 0 || ddPrecision > 10)) {
      throw new Error('Precisión DD debe ser un entero entre 0 y 10');
    }
    
    if (utmPrecision !== undefined && (!Number.isInteger(utmPrecision) || utmPrecision < 0 || utmPrecision > 10)) {
      throw new Error('Precisión UTM debe ser un entero entre 0 y 10');
    }
    
    if (dmsSecondsPrecision !== undefined && (!Number.isInteger(dmsSecondsPrecision) || dmsSecondsPrecision < 0 || dmsSecondsPrecision > 10)) {
      throw new Error('Precisión de segundos DMS debe ser un entero entre 0 y 10');
    }
  }
  
  return true;
}

/**
 * Clones a ConversionConfig object
 * @param {ConversionConfig} config - The config to clone
 * @returns {ConversionConfig}
 */
export function cloneConversionConfig(config) {
  return {
    sourceFormat: config.sourceFormat,
    targetFormat: config.targetFormat,
    precision: config.precision ? { ...config.precision } : null
  };
}
