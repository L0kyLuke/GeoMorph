/**
 * SmartColumnDetection - Content-based intelligent column detection
 * Analyzes actual cell values to detect coordinate formats
 */

/**
 * Analyze a value to determine if it looks like a specific coordinate type
 * @param {any} value - Cell value to analyze
 * @param {string|null} formatFilter - Optional format to filter by ('DD', 'UTM', 'DMS', or null for all)
 * @returns {{type: string|null, confidence: number}} Detection result
 */
function analyzeValue(value, formatFilter = null) {
  if (value === null || value === undefined || value === '') {
    return { type: null, confidence: 0 };
  }

  const str = String(value).trim();
  // Handle comma as decimal separator
  const numStr = str.replace(',', '.');
  const num = parseFloat(numStr);

  // Check for DMS format first (more specific pattern)
  const dmsPattern = /(\d+)[°º]\s*(\d+)['′]\s*([\d,\.]+)["″]\s*([NSEW])/i;
  if (dmsPattern.test(str)) {
    // Only return DMS if we're looking for DMS or not filtering
    if (formatFilter === null || formatFilter === 'DMS') {
      return { type: 'DMS_FULL', confidence: 0.95 };
    }
    // If filtering for DD or UTM, ignore DMS patterns
    return { type: null, confidence: 0 };
  }

  // Check for DD (Decimal Degrees)
  // Latitude: -90 to 90, typically with decimals
  // Longitude: -180 to 180, typically with decimals
  if (!isNaN(num) && isFinite(num)) {
    const hasDecimals = str.includes('.') || str.includes(',');
    
    // If we're filtering for DD, only detect DD values
    if (formatFilter === 'DD' || formatFilter === null) {
      // Likely latitude if between -90 and 90
      if (num >= -90 && num <= 90 && hasDecimals) {
        // VERY HIGH confidence for values with 5+ decimal places (clear DD format)
        const decimalPlaces = (str.split(/[.,]/)[1] || '').length;
        if (decimalPlaces >= 5) {
          return { type: 'DD_LAT', confidence: 0.98 };
        }
        // Higher confidence for typical latitude ranges
        if (Math.abs(num) <= 90) {
          return { type: 'DD_LAT', confidence: 0.90 };
        }
        return { type: 'DD_LAT', confidence: 0.7 };
      }
      
      // Likely longitude if between -180 and 180
      // More specific: typical longitude values are outside typical latitude range
      if (num >= -180 && num <= 180 && hasDecimals) {
        // VERY HIGH confidence for values with 5+ decimal places (clear DD format)
        const decimalPlaces = (str.split(/[.,]/)[1] || '').length;
        if (decimalPlaces >= 5) {
          return { type: 'DD_LON', confidence: 0.98 };
        }
        // High confidence if value is clearly outside latitude range
        if (Math.abs(num) > 90) {
          return { type: 'DD_LON', confidence: 0.95 };
        }
        // Medium-high confidence for values that could be either but have many decimals
        if (hasDecimals && decimalPlaces >= 5) {
          return { type: 'DD_LON', confidence: 0.85 };
        }
        return { type: 'DD_LON', confidence: 0.75 };
      }
    }

    // If we're filtering for UTM, only detect UTM values
    if (formatFilter === 'UTM' || formatFilter === null) {
      // Check for UTM Easting (typically 100,000 to 900,000)
      if (num >= 100000 && num <= 900000) {
        return { type: 'UTM_EASTING', confidence: 0.85 };
      }

      // Check for UTM Northing (typically 0 to 10,000,000)
      if (num >= 0 && num <= 10000000) {
        // Lower confidence as this range overlaps with many things
        if (num > 1000000) {
          return { type: 'UTM_NORTHING', confidence: 0.8 };
        }
        return { type: 'UTM_NORTHING', confidence: 0.5 };
      }

      // Check for UTM Zone (1 to 60)
      if (Number.isInteger(num) && num >= 1 && num <= 60) {
        return { type: 'UTM_ZONE', confidence: 0.7 };
      }
    }
  }

  // Check for UTM Hemisphere / Band (single letter)
  if (formatFilter === 'UTM' || formatFilter === null) {
    if (str.length === 1 && /[CDEFGHJKLMNPQRSTUVWX]/i.test(str)) {
      return { type: 'UTM_BAND', confidence: 0.8 };
    }
    if (/^[NS]$/i.test(str)) {
      return { type: 'UTM_HEMISPHERE', confidence: 0.9 };
    }
  }

  return { type: null, confidence: 0 };
}

/**
 * Find the header row by looking for the first row above data rows
 * @param {Array<Array>} rows - All rows from Excel (array of arrays)
 * @param {number} dataRowIndex - Index where data starts
 * @returns {number} Index of header row (or -1 if not found)
 */
function findHeaderRow(rows, dataRowIndex) {
  // Look up to 5 rows above the data row
  for (let i = dataRowIndex - 1; i >= Math.max(0, dataRowIndex - 5); i--) {
    const row = rows[i];
    // Check if this row has mostly text values (potential header)
    const textCellCount = row.filter(cell => {
      if (cell === null || cell === undefined || cell === '') return false;
      const str = String(cell).trim();
      // Is it text and not just a number?
      return isNaN(parseFloat(cell)) || str.length > 10;
    }).length;
    
    if (textCellCount >= 2) {
      return i;
    }
  }
  return dataRowIndex > 0 ? dataRowIndex - 1 : 0;
}

/**
 * Scan Excel data to find coordinate columns by analyzing cell content
 * @param {Array<Array>} jsonData - Raw Excel data (array of arrays)
 * @param {string|null} formatFilter - Optional format to filter by ('DD', 'UTM', 'DMS', or null for all)
 * @returns {{headers: string[], dataStartRow: number, detectedColumns: Object}}
 */
export function smartDetectColumns(jsonData, formatFilter = null) {
  if (!jsonData || jsonData.length < 2) {
    return {
      headers: [],
      dataStartRow: 0,
      detectedColumns: {}
    };
  }

  // Step 1: Scan rows to find where data starts (first row with coordinate values)
  let dataRowIndex = -1;
  const columnTypes = {}; // Map: columnIndex -> {type, confidence, count}

  // Scan first 10 rows to find data patterns
  for (let rowIdx = 0; rowIdx < Math.min(jsonData.length, 10); rowIdx++) {
    const row = jsonData[rowIdx];
    let coordsFoundInRow = 0;

    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      const value = row[colIdx];
      const analysis = analyzeValue(value, formatFilter);

      if (analysis.type && analysis.confidence > 0.6) {
        coordsFoundInRow++;
        
        // Initialize column tracking
        if (!columnTypes[colIdx]) {
          columnTypes[colIdx] = {
            type: analysis.type,
            confidence: analysis.confidence,
            count: 1,
            firstRow: rowIdx
          };
        } else {
          // Update if same type detected again
          if (columnTypes[colIdx].type === analysis.type) {
            columnTypes[colIdx].count++;
            columnTypes[colIdx].confidence = Math.min(
              0.99, 
              columnTypes[colIdx].confidence + 0.05
            );
          }
        }
      }
    }

    // If we found multiple coordinate-looking values, this is likely the data row
    if (coordsFoundInRow >= 2 && dataRowIndex === -1) {
      dataRowIndex = rowIdx;
    }
  }

  // Step 2: Find header row (row above data)
  const headerRowIndex = dataRowIndex > 0 ? findHeaderRow(jsonData, dataRowIndex) : 0;
  const headers = jsonData[headerRowIndex].map((header, index) => {
    if (header === null || header === undefined || header === '') {
      return `Columna_${index + 1}`;
    }
    return String(header).trim();
  });

  // Step 3: Boost confidence based on header names (SMALL boost only)
  for (const [colIdx, typeInfo] of Object.entries(columnTypes)) {
    const idx = parseInt(colIdx);
    const headerName = (headers[idx] || '').toLowerCase();
    
    // SMALL boost for DD_LAT if header contains latitude-related terms
    // Keep boost small so content analysis takes priority
    if (typeInfo.type === 'DD_LAT') {
      if (headerName.includes('lat') || headerName.includes('latitud') || headerName.includes('y')) {
        typeInfo.confidence = Math.min(0.99, typeInfo.confidence + 0.05);
      }
    }
    
    // SMALL boost for DD_LON if header contains longitude-related terms
    if (typeInfo.type === 'DD_LON') {
      if (headerName.includes('lon') || headerName.includes('longitud') || headerName.includes('x')) {
        typeInfo.confidence = Math.min(0.99, typeInfo.confidence + 0.05);
      }
    }
    
    // SMALL boost for UTM columns based on header
    if (typeInfo.type === 'UTM_EASTING') {
      if (headerName.includes('este') || headerName.includes('east') || headerName.includes('x')) {
        typeInfo.confidence = Math.min(0.99, typeInfo.confidence + 0.05);
      }
    }
    
    if (typeInfo.type === 'UTM_NORTHING') {
      if (headerName.includes('norte') || headerName.includes('north') || headerName.includes('y')) {
        typeInfo.confidence = Math.min(0.99, typeInfo.confidence + 0.05);
      }
    }
  }

  // Step 4: Resolve ambiguity - if two columns both detected as DD_LAT, 
  // the one with longitude-like header should be DD_LON
  const latCandidates = [];
  const lonCandidates = [];
  
  for (const [colIdx, typeInfo] of Object.entries(columnTypes)) {
    if (typeInfo.type === 'DD_LAT') {
      latCandidates.push({ colIdx: parseInt(colIdx), ...typeInfo });
    } else if (typeInfo.type === 'DD_LON') {
      lonCandidates.push({ colIdx: parseInt(colIdx), ...typeInfo });
    }
  }
  
  // If we have 2 latitude candidates but no longitude, check headers
  if (latCandidates.length >= 2 && lonCandidates.length === 0) {
    for (const candidate of latCandidates) {
      const headerName = (headers[candidate.colIdx] || '').toLowerCase();
      // If header suggests longitude, reclassify it
      if (headerName.includes('lon') || headerName.includes('longitud') || 
          (headerName.includes('x') && !headerName.includes('lat'))) {
        columnTypes[candidate.colIdx].type = 'DD_LON';
        columnTypes[candidate.colIdx].confidence = Math.min(0.95, candidate.confidence + 0.1);
      }
    }
  }
  
  // If we STILL have lat but no lon, pick the rightmost lat as lon
  // (typical Excel layout: Lat | Lon)
  if (latCandidates.length >= 2) {
    const updatedLonCandidates = [];
    for (const [colIdx, typeInfo] of Object.entries(columnTypes)) {
      if (typeInfo.type === 'DD_LON') {
        updatedLonCandidates.push({ colIdx: parseInt(colIdx), ...typeInfo });
      }
    }
    
    if (updatedLonCandidates.length === 0) {
      // Sort by column index and convert the rightmost to longitude
      const sortedLats = latCandidates.sort((a, b) => a.colIdx - b.colIdx);
      if (sortedLats.length >= 2) {
        const rightmost = sortedLats[sortedLats.length - 1];
        columnTypes[rightmost.colIdx].type = 'DD_LON';
        columnTypes[rightmost.colIdx].confidence = Math.min(0.90, rightmost.confidence);
      }
    }
  }

  // Step 5: Build detection results with header names
  const detectedColumns = {};
  
  for (const [colIdx, typeInfo] of Object.entries(columnTypes)) {
    const idx = parseInt(colIdx);
    const headerName = headers[idx] || `Columna_${idx + 1}`;
    
    if (!detectedColumns[typeInfo.type]) {
      detectedColumns[typeInfo.type] = [];
    }
    
    detectedColumns[typeInfo.type].push({
      columnIndex: idx,
      columnName: headerName,
      confidence: typeInfo.confidence,
      sampleCount: typeInfo.count
    });
  }

  // Sort each type by confidence descending
  for (const type in detectedColumns) {
    detectedColumns[type].sort((a, b) => b.confidence - a.confidence);
  }
  
  // Debug log for format-filtered detection
  if (formatFilter) {
    console.log(`[SmartDetection] Format filter: ${formatFilter}`);
    console.log('[SmartDetection] Detected columns:', JSON.stringify(detectedColumns, null, 2));
  }

  return {
    headers,
    dataStartRow: dataRowIndex !== -1 ? dataRowIndex : 1,
    detectedColumns
  };
}

