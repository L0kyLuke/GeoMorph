# GeoMorph - Guía de Uso

Conversor profesional de coordenadas geográficas entre formatos DD, UTM y DMS.

## 🚀 Acceso

La aplicación está disponible en: **http://localhost:5173/**

## 📋 Tres Modos de Conversión

### 1. Conversión Individual

Convierte una coordenada a la vez de forma interactiva.

**Cómo usar:**
1. Selecciona el formato de origen (DD, UTM o DMS)
2. Selecciona el formato de destino
3. Ingresa los valores de la coordenada
4. Haz clic en "Convertir"

**Ejemplo - Madrid a UTM:**
- Formato origen: DD (Decimal)
- Latitud: `40.416775`
- Longitud: `-3.703790`
- Formato destino: UTM
- **Resultado**: `30T N 440291.28 m 4474254.6 m`

### 2. Conversión Masiva ⭐ NUEVO

Convierte múltiples coordenadas pegando listas separadas por saltos de línea.

**Cómo usar:**
1. Pega una lista de latitudes (una por línea) en el primer campo
2. Pega una lista de longitudes (una por línea) en el segundo campo
3. Asegúrate de que ambas listas tengan el mismo número de valores
4. Selecciona el formato de destino
5. Haz clic en "Convertir Todas"

**Ejemplo:**

**Latitudes:**
```
40.416775
41.385064
39.469907
```

**Longitudes:**
```
-3.703790
2.173404
-0.376288
```

**Características:**
- ✅ Procesa cientos de coordenadas en segundos
- ✅ Muestra tabla con resultados
- ✅ Indica errores por fila
- ✅ Botón "Copiar Resultados" para exportar
- ✅ Contador de coordenadas en tiempo real

### 3. Conversión por Excel

Procesa miles de coordenadas desde archivos Excel.

**Cómo usar:**
1. Prepara un archivo Excel (.xlsx o .xls) con tus coordenadas
2. Sube el archivo (máx. 10 MB)
3. El sistema detectará automáticamente las columnas de coordenadas
4. Confirma o ajusta el mapeo de columnas
5. Para UTM: si no hay columnas de zona/hemisferio, puedes usar valores fijos
6. Haz clic en "Procesar Conversiones"
7. Descarga el archivo con resultados

**Características:**
- ✅ Detección automática de columnas con IA
- ✅ Mapeo manual de columnas
- ✅ Valores fijos para zona UTM y hemisferio
- ✅ Barra de progreso en tiempo real
- ✅ Manejo de errores por fila (no detiene el proceso)
- ✅ Preserva todas las columnas originales
- ✅ Agrega 3 columnas: COORDENADA_ORIGINAL, COORDENADA_CONVERTIDA, ERROR

**Archivo de prueba incluido:**
- `coordenadas_prueba.xlsx` - 10 ciudades españolas

## 🗺️ Formatos Soportados

### DD (Decimal Degrees)
- **Ejemplo**: 40.416775°, -3.703790°
- **Rangos**: Latitud [-90, 90], Longitud [-180, 180]

### UTM (Universal Transverse Mercator)
- **Ejemplo**: 30T N 440291.28 m 4474254.6 m
- **Componentes**: Zona [1-60], Banda [C-X], Hemisferio [N/S], Easting, Northing
- **Datum**: WGS84

### DMS (Degrees Minutes Seconds)
- **Ejemplo**: 40° 25' 0.39" N, 3° 42' 13.64" W
- **Componentes**: Grados, Minutos, Segundos, Dirección [N/S/E/W]

## 💡 Casos de Uso

### Conversión Rápida
**Usa**: Conversión Individual

### Lista Copiada de Otro Sistema
**Usa**: Conversión Masiva
- Ideal cuando tienes listas en Excel o CSV
- Copia y pega directamente
- No necesitas formatear un archivo Excel

### Archivo Excel Grande
**Usa**: Conversión por Excel
- Procesa miles de filas
- Detección automática de columnas
- Descarga archivo procesado

## 🎯 Consejos

1. **Conversión Masiva vs Excel**: 
   - Masiva: Más rápido para < 100 coordenadas
   - Excel: Mejor para > 100 coordenadas o si necesitas mantener metadatos

2. **Formato DD**: 
   - Usa punto decimal (no coma): `40.416775` ✅ no `40,416775` ❌

3. **Separadores**: 
   - En Conversión Masiva usa saltos de línea (Enter)
   - En Excel los valores están en columnas

4. **Errores**:
   - El sistema continúa procesando incluso con errores
   - Revisa la columna ERROR en los resultados
   - Los errores más comunes: coordenadas fuera de rango, valores no numéricos

## 🧪 Datos de Prueba

### Ciudades Españolas (DD → UTM)

| Ciudad | Latitud | Longitud | UTM |
|--------|---------|----------|-----|
| Madrid | 40.416775 | -3.703790 | 30T N 440291.28 m 4474254.6 m |
| Barcelona | 41.385064 | 2.173404 | 31T N 431285.73 m 4582401.64 m |
| Valencia | 39.469907 | -0.376288 | 30S N 725764.59 m 4372395.87 m |
| Sevilla | 37.389092 | -5.984459 | 30S N 241595.99 m 4139965.94 m |

### Coordenadas Internacionales

| Lugar | Latitud | Longitud |
|-------|---------|----------|
| Quito, Ecuador | -0.180653 | -78.467838 |
| Buenos Aires | -34.603722 | -58.381592 |
| Ciudad de México | 19.432608 | -99.133209 |

## 🔧 Soporte Técnico

- Todos los cálculos usan el datum **WGS84**
- Procesamiento 100% en el navegador (sin enviar datos a servidor)
- Soporta archivos Excel hasta 10 MB
- Advertencia para archivos > 50,000 filas

## 📊 Características Avanzadas

- **Validación en tiempo real**: Detecta errores antes de convertir
- **Mensajes en español**: Todos los errores están localizados
- **Precisión configurable**: Los decimales se pueden ajustar
- **Responsive**: Funciona en escritorio y tablet
- **Accesible**: Navegación por teclado y compatible con lectores de pantalla
