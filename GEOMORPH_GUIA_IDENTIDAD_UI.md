# GEOMORPH — Guía de identidad visual y sistema de diseño UI

**Versión:** 1.0 · **Destino:** implementación por Codex · **Producto:** aplicación para conversión de coordenadas y sistemas de referencia espacial (CRS).

## 1. Objetivo de marca

GEOMORPH debe transmitir **precisión geoespacial, fiabilidad, claridad y tecnología profesional**. El resultado esperado es un software técnico de alta calidad: funcional, sobrio y reconocible. La personalidad es **precisa, competente, calmada, contemporánea y rigurosa**, nunca futurista de ciencia ficción.

**Principios:**
1. Primero, la lectura y exactitud de los datos; después, la decoración.
2. Blanco y azul marino como base; azul vivo solo donde crea jerarquía o marca.
3. Tipografía clara y alineaciones matemáticamente limpias.
4. Un sistema consistente en todas las pantallas y estados.
5. Ningún cambio estético puede alterar el cálculo, la semántica de las coordenadas o la lógica existente.

**No negociables:** fondo predominantemente blanco; solo colores planos; sin degradados, glassmorphism, neones, brillos, texturas o sombras vistosas; sin iconos cartográficos cliché añadidos al logotipo; sin rediseñar arbitrariamente los flujos operativos.

## 2. Logotipo y uso

El logotipo oficial es el **wordmark `GEOMORPH`**, con el símbolo de referencia/coordenadas integrado en la **primera O**. La versión principal usa texto azul marino y O simbólica azul vivo sobre fondo blanco.

- Usar **el recurso gráfico proporcionado**. No reconstruirlo con una fuente genérica, texto HTML o un emoji. No separar ni mover el símbolo a la izquierda del nombre.
- Si el logo disponible es PNG con márgenes blancos amplios, preparar una copia recortada para uso en interfaz **sin alterar las letras ni el símbolo**. No aplicar filtros CSS para recolorearlo.
- No confundir un PNG con un vector: para producción de máxima calidad conviene preparar posteriormente un **SVG maestro auténtico**, revisado ópticamente, con tintas planas y sin gradientes.
- Posición preferida: esquina superior izquierda de la cabecera, sobre blanco. Altura visible aproximada: **28–36 px** en escritorio y **24–30 px** en móvil. Mantener proporciones y espacio de seguridad mínimo equivalente a ~½ altura de las letras. Adaptar el ancho en función del recurso real.
- Favicons y avatares: no inventar un isotipo independiente. Si se necesita una versión compacta, debe derivarse cuidadosamente de la propia O integrada, como variante de sistema y no sustitución del logotipo principal.
- No colocar texto encima del logotipo, ni recrearlo con efectos, contornos, sombras o degradados.

> **Nota de precisión:** los colores de abajo se normalizan como **valores de tinta plana** coherentes con el logotipo rasterizado de referencia. Si en el futuro existe un SVG maestro oficial con colores especificados, ese master debe prevalecer y los tokens se actualizarán de forma centralizada.

## 3. Paleta de identidad

### 3.1. Colores principales

| Token semántico | HEX | Función |
|---|---|---|
| `--gm-brand-logo` | `#0075FE` | Azul vivo del isotipo integrado, marca, acentos gráficos no textuales |
| `--gm-brand-action` | `#0065E0` | Botones primarios, enlaces, controles interactivos y foco |
| `--gm-brand-action-hover` | `#0055BD` | Hover/pressed de acciones primarias, según estado |
| `--gm-brand-subtle` | `#EAF3FF` | Selección suave, superficies informativas y highlights |
| `--gm-ink` | `#192839` | Texto principal, encabezados, navegación; marino del wordmark |
| `--gm-text-secondary` | `#536379` | Ayuda, metadatos y etiquetas secundarias |
| `--gm-text-muted` | `#637287` | Descripciones menores; no usar en texto sobre tonos más oscuros sin verificar contraste |
| `--gm-canvas` | `#F7F9FC` | Fondo exterior de la aplicación |
| `--gm-surface` | `#FFFFFF` | Cards, formularios, paneles, cabecera |
| `--gm-surface-muted` | `#F1F5F9` | Agrupación de campos, bloques de lectura, tablas alternas opcionales |
| `--gm-border` | `#C7D0DC` | Separadores decorativos, líneas suaves que no definen por sí solas un control |
| `--gm-border-control` | `#7B8797` | Bordes de inputs y controles que deben distinguirse del fondo |
| `--gm-success` | `#166A45` | Confirmación real de una operación |
| `--gm-warning` | `#8A4B0F` | Avisos relevantes, precisión, ambigüedad de CRS o validaciones no bloqueantes |
| `--gm-error` | `#B42318` | Error de campo, conversión fallida, estado destructivo |

