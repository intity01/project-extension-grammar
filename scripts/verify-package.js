#!/usr/bin/env node

/**
 * Package Verification Script
 * 
 * This script verifies that the .vsix package contains all required files
 * and excludes unnecessary files before distribution.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying package contents...\n');

// Get list of files in package
let packageFiles;
try {
  const output = execSync('npx @vscode/vsce ls', { encoding: 'utf-8' });
  packageFiles = output.split('\n').filter(line => line.trim());
} catch (error) {
  console.error('❌ Failed to list package contents');
  console.error(error.message);
  process.exit(1);
}

// Required files that must be in the package
const requiredFiles = [
  'package.json',
  'language-configuration.json',
  'README.md',
  'LICENSE',
  'out/extension.js',
  'syntaxes/targetlang.tmLanguage.json',
  'assets/steering/rules.md',
  'assets/steering/architecture.md',
  'assets/hooks/auto-test.json',
  'assets/hooks/auto-doc.json',
  'schemas/steering-schema.json',
  'schemas/hook-schema.json'
];

// Files that should NOT be in the package
const excludedPatterns = [
  /^src\//,
  /^test\//,
  /^\.kiro\//,
  /^DEVELOPMENT\.md$/,
  /^tsconfig\.json$/,
  /^\.vscode\//,
  /\.ts$/
];

let errors = 0;
let warnings = 0;

// Check required files
console.log('✅ Checking required files...');
for (const file of requiredFiles) {
  if (!packageFiles.includes(file)) {
    console.error(`  ❌ Missing required file: ${file}`);
    errors++;
  } else {
    console.log(`  ✓ ${file}`);
  }
}

// Check excluded files
console.log('\n🚫 Checking excluded files...');
for (const file of packageFiles) {
  for (const pattern of excludedPatterns) {
    if (pattern.test(file)) {
      console.error(`  ❌ Should not include: ${file}`);
      errors++;
      break;
    }
  }
}

// Check for compiled output
console.log('\n📦 Checking compiled output...');
const outFiles = packageFiles.filter(f => f.startsWith('out/'));
if (outFiles.length === 0) {
  console.error('  ❌ No compiled JavaScript files found in out/');
  errors++;
} else {
  console.log(`  ✓ Found ${outFiles.length} compiled files`);
}

// Check package size
console.log('\n📊 Package statistics...');
try {
  const vsixFiles = fs.readdirSync('.').filter(f => f.endsWith('.vsix'));
  if (vsixFiles.length > 0) {
    const stats = fs.statSync(vsixFiles[0]);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`  Package size: ${sizeMB} MB`);
    
    if (stats.size > 10 * 1024 * 1024) {
      console.warn(`  ⚠️  Package is larger than 10 MB`);
      warnings++;
    }
  }
} catch (error) {
  console.warn('  ⚠️  Could not determine package size');
  warnings++;
}

// Summary
console.log('\n' + '='.repeat(50));
if (errors === 0 && warnings === 0) {
  console.log('✅ Package verification passed!');
  console.log('   All required files are present and no excluded files found.');
  process.exit(0);
} else {
  if (errors > 0) {
    console.error(`❌ Package verification failed with ${errors} error(s)`);
  }
  if (warnings > 0) {
    console.warn(`⚠️  ${warnings} warning(s) found`);
  }
  process.exit(errors > 0 ? 1 : 0);
}
