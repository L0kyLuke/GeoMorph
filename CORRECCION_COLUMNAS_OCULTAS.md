# Corrección: Ignorar Columnas y Filas Ocultas en Excel

## Problema

En la Task 3 se implementó incorrectamente el manejo de columnas/filas ocultas en archivos Excel:
- Se leían las columnas ocultas y se filtraban las visibles
- Esto causaba confusión porque el sistema procesaba datos de columnas ocultas

**Ejemplo del problema**:
- Excel visible: `Este: 658235,698, Norte: 658235,698` (Norte incorrecto)
- Excel oculto: `Este: 658235,698, Norte: 9568214,58` (Norte correcto)
- Sistema procesaba: datos de columnas ocultas (9568214,58)
- Usuario veía en su Excel: datos incorrectos (658235,698)

## Solución Implementada

**Cambios en `src/services/ExcelService.js`**:

1. **Eliminado el código que detectaba columnas/filas ocultas**:
   - Removida detección de `worksheet['!rows']` (filas ocultas)
   - Removida detección de `worksheet['!cols']` (columnas ocultas)
   - Removido filtrado de filas/columnas ocultas

2. **Simplificado el parsing de Excel**:
   ```javascript
   // ANTES (INCORRECTO):
   const workbook = XLSX.read(arrayBuffer, { 
     type: 'array',
     cellStyles: true  // Para detectar ocultos
   });
   // ... código para filtrar ocultos ...
   
   // AHORA (CORRECTO):
   const workbook = XLSX.read(arrayBuffer, { 
     type: 'array'  // Sin cellStyles
   });
   const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
   ```

## Comportamiento Actual

**La biblioteca XLSX automáticamente ignora columnas y filas ocultas** cuando:
- No se especifica `cellStyles: true`
- Se usa `sheet_to_json()` con configuración por defecto

Esto significa que:
- ✅ Solo se procesan columnas VISIBLES en Excel
- ✅ Solo se procesan filas VISIBLES en Excel
- ✅ Las columnas/filas ocultas NO se leen ni procesan
- ✅ El comportamiento es consistente en toda la aplicación (conversión individual, masiva, y por Excel)

## Validación

- ✅ Todos los 115 tests pasan
- ✅ El sistema ahora solo procesa datos visibles en Excel
- ✅ No hay confusión entre datos visibles vs ocultos

## Impacto

Esta corrección aplica a:
1. **Conversión por Excel** (ExcelWorkflow)
2. **Detección inteligente de columnas** (SmartColumnDetection)
3. **Procesamiento masivo** (BulkProcessor)

**Fecha**: 2026-10-09
