/**
 * Data Models Test Suite
 * 
 * Tests for coordinate data models and type definitions
 * Validates Requirements: 1.6, 19, 14, 25
 */

import { describe, it, expect } from 'vitest';
import {
  // DDCoordinate
  createDDCoordinate,
  validateDDCoordinate,
  cloneDDCoordinate,
  // UTMCoordinate
  createUTMCoordinate,
  validateUTMCoordinate,
  cloneUTMCoordinate,
  getValidUTMBands,
  // DMSComponent
  createDMSComponent,
  validateDMSLatitude,
  validateDMSLongitude,
  cloneDMSComponent,
  // DMSCoordinate
  createDMSCoordinate,
  validateDMSCoordinate,
  cloneDMSCoordinate,
  // ConversionConfig
  CoordinateFormat,
  createPrecisionConfig,
  createConversionConfig,
  validateConversionConfig,
  cloneConversionConfig,
  // ExcelColumnConfig
  createDDColumnMapping,
  createUTMColumnMapping,
  createDMSSingleColumnMapping,
  createDMSMultiColumnMapping,
  createFixedValues,
  createExcelColumnConfig,
  validateExcelColumnConfig,
  cloneExcelColumnConfig
} from '../models/index.js';

describe('DDCoordinate Model', () => {
  describe('createDDCoordinate', () => {
    it('should create a valid DD coordinate with default precision', () => {
      const coord = createDDCoordinate(40.416775, -3.703790);
      expect(coord.latitude).toBe(40.416775);
      expect(coord.longitude).toBe(-3.703790);
      expect(coord.precision).toBe(6);
    });

    it('should create a valid DD coordinate with custom precision', () => {
      const coord = createDDCoordinate(40.416775, -3.703790, 8);
      expect(coord.precision).toBe(8);
    });
  });

  describe('validateDDCoordinate', () => {
    it('should validate a correct DD coordinate', () => {
      const coord = createDDCoordinate(40.416775, -3.703790);
      expect(() => validateDDCoordinate(coord)).not.toThrow();
    });

    it('should reject latitude > 90', () => {
      const coord = createDDCoordinate(91, 0);
      expect(() => validateDDCoordinate(coord)).toThrow('Latitud debe estar entre -90 y 90 grados');
    });

    it('should reject latitude < -90', () => {
      const coord = createDDCoordinate(-91, 0);
      expect(() => validateDDCoordinate(coord)).toThrow('Latitud debe estar entre -90 y 90 grados');
    });

    it('should reject longitude > 180', () => {
      const coord = createDDCoordinate(0, 181);
      expect(() => validateDDCoordinate(coord)).toThrow('Longitud debe estar entre -180 y 180 grados');
    });

    it('should reject longitude < -180', () => {
      const coord = createDDCoordinate(0, -181);
      expect(() => validateDDCoordinate(coord)).toThrow('Longitud debe estar entre -180 y 180 grados');
    });

    it('should accept boundary values', () => {
      expect(() => validateDDCoordinate(createDDCoordinate(90, 180))).not.toThrow();
      expect(() => validateDDCoordinate(createDDCoordinate(-90, -180))).not.toThrow();
    });

    it('should reject invalid precision', () => {
      const coord = createDDCoordinate(40, -3, 11);
      expect(() => validateDDCoordinate(coord)).toThrow('Precisión debe ser un entero entre 0 y 10');
    });

    it('should reject non-numeric latitude', () => {
      const coord = { latitude: 'invalid', longitude: 0, precision: 6 };
      expect(() => validateDDCoordinate(coord)).toThrow('Latitud debe ser un número válido');
    });
  });

  describe('cloneDDCoordinate', () => {
    it('should create a deep copy of DD coordinate', () => {
      const original = createDDCoordinate(40.416775, -3.703790, 8);
      const clone = cloneDDCoordinate(original);
      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
    });
  });
});