/**
 * Get best column for DD latitude
 * @param {Object} detectedColumns - Result from smartDetectColumns
 * @returns {{columnName: string|null, confidence: number}}
 */
export function getBestDDLatitude(detectedColumns) {
  const candidates = detectedColumns['DD_LAT'] || [];
  if (candidates.length > 0) {
    const best = candidates[0];
    return {
      columnName: best.columnName,
      confidence: best.confidence
    };
  }
  return { columnName: null, confidence: 0 };
}

/**
 * Get best column for DD longitude
 * @param {Object} detectedColumns - Result from smartDetectColumns
 * @returns {{columnName: string|null, confidence: number}}
 */
export function getBestDDLongitude(detectedColumns) {
  const candidates = detectedColumns['DD_LON'] || [];
  if (candidates.length > 0) {
    const best = candidates[0];
    return {
      columnName: best.columnName,
      confidence: best.confidence
    };
  }
  return { columnName: null, confidence: 0 };
}

/**
 * Get best column for UTM Easting
 * @param {Object} detectedColumns - Result from smartDetectColumns
 * @returns {{columnName: string|null, confidence: number}}
 */
export function getBestUTMEasting(detectedColumns) {
  const candidates = detectedColumns['UTM_EASTING'] || [];
  if (candidates.length > 0) {
    const best = candidates[0];
    return {
      columnName: best.columnName,
      confidence: best.confidence
    };
  }
  return { columnName: null, confidence: 0 };
}

