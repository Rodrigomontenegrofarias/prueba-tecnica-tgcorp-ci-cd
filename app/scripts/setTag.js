// scripts/setTag.js
const { execSync } = require('child_process');
const fs = require('fs');

let latestTag = 'dev';

try {
  // Obtiene el tag más reciente; si no existe, mantiene fallback "dev".
  const output = execSync('git describe --tags --abbrev=0', { stdio: ['ignore', 'pipe', 'pipe'] })
    .toString()
    .trim();
  if (output) {
    latestTag = output;
  }
} catch (error) {
  console.warn('No se encontró tag Git. Se usará "dev".');
}

fs.writeFileSync('src/latestTag.txt', latestTag);