describe('UTMCoordinate Model', () => {
  describe('createUTMCoordinate', () => {
    it('should create a valid UTM coordinate with default precision', () => {
      const coord = createUTMCoordinate(30, 'T', 'N', 440720.92, 4474814.07);
      expect(coord.zone).toBe(30);
      expect(coord.band).toBe('T');
      expect(coord.hemisphere).toBe('N');
      expect(coord.easting).toBe(440720.92);
      expect(coord.northing).toBe(4474814.07);
      expect(coord.precision).toBe(2);
    });

    it('should create a valid UTM coordinate with custom precision', () => {
      const coord = createUTMCoordinate(30, 'T', 'N', 440720.92, 4474814.07, 4);
      expect(coord.precision).toBe(4);
    });
  });

  describe('validateUTMCoordinate', () => {
    it('should validate a correct UTM coordinate', () => {
      const coord = createUTMCoordinate(30, 'T', 'N', 440720.92, 4474814.07);
      expect(() => validateUTMCoordinate(coord)).not.toThrow();
    });

    it('should reject zone < 1', () => {
      const coord = createUTMCoordinate(0, 'T', 'N', 500000, 5000000);
      expect(() => validateUTMCoordinate(coord)).toThrow('Zona UTM debe estar entre 1 y 60');
    });

    it('should reject zone > 60', () => {
      const coord = createUTMCoordinate(61, 'T', 'N', 500000, 5000000);
      expect(() => validateUTMCoordinate(coord)).toThrow('Zona UTM debe estar entre 1 y 60');
    });

    it('should accept valid zone boundaries', () => {
      expect(() => validateUTMCoordinate(createUTMCoordinate(1, 'T', 'N', 500000, 5000000))).not.toThrow();
      expect(() => validateUTMCoordinate(createUTMCoordinate(60, 'T', 'N', 500000, 5000000))).not.toThrow();
    });

    it('should reject invalid hemisphere', () => {
      const coord = createUTMCoordinate(30, 'T', 'X', 500000, 5000000);
      expect(() => validateUTMCoordinate(coord)).toThrow('Hemisferio debe ser N o S');
    });

    it('should reject easting < 100000', () => {
      const coord = createUTMCoordinate(30, 'T', 'N', 99999, 5000000);
      expect(() => validateUTMCoordinate(coord)).toThrow('Este debe estar entre 100,000 y 900,000 metros');
    });

    it('should reject easting > 900000', () => {
      const coord = createUTMCoordinate(30, 'T', 'N', 900001, 5000000);
      expect(() => validateUTMCoordinate(coord)).toThrow('Este debe estar entre 100,000 y 900,000 metros');
    });

    it('should reject northing < 0', () => {
      const coord = createUTMCoordinate(30, 'T', 'N', 500000, -1);
      expect(() => validateUTMCoordinate(coord)).toThrow('Norte debe estar entre 0 y 10,000,000 metros');
    });

    it('should reject northing > 10000000', () => {
      const coord = createUTMCoordinate(30, 'T', 'N', 500000, 10000001);
      expect(() => validateUTMCoordinate(coord)).toThrow('Norte debe estar entre 0 y 10,000,000 metros');
    });

    it('should accept valid band letters', () => {
      const validBands = getValidUTMBands();
      validBands.forEach(band => {
        expect(() => validateUTMCoordinate(createUTMCoordinate(30, band, 'N', 500000, 5000000))).not.toThrow();
      });
    });

    it('should reject invalid band letters', () => {
      expect(() => validateUTMCoordinate(createUTMCoordinate(30, 'I', 'N', 500000, 5000000))).toThrow();
      expect(() => validateUTMCoordinate(createUTMCoordinate(30, 'O', 'N', 500000, 5000000))).toThrow();
    });
  });

  describe('cloneUTMCoordinate', () => {
    it('should create a deep copy of UTM coordinate', () => {
      const original = createUTMCoordinate(30, 'T', 'N', 440720.92, 4474814.07, 4);
      const clone = cloneUTMCoordinate(original);
      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
    });
  });

  describe('getValidUTMBands', () => {
    it('should return array of valid UTM band letters', () => {
      const bands = getValidUTMBands();
      expect(bands).toHaveLength(20);
      expect(bands).toContain('C');
      expect(bands).toContain('X');
      expect(bands).not.toContain('I');
      expect(bands).not.toContain('O');
    });
  });
});

