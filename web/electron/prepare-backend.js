// Monta electron/backend-bundle: backend compilado + dependências de produção + .env
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const backend = path.join(__dirname, '..', '..', 'backend');
const bundle = path.join(__dirname, 'backend-bundle');
const run = (cmd, cwd) => execSync(cmd, { cwd, stdio: 'inherit' });

run('npx tsc', backend);

fs.rmSync(bundle, { recursive: true, force: true });
fs.mkdirSync(bundle, { recursive: true });
fs.cpSync(path.join(backend, 'dist'), path.join(bundle, 'dist'), { recursive: true });
for (const file of ['package.json', 'package-lock.json']) {
  fs.copyFileSync(path.join(backend, file), path.join(bundle, file));
}
if (fs.existsSync(path.join(backend, '.env'))) {
  fs.copyFileSync(path.join(backend, '.env'), path.join(bundle, '.env'));
}

run('npm ci --omit=dev --ignore-scripts', bundle);
// Puxados só como peer/opcionais; o servidor em runtime não usa (economiza ~140 MB)
for (const dir of ['prisma', 'typescript', 'effect', 'react', 'react-dom', 'elkjs', '@types', '@electric-sql']) {
  fs.rmSync(path.join(bundle, 'node_modules', dir), { recursive: true, force: true });
}
console.log('backend-bundle pronto');
