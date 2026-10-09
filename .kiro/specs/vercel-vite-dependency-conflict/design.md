# Vercel Vite Dependency Conflict Bugfix Design

## Overview

El deployment en Vercel falla debido a una incompatibilidad entre Vite 8.3.3 y @vitejs/plugin-react 4.7.0. El plugin de React está diseñado para Vite 4.x-7.x y no soporta Vite 8.x, causando que npm rechace la instalación durante el build en Vercel.

La solución más segura y recomendada es **downgrade de Vite a la versión 5.x LTS**, que es la versión estable más reciente con soporte completo del ecosistema. Vite 8.x es experimental/beta y no tiene soporte oficial de plugins.

## Glossary

- **Bug_Condition (C)**: La combinación de versiones incompatibles de Vite y @vitejs/plugin-react en package.json
- **Property (P)**: Las dependencias deben satisfacer las peer dependency constraints de npm sin errores ERESOLVE
- **Preservation**: Toda la funcionalidad actual del proyecto (dev server, build, HMR, testing) debe permanecer idéntica
- **ERESOLVE**: Error de npm cuando las peer dependencies no pueden resolverse debido a conflictos de versiones
- **Peer Dependency**: Dependencia que un paquete requiere que esté presente en el proyecto host con una versión específica
- **LTS (Long Term Support)**: Versión estable con soporte extendido y actualizaciones de seguridad

## Bug Details

### Bug Condition

El bug se manifiesta cuando el proyecto tiene Vite 8.3.3 instalado pero @vitejs/plugin-react@4.7.0 requiere explícitamente Vite ^4.2.0 || ^5.0.0 || ^6.0.0 || ^7.0.0. Esto causa un conflicto de peer dependencies que npm detecta y rechaza durante la instalación en el entorno de build de Vercel.

**Formal Specification:**
```
FUNCTION isBugCondition(packageJson)
  INPUT: packageJson of type Object
  OUTPUT: boolean
  
  viteVersion := parseVersion(packageJson.devDependencies.vite)
  pluginReactVersion := parseVersion(packageJson.devDependencies["@vitejs/plugin-react"])
  
  RETURN viteVersion.major >= 8
         AND pluginReactVersion.major == 4
         AND NOT pluginReactSupportsVersion(pluginReactVersion, viteVersion)
END FUNCTION
```

### Examples

- **Actual Buggy State**: `vite: "^8.3.3"` + `@vitejs/plugin-react: "^4.3.0"` (resuelve a 4.7.0) → npm ERESOLVE error en Vercel
- **Edge Case**: `vite: "^8.0.0"` + `@vitejs/plugin-react: "^4.7.0"` → mismo error ERESOLVE
- **Working Configuration**: `vite: "^5.4.0"` + `@vitejs/plugin-react: "^4.3.0"` → instalación exitosa, build correcto

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- El plugin de React debe continuar transpilando JSX y componentes React correctamente
- Vite dev server debe funcionar con todas las características actuales (HMR, fast refresh, optimización de deps)
- Vitest debe ejecutar los tests correctamente con las mismas configuraciones
- El build de producción debe generar los mismos assets optimizados
- Todas las características de desarrollo local (vite dev, vite preview) deben funcionar idénticamente

**Scope:**
Todos los flujos de trabajo de desarrollo, testing y build que actualmente funcionan localmente deben continuar funcionando exactamente igual. El único cambio será que ahora también funcionará en Vercel.

## Hypothesized Root Cause

Based on the bug description, the root cause is:

1. **Versión Experimental de Vite**: Vite 8.x es una versión beta/experimental que no tiene soporte oficial de plugins
   - El ecosistema de plugins (incluyendo @vitejs/plugin-react) solo soporta hasta Vite 7.x
   - Vite 8 introduce cambios breaking en la API de plugins que aún no están adoptados

2. **Peer Dependency Constraint Violation**: @vitejs/plugin-react@4.7.0 declara explícitamente `"vite": "^4.2.0 || ^5.0.0 || ^6.0.0 || ^7.0.0"` en sus peer dependencies
   - Vite 8.x no está incluido en los rangos soportados
   - npm en modo strict (usado por Vercel) rechaza esta incompatibilidad

