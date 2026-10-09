# Corrección: Detección de Columnas Específica por Formato

## Problema Identificado

Cuando el archivo Excel contenía columnas duplicadas con el mismo nombre de encabezado ("Latitud", "Longitud") pero en diferentes formatos:
- **Posición 3-4**: Latitud/Longitud en formato DD (grados decimales): `-3,90522469`, `-79,57483494`
- **Posición 5-6**: Latitud/Longitud en formato DMS (grados-minutos-segundos): `3º 54' 18,809" S`, `79º 34' 29,406" W`

El sistema detectaba primero las columnas DMS (más específicas), por lo que cuando el usuario seleccionaba el formato DD, el sistema usaba las columnas incorrectas.

## Solución Implementada

Se modificó el sistema de detección para que sea **específico por formato**. Ahora, cuando el usuario selecciona un formato en el selector:

### 1. Detección con Filtro de Formato (`SmartColumnDetection.js`)

- Se agregó el parámetro `formatFilter` a la función `analyzeValue()` y `smartDetectColumns()`
- Cuando `formatFilter = 'DD'`:
  - **Solo detecta** valores decimales con punto o coma decimal
  - **Ignora** patrones DMS (grados° minutos' segundos")
- Cuando `formatFilter = 'UTM'`:
  - **Solo detecta** valores de Easting, Northing, Zona, Hemisferio
  - **Ignora** patrones DD y DMS
- Cuando `formatFilter = 'DMS'`:
  - **Solo detecta** patrones con formato `3º 54' 18,809" S`
  - **Ignora** valores decimales puros

### 2. Re-detección al Cambiar Formato (`ExcelWorkflow.jsx`)

Cuando el usuario cambia el selector de "Formato de Origen":

1. El sistema convierte los datos de vuelta a formato array-of-arrays
2. Re-ejecuta `smartDetectColumns()` con el filtro de formato correspondiente
3. Actualiza el mapeo de columnas con las columnas correctas para ese formato
4. Actualiza la confianza de detección

### 3. Eliminación de Debug Logs

Se eliminaron los `console.log()` de depuración que ya no son necesarios:
- `BulkProcessor.js`: logs de extracción de coordenadas
- `SmartColumnDetection.js`: logs de reclasificación y tipos finales

## Resultado

Ahora el sistema funciona correctamente cuando hay columnas duplicadas:

1. **Usuario selecciona "Decimal (DD)"** → Sistema detecta columnas `-3,90522469`, `-79,57483494`
2. **Usuario selecciona "DMS"** → Sistema detecta columnas `3º 54' 18,809" S`, `79º 34' 29,406" W`
3. **Usuario selecciona "UTM"** → Sistema detecta columnas de Este, Norte, Zona, Hemisferio

## Archivos Modificados

1. `src/services/SmartColumnDetection.js`
   - Agregado parámetro `formatFilter` a `analyzeValue()` y `smartDetectColumns()`
   - Lógica de filtrado por formato (DD solo detecta decimales, ignora DMS)
   
2. `src/components/ExcelWorkflow.jsx`
   - Modificado onChange del selector "Formato de Origen"
   - Re-detección de columnas con filtro específico al cambiar formato
   
3. `src/services/BulkProcessor.js`
   - Eliminados logs de depuración

## Tests

✅ Todas las pruebas pasan (115/115)