### 3.2. Variables CSS de referencia

Implementar estos tokens en la arquitectura **ya utilizada por el proyecto** (CSS variables, tema Tailwind, tokens del sistema de componentes, etc.). No mantener dos sistemas paralelos.

```css
:root {
  --gm-brand-logo: #0075FE;
  --gm-brand-action: #0065E0;
  --gm-brand-action-hover: #0055BD;
  --gm-brand-subtle: #EAF3FF;
  --gm-ink: #192839;
  --gm-text-secondary: #536379;
  --gm-text-muted: #637287;
  --gm-canvas: #F7F9FC;
  --gm-surface: #FFFFFF;
  --gm-surface-muted: #F1F5F9;
  --gm-border: #C7D0DC;
  --gm-border-control: #7B8797;
  --gm-success: #166A45;
  --gm-warning: #8A4B0F;
  --gm-error: #B42318;

  --gm-radius-sm: 6px;
  --gm-radius-md: 8px;
  --gm-radius-lg: 12px;
  --gm-space-1: 4px;
  --gm-space-2: 8px;
  --gm-space-3: 12px;
  --gm-space-4: 16px;
  --gm-space-6: 24px;
  --gm-space-8: 32px;
  --gm-control-height: 44px;
  --gm-focus-ring: 2px solid var(--gm-brand-action);
}
```

**Reglas:**
- Azul vivo de logo `#0075FE` **no** es color por defecto de texto pequeño blanco: su contraste con blanco es aproximadamente **4,22:1**, inferior al requisito AA normal de 4,5:1. Usar `#0065E0` para texto blanco sobre fondos de acción y enlaces sobre blanco.
- Azul de acción `#0065E0` tiene contraste de aproximadamente **5,33:1** con blanco: idóneo para botones primarios con texto blanco.
- Los bordes suaves `#C7D0DC` no son suficientes como **único** indicador del contorno de un input; para esos casos usar `#7B8797` u otro estado con contraste suficiente.
- Estados de éxito, alerta y error usan colores semánticos **solo cuando existan esos estados**. Nunca pintar un botón normal de verde porque “se ve bien”.
- Si hay modo oscuro preexistente, mantenerlo y armonizarlo con equivalentes accesibles; **no crear modo oscuro nuevo** si el proyecto no lo necesita.

## 4. Tipografía y jerarquía

