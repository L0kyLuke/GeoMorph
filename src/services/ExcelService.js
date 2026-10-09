/**
 * ExcelService - Parse and handle Excel files
 * Provides functionality to read .xlsx and .xls files and extract coordinate data
 */

import * as XLSX from 'xlsx';
import { smartDetectColumns } from './SmartColumnDetection.js';

/**
 * ExcelData structure representing parsed Excel content
 * @typedef {Object} ExcelData
 * @property {string[]} headers - Column headers from first row
 * @property {Object[]} rows - Array of row objects with column values
 * @property {number} totalRows - Total number of data rows (excluding header)
 */

/**
 * Maximum file size allowed: 10 MB
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB in bytes

/**
 * Warning threshold for large files: 50,000 rows
 */
const LARGE_FILE_THRESHOLD = 50000;

/**
 * Parse an Excel file and extract headers and data rows
 * 
 * @param {File} file - The uploaded Excel file (.xlsx or .xls)
 * @returns {Promise<ExcelData>} Promise resolving to parsed Excel data
 * @throws {Error} If file is invalid, corrupted, empty, or exceeds size limit
 */
export async function parseExcelFile(file) {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `El archivo excede el tamaño máximo permitido de 10 MB. ` +
      `Tamaño del archivo: ${(file.size / (1024 * 1024)).toFixed(2)} MB`
    );
  }

  // Validate file type
  const validExtensions = ['.xlsx', '.xls'];
  const fileName = file.name.toLowerCase();
  const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
  
  if (!hasValidExtension) {
    throw new Error(
      'Formato de archivo no válido. Por favor, sube un archivo Excel (.xlsx o .xls).'
    );
  }

  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Parse Excel file WITH cellStyles to detect hidden rows/columns
    const workbook = XLSX.read(arrayBuffer, { 
      type: 'array',
      cellStyles: true  // Required to detect hidden columns/rows
    });
    
    // Get first sheet
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new Error('El archivo Excel está vacío o no contiene hojas.');
    }
    
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Get hidden columns info to filter them out
    const hiddenCols = new Set();
    if (worksheet['!cols']) {
      worksheet['!cols'].forEach((colInfo, colIndex) => {
        if (colInfo && colInfo.hidden) {
          hiddenCols.add(colIndex);
        }
      });
    }
    
    // Get hidden rows info to filter them out
    const hiddenRows = new Set();
    if (worksheet['!rows']) {
      worksheet['!rows'].forEach((rowInfo, rowIndex) => {
        if (rowInfo && rowInfo.hidden) {
          hiddenRows.add(rowIndex);
        }
      });
    }
    
    // Convert sheet to JSON (array of arrays)
    const jsonDataRaw = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    
    // Filter out hidden rows and columns - ONLY keep visible data
    const jsonData = jsonDataRaw
      .filter((row, rowIndex) => !hiddenRows.has(rowIndex)) // Remove hidden rows
      .map(row => row.filter((cell, colIndex) => !hiddenCols.has(colIndex))); // Remove hidden columns
    
    // Validate that file has data
    if (!jsonData || jsonData.length === 0) {
      throw new Error('El archivo Excel está vacío.');
    }
    
    if (jsonData.length < 2) {
      throw new Error('El archivo Excel debe contener al menos una fila de encabezados y una fila de datos.');
    }
    
    // Use smart detection to find headers and data start row
    const detection = smartDetectColumns(jsonData);
    let headers = detection.headers;
    const dataStartRow = detection.dataStartRow;
    
    // Make column names unique by adding suffix to duplicates
    // Also update detectedColumns to use unique names
    const headerCounts = {};
    const originalToUniqueMap = {}; // Map original names to unique names
    headers = headers.map((header, index) => {
      let uniqueName = header;
      if (!headerCounts[header]) {
        headerCounts[header] = 1;
      } else {
        headerCounts[header]++;
        uniqueName = `${header}_${headerCounts[header]}`;
      }
      originalToUniqueMap[index] = uniqueName;
      return uniqueName;
    });
    
    // Update detected columns to use unique names
    const detectedColumns = {};
    for (const [type, columns] of Object.entries(detection.detectedColumns)) {
      detectedColumns[type] = columns.map(col => ({
        ...col,
        columnName: originalToUniqueMap[col.columnIndex]
      }));
    }
    
    // Extract data rows (skip header rows)
    const dataRows = jsonData.slice(dataStartRow);
    
    // Convert rows from arrays to objects with column names as keys
    const rows = dataRows.map((row, rowIndex) => {
      const rowObject = {};
      headers.forEach((header, colIndex) => {
        const cellValue = row[colIndex];
        rowObject[header] = cellValue !== undefined && cellValue !== null ? cellValue : '';
      });
      return rowObject;
    });
    
    // Filter out completely empty rows (all values are empty, null, or undefined)
    const nonEmptyRows = rows.filter(row => {
      // Check if at least one cell has a non-empty value
      return Object.values(row).some(value => {
        if (value === '' || value === null || value === undefined) {
          return false;
        }
        // Also exclude rows that only have whitespace
        if (typeof value === 'string' && value.trim() === '') {
          return false;
        }
        return true;
      });
    });
    
    const totalRows = nonEmptyRows.length;
    
    // Warn about large files
    if (totalRows > LARGE_FILE_THRESHOLD) {
      console.warn(
        `Advertencia: El archivo contiene ${totalRows.toLocaleString('es-ES')} filas. ` +
        `El procesamiento puede tardar varios segundos.`
      );
    }
    
    return {
      headers,
      rows: nonEmptyRows,
      totalRows,
      detectedColumns: detectedColumns, // Use updated detectedColumns with unique names
      rawData: jsonData // Add raw data for re-detection when format changes
    };
    
  } catch (error) {
    // If error is already our custom error, re-throw it
    if (error.message && (
      error.message.includes('excede el tamaño') ||
      error.message.includes('Formato de archivo') ||
      error.message.includes('Excel está vacío') ||
      error.message.includes('debe contener al menos')
    )) {
      throw error;
    }
    
    // Otherwise, it's a parsing error
    throw new Error(
      'Error al leer el archivo Excel. El archivo puede estar corrupto o en un formato no compatible.'
    );
  }
}

/**
 * Check if file size exceeds the maximum allowed
 * 
 * @param {File} file - The file to check
 * @returns {boolean} True if file exceeds size limit
 */
export function isFileTooLarge(file) {
  return file.size > MAX_FILE_SIZE;
}

/**
 * Check if the number of rows exceeds the large file threshold
 * 
 * @param {number} rowCount - Number of rows to check
 * @returns {boolean} True if row count exceeds threshold
 */
export function isLargeFile(rowCount) {
  return rowCount > LARGE_FILE_THRESHOLD;
}

/**
 * Get human-readable file size
 * 
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size (e.g., "2.5 MB")
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} bytes`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}
