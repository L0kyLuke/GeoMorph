/**
 * ExcelExporter - Generate and download Excel files with conversion results
 */

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Generate Excel file from processed results
 * Creates a new workbook with all original columns plus result columns
 * 
 * @param {Object[]} results - Array of result objects with original and converted data
 * @param {string} filename - Output filename (default: "coordenadas_convertidas.xlsx")
 * @returns {Blob} Excel file as Blob
 */
export function generateExcelFile(results, filename = 'coordenadas_convertidas.xlsx') {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Convert results to worksheet
  const worksheet = XLSX.utils.json_to_sheet(results);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Resultados');
  
  // Generate binary Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  // Create Blob from buffer
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  return blob;
}

/**
 * Download Excel file with conversion results
 * 
 * @param {Object[]} results - Array of result objects with original and converted data
 * @param {string} filename - Output filename (default: "coordenadas_convertidas.xlsx")
 */
export function downloadExcelFile(results, filename = 'coordenadas_convertidas.xlsx') {
  const blob = generateExcelFile(results, filename);
  saveAs(blob, filename);
}

/**
 * Get error rows from results
 * 
 * @param {Object[]} results - Array of result objects
 * @returns {Object[]} Array of rows that have errors
 */
export function getErrorRows(results) {
  return results.filter(row => row.ERROR && row.ERROR !== '');
}

/**
 * Get success rows from results
 * 
 * @param {Object[]} results - Array of result objects
 * @returns {Object[]} Array of rows that were converted successfully
 */
export function getSuccessRows(results) {
  return results.filter(row => !row.ERROR || row.ERROR === '');
}
