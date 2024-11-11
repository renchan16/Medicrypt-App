/* 
Electron Preload Script:
-------------------------
This preload script serves as a bridge between the Electron main process and the renderer process, exposing specific functionality from the main process into the renderer's `window` object using Electron's `contextBridge`. This allows safe inter-process communication (IPC) without exposing the entire Electron API to the renderer, enhancing security in the application.

Exposed Functions:
-------------------
1. openFilePath():
   - Invokes the `dialog:openFilePath` IPC handler in the main process to open a dialog for selecting video files (`mkv`, `avi`, `mp4`, `mov`, `wmv`). Allows multiple file selections and returns the selected file paths or `null` if canceled.

2. openEncryptedFilePath():
   - Invokes the `dialog:openEncryptedFilePath` IPC handler to open a dialog for selecting encrypted video files (`avi`). Returns the selected file paths or `null` if canceled.

3. openHashKeyPath():
   - Invokes the `dialog:openHashKeyPath` IPC handler to open a dialog for selecting key files (`key`). Returns the selected file paths or `null` if canceled.

4. openFolder():
   - Invokes the `dialog:openFolder` IPC handler to open a directory selection dialog. Returns the selected directory path or `null` if canceled.

5. checkFilePath(filePath):
   - Invokes the `dialog:checkFilePath` IPC handler to validate the provided file path(s) (either a string or an array of strings). Returns `true` if all paths are valid files or directories, otherwise `false`.

6. openFileLocation(filePath):
   - Invokes the `dialog:openFileLocation` IPC handler to open the directory containing the specified file or the folder itself if a directory path is provided. Returns `true` if the location was successfully opened, otherwise `false`.

7. parseCSV(filePath):
   - Invokes the `parse-csv` IPC handler to parse a CSV file located at the specified file path using the `papaparse` library in the main process. Returns the parsed data or an error if parsing fails.

Purpose:
--------
These functions facilitate controlled communication between the renderer process and the main process for file and directory handling, CSV parsing, and dialog management.

Dependencies:
-------------
- `contextBridge`: Electron module for securely exposing specific API functions to the renderer process.
- `ipcRenderer`: Electron module for sending asynchronous IPC messages from the renderer to the main process.

Code Author: Charles Andre C. Bandala
Date Created: 9/17/2024
Last Modified: 11/11/2024
*/

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