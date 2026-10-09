# GeoMorph - Conversor de Coordenadas

GeoMorph es una aplicación web profesional para la conversión de coordenadas geográficas entre tres formatos: Decimal Degrees (DD), UTM (Universal Transverse Mercator) y Degrees Minutes Seconds (DMS/GMS).

## Características

- ✅ Conversión individual de coordenadas entre DD, UTM y DMS
- ✅ Procesamiento masivo de archivos Excel con detección inteligente de columnas
- ✅ Validación completa de entradas con mensajes en español
- ✅ Procesamiento del lado del cliente para privacidad de datos
- ✅ Interfaz moderna y minimalista

## Tecnologías

- **React 18** - Framework UI
- **Vite** - Build tool y dev server
- **XLSX** - Procesamiento de archivos Excel
- **FileSaver.js** - Descarga de archivos
- **Vitest** - Framework de testing

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Ejecutar tests
npm test
```

## Estructura del Proyecto

```
src/
├── components/     # Componentes React de UI
├── services/       # Lógica de negocio (ConversionEngine, ValidationService, ExcelService)
├── utils/          # Funciones utilitarias y parsers
├── models/         # Modelos de datos y tipos
└── test/           # Configuración de tests
```

## Uso

### Conversión Individual

1. Selecciona el formato de origen (DD, UTM o DMS)
2. Ingresa los valores de coordenadas
3. Selecciona el formato de destino
4. Haz clic en "Convertir"

### Procesamiento Masivo

1. Sube un archivo Excel (.xlsx o .xls)
2. Confirma o ajusta las columnas detectadas automáticamente
3. Haz clic en "Procesar"
4. Descarga el archivo con los resultados

## Licencia

MIT
