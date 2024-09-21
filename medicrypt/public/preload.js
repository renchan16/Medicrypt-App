const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  openFilePath: () => ipcRenderer.invoke('dialog:openFilePath'),
  openKeyPath: () => ipcRenderer.invoke('dialog:openKeyPath'),
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
});