describe('DMSComponent Model', () => {
  describe('createDMSComponent', () => {
    it('should create a valid DMS component', () => {
      const component = createDMSComponent(40, 25, 0.39, 'N');
      expect(component.degrees).toBe(40);
      expect(component.minutes).toBe(25);
      expect(component.seconds).toBe(0.39);
      expect(component.direction).toBe('N');
    });
  });

  describe('validateDMSLatitude', () => {
    it('should validate a correct latitude component', () => {
      const component = createDMSComponent(40, 25, 0.39, 'N');
      expect(() => validateDMSLatitude(component)).not.toThrow();
    });

    it('should reject degrees > 90 for latitude', () => {
      const component = createDMSComponent(91, 0, 0, 'N');
      expect(() => validateDMSLatitude(component)).toThrow('Grados de latitud deben ser un entero entre 0 y 90');
    });

    it('should reject negative degrees for latitude', () => {
      const component = createDMSComponent(-1, 0, 0, 'N');
      expect(() => validateDMSLatitude(component)).toThrow('Grados de latitud deben ser un entero entre 0 y 90');
    });

    it('should reject minutes >= 60', () => {
      const component = createDMSComponent(40, 60, 0, 'N');
      expect(() => validateDMSLatitude(component)).toThrow('Minutos deben estar entre 0 y 59');
    });

    it('should reject seconds >= 60', () => {
      const component = createDMSComponent(40, 25, 60, 'N');
      expect(() => validateDMSLatitude(component)).toThrow('Segundos deben estar entre 0 y 60 (exclusivo)');
    });

    it('should reject invalid direction for latitude', () => {
      const component = createDMSComponent(40, 25, 0, 'E');
      expect(() => validateDMSLatitude(component)).toThrow('Dirección de latitud debe ser N o S');
    });

    it('should accept boundary values', () => {
      expect(() => validateDMSLatitude(createDMSComponent(0, 0, 0, 'N'))).not.toThrow();
      expect(() => validateDMSLatitude(createDMSComponent(90, 0, 0, 'S'))).not.toThrow();
      expect(() => validateDMSLatitude(createDMSComponent(45, 59, 59.999, 'N'))).not.toThrow();
    });
  });

  describe('validateDMSLongitude', () => {
    it('should validate a correct longitude component', () => {
      const component = createDMSComponent(3, 42, 13.64, 'W');
      expect(() => validateDMSLongitude(component)).not.toThrow();
    });

    it('should reject degrees > 180 for longitude', () => {
      const component = createDMSComponent(181, 0, 0, 'E');
      expect(() => validateDMSLongitude(component)).toThrow('Grados de longitud deben ser un entero entre 0 y 180');
    });

    it('should reject invalid direction for longitude', () => {
      const component = createDMSComponent(3, 42, 13.64, 'N');
      expect(() => validateDMSLongitude(component)).toThrow('Dirección de longitud debe ser E o W');
    });

    it('should accept boundary values', () => {
      expect(() => validateDMSLongitude(createDMSComponent(0, 0, 0, 'E'))).not.toThrow();
      expect(() => validateDMSLongitude(createDMSComponent(180, 0, 0, 'W'))).not.toThrow();
    });
  });

  describe('cloneDMSComponent', () => {
    it('should create a deep copy of DMS component', () => {
      const original = createDMSComponent(40, 25, 0.39, 'N');
      const clone = cloneDMSComponent(original);
      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
    });
  });
});

