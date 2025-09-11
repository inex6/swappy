const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  takeScreenshot: () => ipcRenderer.invoke('take-screenshot'),
  getImageAsBase64: (filePath) => ipcRenderer.invoke('get-image-as-base64', filePath),
});