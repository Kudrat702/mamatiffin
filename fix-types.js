#!/usr/bin/env node

/**
 * Fix TypeScript/Express Type Conflicts
 * This script helps resolve version conflicts between workspaces
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔧 Fixing TypeScript and Express type conflicts...\n');

function runCommand(command, cwd = process.cwd()) {
  try {
    console.log(`Running: ${command} ${cwd !== process.cwd() ? `in ${cwd}` : ''}`);
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error running command: ${command}`);
    console.error(error.message);
    return false;
  }
}

function cleanNodeModules(path) {
  const nodeModulesPath = `${path}/node_modules`;
  if (fs.existsSync(nodeModulesPath)) {
    console.log(`🧹 Cleaning ${nodeModulesPath}...`);
    runCommand(`rimraf ${nodeModulesPath}`);
  }
}

console.log('Step 1: Cleaning node_modules...');
cleanNodeModules('.');
cleanNodeModules('./client');
cleanNodeModules('./server');

console.log('\nStep 2: Cleaning package-lock files...');
const lockFiles = [
  './package-lock.json',
  './client/package-lock.json',
  './server/package-lock.json'
];

lockFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`🧹 Removing ${file}...`);
    fs.unlinkSync(file);
  }
});

console.log('\nStep 3: Installing dependencies...');

// Install root dependencies first
console.log('📦 Installing root dependencies...');
if (!runCommand('npm install')) {
  console.error('❌ Failed to install root dependencies');
  process.exit(1);
}

// Install server dependencies
console.log('\n📦 Installing server dependencies...');
if (!runCommand('npm install', './server')) {
  console.error('❌ Failed to install server dependencies');
  process.exit(1);
}

// Install client dependencies
console.log('\n📦 Installing client dependencies...');
if (!runCommand('npm install', './client')) {
  console.error('❌ Failed to install client dependencies');
  process.exit(1);
}

console.log('\nStep 4: Type checking...');

// Check TypeScript in server
console.log('🔍 Checking server TypeScript...');
if (!runCommand('npm run type-check', './server')) {
  console.warn('⚠️ Server TypeScript check failed, but continuing...');
}

// Check TypeScript in client
console.log('🔍 Checking client TypeScript...');
if (!runCommand('npm run type-check', './client')) {
  console.warn('⚠️ Client TypeScript check failed, but continuing...');
}

console.log('\n✅ Type conflict fix complete!');
console.log('\n🚀 Next steps:');
console.log('1. Copy environment variables:');
console.log('   cp client/.env.example client/.env');
console.log('   cp server/.env.example server/.env');
console.log('2. Configure your environment variables');
console.log('3. Run: npm run dev');
console.log('4. Open http://localhost:5173 (client)');
console.log('5. Open http://localhost:3000 (server)');

console.log('\n📚 If you still have issues:');
console.log('- Restart your IDE/TypeScript language server');
console.log('- Run: npm run clean && npm run install:all');
console.log('- Check the README.md for troubleshooting');