import { useState } from 'react';
import { CoordinateFormat } from '../models/ConversionConfig.js';
import { parseExcelFile } from '../services/ExcelService.js';
import { 
  getBestDDLatitude, 
  getBestDDLongitude, 
  getBestUTMEasting, 
  getBestUTMNorthing, 
  getBestUTMZone, 
  getBestUTMHemisphere 
} from '../services/SmartColumnDetection.js';
import { processExcelRows } from '../services/BulkProcessor.js';
import { downloadExcelFile } from '../services/ExcelExporter.js';

function ExcelWorkflow() {
  // Workflow steps: 'upload' | 'configure' | 'processing' | 'complete'
  const [step, setStep] = useState('upload');
  
  // File and parsed data
  const [file, setFile] = useState(null);
  const [excelData, setExcelData] = useState(null);
  
  // Format configuration
  const [sourceFormat, setSourceFormat] = useState(CoordinateFormat.DD);
  const [targetFormat, setTargetFormat] = useState(CoordinateFormat.UTM);
  
  // Column mapping
  const [columnMapping, setColumnMapping] = useState({});
  const [detectionConfidence, setDetectionConfidence] = useState(0);
  
  // Processing state
  const [progress, setProgress] = useState({ current: 0, total: 0, percentage: 0 });
  const [processingResults, setProcessingResults] = useState(null);
  
  // Errors
  const [errors, setErrors] = useState([]);

  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    setErrors([]);
    setFile(uploadedFile);

    try {
      const parsed = await parseExcelFile(uploadedFile);
      setExcelData(parsed);
      
      // Auto-detect format based on actual data content
      const detectedCols = parsed.detectedColumns || {};
      
      // Determine most likely format based on what was detected
      let autoFormat = CoordinateFormat.DD;
      let mappingResult = null;
      let confidence = 0;
      
      // Check for DD columns
      const ddLat = getBestDDLatitude(detectedCols);
      const ddLon = getBestDDLongitude(detectedCols);
      const ddConfidence = (ddLat.confidence + ddLon.confidence) / 2;
      
      // Check for UTM columns
      const utmEast = getBestUTMEasting(detectedCols);
      const utmNorth = getBestUTMNorthing(detectedCols);
      const utmConfidence = (utmEast.confidence + utmNorth.confidence) / 2;
      
      // Choose format with highest confidence
      if (ddConfidence > utmConfidence && ddConfidence > 0.5) {
        autoFormat = CoordinateFormat.DD;
        confidence = ddConfidence;
        mappingResult = {
          latitude: ddLat.columnName,
          longitude: ddLon.columnName
        };
      } else if (utmConfidence > 0.5) {
        autoFormat = CoordinateFormat.UTM;
        confidence = utmConfidence;
        const utmZone = getBestUTMZone(detectedCols);
        const utmHem = getBestUTMHemisphere(detectedCols);
        mappingResult = {
          easting: utmEast.columnName,
          northing: utmNorth.columnName,
          zone: utmZone.columnName,
          hemisphere: utmHem.columnName,
          fixedZone: null,
          fixedHemisphere: null
        };
      } else {
        // Default to DD with empty mapping
        autoFormat = CoordinateFormat.DD;
        confidence = 0;
        mappingResult = {
          latitude: null,
          longitude: null
        };
      }
      
      setSourceFormat(autoFormat);
      setColumnMapping(mappingResult);
      setDetectionConfidence(confidence);
      
      // Set target format to something different from source
      const availableTargets = [CoordinateFormat.DD, CoordinateFormat.UTM, CoordinateFormat.DMS]
        .filter(fmt => fmt !== autoFormat);
      setTargetFormat(availableTargets[0]);
      
      setStep('configure');
    } catch (error) {
      setErrors([error.message]);
    }
  };

  const handleStartProcessing = () => {
    setStep('processing');
    setErrors([]);
    
    // Process in next tick to allow UI to update
    setTimeout(() => {
      try {
        const results = processExcelRows(
          excelData.rows,
          columnMapping,
          sourceFormat,
          targetFormat,
          (current, total, percentage) => {
            setProgress({ current, total, percentage });
          }
        );
        
        setProcessingResults(results);
        setStep('complete');
      } catch (error) {
        setErrors([error.message]);
        setStep('configure');
      }
    }, 100);
  };

  const handleDownload = () => {
    if (processingResults) {
      downloadExcelFile(processingResults.results, 'coordenadas_convertidas.xlsx');
    }
  };

  const handleReset = () => {
    setStep('upload');
    setFile(null);
    setExcelData(null);
    setColumnMapping({});
    setDetectionConfidence(0);
    setProgress({ current: 0, total: 0, percentage: 0 });
    setProcessingResults(null);
    setErrors([]);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Conversión por Excel</h2>
        <p className="card-description">
          Procesa miles de coordenadas de forma automática desde archivos Excel
        </p>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="alert alert-error">
          <strong>Error:</strong>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem', marginBottom: 0 }}>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div>
          <div className="form-group">
            <label className="form-label">Selecciona un archivo Excel</label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="form-input"
            />
            <span className="form-help">Formatos soportados: .xlsx, .xls (máximo 10 MB)</span>
          </div>
          
          <div className="alert alert-info">
            <strong>¿Cómo funciona?</strong>
            <ol style={{ marginTop: '0.5rem', paddingLeft: '1.5rem', marginBottom: 0 }}>
              <li>Sube un archivo Excel con coordenadas</li>
              <li>Confirma la detección automática de columnas</li>
              <li>Procesa todas las filas automáticamente</li>
              <li>Descarga el archivo con las coordenadas convertidas</li>
            </ol>
          </div>
        </div>
      )}

      {/* Step 2: Configure Column Mapping */}
      {step === 'configure' && excelData && (
        <div>
          <div className="alert alert-success">
            <strong>Archivo cargado exitosamente</strong>
            <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>
              {file.name} - {excelData.totalRows.toLocaleString('es-ES')} filas
            </p>
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Formato de Origen</label>
              <select
                className="form-select"
                value={sourceFormat}
                onChange={(e) => {
                  const newSourceFormat = e.target.value;
                  setSourceFormat(newSourceFormat);
                  
                  // If target format is same as new source, change target to a different format
                  if (newSourceFormat === targetFormat) {
                    const availableFormats = [CoordinateFormat.DD, CoordinateFormat.UTM, CoordinateFormat.DMS]
                      .filter(fmt => fmt !== newSourceFormat);
                    setTargetFormat(availableFormats[0]);
                  }
                  
                  // Re-detect columns with format-specific filtering
                  if (excelData && excelData.rawData && excelData.rawData.length > 0) {
                    // Import smartDetectColumns to re-run detection with format filter
                    import('../services/SmartColumnDetection.js').then(module => {
                      const { smartDetectColumns, getBestDDLatitude, getBestDDLongitude, getBestUTMEasting, getBestUTMNorthing, getBestUTMZone, getBestUTMHemisphere } = module;
                      
                      // Use raw data for re-detection (includes all rows with proper format)
                      const detection = smartDetectColumns(excelData.rawData, newSourceFormat);
                      
                      // Apply unique column names to detected columns (same logic as ExcelService)
                      const originalHeaders = detection.headers;
                      const headerCounts = {};
                      const originalToUniqueMap = {};
                      const uniqueHeaders = originalHeaders.map((header, index) => {
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
                      const detectedCols = {};
                      for (const [type, columns] of Object.entries(detection.detectedColumns)) {
                        detectedCols[type] = columns.map(col => ({
                          ...col,
                          columnName: originalToUniqueMap[col.columnIndex]
                        }));
                      }
                      
                      console.log('[ExcelWorkflow] Unique column names applied:', detectedCols);
                      
                      // Build mapping based on selected format
                      if (newSourceFormat === CoordinateFormat.DD) {
                        const ddLat = getBestDDLatitude(detectedCols);
                        const ddLon = getBestDDLongitude(detectedCols);
                        setColumnMapping({
                          latitude: ddLat.columnName,
                          longitude: ddLon.columnName
                        });
                        setDetectionConfidence((ddLat.confidence + ddLon.confidence) / 2);
                      } else if (newSourceFormat === CoordinateFormat.UTM) {
                        const utmEast = getBestUTMEasting(detectedCols);
                        const utmNorth = getBestUTMNorthing(detectedCols);
                        const utmZone = getBestUTMZone(detectedCols);
                        const utmHem = getBestUTMHemisphere(detectedCols);
                        setColumnMapping({
                          easting: utmEast.columnName,
                          northing: utmNorth.columnName,
                          zone: utmZone.columnName,
                          hemisphere: utmHem.columnName,
                          fixedZone: null,
                          fixedHemisphere: null
                        });
                        setDetectionConfidence((utmEast.confidence + utmNorth.confidence) / 2);
                      } else if (newSourceFormat === CoordinateFormat.DMS) {
                        // DMS format - detect single column format (combined lat/lon in one column)
                        const dmsCandidates = detectedCols['DMS_FULL'] || [];
                        if (dmsCandidates.length >= 2) {
                          // Multi-column DMS (separate columns for lat and lon)
                          setColumnMapping({
                            format: 'single',  // Using single column format for now (multi-column not implemented)
                            latColumn: dmsCandidates[0].columnName,
                            lonColumn: dmsCandidates[1].columnName
                          });
                          setDetectionConfidence((dmsCandidates[0].confidence + dmsCandidates[1].confidence) / 2);
                        } else if (dmsCandidates.length === 1) {
                          // Single column DMS
                          setColumnMapping({
                            format: 'single',
                            combinedColumn: dmsCandidates[0].columnName
                          });
                          setDetectionConfidence(dmsCandidates[0].confidence);
                        } else {
                          // No DMS detected
                          setColumnMapping({});
                          setDetectionConfidence(0);
                        }
                      }
                    });
                  }
                }}
              >
                <option value={CoordinateFormat.DD}>Decimal (DD)</option>
                <option value={CoordinateFormat.UTM}>UTM</option>
                <option value={CoordinateFormat.DMS}>DMS</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Formato de Destino</label>
              <select
                className="form-select"
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value)}
              >
                {sourceFormat !== CoordinateFormat.DD && (
                  <option value={CoordinateFormat.DD}>Decimal (DD)</option>
                )}
                {sourceFormat !== CoordinateFormat.UTM && (
                  <option value={CoordinateFormat.UTM}>UTM</option>
                )}
                {sourceFormat !== CoordinateFormat.DMS && (
                  <option value={CoordinateFormat.DMS}>DMS</option>
                )}
              </select>
            </div>
          </div>

          {/* Show detection results */}
          {detectionConfidence > 0 ? (
            <div className={`alert ${detectionConfidence >= 0.7 ? 'alert-success' : detectionConfidence >= 0.5 ? 'alert-info' : 'alert-warning'}`}>
              <strong>
                {detectionConfidence >= 0.7 ? '✓ Columnas detectadas automáticamente' : 
                 detectionConfidence >= 0.5 ? 'Columnas detectadas con confianza media' : 
                 'Detección con baja confianza'}
              </strong>
              <p style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                Confianza: {(detectionConfidence * 100).toFixed(0)}%
              </p>
              <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', marginBottom: 0 }}>
                {sourceFormat === CoordinateFormat.DD && (
                  <>
                    <li>Latitud: <strong>{columnMapping.latitude || 'No detectada'}</strong></li>
                    <li>Longitud: <strong>{columnMapping.longitude || 'No detectada'}</strong></li>
                  </>
                )}
                {sourceFormat === CoordinateFormat.UTM && (
                  <>
                    <li>Easting: <strong>{columnMapping.easting || 'No detectada'}</strong></li>
                    <li>Northing: <strong>{columnMapping.northing || 'No detectada'}</strong></li>
                    <li>Zona: <strong>{columnMapping.zone || 'No detectada (usar valor fijo 17)'}</strong></li>
                    <li>Hemisferio: <strong>{columnMapping.hemisphere || 'No detectada (usar valor fijo S)'}</strong></li>
                  </>
                )}
                {sourceFormat === CoordinateFormat.DMS && (
                  <>
                    <li>Latitud: <strong>{columnMapping.latColumn || 'No detectada'}</strong></li>
                    <li>Longitud: <strong>{columnMapping.lonColumn || 'No detectada'}</strong></li>
                  </>
                )}
              </ul>
            </div>
          ) : (
            <div className="alert alert-error">
              <strong>No se pudieron detectar las columnas</strong>
              <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                El archivo no contiene columnas reconocibles para el formato seleccionado.
                Verifica que el formato de origen sea correcto.
              </p>
            </div>
          )}

          {/* Preview table */}
          {excelData.rows && excelData.rows.length > 0 && (
            <div style={{ marginTop: 'var(--space-md)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
                Previsualización de datos (primeras 5 filas)
              </h3>
              <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                <table className="table" style={{ marginBottom: 0 }}>
                  <thead style={{ position: 'sticky', top: 0, background: 'var(--color-bg)', zIndex: 1 }}>
                    <tr>
                      {sourceFormat === CoordinateFormat.DD && (
                        <>
                          <th>{columnMapping.latitude || 'Latitud'}</th>
                          <th>{columnMapping.longitude || 'Longitud'}</th>
                        </>
                      )}
                      {sourceFormat === CoordinateFormat.UTM && (
                        <>
                          <th>{columnMapping.easting || 'Easting'}</th>
                          <th>{columnMapping.northing || 'Northing'}</th>
                          <th>{columnMapping.zone || 'Zona'}</th>
                          <th>{columnMapping.hemisphere || 'Hemisferio'}</th>
                        </>
                      )}
                      {sourceFormat === CoordinateFormat.DMS && (
                        <>
                          <th>{columnMapping.latColumn || 'Latitud'}</th>
                          <th>{columnMapping.lonColumn || 'Longitud'}</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {excelData.rows.slice(0, 5).map((row, idx) => (
                      <tr key={idx}>
                        {sourceFormat === CoordinateFormat.DD && (
                          <>
                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                              {columnMapping.latitude && row[columnMapping.latitude] !== undefined ? row[columnMapping.latitude] : '-'}
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                              {columnMapping.longitude && row[columnMapping.longitude] !== undefined ? row[columnMapping.longitude] : '-'}
                            </td>
                          </>
                        )}
                        {sourceFormat === CoordinateFormat.UTM && (
                          <>
                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                              {columnMapping.easting && row[columnMapping.easting] !== undefined ? row[columnMapping.easting] : '-'}
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                              {columnMapping.northing && row[columnMapping.northing] !== undefined ? row[columnMapping.northing] : '-'}
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                              {columnMapping.zone && row[columnMapping.zone] !== undefined ? row[columnMapping.zone] : (columnMapping.fixedZone || '-')}
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                              {columnMapping.hemisphere && row[columnMapping.hemisphere] !== undefined ? row[columnMapping.hemisphere] : (columnMapping.fixedHemisphere || '-')}
                            </td>
                          </>
                        )}
                        {sourceFormat === CoordinateFormat.DMS && (
                          <>
                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                              {columnMapping.latColumn && row[columnMapping.latColumn] !== undefined ? row[columnMapping.latColumn] : '-'}
                            </td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                              {columnMapping.lonColumn && row[columnMapping.lonColumn] !== undefined ? row[columnMapping.lonColumn] : '-'}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: 'var(--space-sm)', marginBottom: 0 }}>
                Mostrando {Math.min(5, excelData.rows.length)} de {excelData.totalRows} filas
              </p>
            </div>
          )}

          {/* Show UTM fixed value inputs if zone/hemisphere not detected */}
          {sourceFormat === CoordinateFormat.UTM && (!columnMapping.zone || !columnMapping.hemisphere) && (
            <div className="grid grid-cols-2">
              {!columnMapping.zone && (
                <div className="form-group">
                  <label className="form-label">Zona UTM (valor fijo)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Ej: 17"
                    value={columnMapping.fixedZone || ''}
                    onChange={(e) => setColumnMapping({ ...columnMapping, fixedZone: parseInt(e.target.value, 10) || null })}
                  />
                  <span className="form-help">Todas las filas usarán esta zona</span>
                </div>
              )}
              {!columnMapping.hemisphere && (
                <div className="form-group">
                  <label className="form-label">Hemisferio (valor fijo)</label>
                  <select
                    className="form-select"
                    value={columnMapping.fixedHemisphere || ''}
                    onChange={(e) => setColumnMapping({ ...columnMapping, fixedHemisphere: e.target.value })}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="N">Norte (N)</option>
                    <option value="S">Sur (S)</option>
                  </select>
                  <span className="form-help">Todas las filas usarán este hemisferio</span>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between gap-md" style={{ marginTop: 'var(--space-lg)' }}>
            <button className="btn btn-secondary" onClick={handleReset}>
              Cancelar
            </button>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleStartProcessing}
              disabled={
                (sourceFormat === CoordinateFormat.DD && (!columnMapping.latitude || !columnMapping.longitude)) ||
                (sourceFormat === CoordinateFormat.UTM && (!columnMapping.easting || !columnMapping.northing || 
                  (!columnMapping.zone && !columnMapping.fixedZone) || (!columnMapping.hemisphere && !columnMapping.fixedHemisphere)))
              }
            >
              Procesar {excelData.totalRows.toLocaleString('es-ES')} Coordenadas
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Processing */}
      {step === 'processing' && (
        <div>
          <div className="form-group">
            <label className="form-label">Procesando conversiones...</label>
            <div className="progress">
              <div
                className="progress-bar"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
            <span className="form-help">
              Procesando: {progress.current.toLocaleString('es-ES')} de {progress.total.toLocaleString('es-ES')} ({progress.percentage}%)
            </span>
          </div>
        </div>
      )}

      {/* Step 4: Complete */}
      {step === 'complete' && processingResults && (
        <div>
          <div className="alert alert-success">
            <strong>Procesamiento completado</strong>
            <div style={{ marginTop: '0.5rem' }}>
              <p style={{ marginBottom: '0.25rem' }}>
                Total de filas: {processingResults.summary.total.toLocaleString('es-ES')}
              </p>
              <p style={{ marginBottom: '0.25rem' }}>
                Conversiones exitosas: {processingResults.summary.success.toLocaleString('es-ES')}
              </p>
              <p style={{ marginBottom: 0 }}>
                Errores: {processingResults.summary.errors.toLocaleString('es-ES')}
              </p>
            </div>
          </div>

          {processingResults.summary.errors > 0 && (
            <div className="alert alert-warning">
              <strong>Advertencia</strong>
              <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                Algunas filas contienen errores. Revisa la columna ERROR en el archivo descargado para más detalles.
              </p>
            </div>
          )}

          <div className="flex justify-between gap-md">
            <button className="btn btn-secondary" onClick={handleReset}>
              Procesar Otro Archivo
            </button>
            <button className="btn btn-primary btn-lg" onClick={handleDownload}>
              Descargar Resultados
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExcelWorkflow;
