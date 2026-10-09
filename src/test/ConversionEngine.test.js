/**
 * Unit tests for ConversionEngine
 * Tests core coordinate conversion algorithms
 */

import { describe, it, expect } from 'vitest';
import {
  calculateUTMBand,
  convertDDtoUTM,
  convertUTMtoDD,
  convertDDtoDMS,
  convertDMStoDD,
  convertUTMtoDMS,
  convertDMStoUTM
} from '../services/ConversionEngine.js';

describe('ConversionEngine', () => {
  describe('calculateUTMBand', () => {
    it('should calculate correct bands for standard latitudes', () => {
      expect(calculateUTMBand(-80)).toBe('C');
      expect(calculateUTMBand(-72)).toBe('C');
      expect(calculateUTMBand(-64)).toBe('D');
      expect(calculateUTMBand(-56)).toBe('E');
      expect(calculateUTMBand(-48)).toBe('F');
      expect(calculateUTMBand(-40)).toBe('G');
      expect(calculateUTMBand(-32)).toBe('H');
      expect(calculateUTMBand(-24)).toBe('J');
      expect(calculateUTMBand(-16)).toBe('K');
      expect(calculateUTMBand(-8)).toBe('L');
      expect(calculateUTMBand(0)).toBe('N');
      expect(calculateUTMBand(8)).toBe('P');
      expect(calculateUTMBand(16)).toBe('Q');
      expect(calculateUTMBand(24)).toBe('R');
      expect(calculateUTMBand(32)).toBe('S');
      expect(calculateUTMBand(40)).toBe('T');
      expect(calculateUTMBand(48)).toBe('U');
      expect(calculateUTMBand(56)).toBe('V');
      expect(calculateUTMBand(64)).toBe('W');
    });

    it('should handle Svalbard exception (72-84° = band X)', () => {
      expect(calculateUTMBand(72)).toBe('X');
      expect(calculateUTMBand(75)).toBe('X');
      expect(calculateUTMBand(80)).toBe('X');
      expect(calculateUTMBand(83.9)).toBe('X');
    });

    it('should throw error for latitude outside UTM range', () => {
      expect(() => calculateUTMBand(-81)).toThrow('Latitud fuera del rango del sistema UTM');
      expect(() => calculateUTMBand(85)).toThrow('Latitud fuera del rango del sistema UTM');
    });
  });

  describe('convertDDtoUTM', () => {
    it('should convert Madrid coordinates correctly', () => {
      const result = convertDDtoUTM(40.416775, -3.703790, 2);
      
      expect(result.zone).toBe(30);
      expect(result.band).toBe('T');
      expect(result.hemisphere).toBe('N');
      // Correct values from proj4: Zone 30T E: 440291.28 N: 4474254.6
      expect(result.easting).toBeCloseTo(440291.28, 0);
      expect(result.northing).toBeCloseTo(4474254.6, 0);
    });

    it('should handle equator coordinates', () => {
      const result = convertDDtoUTM(0, 0, 2);
      
      expect(result.zone).toBe(31);
      expect(result.band).toBe('N');
      expect(result.hemisphere).toBe('N');
      // Longitude 0° is NOT at center of zone 31 (center is at 3°), so easting != 500000
      // Verified: Zone 31 E: 166021.44 N: 0
      expect(result.easting).toBeCloseTo(166021.44, 0);
      expect(result.northing).toBeCloseTo(0, 0);
    });

    it('should handle southern hemisphere with false northing', () => {
      const result = convertDDtoUTM(-33.865143, 151.209900, 2);
      
      expect(result.zone).toBe(56);
      expect(result.band).toBe('H');
      expect(result.hemisphere).toBe('S');
      expect(result.northing).toBeGreaterThan(5000000);
    });

    it('should handle zone boundaries correctly', () => {
      // Longitude -180 should be zone 1
      const result1 = convertDDtoUTM(0, -180, 2);
      expect(result1.zone).toBe(1);
      
      // Longitude 0 should be zone 31
      const result2 = convertDDtoUTM(0, 0, 2);
      expect(result2.zone).toBe(31);
      
      // Longitude 180 should be zone 60
      const result3 = convertDDtoUTM(0, 179, 2);
      expect(result3.zone).toBe(60);
    });

    it('should apply precision correctly', () => {
      const result0 = convertDDtoUTM(40.416775, -3.703790, 0);
      expect(result0.easting).toBe(Math.floor(440291.28));
      
      const result5 = convertDDtoUTM(40.416775, -3.703790, 5);
      const eastingStr = result5.easting.toString();
      expect(eastingStr.split('.')[1]?.length || 0).toBeLessThanOrEqual(5);
    });
  });

  describe('convertUTMtoDD', () => {
    it('should convert Madrid UTM coordinates back to DD', () => {
      // Using correct Madrid UTM values: Zone 30 E: 440291.28 N: 4474254
      const result = convertUTMtoDD(30, 'N', 440291.28, 4474254, 6);
      
      expect(result.latitude).toBeCloseTo(40.416775, 4); // Reduced precision tolerance
      expect(result.longitude).toBeCloseTo(-3.703790, 5);
    });

    it('should handle southern hemisphere', () => {
      const result = convertUTMtoDD(56, 'S', 334873, 6252266, 6);
      
      expect(result.latitude).toBeLessThan(0);
      expect(result.hemisphere).toBeUndefined(); // DD doesn't have hemisphere field
    });

    it('should handle equator', () => {
      // Using correct equator UTM values: Zone 31 E: 166021.44 N: 0
      const result = convertUTMtoDD(31, 'N', 166021.44, 0, 6);
      
      expect(result.latitude).toBeCloseTo(0, 3);
      expect(result.longitude).toBeCloseTo(0, 3);
    });

    it('should apply precision correctly', () => {
      const result2 = convertUTMtoDD(30, 'N', 440720.92, 4474814.07, 2);
      const latStr = result2.latitude.toString();
      expect(latStr.split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
    });
  });

  describe('convertDDtoDMS', () => {
    it('should convert positive latitude to DMS with N direction', () => {
      const result = convertDDtoDMS(40.416775, -3.703790, 2);
      
      expect(result.latitude.degrees).toBe(40);
      expect(result.latitude.minutes).toBe(25);
      expect(result.latitude.seconds).toBeCloseTo(0.39, 1);
      expect(result.latitude.direction).toBe('N');
    });

    it('should convert negative latitude to DMS with S direction', () => {
      const result = convertDDtoDMS(-33.865143, 151.209900, 2);
      
      expect(result.latitude.degrees).toBe(33);
      expect(result.latitude.minutes).toBe(51);
      expect(result.latitude.seconds).toBeCloseTo(54.51, 1);
      expect(result.latitude.direction).toBe('S');
    });

    it('should convert positive longitude to DMS with E direction', () => {
      const result = convertDDtoDMS(40.416775, 3.703790, 2);
      
      expect(result.longitude.degrees).toBe(3);
      expect(result.longitude.minutes).toBe(42);
      expect(result.longitude.seconds).toBeCloseTo(13.64, 1);
      expect(result.longitude.direction).toBe('E');
    });

    it('should convert negative longitude to DMS with W direction', () => {
      const result = convertDDtoDMS(40.416775, -3.703790, 2);
      
      expect(result.longitude.degrees).toBe(3);
      expect(result.longitude.minutes).toBe(42);
      expect(result.longitude.seconds).toBeCloseTo(13.64, 1);
      expect(result.longitude.direction).toBe('W');
    });

    it('should handle rollover when seconds round to 60', () => {
      // Test with value that rounds to 60 seconds
      const result = convertDDtoDMS(40.4166666667, 0, 0);
      
      if (result.latitude.seconds >= 60) {
        expect(result.latitude.seconds).toBe(0);
        expect(result.latitude.minutes).toBe(26); // Should have incremented
      }
    });

    it('should handle zero values', () => {
      const result = convertDDtoDMS(0, 0, 3);
      
      expect(result.latitude.degrees).toBe(0);
      expect(result.latitude.minutes).toBe(0);
      expect(result.latitude.seconds).toBe(0);
      expect(result.latitude.direction).toBe('N');
      
      expect(result.longitude.degrees).toBe(0);
      expect(result.longitude.minutes).toBe(0);
      expect(result.longitude.seconds).toBe(0);
      expect(result.longitude.direction).toBe('E');
    });

    it('should apply seconds precision correctly', () => {
      const result0 = convertDDtoDMS(40.416775, -3.703790, 0);
      expect(Number.isInteger(result0.latitude.seconds)).toBe(true);
      
      const result3 = convertDDtoDMS(40.416775, -3.703790, 3);
      const secondsStr = result3.latitude.seconds.toString();
      expect(secondsStr.split('.')[1]?.length || 0).toBeLessThanOrEqual(3);
    });
  });

  describe('convertDMStoDD', () => {
    it('should convert N latitude to positive DD', () => {
      const latDMS = { degrees: 40, minutes: 25, seconds: 0.39, direction: 'N' };
      const lonDMS = { degrees: 3, minutes: 42, seconds: 13.64, direction: 'W' };
      const result = convertDMStoDD(latDMS, lonDMS, 6);
      
      expect(result.latitude).toBeCloseTo(40.416775, 5);
    });

    it('should convert S latitude to negative DD', () => {
      const latDMS = { degrees: 33, minutes: 51, seconds: 54.51, direction: 'S' };
      const lonDMS = { degrees: 151, minutes: 12, seconds: 35.64, direction: 'E' };
      const result = convertDMStoDD(latDMS, lonDMS, 6);
      
      expect(result.latitude).toBeCloseTo(-33.865142, 5);
      expect(result.latitude).toBeLessThan(0);
    });

    it('should convert E longitude to positive DD', () => {
      const latDMS = { degrees: 40, minutes: 25, seconds: 0.39, direction: 'N' };
      const lonDMS = { degrees: 3, minutes: 42, seconds: 13.64, direction: 'E' };
      const result = convertDMStoDD(latDMS, lonDMS, 6);
      
      expect(result.longitude).toBeCloseTo(3.703789, 5);
      expect(result.longitude).toBeGreaterThan(0);
    });

    it('should convert W longitude to negative DD', () => {
      const latDMS = { degrees: 40, minutes: 25, seconds: 0.39, direction: 'N' };
      const lonDMS = { degrees: 3, minutes: 42, seconds: 13.64, direction: 'W' };
      const result = convertDMStoDD(latDMS, lonDMS, 6);
      
      expect(result.longitude).toBeCloseTo(-3.703789, 5);
      expect(result.longitude).toBeLessThan(0);
    });

    it('should handle zero values', () => {
      const latDMS = { degrees: 0, minutes: 0, seconds: 0, direction: 'N' };
      const lonDMS = { degrees: 0, minutes: 0, seconds: 0, direction: 'E' };
      const result = convertDMStoDD(latDMS, lonDMS, 6);
      
      expect(result.latitude).toBe(0);
      expect(result.longitude).toBe(0);
    });

    it('should apply precision correctly', () => {
      const latDMS = { degrees: 40, minutes: 25, seconds: 0.39, direction: 'N' };
      const lonDMS = { degrees: 3, minutes: 42, seconds: 13.64, direction: 'W' };
      const result2 = convertDMStoDD(latDMS, lonDMS, 2);
      
      const latStr = result2.latitude.toString();
      expect(latStr.split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
    });
  });

  describe('Conversion round-trip tests', () => {
    it('should maintain accuracy in DD -> UTM -> DD round trip', () => {
      const original = { latitude: 40.416775, longitude: -3.703790 };
      
      const utm = convertDDtoUTM(original.latitude, original.longitude, 2);
      const result = convertUTMtoDD(utm.zone, utm.hemisphere, utm.easting, utm.northing, 6);
      
      expect(result.latitude).toBeCloseTo(original.latitude, 4);
      expect(result.longitude).toBeCloseTo(original.longitude, 4);
    });

    it('should maintain accuracy in DD -> DMS -> DD round trip', () => {
      const original = { latitude: 40.416775, longitude: -3.703790 };
      
      const dms = convertDDtoDMS(original.latitude, original.longitude, 3);
      const result = convertDMStoDD(dms.latitude, dms.longitude, 6);
      
      expect(result.latitude).toBeCloseTo(original.latitude, 5);
      expect(result.longitude).toBeCloseTo(original.longitude, 5);
    });
  });

  describe('convertUTMtoDMS', () => {
    it('should convert UTM to DMS using chained conversion', () => {
      // Using correct Madrid UTM values: Zone 30 E: 440291.28 N: 4474254
      const result = convertUTMtoDMS(30, 'N', 440291.28, 4474254, 2);
      
      expect(result.latitude.degrees).toBe(40);
      expect(result.latitude.minutes).toBe(25);
      expect(result.latitude.direction).toBe('N');
      
      expect(result.longitude.degrees).toBe(3);
      expect(result.longitude.minutes).toBe(42);
      expect(result.longitude.direction).toBe('W');
    });

    it('should use higher intermediate precision', () => {
      // Should produce accurate results even with final precision of 0
      const result = convertUTMtoDMS(30, 'N', 440291.28, 4474254, 0);
      
      expect(result.latitude.degrees).toBe(40);
      expect(result.latitude.minutes).toBe(25);
    });
  });

  describe('convertDMStoUTM', () => {
    it('should convert DMS to UTM using chained conversion', () => {
      const latDMS = { degrees: 40, minutes: 25, seconds: 0.39, direction: 'N' };
      const lonDMS = { degrees: 3, minutes: 42, seconds: 13.64, direction: 'W' };
      const result = convertDMStoUTM(latDMS, lonDMS, 2);
      
      expect(result.zone).toBe(30);
      expect(result.band).toBe('T');
      expect(result.hemisphere).toBe('N');
      // Correct values from proj4
      expect(result.easting).toBeCloseTo(440291.28, 0);
      expect(result.northing).toBeCloseTo(4474254.6, 0);
    });

    it('should use higher intermediate precision', () => {
      // Should produce accurate results using intermediate precision
      const latDMS = { degrees: 40, minutes: 25, seconds: 0, direction: 'N' };
      const lonDMS = { degrees: 3, minutes: 42, seconds: 14, direction: 'W' };
      const result = convertDMStoUTM(latDMS, lonDMS, 0);
      
      expect(result.zone).toBe(30);
      expect(result.hemisphere).toBe('N');
    });
  });

  describe('Edge cases and boundaries', () => {
    it('should handle prime meridian', () => {
      const utm = convertDDtoUTM(51.5, 0, 2);
      expect(utm.zone).toBe(31);
      
      const dd = convertUTMtoDD(utm.zone, utm.hemisphere, utm.easting, utm.northing, 6);
      expect(dd.longitude).toBeCloseTo(0, 3);
    });

    it('should handle international date line', () => {
      const utm1 = convertDDtoUTM(0, -180, 2);
      expect(utm1.zone).toBe(1);
      
      const utm2 = convertDDtoUTM(0, 179.9, 2);
      expect(utm2.zone).toBe(60);
    });

    it('should handle North Pole region', () => {
      const utm = convertDDtoUTM(83, 0, 2);
      expect(utm.band).toBe('X');
      expect(utm.hemisphere).toBe('N');
    });

    it('should handle South Pole region', () => {
      const utm = convertDDtoUTM(-79, 0, 2);
      expect(utm.band).toBe('C');
      expect(utm.hemisphere).toBe('S');
    });
  });
});
