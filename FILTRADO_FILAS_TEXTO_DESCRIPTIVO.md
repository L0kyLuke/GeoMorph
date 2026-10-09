# Corrección: Filtrado Estricto de Filas con Coordenadas Válidas

## Problema Identificado

El archivo Excel contenía 27 filas con estas características:

**Filas con coordenadas válidas (10 filas):**
```
Este (UTM)      Norte (UTM)
658235,698      9568214,58
658235,698      9568214,58
... (10 filas con AMBOS valores UTM válidos)
```

**Filas con texto descriptivo (17 filas):**
```
Este (UTM)              Norte (UTM)
DATUM WGS84             658235,698          <- Solo Este tiene número
a (semieje mayor)       6378137             <- Este fuera de rango UTM
b (semieje menor)       6356752,31          <- Norte vacío
658235,698              9568214,58          <- VÁLIDA
Excentricidad           0,08181919          <- Este no numérico
www.acolita.com         658235,698          <- Este no numérico
```

El sistema anterior intentaba validar cada columna individualmente, pero las filas como "DATUM WGS84" tienen un valor numérico en la columna Este (`658235,698`) aunque no tienen un valor válido en Norte, o tienen texto en Este pero número en Norte.

**Resultado anterior**: 15 conversiones exitosas, 12 errores

## Solución Implementada

Validación **estricta en AMBAS columnas simultáneamente**:

### Para Coordenadas UTM:

1. **Ambas columnas deben existir y no estar vacías** (Este Y Norte)
2. **Ambos valores deben ser números válidos** (no texto como "DATUM WGS84")
3. **Este debe estar en rango UTM**: 100,000 a 900,000 metros
4. **Norte debe estar en rango UTM**: 0 a 10,000,000 metros

**Filas que se rechazan ahora:**
- `"DATUM WGS84", "658235,698"` → Este no es número
- `"a (semieje mayor)", "6378137"` → Este fuera de rango (> 900,000)
- `"Excentricidad", "0,08181919"` → Este no es número
- `"www.acolita.com", "658235,698"` → Este no es número
- Cualquier fila donde Norte esté vacío o sea texto

### Para Coordenadas DD (Decimal Degrees):

1. **Ambas columnas deben existir y no estar vacías** (Latitud Y Longitud)
2. **Ambos valores deben ser números válidos**
3. **Ambos deben tener separador decimal** (. o ,)
4. **Latitud debe estar en rango**: -90 a 90
5. **Longitud debe estar en rango**: -180 a 180

## Resultado Esperado

Con el archivo del usuario:
- **Filas cargadas**: ~10 (solo las que tienen AMBOS valores UTM válidos)
- **Conversiones exitosas**: 10
- **Errores**: 0

Las 17 filas con texto descriptivo o valores incompletos se filtran automáticamente.

## Archivos Modificados

- `src/services/ExcelService.js`
  - Validación estricta para UTM: verifica que AMBAS columnas (Este Y Norte) tengan valores numéricos en rango UTM
  - Validación estricta para DD: verifica que AMBAS columnas (Lat Y Lon) tengan valores decimales en rango DD
  - Eliminada función `isCoordinateLike()` (demasiado permisiva)

## Tests

✅ Todas las pruebas pasan (115/115)
