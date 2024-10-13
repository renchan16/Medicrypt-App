/* 
Electron Main Process:
----------------------
This Electron application manages the main window, file dialog interactions, and CSV parsing. It uses `BrowserWindow` to create the application's window, `dialog` to open file and folder selection dialogs, and `ipcMain` to handle inter-process communication with the renderer process.

Functions:
----------
1. createWindow():
   - Initializes the Electron main window (`BrowserWindow`) with a predefined size and loads the application at 'http://localhost:3000'.
   
2. app.whenReady():
   - Runs the `createWindow` function when the Electron app is ready and handles window activation events.
   
3. app.on('window-all-closed'):
   - Quits the application when all windows are closed unless the platform is macOS (`darwin`).

4. showSingleDialog(dialogOptions):
   - Opens a dialog window to select files or directories based on the given `dialogOptions`. Ensures only one dialog is open at a time.

IPC Handlers:
-------------
1. dialog:openFilePath (ipcMain.handle):
   - Opens a file dialog for selecting video files (`mkv`, `avi`, `mp4`, `mov`, `wmv`) and allows multiple file selections. Returns the selected file paths or `null` if the dialog was canceled.

2. dialog:openEncryptedFilePath (ipcMain.handle):
   - Opens a file dialog for selecting encrypted video files (`avi`). Returns the selected file paths or `null` if the dialog was canceled.

3. dialog:openHashKeyPath (ipcMain.handle):
   - Opens a file dialog for selecting key files (`key`). Returns the selected file paths or `null` if the dialog was canceled.

4. dialog:openFolder (ipcMain.handle):
   - Opens a directory selection dialog. Returns the selected directory path or `null` if the dialog was canceled.

5. dialog:checkFilePath (ipcMain.handle):
   - Checks if the provided file paths (either a string or an array of strings) exist and are valid files or directories. Returns `true` if all paths are valid, otherwise `false`.

6. dialog:openFileLocation (ipcMain.handle):
   - Opens the directory containing the provided file path or opens the directory itself if it's a folder. Returns `true` if the location was successfully opened, otherwise `false`.

7. parse-csv (ipcMain.handle):
   - Parses a CSV file located at the provided file path using the `papaparse` library. Returns the parsed data or an error if parsing fails.

Variables:
----------
- mainWindow:
  Global variable that stores the reference to the main application window (`BrowserWindow`).
  
- currentDialog:
  Global variable that tracks the currently active dialog window to prevent multiple dialogs from opening simultaneously.

Dependencies:
-------------
- Electron modules: `app`, `BrowserWindow`, `dialog`, `ipcMain`, `shell` for managing the application, dialogs, and inter-process communication.
- `path`: Node.js module for handling file paths.
- `fs`: Node.js module for filesystem interactions.
- `Papa`: Library for parsing CSV files.

Code Author: Renz Carlo T. Caritativo, Charles Andre C. Bandala
*/

const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const Papa = require('papaparse');

let mainWindow;
let currentDialog = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadURL('http://localhost:3000');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

async function showSingleDialog(dialogOptions) {
  if (currentDialog) {
    currentDialog.close();
  }

  return new Promise((resolve) => {
    currentDialog = dialog.showOpenDialog(mainWindow, dialogOptions);
    currentDialog.then((result) => {
      currentDialog = null;
      resolve(result);
    });
  });
}

// Handle open File Explorer for Video Files
ipcMain.handle('dialog:openFilePath', async () => {
  const { canceled, filePaths } = await showSingleDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Videos', extensions: ['mkv', 'avi', 'mp4', 'mov', 'wmv'] },
    ],
  });
  if (canceled) {
    return null;
  } else {
    return filePaths;  // Return the first selected file path
  }
});

// Handle file File Explorer for Encrypted Video Files
ipcMain.handle('dialog:openEncryptedFilePath', async () => {
  const { canceled, filePaths } = await showSingleDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Videos', extensions: ['avi'] },
    ],
  });
  if (canceled) {
    return null;
  } else {
    return filePaths;  // Return the first selected file path
  }
});

// Handle file File Explorer for Key Files
ipcMain.handle('dialog:openHashKeyPath', async () => {
  const { canceled, filePaths } = await showSingleDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Key', extensions: ['key'] },
    ],
  });
  if (canceled) {
    return null;
  } else {
    return filePaths;  // Return the first selected file path
  }
});

// Handle file File Explorer for Destination Location
ipcMain.handle('dialog:openFolder', async () => {
  const { canceled, filePaths } = await showSingleDialog({
    properties: ['openDirectory'],
  });
  if (canceled) {
    return null;
  } else {
    return filePaths[0];  // Return the first selected file path
  }
});

// Handle file path checking
ipcMain.handle('dialog:checkFilePath', (event, filePaths) => {
  try {
    if (Array.isArray(filePaths)) {
      // Iterate over each file path and check if it exists and is a file or directory
      return filePaths.every(filePath => {
        const normalizedPath = path.normalize(filePath); // Normalize the path
        if (fs.existsSync(normalizedPath)) {
          const stat = fs.lstatSync(normalizedPath);
          return stat.isFile() || stat.isDirectory();
        }
        return false;
      });
    } else if (typeof filePaths === 'string') {
      // Check if the single file path is a valid file or directory
      const normalizedPath = path.normalize(filePaths); // Normalize the path
      if (fs.existsSync(normalizedPath)) {
        const stat = fs.lstatSync(normalizedPath);
        return stat.isFile() || stat.isDirectory();
      }
    }
    return false; // If input is neither an array nor a valid path, return false
  } catch (err) {
    return false;
  }
});

// Handle directory location opening
ipcMain.handle('dialog:openFileLocation', (event, filePath) => {
  try {
    const normalizedPath = path.normalize(filePath);
    
    if (fs.existsSync(normalizedPath)) {
      shell.showItemInFolder(normalizedPath);
      return true;
    }
    return false; // Path does not exist
  } catch (err) {
    console.error('Error opening file or directory location:', err);
    return false; // Error occurred
  }
});

ipcMain.handle('parse-csv', async (event, filepath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        Papa.parse(data, {
          header: true,
          complete: (results) => resolve(results.data),
          error: (error) => reject(error),
        });
      }
    });
  });
});