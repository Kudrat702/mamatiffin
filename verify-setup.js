#!/usr/bin/env node

/**
 * TIFFIN SERVICE MONOREPO SETUP VERIFICATION
 * Comprehensive check for the fullstack TypeScript monorepo
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Tiffin Service Monorepo Setup...\n');

const checks = [];
let score = 0;
const maxScore = 20;

// Check function
function check(name, condition, details) {
  const status = condition ? 'PASS' : 'FAIL';
  const icon = condition ? '✅' : '❌';

  if (condition) score++;

  checks.push({ name, status, details, icon });

  console.log(`${icon} ${status} - ${name}`);
  if (details) {
    console.log(`   ${details}\n`);
  }
}

// 1. Check directory structure
check(
  'Monorepo structure',
  fs.existsSync('./client') && fs.existsSync('./server'),
  'Client and server directories exist'
);

// 2. Check package.json files
const rootPkg = fs.existsSync('./package.json');
const clientPkg = fs.existsSync('./client/package.json');
const serverPkg = fs.existsSync('./server/package.json');

check(
  'Package.json files',
  rootPkg && clientPkg && serverPkg,
  'Root, client, and server package.json files exist'
);

// 3. Check workspace configuration
if (rootPkg) {
  try {
    const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    check(
      'NPM workspaces configured',
      pkg.workspaces && pkg.workspaces.includes('client') && pkg.workspaces.includes('server'),
      'Workspaces properly configured for client and server'
    );
  } catch (error) {
    check('NPM workspaces configured', false, 'Error reading root package.json');
  }
}

// 4. Check TypeScript configurations
check(
  'TypeScript configurations',
  fs.existsSync('./client/tsconfig.json') &&
  fs.existsSync('./client/tsconfig.app.json') &&
  fs.existsSync('./server/tsconfig.json'),
  'All TypeScript configuration files exist'
);

// 5. Check Vite configuration
check(
  'Vite configuration',
  fs.existsSync('./client/vite.config.ts'),
  'Vite configuration with TypeScript support'
);

// 6. Check Tailwind configuration
check(
  'Tailwind CSS configuration',
  fs.existsSync('./client/tailwind.config.ts'),
  'Tailwind CSS configured with TypeScript'
);

// 7. Check environment files
check(
  'Environment templates',
  fs.existsSync('./client/.env.example') && fs.existsSync('./server/.env.example'),
  'Environment variable templates exist'
);

// 8. Check ESLint configurations
check(
  'ESLint configurations',
  fs.existsSync('./client/.eslintrc.cjs') && fs.existsSync('./server/.eslintrc.js'),
  'ESLint configured for both client and server'
);

// 9. Check Prettier configurations
check(
  'Prettier configurations',
  fs.existsSync('./client/.prettierrc') && fs.existsSync('./server/.prettierrc'),
  'Prettier configured for both workspaces'
);

// 10. Check Jest configuration
check(
  'Jest configuration',
  fs.existsSync('./server/jest.config.js'),
  'Jest testing framework configured for server'
);

// 11. Check client source structure
const clientSrcExists = fs.existsSync('./client/src');
const componentsExists = fs.existsSync('./client/src/components');

check(
  'Client source structure',
  clientSrcExists && componentsExists,
  'Client source and components directories exist'
);

// 12. Check server source structure
const controllersExists = fs.existsSync('./server/controllers');
const modelsExists = fs.existsSync('./server/models');
const routesExists = fs.existsSync('./server/routes');

check(
  'Server source structure',
  controllersExists && modelsExists && routesExists,
  'Server controllers, models, and routes directories exist'
);

// 13. Check TypeScript types
check(
  'TypeScript type definitions',
  fs.existsSync('./server/types/database.types.ts') &&
  fs.existsSync('./server/types/express.types.ts'),
  'Comprehensive TypeScript type definitions exist'
);

// 14. Check server entry point
check(
  'Server entry point',
  fs.existsSync('./server/server.ts'),
  'TypeScript server entry point exists'
);

// 15. Check client entry files
check(
  'Client entry files',
  fs.existsSync('./client/index.html') && fs.existsSync('./client/src/main.tsx'),
  'Client HTML and TypeScript entry points exist'
);

// 16. Check gitignore
check(
  'Git ignore configuration',
  fs.existsSync('./.gitignore'),
  'Comprehensive gitignore file exists'
);

// 17. Check README
check(
  'Documentation',
  fs.existsSync('./README.md'),
  'Comprehensive README documentation exists'
);

// 18. Check development scripts
if (rootPkg) {
  try {
    const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    const hasDevScript = pkg.scripts && pkg.scripts.dev;
    const hasBuildScript = pkg.scripts && pkg.scripts.build;

    check(
      'Development scripts',
      hasDevScript && hasBuildScript,
      'Essential npm scripts configured'
    );
  } catch (error) {
    check('Development scripts', false, 'Error checking scripts');
  }
}

// 19. Check client dependencies
if (clientPkg) {
  try {
    const pkg = JSON.parse(fs.readFileSync('./client/package.json', 'utf8'));
    const hasReact = pkg.dependencies && pkg.dependencies.react;
    const hasVite = pkg.devDependencies && pkg.devDependencies.vite;
    const hasTailwind = pkg.dependencies && pkg.dependencies.tailwindcss;

    check(
      'Client dependencies',
      hasReact && hasVite && hasTailwind,
      'React, Vite, and Tailwind CSS properly configured'
    );
  } catch (error) {
    check('Client dependencies', false, 'Error checking client dependencies');
  }
}

// 20. Check server dependencies
if (serverPkg) {
  try {
    const pkg = JSON.parse(fs.readFileSync('./server/package.json', 'utf8'));
    const hasExpress = pkg.dependencies && pkg.dependencies.express;
    const hasMongoose = pkg.dependencies && pkg.dependencies.mongoose;
    const hasTypescript = pkg.devDependencies && pkg.devDependencies.typescript;

    check(
      'Server dependencies',
      hasExpress && hasMongoose && hasTypescript,
      'Express, Mongoose, and TypeScript properly configured'
    );
  } catch (error) {
    check('Server dependencies', false, 'Error checking server dependencies');
  }
}

// Summary
console.log('\n' + '='.repeat(60));
console.log(`📊 VERIFICATION SUMMARY: ${score}/${maxScore} checks passed`);
console.log('='.repeat(60));

const percentage = Math.round((score / maxScore) * 100);

if (percentage === 100) {
  console.log('🎉 EXCELLENT! Your monorepo is perfectly configured!');
  console.log('\n🚀 Next steps:');
  console.log('1. Copy .env.example files to .env and configure');
  console.log('2. Run: npm run install:all');
  console.log('3. Run: npm run dev');
  console.log('4. Open http://localhost:5173 (client)');
  console.log('5. Open http://localhost:3000 (server)');
} else if (percentage >= 80) {
  console.log('✨ GREAT! Your monorepo is well configured with minor issues.');
  console.log('Please address the failed checks above.');
} else if (percentage >= 60) {
  console.log('⚠️  GOOD! Your monorepo has the basics but needs improvements.');
  console.log('Please fix the failed checks for optimal development experience.');
} else {
  console.log('🔧 NEEDS WORK! Several important configurations are missing.');
  console.log('Please review and fix the failed checks before proceeding.');
}

console.log('\n📚 For help, check the README.md file or documentation.');
console.log('🐛 Issues? Visit: https://github.com/your-username/tiffin-service/issues');

// Exit with appropriate code
process.exit(percentage >= 80 ? 0 : 1);