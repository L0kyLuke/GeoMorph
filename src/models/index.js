/**
 * Models index - Exports all coordinate data models and type definitions
 */

// DDCoordinate
export {
  createDDCoordinate,
  validateDDCoordinate,
  cloneDDCoordinate
} from './DDCoordinate.js';

// DMSComponent
export {
  createDMSComponent,
  validateDMSLatitude,
  validateDMSLongitude,
  cloneDMSComponent
} from './DMSComponent.js';

// DMSCoordinate
export {
  createDMSCoordinate,
  validateDMSCoordinate,
  cloneDMSCoordinate
} from './DMSCoordinate.js';

// UTMCoordinate
export {
  createUTMCoordinate,
  validateUTMCoordinate,
  cloneUTMCoordinate,
  getValidUTMBands
} from './UTMCoordinate.js';

// ConversionConfig
export {
  CoordinateFormat,
  createPrecisionConfig,
  createConversionConfig,
  validateConversionConfig,
  cloneConversionConfig
} from './ConversionConfig.js';

// ExcelColumnConfig
export {
  createDDColumnMapping,
  createUTMColumnMapping,
  createDMSSingleColumnMapping,
  createDMSMultiColumnMapping,
  createFixedValues,
  createExcelColumnConfig,
  validateExcelColumnConfig,
  cloneExcelColumnConfig
} from './ExcelColumnConfig.js';