describe('DMSCoordinate Model', () => {
  describe('createDMSCoordinate', () => {
    it('should create a valid DMS coordinate with default precision', () => {
      const lat = createDMSComponent(40, 25, 0.39, 'N');
      const lon = createDMSComponent(3, 42, 13.64, 'W');
      const coord = createDMSCoordinate(lat, lon);
      expect(coord.latitude).toEqual(lat);
      expect(coord.longitude).toEqual(lon);
      expect(coord.secondsPrecision).toBe(3);
    });

    it('should create a valid DMS coordinate with custom precision', () => {
      const lat = createDMSComponent(40, 25, 0.39, 'N');
      const lon = createDMSComponent(3, 42, 13.64, 'W');
      const coord = createDMSCoordinate(lat, lon, 5);
      expect(coord.secondsPrecision).toBe(5);
    });
  });

  describe('validateDMSCoordinate', () => {
    it('should validate a correct DMS coordinate', () => {
      const lat = createDMSComponent(40, 25, 0.39, 'N');
      const lon = createDMSComponent(3, 42, 13.64, 'W');
      const coord = createDMSCoordinate(lat, lon);
      expect(() => validateDMSCoordinate(coord)).not.toThrow();
    });

    it('should reject invalid latitude component', () => {
      const lat = createDMSComponent(91, 0, 0, 'N');
      const lon = createDMSComponent(3, 42, 13.64, 'W');
      const coord = createDMSCoordinate(lat, lon);
      expect(() => validateDMSCoordinate(coord)).toThrow();
    });

    it('should reject invalid longitude component', () => {
      const lat = createDMSComponent(40, 25, 0.39, 'N');
      const lon = createDMSComponent(181, 0, 0, 'W');
      const coord = createDMSCoordinate(lat, lon);
      expect(() => validateDMSCoordinate(coord)).toThrow();
    });

    it('should reject invalid seconds precision', () => {
      const lat = createDMSComponent(40, 25, 0.39, 'N');
      const lon = createDMSComponent(3, 42, 13.64, 'W');
      const coord = createDMSCoordinate(lat, lon, 11);
      expect(() => validateDMSCoordinate(coord)).toThrow('Precisión de segundos debe ser un entero entre 0 y 10');
    });
  });

  describe('cloneDMSCoordinate', () => {
    it('should create a deep copy of DMS coordinate', () => {
      const lat = createDMSComponent(40, 25, 0.39, 'N');
      const lon = createDMSComponent(3, 42, 13.64, 'W');
      const original = createDMSCoordinate(lat, lon, 5);
      const clone = cloneDMSCoordinate(original);
      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
      expect(clone.latitude).not.toBe(original.latitude);
      expect(clone.longitude).not.toBe(original.longitude);
    });
  });
});

describe('ConversionConfig Model', () => {
  describe('CoordinateFormat', () => {
    it('should define all coordinate formats', () => {
      expect(CoordinateFormat.DD).toBe('DD');
      expect(CoordinateFormat.UTM).toBe('UTM');
      expect(CoordinateFormat.DMS).toBe('DMS');
    });
  });

  describe('createPrecisionConfig', () => {
    it('should create precision config with default values', () => {
      const config = createPrecisionConfig();
      expect(config.ddPrecision).toBe(6);
      expect(config.utmPrecision).toBe(2);
      expect(config.dmsSecondsPrecision).toBe(3);
    });

    it('should create precision config with custom values', () => {
      const config = createPrecisionConfig(8, 4, 5);
      expect(config.ddPrecision).toBe(8);
      expect(config.utmPrecision).toBe(4);
      expect(config.dmsSecondsPrecision).toBe(5);
    });
  });

  describe('createConversionConfig', () => {
    it('should create conversion config with default precision', () => {
      const config = createConversionConfig('DD', 'UTM');
      expect(config.sourceFormat).toBe('DD');
      expect(config.targetFormat).toBe('UTM');
      expect(config.precision).toBeDefined();
      expect(config.precision.ddPrecision).toBe(6);
    });

    it('should create conversion config with custom precision', () => {
      const precision = createPrecisionConfig(8, 4, 5);
      const config = createConversionConfig('DD', 'UTM', precision);
      expect(config.precision).toEqual(precision);
    });
  });

  describe('validateConversionConfig', () => {
    it('should validate a correct conversion config', () => {
      const config = createConversionConfig('DD', 'UTM');
      expect(() => validateConversionConfig(config)).not.toThrow();
    });

    it('should reject same source and target format', () => {
      const config = createConversionConfig('DD', 'DD');
      expect(() => validateConversionConfig(config)).toThrow('Formato de origen y destino no pueden ser iguales');
    });

    it('should reject invalid source format', () => {
      const config = { sourceFormat: 'INVALID', targetFormat: 'UTM', precision: createPrecisionConfig() };
      expect(() => validateConversionConfig(config)).toThrow('Formato de origen debe ser DD, UTM o DMS');
    });

    it('should reject invalid target format', () => {
      const config = { sourceFormat: 'DD', targetFormat: 'INVALID', precision: createPrecisionConfig() };
      expect(() => validateConversionConfig(config)).toThrow('Formato de destino debe ser DD, UTM o DMS');
    });

    it('should reject invalid precision values', () => {
      const config = createConversionConfig('DD', 'UTM', createPrecisionConfig(11, 2, 3));
      expect(() => validateConversionConfig(config)).toThrow('Precisión DD debe ser un entero entre 0 y 10');
    });

    it('should accept all valid format combinations', () => {
      expect(() => validateConversionConfig(createConversionConfig('DD', 'UTM'))).not.toThrow();
      expect(() => validateConversionConfig(createConversionConfig('DD', 'DMS'))).not.toThrow();
      expect(() => validateConversionConfig(createConversionConfig('UTM', 'DD'))).not.toThrow();
      expect(() => validateConversionConfig(createConversionConfig('UTM', 'DMS'))).not.toThrow();
      expect(() => validateConversionConfig(createConversionConfig('DMS', 'DD'))).not.toThrow();
      expect(() => validateConversionConfig(createConversionConfig('DMS', 'UTM'))).not.toThrow();
    });
  });

  describe('cloneConversionConfig', () => {
    it('should create a deep copy of conversion config', () => {
      const original = createConversionConfig('DD', 'UTM', createPrecisionConfig(8, 4, 5));
      const clone = cloneConversionConfig(original);
      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
      expect(clone.precision).not.toBe(original.precision);
    });
  });
});