3. **Actualización Prematura**: El proyecto fue actualizado a Vite 8.x antes de que el ecosistema estuviera listo
   - No hay versión de @vitejs/plugin-react que soporte Vite 8
   - Otras dependencias del ecosistema probablemente tampoco soporten Vite 8

## Correctness Properties

Property 1: Bug Condition - Dependency Compatibility

_For any_ package.json configuration where Vite and @vitejs/plugin-react are listed as dependencies, the fixed configuration SHALL use version ranges that satisfy all peer dependency constraints, allowing npm install to complete successfully in Vercel's build environment without ERESOLVE errors.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Development Workflow

_For any_ development workflow (dev server, build, preview, testing) that currently works with the existing Vite configuration, the fixed configuration SHALL produce identical behavior and functionality, preserving all features including HMR, JSX transpilation, optimization, and test execution.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

## Fix Implementation

### Changes Required

La mejor solución es **downgrade a Vite 5.x LTS**, que es la versión estable más reciente con soporte completo del ecosistema y compatibilidad garantizada con @vitejs/plugin-react.

**File**: `package.json`

**Specific Changes**:

1. **Downgrade Vite**: Cambiar de `"vite": "^8.3.3"` a `"vite": "^5.4.11"`
   - Vite 5.4.11 es la última versión LTS estable
   - Tiene soporte completo de todos los plugins del ecosistema
   - Es la versión recomendada para producción

2. **Mantener @vitejs/plugin-react**: Mantener `"@vitejs/plugin-react": "^4.3.0"`
   - Esta versión soporta Vite 5.x perfectamente
   - Ya está instalada y funcionando localmente

3. **Verificar vitest**: Mantener `"vitest": "^5.0.3"` si es compatible, o downgrade si es necesario
   - Vitest 5.x puede requerir ajustes para trabajar con Vite 5.x
   - Verificar compatibilidad en la documentación oficial

4. **Regenerar package-lock.json**: Después de los cambios, ejecutar `npm install` para actualizar el lockfile
   - Esto asegura que Vercel use las mismas versiones resueltas
   - Elimina cualquier referencia a Vite 8.x del árbol de dependencias

5. **Verificar localmente**: Ejecutar `npm run dev`, `npm run build`, y `npm test` para confirmar que todo funciona
   - Debe comportarse idénticamente a la configuración anterior
   - No debe haber cambios en funcionalidad

### Alternative Solutions Considered

**Opción A: Upgrade @vitejs/plugin-react a versión futura que soporte Vite 8**
- ❌ No disponible: No existe versión de @vitejs/plugin-react que soporte Vite 8
- ❌ Vite 8 es experimental y no tiene soporte oficial de plugins

**Opción B: Usar --legacy-peer-deps en Vercel**
- ❌ No recomendado: Solo oculta el problema, no lo resuelve
- ❌ Puede causar errores de runtime inesperados
- ❌ No es una solución robusta para producción

**Opción C: Reemplazar @vitejs/plugin-react con alternativa**
- ❌ No hay alternativas maduras que soporten Vite 8
- ❌ Cambiaría la configuración y comportamiento del proyecto

**Opción D: Downgrade a Vite 5.x LTS** ✅ **RECOMENDADA**
- ✅ Versión estable y probada en producción
- ✅ Soporte completo del ecosistema de plugins
- ✅ Compatibilidad garantizada con @vitejs/plugin-react
- ✅ No requiere cambios en código o configuración
- ✅ Funciona en Vercel sin configuración especial

## Testing Strategy

### Validation Approach

La estrategia de testing sigue un enfoque de dos fases: primero, reproducir el error en un entorno similar a Vercel con las dependencias actuales, luego verificar que el fix resuelve el problema y preserva toda la funcionalidad.

### Exploratory Bug Condition Checking

**Goal**: Reproducir el error ERESOLVE en un entorno limpio ANTES de implementar el fix, confirmando la incompatibilidad de versiones.

**Test Plan**: 
1. Crear un directorio temporal limpio
2. Copiar package.json actual (con Vite 8.3.3)
3. Ejecutar `npm install --strict-peer-deps` (simula el comportamiento de Vercel)
4. Observar el error ERESOLVE que documenta la incompatibilidad

