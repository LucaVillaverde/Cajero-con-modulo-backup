import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, '../package.json');
const nodeModulesPath = path.join(__dirname, '../node_modules');

if (!fs.existsSync(packageJsonPath)) {
  console.error('No se encontró package.json');
  process.exit(1);
}

if (!fs.existsSync(nodeModulesPath)) {
  console.error('No se encontró node_modules');
  process.exit(1);
}

const { dependencies = {}, devDependencies = {} } = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const allDeps = { ...dependencies, ...devDependencies };
const missing = [];
const installed = [];

// Comprobar si las dependencias están instaladas
for (const dep of Object.keys(allDeps)) {
  const depPath = path.join(nodeModulesPath, dep);
  if (fs.existsSync(depPath)) {
    installed.push(dep);
  } else {
    missing.push(dep);
  }
}

// Mostrar dependencias instaladas
if (installed.length > 0) {
  console.log('Dependencias instaladas:\n', installed.join('\n'));
}

// Mostrar dependencias necesarias (de acuerdo a package.json)
if (Object.keys(allDeps).length > 0) {
  console.log('\nDependencias necesarias (según package.json):\n', Object.keys(allDeps).join('\n'));
}

// Mostrar dependencias faltantes
if (missing.length > 0) {
  console.error('\nFaltan las siguientes dependencias:\n', missing.join('\n'));
  process.exit(1);
} else {
  console.log(chalk.greenBright('\n--- Se han encontrado todas las dependencias necesarias ---\n'));
}
