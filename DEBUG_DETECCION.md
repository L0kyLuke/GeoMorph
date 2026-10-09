# Debug: Detección de Columnas DD

## Problema Actual

- Columna AG (índice 32): "Latitud" → ✅ Detectada
- Columna AH (índice 33): "Longitud" → ❌ NO detectada

## Pasos para Diagnosticar

### 1. Abrir DevTools en el Navegador
- Presiona **F12** o clic derecho → Inspeccionar
- Ve a la pestaña **Console**

### 2. Subir el Archivo Excel
- Sube tu archivo `conversor_coordenadas (1).xlsx`
- Observa los mensajes en consola que empiezan con `[SmartDetect]`

### 3. Buscar Esta Información

Deberías ver algo como:
```
[SmartDetect] Final column types: {
  32: { type: 'DD_LAT', confidence: 0.95, count: 27 },
  33: { type: 'DD_LAT', confidence: 0.95, count: 27 }  ← Problema: debería ser DD_LON
}
[SmartDetect] Headers: [..., 'Latitud', 'Longitud', ...]
```

## Causas Posibles

### Causa 1: Ambos Valores en Rango -90 a 90
Si tanto latitud como longitud están en el rango -90 a 90:
- Latitud: `-3,90522469` ✓ (entre -90 y 90)
- Longitud: `-79,57483494` ✓ (también entre -90 y 90)

El sistema puede confundirse y clasificar ambas como latitud.

### Causa 2: Columnas Ocultas Afectando Índices
Si hay muchas columnas ocultas entre AG y AH, los índices pueden estar desfasados.

## Solución Implementada

He agregado 3 niveles de resolución:

### Nivel 1: Análisis de Valores
```javascript
// Latitud: -90 a 90 con decimales → DD_LAT (confianza 0.95)
// Longitud: fuera de -90 a 90 O muchos decimales → DD_LON (confianza 0.95)
```

### Nivel 2: Boost por Headers
```javascript
// Si header contiene "latitud" → +15% confianza para DD_LAT
// Si header contiene "longitud" → +15% confianza para DD_LON
```

### Nivel 3: Resolución de Ambigüedad
```javascript
// Si 2 columnas clasificadas como DD_LAT:
//   1. Buscar header con "longitud" → reclasificar como DD_LON
//   2. Si no, tomar la columna más a la derecha → reclasificar como DD_LON
```

## ¿Qué Deberías Ver Ahora?

Después de mis cambios, en la consola deberías ver:
```
[SmartDetect] Reclassified column 33 (Longitud) from LAT to LON based on position
[SmartDetect] Final column types: {
  32: { type: 'DD_LAT', confidence: 0.95 },
  33: { type: 'DD_LON', confidence: 0.90 }  ← Corregido
}
```

Y en la UI:
```
✓ Columnas detectadas automáticamente
Confianza: 92%
Latitud: Latitud
Longitud: Longitud  ← Ahora debería aparecer
```

## Si Aún No Funciona

Por favor copia y pega aquí los mensajes de la consola que empiezan con `[SmartDetect]` para que pueda ver exactamente qué está detectando el sistema.
