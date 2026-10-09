import { useState } from 'react';
import { CoordinateFormat } from '../models/ConversionConfig.js';
import { convertDDtoUTM, convertDDtoDMS, convertUTMtoDD, convertUTMtoDMS, convertDMStoDD, convertDMStoUTM } from '../services/ConversionEngine.js';
import { validateDD, validateUTM, validateDMS } from '../services/ValidationService.js';
import { formatCoordinateString } from '../utils/CoordinateFormatter.js';
import { parseDMSString } from '../utils/CoordinateParser.js';

function BulkConversion() {
  const [sourceFormat, setSourceFormat] = useState(CoordinateFormat.DD);
  const [targetFormat, setTargetFormat] = useState(CoordinateFormat.UTM);
  
  // Text area inputs
  const [latitudesText, setLatitudesText] = useState('');
  const [longitudesText, setLongitudesText] = useState('');
  
  // Results
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get labels based on source format
  const getInputLabels = () => {
    switch(sourceFormat) {
      case CoordinateFormat.DD:
        return {
          field1: 'Latitudes (una por línea)',
          field2: 'Longitudes (una por línea)',
          placeholder1: '-3.90522469\n-3.90522469\n-3.90522469',
          placeholder2: '-79.57483494\n-79.57483494\n-79.57483494'
        };
      case CoordinateFormat.UTM:
        return {
          field1: 'Easting/Este (una por línea)',
          field2: 'Northing/Norte (una por línea)',
          placeholder1: '658235.698\n658235.698\n658235.698',
          placeholder2: '9568214.58\n9568214.58\n9568214.58'
        };
      case CoordinateFormat.DMS:
        return {
          field1: 'Latitudes DMS (una por línea)',
          field2: 'Longitudes DMS (una por línea)',
          placeholder1: '3º 54\' 18.809" S\n3º 54\' 18.809" S',
          placeholder2: '79º 34\' 29.406" W\n79º 34\' 29.406" W'
        };
      default:
        return {
          field1: 'Campo 1',
          field2: 'Campo 2',
          placeholder1: '',
          placeholder2: ''
        };
    }
  };

  const labels = getInputLabels();

  const handleBulkConvert = () => {
    setIsProcessing(true);
    setResults([]);
    setSummary(null);

    try {
      // Split by line breaks and filter empty lines
      const latitudes = latitudesText.split('\n').map(line => line.trim()).filter(line => line !== '');
      const longitudes = longitudesText.split('\n').map(line => line.trim()).filter(line => line !== '');

      // Validate that we have the same number of latitudes and longitudes
      if (latitudes.length === 0 || longitudes.length === 0) {
        setSummary({
          total: 0,
          success: 0,
          errors: 1,
          message: 'Por favor, ingresa al menos una coordenada en cada campo'
        });
        setIsProcessing(false);
        return;
      }

      if (latitudes.length !== longitudes.length) {
        setSummary({
          total: 0,
          success: 0,
          errors: 1,
          message: `El número de latitudes (${latitudes.length}) no coincide con el número de longitudes (${longitudes.length})`
        });
        setIsProcessing(false);
        return;
      }

      const processedResults = [];
      let successCount = 0;
      let errorCount = 0;

      // Process each coordinate pair based on source format
      for (let i = 0; i < latitudes.length; i++) {
        const value1 = latitudes[i];
        const value2 = longitudes[i];
        const rowNumber = i + 1;

        try {
          let coordinate = null;
          let originalFormatted = '';
          let validationResult = null;

          // Parse and validate based on source format
          if (sourceFormat === CoordinateFormat.DD) {
            // Parse as decimal degrees
            const lat = parseFloat(value1.replace(',', '.'));
            const lon = parseFloat(value2.replace(',', '.'));

            if (isNaN(lat) || isNaN(lon) || !isFinite(lat) || !isFinite(lon)) {
              throw new Error('Valores no numéricos o infinitos');
            }

            validationResult = validateDD(lat, lon);
            if (!validationResult.isValid) {
              throw new Error(validationResult.errors.join('; '));
            }

            coordinate = { latitude: lat, longitude: lon };
            originalFormatted = `${lat}°, ${lon}°`;

          } else if (sourceFormat === CoordinateFormat.UTM) {
            // Parse as UTM
            const easting = parseFloat(value1.replace(',', '.'));
            const northing = parseFloat(value2.replace(',', '.'));

            if (isNaN(easting) || isNaN(northing) || !isFinite(easting) || !isFinite(northing)) {
              throw new Error('Valores no numéricos o infinitos');
            }

            // For UTM, we need zone and hemisphere - use defaults for Ecuador (zone 17S)
            const zone = 17;
            const hemisphere = 'S';

            validationResult = validateUTM(zone, hemisphere, easting, northing);
            if (!validationResult.isValid) {
              throw new Error(validationResult.errors.join('; '));
            }

            coordinate = { zone, hemisphere, easting, northing };
            originalFormatted = `${zone}${hemisphere} ${easting.toFixed(2)} m ${northing.toFixed(2)} m`;

          } else if (sourceFormat === CoordinateFormat.DMS) {
            // Parse DMS format
            const latDMS = parseDMSString(value1, true);  // true = latitude
            const lonDMS = parseDMSString(value2, false); // false = longitude

            validationResult = validateDMS(latDMS, lonDMS);
            if (!validationResult.isValid) {
              throw new Error(validationResult.errors.join('; '));
            }

            coordinate = { latitude: latDMS, longitude: lonDMS };
            originalFormatted = `${value1}, ${value2}`;
          }

          // Convert to target format
          let converted = null;

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
            // Same format - no conversion
            converted = coordinate;
          } else {
            throw new Error(`Conversión no soportada: ${sourceFormat} a ${targetFormat}`);
          }

          const convertedFormatted = formatCoordinateString(converted, targetFormat);

          processedResults.push({
            index: rowNumber,
            original: originalFormatted,
            converted: convertedFormatted,
            error: null
          });
          successCount++;

        } catch (error) {
          processedResults.push({
            index: rowNumber,
            original: `${value1}, ${value2}`,
            converted: null,
            error: error.message
          });
          errorCount++;
        }
      }

      setResults(processedResults);
      setSummary({
        total: latitudes.length,
        success: successCount,
        errors: errorCount,
        message: null
      });

    } catch (error) {
      setSummary({
        total: 0,
        success: 0,
        errors: 1,
        message: 'Error al procesar: ' + error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setLatitudesText('');
    setLongitudesText('');
    setResults([]);
    setSummary(null);
  };

  const handleCopyResults = () => {
    const successResults = results.filter(r => r.converted !== null);
    const text = successResults.map(r => r.converted).join('\n');
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Conversión Masiva</h2>
        <p className="card-description">
          Convierte múltiples coordenadas pegando listas separadas por saltos de línea
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
            }}
          >
            <option value={CoordinateFormat.DD}>Decimal (DD)</option>
            <option value={CoordinateFormat.UTM}>UTM</option>
            <option value={CoordinateFormat.DMS}>Grados, Minutos, Segundos (DMS)</option>
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
              <option value={CoordinateFormat.DMS}>Grados, Minutos, Segundos (DMS)</option>
            )}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2">
        <div className="form-group">
          <label className="form-label">{labels.field1}</label>
          <textarea
            className="form-input"
            rows="10"
            placeholder={labels.placeholder1}
            value={latitudesText}
            onChange={(e) => setLatitudesText(e.target.value)}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}
          />
          <span className="form-help">
            {latitudesText.split('\n').filter(l => l.trim()).length} coordenadas
          </span>
        </div>

        <div className="form-group">
          <label className="form-label">{labels.field2}</label>
          <textarea
            className="form-input"
            rows="10"
            placeholder={labels.placeholder2}
            value={longitudesText}
            onChange={(e) => setLongitudesText(e.target.value)}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}
          />
          <span className="form-help">
            {longitudesText.split('\n').filter(l => l.trim()).length} coordenadas
          </span>
        </div>
      </div>

      <div className="flex justify-between gap-md">
        <button 
          className="btn btn-secondary"
          onClick={handleClear}
          disabled={isProcessing}
        >
          Limpiar
        </button>
        <button 
          className="btn btn-primary btn-lg"
          onClick={handleBulkConvert}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <span className="spinner"></span>
              Procesando...
            </>
          ) : (
            'Convertir Todas'
          )}
        </button>
      </div>

      {/* Summary */}
      {summary && (
        <div className={`alert ${summary.errors > 0 ? 'alert-warning' : 'alert-success'}`}>
          {summary.message ? (
            <p style={{ marginBottom: 0 }}>{summary.message}</p>
          ) : (
            <>
              <strong>Resultado del procesamiento:</strong>
              <div style={{ marginTop: '0.5rem' }}>
                <p style={{ marginBottom: '0.25rem' }}>Total: {summary.total}</p>
                <p style={{ marginBottom: '0.25rem' }}>Exitosas: {summary.success}</p>
                <p style={{ marginBottom: 0 }}>Errores: {summary.errors}</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Results Table */}
      {results.length > 0 && (
        <div>
          <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-md)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 0 }}>
              Resultados ({results.length})
            </h3>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={handleCopyResults}
            >
              Copiar Resultados
            </button>
          </div>

          <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>#</th>
                  <th>Original</th>
                  <th>Convertida</th>
                  <th style={{ width: '120px' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.index}>
                    <td>{result.index}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                      {result.original}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                      {result.converted || (
                        <span style={{ color: 'var(--color-error)', fontSize: '0.875rem' }}>
                          {result.error}
                        </span>
                      )}
                    </td>
                    <td>
                      {result.converted ? (
                        <span className="badge badge-success">Éxito</span>
                      ) : (
                        <span className="badge badge-error">Error</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default BulkConversion;
