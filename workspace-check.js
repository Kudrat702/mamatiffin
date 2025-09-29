#!/usr/bin/env node

/**
 * Workspace Health Check Script
 * Verifies the monorepo structure and configurations
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Tiffin Service Monorepo Structure...\n');

const checks = [];

// Check root package.json
function checkRootPackage() {
  try {
    const rootPkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    const hasWorkspaces = rootPkg.workspaces && Array.isArray(rootPkg.workspaces);
    const correctWorkspaces = hasWorkspaces &&
      rootPkg.workspaces.includes('client') &&
      rootPkg.workspaces.includes('server');

    checks.push({
      name: 'Root package.json configuration',
      status: correctWorkspaces ? 'PASS' : 'FAIL',
      details: correctWorkspaces ? 'Workspaces correctly configured' : 'Workspaces not properly configured'
    });
  } catch (error) {
    checks.push({
      name: 'Root package.json configuration',
      status: 'FAIL',
      details: `Error reading package.json: ${error.message}`
    });
  }
}

// Check client structure
function checkClientStructure() {
  const clientExists = fs.existsSync('./client');
  const clientPkgExists = fs.existsSync('./client/package.json');
  const viteConfigExists = fs.existsSync('./client/vite.config.ts');

  let clientPkgValid = false;
  if (clientPkgExists) {
    try {
      const clientPkg = JSON.parse(fs.readFileSync('./client/package.json', 'utf8'));
      clientPkgValid = clientPkg.name === 'tiffin-service-client';
    } catch (error) {
      // Invalid JSON
    }
  }

  const allGood = clientExists && clientPkgExists && viteConfigExists && clientPkgValid;

  checks.push({
    name: 'Client workspace structure',
    status: allGood ? 'PASS' : 'FAIL',
    details: allGood ? 'Client structure is correct' :
      `Missing: ${!clientExists ? 'client dir, ' : ''}${!clientPkgExists ? 'package.json, ' : ''}${!viteConfigExists ? 'vite.config.ts, ' : ''}${!clientPkgValid ? 'correct package name' : ''}`
  });
}

// Check server structure
function checkServerStructure() {
  const serverExists = fs.existsSync('./server');
  const serverPkgExists = fs.existsSync('./server/package.json');
  const serverTsExists = fs.existsSync('./server/server.ts');

  let serverPkgValid = false;
  if (serverPkgExists) {
    try {
      const serverPkg = JSON.parse(fs.readFileSync('./server/package.json', 'utf8'));
      serverPkgValid = serverPkg.name === 'tiffin-service-backend';
    } catch (error) {
      // Invalid JSON
    }
  }

  const allGood = serverExists && serverPkgExists && serverTsExists && serverPkgValid;

  checks.push({
    name: 'Server workspace structure',
    status: allGood ? 'PASS' : 'FAIL',
    details: allGood ? 'Server structure is correct' :
      `Missing: ${!serverExists ? 'server dir, ' : ''}${!serverPkgExists ? 'package.json, ' : ''}${!serverTsExists ? 'server.ts, ' : ''}${!serverPkgValid ? 'correct package name' : ''}`
  });
}

// Check essential files
function checkEssentialFiles() {
  const files = ['.gitignore', 'README.md', 'tsconfig.json'];
  const missingFiles = files.filter(file => !fs.existsSync(`./${file}`));

  checks.push({
    name: 'Essential files',
    status: missingFiles.length === 0 ? 'PASS' : 'FAIL',
    details: missingFiles.length === 0 ? 'All essential files present' : `Missing: ${missingFiles.join(', ')}`
  });
}

// Run all checks
checkRootPackage();
checkClientStructure();
checkServerStructure();
checkEssentialFiles();

// Display results
checks.forEach(check => {
  const icon = check.status === 'PASS' ? '✅' : '❌';
  const statusColor = check.status === 'PASS' ? '\x1b[32m' : '\x1b[31m';
  console.log(`${icon} ${statusColor}${check.status}\x1b[0m ${check.name}`);
  console.log(`   ${check.details}\n`);
});

const passedChecks = checks.filter(c => c.status === 'PASS').length;
const totalChecks = checks.length;

console.log(`\n📊 Summary: ${passedChecks}/${totalChecks} checks passed`);

if (passedChecks === totalChecks) {
  console.log('🎉 Monorepo structure is correctly configured!');
  console.log('\n🚀 Next steps:');
  console.log('1. Run: npm run install:all');
  console.log('2. Run: npm run dev');
  console.log('3. Open client: http://localhost:5173');
  console.log('4. Open server: http://localhost:3000');
} else {
  console.log('⚠️  Some issues found. Please fix them before proceeding.');
  process.exit(1);
}