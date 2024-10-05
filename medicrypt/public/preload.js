const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  openFilePath: () => ipcRenderer.invoke('dialog:openFilePath'),
  openEncryptedFilePath: () => ipcRenderer.invoke('dialog:openEncryptedFilePath'),
  openHashKeyPath: () => ipcRenderer.invoke('dialog:openHashKeyPath'),
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  checkFilePath: (filePath) => ipcRenderer.invoke('dialog:checkFilePath', filePath),
  openFileLocation: (filePath) => ipcRenderer.invoke('dialog:openFileLocation', filePath),
  parseCSV: (filePath) => ipcRenderer.invoke('parse-csv', filePath)
});