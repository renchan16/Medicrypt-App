const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  openFilePath: () => ipcRenderer.invoke('dialog:openFilePath'),
  openHashKeyPath: () => ipcRenderer.invoke('dialog:openHashKeyPath'),
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  checkFilePath: (filePath) => ipcRenderer.invoke('dialog:checkFilePath', filePath)
});