describe('ExcelColumnConfig Model', () => {
  describe('createDDColumnMapping', () => {
    it('should create DD column mapping', () => {
      const mapping = createDDColumnMapping('Latitude', 'Longitude');
      expect(mapping.type).toBe('DD');
      expect(mapping.latColumn).toBe('Latitude');
      expect(mapping.lonColumn).toBe('Longitude');
    });
  });

  describe('createUTMColumnMapping', () => {
    it('should create UTM column mapping with columns', () => {
      const mapping = createUTMColumnMapping('Easting', 'Northing', 'Zone', 'Hemisphere');
      expect(mapping.type).toBe('UTM');
      expect(mapping.eastingColumn).toBe('Easting');
      expect(mapping.northingColumn).toBe('Northing');
      expect(mapping.zoneColumn).toBe('Zone');
      expect(mapping.hemisphereColumn).toBe('Hemisphere');
    });

    it('should create UTM column mapping with null zone and hemisphere', () => {
      const mapping = createUTMColumnMapping('Easting', 'Northing', null, null);
      expect(mapping.zoneColumn).toBeNull();
      expect(mapping.hemisphereColumn).toBeNull();
    });
  });

  describe('createDMSSingleColumnMapping', () => {
    it('should create DMS single column mapping', () => {
      const mapping = createDMSSingleColumnMapping('Lat_DMS', 'Lon_DMS');
      expect(mapping.type).toBe('DMS');
      expect(mapping.variant).toBe('single');
      expect(mapping.latColumn).toBe('Lat_DMS');
      expect(mapping.lonColumn).toBe('Lon_DMS');
    });
  });

  describe('createDMSMultiColumnMapping', () => {
    it('should create DMS multi column mapping', () => {
      const mapping = createDMSMultiColumnMapping(
        'Lat_Deg', 'Lat_Min', 'Lat_Sec', 'Lat_Dir',
        'Lon_Deg', 'Lon_Min', 'Lon_Sec', 'Lon_Dir'
      );
      expect(mapping.type).toBe('DMS');
      expect(mapping.variant).toBe('multi');
      expect(mapping.latDegreesColumn).toBe('Lat_Deg');
      expect(mapping.lonDirectionColumn).toBe('Lon_Dir');
    });
  });

  describe('createFixedValues', () => {
    it('should create fixed values with defaults', () => {
      const fixed = createFixedValues();
      expect(fixed.zone).toBeNull();
      expect(fixed.hemisphere).toBeNull();
    });

    it('should create fixed values with zone and hemisphere', () => {
      const fixed = createFixedValues(30, 'N');
      expect(fixed.zone).toBe(30);
      expect(fixed.hemisphere).toBe('N');
    });
  });

  describe('createExcelColumnConfig', () => {
    it('should create Excel column config for DD', () => {
      const mapping = createDDColumnMapping('Latitude', 'Longitude');
      const config = createExcelColumnConfig('DD', 'UTM', mapping);
      expect(config.sourceFormat).toBe('DD');
      expect(config.targetFormat).toBe('UTM');
      expect(config.columnMapping).toEqual(mapping);
      expect(config.fixedValues).toBeNull();
    });

    it('should create Excel column config for UTM with fixed values', () => {
      const mapping = createUTMColumnMapping('Easting', 'Northing', null, null);
      const fixed = createFixedValues(30, 'N');
      const config = createExcelColumnConfig('UTM', 'DD', mapping, fixed);
      expect(config.fixedValues).toEqual(fixed);
    });
  });

  describe('validateExcelColumnConfig', () => {
    const headers = ['Latitude', 'Longitude', 'Easting', 'Northing', 'Zone', 'Hemisphere'];

    it('should validate DD column config', () => {
      const mapping = createDDColumnMapping('Latitude', 'Longitude');
      const config = createExcelColumnConfig('DD', 'UTM', mapping);
      expect(() => validateExcelColumnConfig(config, headers)).not.toThrow();
    });

    it('should reject DD config with missing latitude column', () => {
      const mapping = createDDColumnMapping('Invalid', 'Longitude');
      const config = createExcelColumnConfig('DD', 'UTM', mapping);
      expect(() => validateExcelColumnConfig(config, headers)).toThrow('Columna de latitud no existe en el archivo Excel');
    });

    it('should reject DD config with missing longitude column', () => {
      const mapping = createDDColumnMapping('Latitude', 'Invalid');
      const config = createExcelColumnConfig('DD', 'UTM', mapping);
      expect(() => validateExcelColumnConfig(config, headers)).toThrow('Columna de longitud no existe en el archivo Excel');
    });

    it('should validate UTM column config with columns', () => {
      const mapping = createUTMColumnMapping('Easting', 'Northing', 'Zone', 'Hemisphere');
      const config = createExcelColumnConfig('UTM', 'DD', mapping);
      expect(() => validateExcelColumnConfig(config, headers)).not.toThrow();
    });

    it('should validate UTM column config with fixed zone and hemisphere', () => {
      const mapping = createUTMColumnMapping('Easting', 'Northing', null, null);
      const fixed = createFixedValues(30, 'N');
      const config = createExcelColumnConfig('UTM', 'DD', mapping, fixed);
      expect(() => validateExcelColumnConfig(config, headers)).not.toThrow();
    });

    it('should reject UTM config without zone column or fixed value', () => {
      const mapping = createUTMColumnMapping('Easting', 'Northing', null, null);
      const config = createExcelColumnConfig('UTM', 'DD', mapping);
      expect(() => validateExcelColumnConfig(config, headers)).toThrow('Debe especificar una columna de zona o un valor fijo de zona');
    });

    it('should reject UTM config without hemisphere column or fixed value', () => {
      const mapping = createUTMColumnMapping('Easting', 'Northing', 'Zone', null);
      const config = createExcelColumnConfig('UTM', 'DD', mapping);
      expect(() => validateExcelColumnConfig(config, headers)).toThrow('Debe especificar una columna de hemisferio o un valor fijo de hemisferio');
    });

    it('should reject invalid fixed zone value', () => {
      const mapping = createUTMColumnMapping('Easting', 'Northing', null, null);
      const fixed = createFixedValues(61, 'N');
      const config = createExcelColumnConfig('UTM', 'DD', mapping, fixed);
      expect(() => validateExcelColumnConfig(config, headers)).toThrow('Valor fijo de zona debe estar entre 1 y 60');
    });

    it('should reject invalid fixed hemisphere value', () => {
      const mapping = createUTMColumnMapping('Easting', 'Northing', null, null);
      const fixed = createFixedValues(30, 'X');
      const config = createExcelColumnConfig('UTM', 'DD', mapping, fixed);
      expect(() => validateExcelColumnConfig(config, headers)).toThrow('Valor fijo de hemisferio debe ser N o S');
    });

    it('should reject same source and target format', () => {
      const mapping = createDDColumnMapping('Latitude', 'Longitude');
      const config = createExcelColumnConfig('DD', 'DD', mapping);
      expect(() => validateExcelColumnConfig(config, headers)).toThrow('Formato de origen y destino no pueden ser iguales');
    });
  });

  describe('cloneExcelColumnConfig', () => {
    it('should create a deep copy of Excel column config', () => {
      const mapping = createDDColumnMapping('Latitude', 'Longitude');
      const original = createExcelColumnConfig('DD', 'UTM', mapping);
      const clone = cloneExcelColumnConfig(original);
      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
      expect(clone.columnMapping).not.toBe(original.columnMapping);
    });
  });
});
