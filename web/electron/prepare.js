// Completa .next/standalone com os assets estáticos (o Next não os copia sozinho)
const fs = require('fs');
const path = require('path');

const web = path.join(__dirname, '..');
const standalone = path.join(web, '.next', 'standalone');

if (!fs.existsSync(path.join(standalone, 'server.js'))) {
  throw new Error('Rode "next build" antes (output standalone não encontrado)');
}

fs.cpSync(path.join(web, '.next', 'static'), path.join(standalone, '.next', 'static'), {
  recursive: true,
});
fs.cpSync(path.join(web, 'public'), path.join(standalone, 'public'), { recursive: true });
console.log('standalone pronto');