/**
 * Get best column for UTM Northing
 * @param {Object} detectedColumns - Result from smartDetectColumns
 * @returns {{columnName: string|null, confidence: number}}
 */
export function getBestUTMNorthing(detectedColumns) {
  const candidates = detectedColumns['UTM_NORTHING'] || [];
  if (candidates.length > 0) {
    const best = candidates[0];
    return {
      columnName: best.columnName,
      confidence: best.confidence
    };
  }
  return { columnName: null, confidence: 0 };
}

/**
 * Get best column for UTM Zone
 * @param {Object} detectedColumns - Result from smartDetectColumns
 * @returns {{columnName: string|null, confidence: number}}
 */
export function getBestUTMZone(detectedColumns) {
  const candidates = detectedColumns['UTM_ZONE'] || [];
  if (candidates.length > 0) {
    const best = candidates[0];
    return {
      columnName: best.columnName,
      confidence: best.confidence
    };
  }
  return { columnName: null, confidence: 0 };
}

/**
 * Get best column for UTM Hemisphere/Band
 * @param {Object} detectedColumns - Result from smartDetectColumns
 * @returns {{columnName: string|null, confidence: number}}
 */
export function getBestUTMHemisphere(detectedColumns) {
  // Try hemisphere first, then band
  const hemCandidates = detectedColumns['UTM_HEMISPHERE'] || [];
  if (hemCandidates.length > 0) {
    const best = hemCandidates[0];
    return {
      columnName: best.columnName,
      confidence: best.confidence
    };
  }
  
  const bandCandidates = detectedColumns['UTM_BAND'] || [];
  if (bandCandidates.length > 0) {
    const best = bandCandidates[0];
    return {
      columnName: best.columnName,
      confidence: best.confidence
    };
  }
  
  return { columnName: null, confidence: 0 };
}
