const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

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
    return filePaths[0];  // Return the first selected file path
  }
});

// Handle file File Explorer for Key Files
ipcMain.handle('dialog:openHashKeyPath', async () => {
  const { canceled, filePaths } = await showSingleDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Key', extensions: ['key'] },
    ],
  });
  if (canceled) {
    return null;
  } else {
    return filePaths[0];  // Return the first selected file path
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
    // Ensure the input is a list of file paths
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
    }
    return false; // If input is not an array, return false
  } catch (err) {
    return false;
  }
});

// Handle directory location opening
ipcMain.handle('dialog:openFileLocation', (event, filePath) => {
  try {
    const normalizedPath = path.normalize(filePath);
    if (fs.existsSync(normalizedPath)) {
      const stat = fs.lstatSync(normalizedPath);
      if (stat.isFile()) {
        const dirPath = path.dirname(normalizedPath);
        shell.openPath(dirPath);
        return true;
      }
    }
    return false;
  } catch (err) {
    console.error('Error opening file location:', err);
    return false;
  }
});