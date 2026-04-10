// scripts/setTag.js
const { execSync } = require('child_process');
const fs = require('fs');

// Obtener el último tag
const latestTag = execSync('git describe --tags `git rev-list --tags --max-count=1`').toString().trim();

// Escribirlo en un archivo .env.local
fs.writeFileSync('src/latestTag.txt', latestTag);