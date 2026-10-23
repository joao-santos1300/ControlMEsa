const { contextBridge, ipcRenderer } = require('electron');

// Endereço do backend achado na rede pelo processo principal (ver api.ts)
contextBridge.exposeInMainWorld('controlmesa', {
  apiUrl: () => ipcRenderer.sendSync('api-url'),
  rediscover: () => ipcRenderer.invoke('rediscover'),
  printHtml: (html) => ipcRenderer.invoke('print-html', html),
});
