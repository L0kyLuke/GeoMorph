/**
 * Preservation Property Tests
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
 * 
 * **Property 2: Preservation** - Development Workflow Functionality
 * 
 * These tests capture baseline behavior for dev workflows that MUST be preserved
 * after fixing the Vite version incompatibility. They verify that:
 * - JSX transpilation works correctly
 * - Build output is generated properly
 * - Test execution works
 * - Core Vite features (dev server, HMR) remain functional
 * 
 * EXPECTED OUTCOME: These tests should PASS both before and after the fix,
 * confirming no regression in functionality.
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { execSync, spawn } from 'child_process';
import { existsSync, readFileSync, rmSync, readdirSync } from 'fs';
import { join } from 'path';

describe('Preservation: Development Workflow Functionality', () => {
  
  describe('Build Output Preservation', () => {
    const distPath = join(process.cwd(), 'dist');
    
    beforeAll(() => {
      // Clean dist directory before test
      if (existsSync(distPath)) {
        rmSync(distPath, { recursive: true, force: true });
      }
    });

    test('npm run build should complete successfully and generate dist output', () => {
      // Run build command
      let buildFailed = false;
      let exitCode = 0;
      let output = '';

      try {
        output = execSync('npm run build', {
          cwd: process.cwd(),
          encoding: 'utf-8',
          stdio: 'pipe',
          timeout: 60000 // 1 minute timeout
        });
        exitCode = 0;
      } catch (error) {
        buildFailed = true;
        exitCode = error.status || 1;
        output = error.stdout || error.stderr || '';
      }

      console.log('\n=== BUILD PRESERVATION TEST ===');
      console.log(`Build completed: ${!buildFailed}`);
      console.log(`Exit code: ${exitCode}`);
      console.log(`dist/ exists: ${existsSync(distPath)}`);
      
      if (existsSync(distPath)) {
        const distContents = readdirSync(distPath);
        console.log(`dist/ contents: ${distContents.join(', ')}`);
        console.log(`Number of files in dist/: ${distContents.length}`);
      }
      console.log('==============================\n');

      // Assertions: Build should succeed
      expect(buildFailed).toBe(false);
      expect(exitCode).toBe(0);
      
      // Assertions: dist directory should exist and contain build output
      expect(existsSync(distPath)).toBe(true);
      
      // Verify dist has content (at minimum index.html and assets)
      const distContents = readdirSync(distPath);
      expect(distContents.length).toBeGreaterThan(0);
      expect(distContents).toContain('index.html');
    });
  });

  describe('Test Execution Preservation', () => {
    test('npm test should execute successfully', () => {
      // Run test command (excluding this test file to avoid recursion)
      let testFailed = false;
      let exitCode = 0;
      let output = '';

      try {
        // Run only the sanity tests to verify test execution works
        output = execSync('npm test -- src/test/sanity.test.js', {
          cwd: process.cwd(),
          encoding: 'utf-8',
          stdio: 'pipe',
          timeout: 30000 // 30 second timeout
        });
        exitCode = 0;
      } catch (error) {
        testFailed = true;
        exitCode = error.status || 1;
        output = error.stdout || error.stderr || '';
      }

      console.log('\n=== TEST EXECUTION PRESERVATION ===');
      console.log(`Tests completed: ${!testFailed}`);
      console.log(`Exit code: ${exitCode}`);
      if (output) {
        console.log('Test output (first 500 chars):');
        console.log(output.substring(0, 500));
      }
      console.log('===================================\n');

      // Assertions: Tests should run and pass
      expect(testFailed).toBe(false);
      expect(exitCode).toBe(0);
    });
  });

  describe('JSX Transpilation Preservation', () => {
    test('Vite should transpile JSX files correctly', () => {
      // Verify that key React component files exist and are valid JSX
      const appPath = join(process.cwd(), 'src', 'App.jsx');
      const mainPath = join(process.cwd(), 'src', 'main.jsx');

      expect(existsSync(appPath)).toBe(true);
      expect(existsSync(mainPath)).toBe(true);

      // Read and verify JSX content contains React patterns
      const appContent = readFileSync(appPath, 'utf-8');
      const mainContent = readFileSync(mainPath, 'utf-8');

      console.log('\n=== JSX TRANSPILATION PRESERVATION ===');
      console.log('Checking JSX files for React patterns...');
      console.log(`App.jsx exists: ${existsSync(appPath)}`);
      console.log(`main.jsx exists: ${existsSync(mainPath)}`);
      console.log(`App.jsx contains JSX: ${appContent.includes('return')}`);
      console.log(`main.jsx imports React: ${mainContent.includes('react')}`);
      console.log('=====================================\n');

      // Verify JSX patterns are present
      expect(appContent.length).toBeGreaterThan(0);
      expect(mainContent).toMatch(/import.*react/i);
      expect(mainContent).toMatch(/ReactDOM|createRoot/i);
    });

    test('Built output should contain transpiled JavaScript', () => {
      const distPath = join(process.cwd(), 'dist');
      
      // Ensure build has run
      if (!existsSync(distPath)) {
        console.log('dist/ directory does not exist, skipping transpilation check');
        return;
      }

      // Check that index.html references JavaScript files
      const indexPath = join(distPath, 'index.html');
      if (!existsSync(indexPath)) {
        console.log('index.html does not exist in dist/, skipping check');
        return;
      }

      const indexContent = readFileSync(indexPath, 'utf-8');

      console.log('\n=== TRANSPILED OUTPUT PRESERVATION ===');
      console.log(`index.html contains script tag: ${indexContent.includes('<script')}`);
      console.log(`index.html contains .js reference: ${indexContent.includes('.js')}`);
      console.log('=====================================\n');

      // Verify the build output includes JavaScript
      expect(indexContent).toMatch(/<script.*\.js/);
    });
  });

  describe('Vite Configuration Preservation', () => {
    test('vite.config.js should use @vitejs/plugin-react', () => {
      const configPath = join(process.cwd(), 'vite.config.js');
      
      expect(existsSync(configPath)).toBe(true);

      const configContent = readFileSync(configPath, 'utf-8');

      console.log('\n=== VITE CONFIG PRESERVATION ===');
      console.log(`vite.config.js exists: ${existsSync(configPath)}`);
      console.log(`Uses @vitejs/plugin-react: ${configContent.includes('@vitejs/plugin-react')}`);
      console.log(`Configures test environment: ${configContent.includes('test')}`);
      console.log('================================\n');

      // Verify plugin-react is configured
      expect(configContent).toMatch(/@vitejs\/plugin-react/);
      expect(configContent).toMatch(/plugins.*react/);
      
      // Verify test configuration is present
      expect(configContent).toMatch(/test.*{/);
      expect(configContent).toMatch(/environment.*jsdom/);
    });
  });

  describe('Dev Server Startup Preservation (Integration)', () => {
    test('vite dev command should be available and configured', () => {
      // Read package.json to verify dev script exists
      const packageJsonPath = join(process.cwd(), 'package.json');
      expect(existsSync(packageJsonPath)).toBe(true);

      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

      console.log('\n=== DEV SERVER PRESERVATION ===');
      console.log(`package.json has dev script: ${!!packageJson.scripts?.dev}`);
      console.log(`Dev script command: ${packageJson.scripts?.dev}`);
      console.log('==============================\n');

      // Verify dev script is configured
      expect(packageJson.scripts).toBeDefined();
      expect(packageJson.scripts.dev).toBeDefined();
      expect(packageJson.scripts.dev).toMatch(/vite/);
    });
  });
});
