# Filtrado de Filas y Columnas Ocultas en Excel

## Resumen

El sistema ahora **ignora automáticamente** filas, columnas y celdas ocultas al leer archivos Excel.

## ¿Qué se Ignora?

### ✅ Filas Ocultas
Si ocultas filas en Excel (clic derecho → Ocultar), el sistema:
- NO las lee
- NO las procesa
- NO las incluye en el conteo de filas
- NO aparecen en el resultado

### ✅ Columnas Ocultas
Si ocultas columnas en Excel (clic derecho → Ocultar), el sistema:
- NO las lee
- NO las incluye en los headers
- NO las detecta para mapping
- NO aparecen en el resultado

### ✅ Celdas en Filas/Columnas Ocultas
Si una celda está en una fila o columna oculta:
- Se ignora completamente
- No afecta la detección de columnas
- No se procesa ni convierte

## Casos de Uso

### 1. Ocultar Columnas de Cálculos Intermedios
Si tu Excel tiene columnas con fórmulas intermedias (A1, A2, J2, etc.) que no quieres procesar:

**Antes del cambio:**
```
Este | Norte | A1 | A2 | J2 | Latitud | Longitud
→ Procesaba TODAS las columnas (confuso)
```

**Después del cambio:**
```
Ocultas A1, A2, J2 en Excel
Este | Norte | [A1 oculta] | [A2 oculta] | [J2 oculta] | Latitud | Longitud
→ Solo procesa: Este | Norte | Latitud | Longitud
```

### 2. Ocultar Filas de Prueba o Datos Incorrectos
Si tienes filas con datos de prueba o erróneos:

**Antes:**
```
Fila 1: 658235,698 | 9568214,580 ✓
Fila 2: 999999,999 | 8888888,888 (dato de prueba)
Fila 3: 658235,698 | 9568214,580 ✓
→ Procesaba las 3 filas (incluido el dato erróneo)
```

**Después:**
```
Ocultas la Fila 2 en Excel
Fila 1: 658235,698 | 9568214,580 ✓
Fila 2: [oculta]
Fila 3: 658235,698 | 9568214,580 ✓
→ Solo procesa Fila 1 y Fila 3
```

### 3. Preparar Excel para Procesamiento
Puedes preparar tu Excel ocultando:
- Filas de encabezados secundarios
- Columnas auxiliares
- Filas con fórmulas que no contienen datos reales
- Columnas de notas o comentarios

## Cómo Funciona Técnicamente

### Lectura de Propiedades de Excel

```javascript
// Se lee el Excel con información de estilos
const workbook = XLSX.read(arrayBuffer, { 
  type: 'array',
  cellStyles: true  // ← Activa lectura de propiedades
});

// Excel guarda información de filas ocultas
worksheet['!rows'] = [
  { hidden: false },  // Fila 0 visible
  { hidden: true },   // Fila 1 oculta
  { hidden: false },  // Fila 2 visible
  ...
]

// Excel guarda información de columnas ocultas
worksheet['!cols'] = [
  { hidden: false },  // Columna A visible
  { hidden: true },   // Columna B oculta
  { hidden: false },  // Columna C visible
  ...
]
```

### Filtrado Automático

```javascript
// 1. Detectar filas ocultas
const hiddenRows = new Set();
worksheet['!rows'].forEach((rowInfo, rowIndex) => {
  if (rowInfo && rowInfo.hidden) {
    hiddenRows.add(rowIndex);
  }
});

// 2. Detectar columnas ocultas
const hiddenCols = new Set();
worksheet['!cols'].forEach((colInfo, colIndex) => {
  if (colInfo && colInfo.hidden) {
    hiddenCols.add(colIndex);
  }
});

// 3. Filtrar datos
const jsonData = jsonDataRaw
  .map((row, rowIndex) => {
    if (hiddenRows.has(rowIndex)) return null;  // Ignorar fila oculta
    return row.filter((cell, colIndex) => !hiddenCols.has(colIndex));  // Ignorar columnas ocultas
  })
  .filter(row => row !== null);
```

## Ejemplo Práctico

### Excel Original (con elementos ocultos)

```
     A          B (oculta)  C          D (oculta)  E
1    Este       A1          Norte      A2          Banda
2    658235,698 123.45      9568214,58 456.78      M
3 (oculta) 999999 999.99    8888888    888.88      X
4    658235,698 123.45      9568214,58 456.78      M
```

### Lo Que Lee el Sistema

```
     A          C          E
1    Este       Norte      Banda
2    658235,698 9568214,58 M
4    658235,698 9568214,58 M

Total: 2 filas de datos (la fila 3 oculta fue ignorada)
Columnas: A, C, E (B y D ocultas fueron ignoradas)
```

### Resultado de la Conversión

```
Este (UTM)  | Norte (UTM)  | Zona UTM | Latitud decimal | Longitud decimal
658235,698  | 9568214,580  | 17S      | -3.90522469     | -79.57483494
658235,698  | 9568214,580  | 17S      | -3.90522469     | -79.57483494

2 filas procesadas (fila oculta ignorada)
```

## Ventajas

1. **Control total** - Decides qué se procesa ocultando elementos en Excel
2. **Sin modificar datos** - No necesitas eliminar columnas o filas
3. **Reversible** - Puedes mostrar/ocultar elementos fácilmente
4. **Más limpio** - Solo procesas lo que necesitas
5. **Flexible** - Puedes preparar diferentes "vistas" del mismo archivo

## Cómo Ocultar en Excel

### Ocultar Filas:
1. Selecciona las filas (clic en número de fila)
2. Clic derecho → "Ocultar"
3. Las filas quedan ocultas (se salta la numeración)

### Ocultar Columnas:
1. Selecciona las columnas (clic en letra de columna)
2. Clic derecho → "Ocultar"
3. Las columnas quedan ocultas (se salta la letra)

### Mostrar de Nuevo:
1. Selecciona las filas/columnas alrededor del elemento oculto
2. Clic derecho → "Mostrar"

## Notas Importantes

⚠️ **Hojas Ocultas**: Por ahora solo se procesa la primera hoja visible del workbook. Hojas completamente ocultas son ignoradas.

⚠️ **Validación**: El sistema sigue validando que haya al menos 2 filas visibles (headers + 1 fila de datos mínimo).

✅ **Compatibilidad**: Funciona con archivos .xlsx y .xls que tengan información de formato guardada.

## Archivo Modificado

- `src/services/ExcelService.js` - Líneas 52-90
  - Agregado: `cellStyles: true` en opciones de lectura
  - Agregado: Detección de filas ocultas (`worksheet['!rows']`)
  - Agregado: Detección de columnas ocultas (`worksheet['!cols']`)
  - Agregado: Filtrado de datos antes de procesamiento

---

**Estado**: ✅ Implementado y funcionando  
**Compatibilidad**: .xlsx, .xls  
**Impacto**: Automático, no requiere configuración del usuario