**Test Cases**:
1. **Clean Install Test**: `npm install --strict-peer-deps` con Vite 8.3.3 (will fail with ERESOLVE)
2. **Dependency Tree Analysis**: `npm ls vite @vitejs/plugin-react` para ver el conflicto (will show peer dep mismatch)
3. **Plugin Version Check**: Verificar que @vitejs/plugin-react@4.7.0 no lista Vite 8 en peer deps (will confirm incompatibility)

**Expected Counterexamples**:
- npm install falla con error "ERESOLVE unable to resolve dependency tree"
- El mensaje indica que @vitejs/plugin-react@4.7.0 requiere vite ^4.2.0 || ^5.0.0 || ^6.0.0 || ^7.0.0
- Posible causa confirmada: Vite 8.x no está en el rango soportado

### Fix Checking

**Goal**: Verificar que para todas las configuraciones donde el bug condition se cumple (Vite incompatible), la configuración corregida permite instalación exitosa.

**Pseudocode:**
```
FOR ALL packageJson WHERE isBugCondition(packageJson) DO
  fixedPackageJson := applyFix(packageJson)  // Downgrade Vite to 5.x
  result := npmInstall(fixedPackageJson, strict=true)
  ASSERT result.success == true
  ASSERT result.exitCode == 0
  ASSERT NOT contains(result.stderr, "ERESOLVE")
END FOR
```

**Test Plan**:
1. Aplicar el fix (cambiar vite a ^5.4.11 en package.json)
2. Eliminar node_modules y package-lock.json
3. Ejecutar `npm install --strict-peer-deps`
4. Verificar que la instalación completa sin errores
5. Verificar que npm ls no muestra conflictos de peer dependencies

### Preservation Checking

**Goal**: Verificar que para todos los flujos de trabajo de desarrollo que actualmente funcionan, la versión corregida produce el mismo comportamiento.

**Pseudocode:**
```
FOR ALL workflow IN [dev, build, preview, test] DO
  behaviorBefore := observeBehavior(workflow, viteVersion="8.3.3")
  behaviorAfter := observeBehavior(workflow, viteVersion="5.4.11")
  ASSERT behaviorBefore == behaviorAfter
END FOR
```

**Testing Approach**: Testing manual y automatizado es recomendado porque:
- Las diferencias entre Vite 5 y Vite 8 son principalmente internas
- El comportamiento observable (dev server, build output, HMR) debe ser idéntico
- Los tests existentes deben pasar sin modificación

**Test Plan**: Observar comportamiento con la configuración actual (si funciona localmente), luego verificar que con Vite 5.x todo sigue igual.

**Test Cases**:
1. **Dev Server Preservation**: `npm run dev` debe iniciar el servidor correctamente, HMR debe funcionar
2. **Build Output Preservation**: `npm run build` debe generar los mismos assets en dist/
3. **Test Execution Preservation**: `npm test` debe ejecutar todos los tests y pasar
4. **JSX Transpilation Preservation**: Los componentes React deben renderizarse correctamente

### Unit Tests

- Test que package.json tiene versiones compatibles de Vite y @vitejs/plugin-react
- Test que npm install completa sin errores en modo strict peer deps
- Test que npm ls no muestra advertencias de peer dependencies

### Property-Based Tests

No aplica directamente a este bugfix (es un problema de configuración, no de lógica de código).

### Integration Tests

- Test de deployment completo en Vercel con la configuración corregida
- Test que el build en Vercel completa exitosamente
- Test que la aplicación desplegada funciona correctamente
- Test de smoke testing post-deployment (verificar rutas principales)

### Manual Verification Steps

1. **Local Development**:
   ```bash
   npm install
   npm run dev  # Verificar que el dev server inicia
   # Abrir http://localhost:5173 y probar funcionalidad
   ```

2. **Local Build**:
   ```bash
   npm run build  # Verificar que el build completa
   npm run preview  # Verificar que el preview funciona
   ```

3. **Testing**:
   ```bash
   npm test  # Verificar que los tests pasan
   ```

4. **Vercel Deployment**:
   - Push los cambios a git
   - Verificar que el build en Vercel completa sin errores ERESOLVE
   - Verificar que el deployment es exitoso
   - Verificar que la aplicación funciona en producción
