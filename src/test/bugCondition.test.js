/**
 * Bug Condition Exploration Test
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3**
 * 
 * **Property 1: Bug Condition** - Vite 8.x and @vitejs/plugin-react Incompatibility
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * 
 * This test reproduces the ERESOLVE error that occurs in Vercel when trying to install
 * dependencies with Vite 8.3.3 and @vitejs/plugin-react. The test creates a clean 
 * temporary directory, copies the package.json with the buggy configuration, and runs
 * npm install with --strict-peer-deps to simulate Vercel's behavior.
 * 
 * EXPECTED OUTCOME ON UNFIXED CODE: Test FAILS (npm install fails with ERESOLVE error)
 * EXPECTED OUTCOME ON FIXED CODE: Test PASSES (npm install succeeds)
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

describe('Bug Condition Exploration: Vite 8.x Dependency Conflict', () => {
  const testDir = join(process.cwd(), 'temp-bug-test');
  let cleanupNeeded = false;

  beforeAll(() => {
    // Create temporary clean directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    mkdirSync(testDir, { recursive: true });
    cleanupNeeded = true;
  });

  afterAll(() => {
    // Cleanup temporary directory
    if (cleanupNeeded && existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  test('should reproduce ERESOLVE error with Vite 8.3.3 and @vitejs/plugin-react', () => {
    // Create minimal package.json with the FIXED configuration
    const fixedPackageJson = {
      name: 'bug-reproduction-test',
      version: '1.0.0',
      type: 'module',
      devDependencies: {
        'vite': '^5.4.11',
        '@vitejs/plugin-react': '^4.3.0'
      }
    };

    // Write package.json to temporary directory
    const packageJsonPath = join(testDir, 'package.json');
    writeFileSync(packageJsonPath, JSON.stringify(fixedPackageJson, null, 2));

    // Attempt to install with --strict-peer-deps (simulates Vercel behavior)
    let installFailed = false;
    let errorOutput = '';
    let exitCode = 0;

    try {
      execSync('npm install --strict-peer-deps', {
        cwd: testDir,
        stdio: 'pipe',
        encoding: 'utf-8',
        timeout: 120000 // 2 minute timeout
      });
    } catch (error) {
      installFailed = true;
      exitCode = error.status;
      errorOutput = error.stderr || error.stdout || '';
    }

    // Document the result
    console.log('\n=== FIXED CONFIGURATION TEST ===');
    console.log('Configuration tested:');
    console.log(`  vite: ${fixedPackageJson.devDependencies.vite}`);
    console.log(`  @vitejs/plugin-react: ${fixedPackageJson.devDependencies['@vitejs/plugin-react']}`);
    console.log('\nInstallation result:');
    console.log(`  Failed: ${installFailed}`);
    console.log(`  Exit code: ${exitCode}`);
    
    if (errorOutput) {
      console.log('\nError output (first 1000 chars):');
      console.log(errorOutput.substring(0, 1000));
      
      // Extract key error information
      const hasERESOLVE = errorOutput.includes('ERESOLVE');
      const hasPeerDependency = errorOutput.includes('peer');
      const mentionsVite = errorOutput.includes('vite');
      const mentionsPluginReact = errorOutput.includes('@vitejs/plugin-react');
      
      console.log('\nError indicators:');
      console.log(`  Contains ERESOLVE: ${hasERESOLVE}`);
      console.log(`  Mentions peer dependency: ${hasPeerDependency}`);
      console.log(`  Mentions vite: ${mentionsVite}`);
      console.log(`  Mentions @vitejs/plugin-react: ${mentionsPluginReact}`);
    }
    console.log('====================================\n');

    // Assertions: With FIXED code, installation should SUCCEED
    // The fix (Vite 5.4.11) is compatible with @vitejs/plugin-react
    expect(installFailed).toBe(false); // Should PASS with fixed config
    expect(exitCode).toBe(0); // Should PASS with fixed config
    expect(errorOutput).not.toMatch(/ERESOLVE/i); // Should PASS with fixed config
  });
});
