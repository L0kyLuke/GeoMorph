import { useState } from 'react';
import { CoordinateFormat } from '../models/ConversionConfig.js';
import { convertDDtoUTM, convertDDtoDMS, convertUTMtoDD, convertUTMtoDMS, convertDMStoDD, convertDMStoUTM } from '../services/ConversionEngine.js';
import { validateDD, validateUTM, validateDMS } from '../services/ValidationService.js';
import { formatCoordinateString } from '../utils/CoordinateFormatter.js';

function ConversionForm() {
  const [sourceFormat, setSourceFormat] = useState(CoordinateFormat.DD);
  const [targetFormat, setTargetFormat] = useState(CoordinateFormat.UTM);
  
  // DD inputs
  const [ddLatitude, setDdLatitude] = useState('');
  const [ddLongitude, setDdLongitude] = useState('');
  
  // UTM inputs
  const [utmZone, setUtmZone] = useState('');
  const [utmHemisphere, setUtmHemisphere] = useState('N');
  const [utmEasting, setUtmEasting] = useState('');
  const [utmNorthing, setUtmNorthing] = useState('');
  
  // DMS inputs
  const [dmsLatDegrees, setDmsLatDegrees] = useState('');
  const [dmsLatMinutes, setDmsLatMinutes] = useState('');
  const [dmsLatSeconds, setDmsLatSeconds] = useState('');
  const [dmsLatDirection, setDmsLatDirection] = useState('N');
  const [dmsLonDegrees, setDmsLonDegrees] = useState('');
  const [dmsLonMinutes, setDmsLonMinutes] = useState('');
  const [dmsLonSeconds, setDmsLonSeconds] = useState('');
  const [dmsLonDirection, setDmsLonDirection] = useState('E');
  
  // Results and errors
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState([]);
  const [isConverting, setIsConverting] = useState(false);

  const handleConvert = () => {
    setIsConverting(true);
    setErrors([]);
    setResult(null);

    try {
      let coordinate = null;
      let validationResult = null;

      // Build and validate source coordinate
      if (sourceFormat === CoordinateFormat.DD) {
        // Check for empty fields first
        if (ddLatitude === '' || ddLongitude === '' || ddLatitude === null || ddLongitude === null) {
          setErrors(['Por favor, ingresa valores de latitud y longitud']);
          setIsConverting(false);
          return;
        }
        
        const lat = parseFloat(ddLatitude);
        const lon = parseFloat(ddLongitude);
        
        // Check for NaN after parsing
        if (isNaN(lat) || isNaN(lon)) {
          setErrors(['Los valores de latitud y longitud deben ser números válidos']);
          setIsConverting(false);
          return;
        }
        
        // Additional check for infinite numbers
        if (!isFinite(lat) || !isFinite(lon)) {
          setErrors(['Los valores de latitud y longitud deben ser números finitos']);
          setIsConverting(false);
          return;
        }
        
        coordinate = {
          latitude: lat,
          longitude: lon
        };
        validationResult = validateDD(coordinate.latitude, coordinate.longitude);
      } else if (sourceFormat === CoordinateFormat.UTM) {
        // Check for empty fields first
        if (utmZone === '' || utmEasting === '' || utmNorthing === '' || 
            utmZone === null || utmEasting === null || utmNorthing === null) {
          setErrors(['Por favor, completa todos los campos requeridos']);
          setIsConverting(false);
          return;
        }
        
        const zone = parseInt(utmZone, 10);
        const easting = parseFloat(utmEasting);
        const northing = parseFloat(utmNorthing);
        
        // Check for NaN after parsing
        if (isNaN(zone) || isNaN(easting) || isNaN(northing)) {
          setErrors(['Todos los valores deben ser números válidos']);
          setIsConverting(false);
          return;
        }
        
        coordinate = {
          zone: zone,
          hemisphere: utmHemisphere,
          easting: easting,
          northing: northing
        };
        validationResult = validateUTM(coordinate.zone, coordinate.hemisphere, coordinate.easting, coordinate.northing);
      } else if (sourceFormat === CoordinateFormat.DMS) {
        // Check for empty fields first
        if (dmsLatDegrees === '' || dmsLatMinutes === '' || dmsLatSeconds === '' || 
            dmsLonDegrees === '' || dmsLonMinutes === '' || dmsLonSeconds === '' ||
            dmsLatDegrees === null || dmsLatMinutes === null || dmsLatSeconds === null ||
            dmsLonDegrees === null || dmsLonMinutes === null || dmsLonSeconds === null) {
          setErrors(['Por favor, completa todos los campos requeridos']);
          setIsConverting(false);
          return;
        }
        
        const latDeg = parseInt(dmsLatDegrees, 10);
        const latMin = parseInt(dmsLatMinutes, 10);
        const latSec = parseFloat(dmsLatSeconds);
        const lonDeg = parseInt(dmsLonDegrees, 10);
        const lonMin = parseInt(dmsLonMinutes, 10);
        const lonSec = parseFloat(dmsLonSeconds);
        
        // Check for NaN after parsing
        if (isNaN(latDeg) || isNaN(latMin) || isNaN(latSec) || 
            isNaN(lonDeg) || isNaN(lonMin) || isNaN(lonSec)) {
          setErrors(['Todos los valores deben ser números válidos']);
          setIsConverting(false);
          return;
        }
        
        coordinate = {
          latitude: {
            degrees: latDeg,
            minutes: latMin,
            seconds: latSec,
            direction: dmsLatDirection
          },
          longitude: {
            degrees: lonDeg,
            minutes: lonMin,
            seconds: lonSec,
            direction: dmsLonDirection
          }
        };
        validationResult = validateDMS(coordinate.latitude, coordinate.longitude);
      }

      if (!validationResult.isValid) {
        setErrors(validationResult.errors);
        setIsConverting(false);
        return;
      }

      // Perform conversion
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
        // Same format - no conversion needed
        converted = coordinate;
      }

      if (converted) {
        const formattedResult = formatCoordinateString(converted, targetFormat);
        setResult(formattedResult);
      }
    } catch (error) {
      setErrors(['Error al convertir: ' + error.message]);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Conversión Individual</h2>
        <p className="card-description">Convierte coordenadas entre formatos DD, UTM y DMS</p>
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

      {/* DD Input Fields */}
      {sourceFormat === CoordinateFormat.DD && (
        <div className="grid grid-cols-2">
          <div className="form-group">
            <label className="form-label">Latitud</label>
            <input 
              type="number"
              step="any"
              className="form-input"
              placeholder="ej. 40.416775"
              value={ddLatitude}
              onChange={(e) => setDdLatitude(e.target.value)}
            />
            <span className="form-help">Rango: -90 a 90</span>
          </div>
          <div className="form-group">
            <label className="form-label">Longitud</label>
            <input 
              type="number"
              step="any"
              className="form-input"
              placeholder="ej. -3.703790"
              value={ddLongitude}
              onChange={(e) => setDdLongitude(e.target.value)}
            />
            <span className="form-help">Rango: -180 a 180</span>
          </div>
        </div>
      )}

      {/* UTM Input Fields */}
      {sourceFormat === CoordinateFormat.UTM && (
        <>
          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Zona UTM</label>
              <input 
                type="number"
                className="form-input"
                placeholder="ej. 30"
                value={utmZone}
                onChange={(e) => setUtmZone(e.target.value)}
              />
              <span className="form-help">Rango: 1 a 60</span>
            </div>
            <div className="form-group">
              <label className="form-label">Hemisferio</label>
              <select 
                className="form-select"
                value={utmHemisphere}
                onChange={(e) => setUtmHemisphere(e.target.value)}
              >
                <option value="N">Norte (N)</option>
                <option value="S">Sur (S)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Easting (m)</label>
              <input 
                type="number"
                step="any"
                className="form-input"
                placeholder="ej. 440291"
                value={utmEasting}
                onChange={(e) => setUtmEasting(e.target.value)}
              />
              <span className="form-help">Rango: 100,000 a 900,000</span>
            </div>
            <div className="form-group">
              <label className="form-label">Northing (m)</label>
              <input 
                type="number"
                step="any"
                className="form-input"
                placeholder="ej. 4474254"
                value={utmNorthing}
                onChange={(e) => setUtmNorthing(e.target.value)}
              />
              <span className="form-help">Rango: 0 a 10,000,000</span>
            </div>
          </div>
        </>
      )}

      {/* DMS Input Fields */}
      {sourceFormat === CoordinateFormat.DMS && (
        <>
          <div className="form-group">
            <label className="form-label">Latitud</label>
            <div className="grid grid-cols-3">
              <div>
                <input 
                  type="number"
                  className="form-input"
                  placeholder="Grados"
                  value={dmsLatDegrees}
                  onChange={(e) => setDmsLatDegrees(e.target.value)}
                />
                <span className="form-help">Grados (0-90)</span>
              </div>
              <div>
                <input 
                  type="number"
                  className="form-input"
                  placeholder="Minutos"
                  value={dmsLatMinutes}
                  onChange={(e) => setDmsLatMinutes(e.target.value)}
                />
                <span className="form-help">Minutos (0-59)</span>
              </div>
              <div>
                <input 
                  type="number"
                  step="any"
                  className="form-input"
                  placeholder="Segundos"
                  value={dmsLatSeconds}
                  onChange={(e) => setDmsLatSeconds(e.target.value)}
                />
                <span className="form-help">Segundos (0-59.999)</span>
              </div>
            </div>
            <div className="form-group mt-sm">
              <select 
                className="form-select"
                value={dmsLatDirection}
                onChange={(e) => setDmsLatDirection(e.target.value)}
              >
                <option value="N">Norte (N)</option>
                <option value="S">Sur (S)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Longitud</label>
            <div className="grid grid-cols-3">
              <div>
                <input 
                  type="number"
                  className="form-input"
                  placeholder="Grados"
                  value={dmsLonDegrees}
                  onChange={(e) => setDmsLonDegrees(e.target.value)}
                />
                <span className="form-help">Grados (0-180)</span>
              </div>
              <div>
                <input 
                  type="number"
                  className="form-input"
                  placeholder="Minutos"
                  value={dmsLonMinutes}
                  onChange={(e) => setDmsLonMinutes(e.target.value)}
                />
                <span className="form-help">Minutos (0-59)</span>
              </div>
              <div>
                <input 
                  type="number"
                  step="any"
                  className="form-input"
                  placeholder="Segundos"
                  value={dmsLonSeconds}
                  onChange={(e) => setDmsLonSeconds(e.target.value)}
                />
                <span className="form-help">Segundos (0-59.999)</span>
              </div>
            </div>
            <div className="form-group mt-sm">
              <select 
                className="form-select"
                value={dmsLonDirection}
                onChange={(e) => setDmsLonDirection(e.target.value)}
              >
                <option value="E">Este (E)</option>
                <option value="W">Oeste (W)</option>
              </select>
            </div>
          </div>
        </>
      )}

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div className="alert alert-error">
          <strong>Errores de validación:</strong>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Conversion Result */}
      {result && (
        <div className="alert alert-success">
          <strong>Resultado:</strong>
          <p style={{ marginTop: '0.5rem', marginBottom: 0, fontSize: '1.125rem', fontFamily: 'var(--font-mono)' }}>
            {result}
          </p>
        </div>
      )}

      {/* Convert Button */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <button 
          className="btn btn-primary btn-lg"
          onClick={handleConvert}
          disabled={isConverting}
          style={{ width: '100%' }}
        >
          {isConverting ? (
            <>
              <span className="spinner"></span>
              Convirtiendo...
            </>
          ) : (
            'Convertir'
          )}
        </button>
      </div>
    </div>
  );
}

export default ConversionForm;
