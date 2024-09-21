const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  openFilePath: () => ipcRenderer.invoke('dialog:openFilePath'),
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
});