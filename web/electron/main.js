const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const { spawn } = require('child_process');
const fs = require('fs');
const net = require('net');
const path = require('path');
const { discoverServer, probeUrl } = require('./discovery');

// Porta fixa: a sessão fica no localStorage, que é separado por origem
const WEB_PORT = 47832;
const FALLBACK_API = 'http://localhost:3333';
const LOCAL_API = 'http://127.0.0.1:3333';

const serverDir = app.isPackaged
  ? path.join(process.resourcesPath, 'app-server')
  : path.join(__dirname, '..', '.next', 'standalone');

const backendDir = app.isPackaged
  ? path.join(process.resourcesPath, 'backend')
  : path.join(__dirname, 'backend-bundle');

let apiUrl = FALLBACK_API;
let nextProcess = null;
let backendProcess = null;

// ---------- endereço do backend ----------

const savedFile = () => path.join(app.getPath('userData'), 'server.json');

function loadSaved() {
  try {
    return JSON.parse(fs.readFileSync(savedFile(), 'utf8')).url || null;
  } catch {
    return null;
  }
}

function save(url) {
  try {
    fs.writeFileSync(savedFile(), JSON.stringify({ url }));
  } catch {}
}

/** Último endereço conhecido; se não responder, procura o servidor na rede. */
async function resolveApiUrl() {
  const saved = loadSaved();
  if (saved && (await probeUrl(saved))) return saved;
  return rediscover(saved);
}

async function rediscover(fallback) {
  const found = await discoverServer().catch(() => null);
  if (found) {
    apiUrl = found.url;
    save(found.url);
    return found.url;
  }
  apiUrl = fallback || FALLBACK_API;
  return null;
}

ipcMain.on('api-url', (event) => {
  event.returnValue = apiUrl;
});
ipcMain.handle('rediscover', async () => {
  const before = apiUrl;
  const found = await rediscover(before);
  return found && found !== before ? found : null;
});

// ---------- impressão térmica ----------

/** Imprime o HTML na impressora padrão (ou CONTROLMESA_PRINTER) sem abrir diálogo. */
ipcMain.handle('print-html', (_event, html) => {
  return new Promise((resolve) => {
    const win = new BrowserWindow({ show: false, webPreferences: { sandbox: true } });
    win.webContents.once('did-finish-load', () => {
      win.webContents.print(
        { silent: true, printBackground: false, deviceName: process.env.CONTROLMESA_PRINTER || undefined },
        (ok) => {
          win.close();
          resolve(ok);
        },
      );
    });
    win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  });
});

// ---------- backend embutido ----------

/**
 * Pasta com o .env do backend: ao lado do .exe (portátil), depois a pasta de
 * dados do app, por fim o .env empacotado. Assim dá para trocar banco/senha
 * sem recompilar.
 */
function backendConfigDir() {
  const candidates = [process.env.PORTABLE_EXECUTABLE_DIR, app.getPath('userData'), backendDir];
  return candidates.find((dir) => dir && fs.existsSync(path.join(dir, '.env'))) || backendDir;
}

/** Sobe o backend junto, a menos que já exista um respondendo nesta máquina. */
async function startBackend() {
  if (await probeUrl(LOCAL_API, 800)) return;

  fs.mkdirSync(app.getPath('userData'), { recursive: true });
  const log = fs.openSync(path.join(app.getPath('userData'), 'backend.log'), 'a');
  backendProcess = spawn(process.execPath, [path.join(backendDir, 'dist', 'src', 'index.js')], {
    cwd: backendConfigDir(),
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1', NODE_PATH: path.join(backendDir, 'node_modules') },
    stdio: ['ignore', log, log],
    windowsHide: true,
  });
  try {
    await waitForPort(3333, 15000);
  } catch {
    backendProcess = null; // caiu (ex.: PostgreSQL desligado): detalhes em backend.log
  }
}

// ---------- servidor Next embutido ----------

function waitForPort(port, timeout = 20000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const socket = net.connect(port, '127.0.0.1');
      socket.once('connect', () => {
        socket.destroy();
        resolve();
      });
      socket.once('error', () => {
        socket.destroy();
        if (Date.now() - started > timeout) reject(new Error('Servidor web não iniciou'));
        else setTimeout(attempt, 250);
      });
    };
    attempt();
  });
}

async function startNext() {
  nextProcess = spawn(process.execPath, [path.join(serverDir, 'server.js')], {
    cwd: serverDir,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      PORT: String(WEB_PORT),
      HOSTNAME: '127.0.0.1',
      NODE_ENV: 'production',
    },
    stdio: 'ignore',
    windowsHide: true,
  });
  await waitForPort(WEB_PORT);
}

// ---------- janela ----------

async function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0C0E13',
    title: 'ControlMesa',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Sobe site e backend; a janela só aparece quando o endereço da API está definido
  await Promise.all([startNext(), startBackend()]);
  // Backend desta máquina no ar: usa ele; senão procura outro na rede
  const localUp = backendProcess || (await probeUrl(LOCAL_API, 800));
  apiUrl = localUp ? FALLBACK_API : (await resolveApiUrl()) || apiUrl;

  win.once('ready-to-show', () => win.show());
  win.loadURL(`http://127.0.0.1:${WEB_PORT}/`);
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const [win] = BrowserWindow.getAllWindows();
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
  app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    createWindow().catch((err) => {
      console.error(err);
      app.quit();
    });
  });
  app.on('window-all-closed', () => app.quit());
  app.on('quit', () => {
    nextProcess?.kill();
    backendProcess?.kill();
  });
}