- **Inter** preferente para interfaz, o la sans-serif profesional **ya presente** en el proyecto si su sustitución implicara carga o inconsistencias. Fallback: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`.
- Para coordenadas, números tabulados, EPSG y bloques de resultados usar **IBM Plex Mono** si está disponible; si no, `ui-monospace, SFMono-Regular, Consolas, monospace`. Aplicar `font-variant-numeric: tabular-nums`.
- Encabezado página: **28–32 px, peso 700**, altura de línea 1,2.
- Títulos de sección/panel: **18–22 px, peso 650–700**, altura 1,3.
- Cuerpo: **14–16 px, peso 400–500**, altura 1,5; priorizar 16 px para lectura y campos principales.
- Etiquetas: **13–14 px, peso 600**, siempre visibles encima o asociadas al control (nunca depender solo del placeholder).
- Números de resultados: **15–18 px, peso 500–600**, alto contraste, alineación consistente, fácil selección/copia.
- Sin versales forzadas en párrafos; limitar mayúsculas a siglas técnicas (`UTM`, `EPSG`, `CRS`) y pequeñas categorías si ya existen.

## 5. Geometría, espacio y composición

- Sistema de espaciado basado en **múltiplos de 4 px**: 4, 8, 12, 16, 24, 32 y 48.
- Componentes principalmente rectangulares con esquinas redondeadas **8 px**; cards **12 px**; chips **6 px**.
- Botones/inputs: altura mínima **44 px**; 48 px cuando el contexto sea táctil.
- Cards: padding **20–24 px** escritorio y **16 px** móvil. Separaciones entre secciones: **24–32 px**.
- Cabecera: altura aproximada **64–72 px**. Contenedor principal centrado, ancho máximo orientativo **1200–1360 px**.
- Desktop: priorizar dos paneles claros “Origen” y “Destino”, con bloque de resultados relacionado visualmente. Si la interfaz actual presenta un patrón mejor adaptado al flujo real, **conservar la lógica** y mejorar la jerarquía sin reorganizar funciones arbitrariamente.
- Móvil: apilar paneles verticalmente; botones importantes visibles, campos a ancho completo, sin scroll horizontal, sin coordenadas cortadas. Validar aproximadamente 360 px y 768 px además del escritorio.
- Una sola acción visualmente primaria por contexto. Los secundarios deben ser outline, neutral o textuales.
- Evitar decoraciones como enormes fondos azules, gradientes, curvas gratuitas, dashboards de métricas ficticias o tarjetas dentro de tarjetas.

## 6. Componentes del sistema

| Componente | Regla de estilo y comportamiento |
|---|---|
| **Cabecera / navegación** | Fondo blanco, logotipo a la izquierda, acciones discretas a la derecha, separador inferior si aporta estructura. Estado activo en azul accesible. |
| **Botón primario** | Fondo `--gm-brand-action`, texto blanco semibold, altura ≥44 px, radio 8 px. Hover `--gm-brand-action-hover`; estado disabled claramente distinto; focus ring visible. |
| **Botón secundario** | Blanco, texto marino, borde visible; hover en superficie tenue. No competir visualmente con el primario. |
| **Inputs de coordenadas** | Fondo blanco, texto marino, borde control `--gm-border-control`, etiquetas explícitas y unidades/formato cercanos. Foco azul de 2 px, error con texto específico. |
| **Select de CRS** | Mostrar nombre comprensible y código identificador disponible (`EPSG:xxxx`) cuando aplique, con búsqueda si el componente actual la soporta. No inventar compatibilidades. |
| **Tarjetas** | Blanco, borde suave, radio 12 px, padding 20–24 px; sin sombras o con elevación extremadamente sutil solo si mejora la separación. |
| **Bloque de resultado** | Contraste alto, números legibles/monoespaciados, formato/datum/unidades visibles, botón de copiar próximo al dato. |
| **Intercambiar sistemas** | Control secundario reconocible con flechas coherentes, nombre accesible: “Intercambiar origen y destino”. Si existe, conservar la funcionalidad real. |
| **Tabs / segmented controls** | Activo con marca textual/geométrica además del color; no solo una tonalidad azul. |
| **Alertas / validación** | Colores semánticos + icono y mensaje específico. El color no es el único medio de comprensión. |
| **Tablas** | Cabecera clara, alineación numérica, separadores finos; copiar/exportar accesible cuando exista funcionalidad. |
| **Tooltips** | Contenido breve, fondo marino, texto blanco. No ocultar información crítica exclusivamente tras hover. |
| **Modales / popovers** | Ancho contenido, foco controlado, cierre con Escape, jerarquía de acciones consistente. |
| **Loading / empty states** | Estado discreto, sin bloquear datos innecesariamente. Diferenciar “sin convertir”, “cargando” y “error”. |

## 7. Experiencia específica de conversión de coordenadas

La presentación de información geoespacial **no es negociable**: claridad visual y rigor científico tienen la misma prioridad.

1. Distinguir de forma inequívoca el **sistema de origen**, sus coordenadas y el **sistema de destino**.
2. Mostrar unidades y orden de ejes cuando corresponda (`latitud / longitud`, `X / Y`, `Este / Norte`, grados, metros). **No asumir ni invertir ejes** por estética: respetar la implementación real y el CRS.
3. Mantener visibles los identificadores de CRS/datum que la aplicación ya ofrezca (`EPSG`, zona UTM, hemisferio, etc.). No agregar datos calculados ficticios.
4. Preservar la **precisión numérica**. No redondear, truncar, reordenar valores ni cambiar automáticamente separadores decimales por CSS o lógica de presentación, salvo reglas ya definidas por el producto.
5. Los campos con errores deben indicar el campo, la razón y cómo corregirlo (por ejemplo, rango válido solo en sistemas que efectivamente usan latitud geográfica).
6. La acción principal (“Convertir coordenadas” o denominación existente) debe destacar; las acciones de copiar, limpiar, intercambiar o exportar han de tener menor jerarquía.
7. El resultado debe permitir selección y copia fiel de los datos que el sistema produzca. Cuando ya exista la función, mostrar confirmación accesible “Coordenadas copiadas”.
8. No borrar inputs ante errores de conversión. Mostrar carga, vacío, éxito y error sin alterar los valores originales.
9. Si hay mapa, mantener un estilo discreto y utilitario: punto de origen/resultado y controles deben ser distinguibles; evitar añadir colores que compitan con el azul de interacción. No añadir una biblioteca de mapas solo por diseño.
10. Si existen conversiones por lotes, historial, favoritos o exportaciones, aplicar los mismos tokens y componentes, sin rediseñar su modelo de datos.

## 8. Iconografía y microinteracciones

- Usar el **mismo paquete de iconos que ya emplea la aplicación**. Si no existe, preferir una librería consistente de trazos geométricos, como Lucide. Peso orientativo 1,75–2 px.
- Iconos funcionales claros: copiar, intercambiar, información, limpiar, descargar, ayuda, localización. No multiplicar iconos decorativos.
- Transiciones cortas y discretas de **120–180 ms** para hover, enfoque visual o pequeños cambios de estado; respetar `prefers-reduced-motion`.
- Nada de bounce, parallax, blur, brillos, animaciones de neón o loaders extravagantes. Una interfaz de coordenadas debe transmitir estabilidad.

## 9. Accesibilidad y calidad

- Objetivo **WCAG 2.2 AA**: texto normal ≥ **4,5:1**, texto grande ≥ **3:1** y elementos gráficos/controles relevantes ≥ **3:1** frente a su entorno.
- Todos los controles interactivos deben funcionar con teclado, mostrar foco claramente visible y conservar etiquetas accesibles.
- Objetivo de interacción cómodo: áreas táctiles de al menos **44 × 44 px** salvo casos justificados por el contexto; no confundir con el mínimo normativo general de WCAG.
- No depender únicamente de color, placeholder, icono, animación o tooltip para explicar un estado.
- Mantener contraste en `hover`, `active`, `disabled`, `focus`, `error`, `success`, `loading` y modo responsive.
- Verificar desbordes, zoom, cadenas largas, nombres extensos de CRS y números largos o negativos.

**Referencias:** [WCAG 2.2 — contraste de texto](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) y [WCAG 2.2 — contraste de componentes](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

## 10. Plan de ejecución para Codex

**Instrucción de implementación** (aplicar al repositorio real, no solo producir una maqueta):

1. **Auditar el repositorio** antes de modificar: framework, router, estilos, componentes, tipografías, tokens, estados, formularios, mapas, dependencias, pruebas y ubicación del logo existente. Enumerar las vistas principales.
2. **Centralizar los tokens** indicados en la sección 3 dentro del mecanismo de temas actual. Eliminar duplicados de color/radio/spacing solo cuando sea seguro hacerlo. No introducir un segundo design system.
3. **Actualizar componentes compartidos primero** (navegación, botones, campos, selects, cards, tabs, alerts, resultados) y luego aplicar el diseño a todas las rutas y pantallas, incluyendo modales, vacíos y errores.
4. **Integrar el logotipo original**. Si el fichero no está en el repo, dejar una ruta clara documentada para que se incorpore el PNG proporcionado; nunca sustituir por un logo inventado. Recortar márgenes del archivo solo sin modificar el diseño y con control visual.
5. **Conservar íntegramente la funcionalidad**: lógica de conversión, CRS, validación, llamadas a APIs, almacenamiento, importación/exportación, permisos y comportamiento de navegación. No cambiar paquetes ni arquitectura salvo necesidad demostrable.
6. **Revisar responsive y accesibilidad**: escritorio (≥1280 px), tablet (~768 px), móvil (~360 px), navegación teclado, foco, contraste, estados disabled y textos largos.
7. **Ejecutar las comprobaciones disponibles**: lint, TypeScript/typecheck, pruebas y build si existen. Corregir errores introducidos. No afirmar que se han ejecutado comprobaciones que no se pudieron correr.
8. **Entregar resumen verificable**: archivos modificados, decisiones de diseño, componentes y pantallas cubiertos, pruebas ejecutadas, capturas antes/después si es posible y cualquier limitación pendiente.

**Regla de alcance:** no implementar características nuevas, no cambiar resultados matemáticos ni librerías críticas y no mover flujos funcionales sin necesidad. El objetivo es unificar la interfaz existente.

## 11. Criterios de aceptación

- [ ] En todas las pantallas predominan blanco, marino y azul de marca conforme a tokens, sin degradados.
- [ ] El logotipo es el mismo, con O integrada; no ha sido sustituido por texto ni un icono separado.
- [ ] Un botón primario, un input o un mensaje de error se ven y se comportan igual en cualquier ruta.
- [ ] La jerarquía origen → destino → resultado se entiende sin ambigüedad.
- [ ] Unidades, códigos CRS, nombres y precisión de coordenadas se mantienen íntegros.
- [ ] Inputs, enlaces, iconos funcionales y mensajes superan las verificaciones de contraste aplicables.
- [ ] Hay foco visible y navegación por teclado en todas las acciones esenciales.
- [ ] No hay scroll horizontal ni recortes críticos en móvil; no hay saltos de layout incontrolados.
- [ ] No hay regresiones de conversión, validación, copiado ni exportación.
- [ ] El build, lint y pruebas existentes funcionan, o se reportan claramente las limitaciones preexistentes.

## 12. Riesgos a evitar

- **Usar `#0075FE` para cualquier texto blanco:** el azul del logo no supera AA de texto normal sobre blanco/blanco sobre azul. Usar el azul de interacción para controles con texto.
- **Confundir coherencia con exceso de azul:** demasiados botones primarios, campos azules y cabeceras masivas reducen jerarquía.
- **Rehacer el logo en CSS:** genera un resultado parecido pero inconsistente. El logo es una marca, no un componente de texto corriente.
- **Confundir un PNG con un SVG:** el arte generado es una referencia rasterizada; necesita vectorización profesional real si se exige escalabilidad perfecta.
- **Sacrificar información geográfica:** ocultar datum, zona, CRS, precisión u orden de coordenadas puede conducir a errores operativos graves.
- **Rediseño masivo sin test:** la apariencia puede mejorar mientras se rompen validaciones, conversiones o exportaciones.

---

**Resultado esperado:** una interfaz GEOMORPH sobria, luminosa, técnica, coherente y reconocible, donde la identidad del logotipo se extienda por los componentes sin competir con los datos. **Implementación real en el proyecto, no una simple propuesta visual.**
