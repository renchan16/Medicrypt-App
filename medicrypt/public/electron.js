const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

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

async function showDialog(dialogFunction, options) {
  mainWindow.setEnabled(false);
  const result = await dialogFunction(options);
  mainWindow.setEnabled(true);
  return result;
}

// Handle file dialog from renderer
ipcMain.handle('dialog:openFilePath', async () => {
  const { canceled, filePaths } = await showDialog(dialog.showOpenDialog, {
    properties: ['openFile'],
    filters: [
      { name: 'Videos', extensions: ['mkv', 'avi', 'mp4', 'mov', 'wmv'] },
    ],
  });
  if (canceled) {
    return null;
  } else {
    return filePaths[0];  // Return the first selected file path
  }
});

// Handle file dialog from renderer
ipcMain.handle('dialog:openHashKeyPath', async () => {
  const { canceled, filePaths } = await showDialog(dialog.showOpenDialog, {
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

// Handle file dialog from renderer
ipcMain.handle('dialog:openFolder', async () => {
  const { canceled, filePaths } = await showDialog(dialog.showOpenDialog, {
    properties: ['openDirectory'],
  });
  if (canceled) {
    return null;
  } else {
    return filePaths[0];  // Return the first selected file path
  }
});

ipcMain.handle('dialog:checkFilePath', (event, filePath) => {
  try {
      const normalizedPath = path.normalize(filePath); // Normalize the path
      if (fs.existsSync(normalizedPath)) {
          const stat = fs.lstatSync(normalizedPath);
          return stat.isFile() || stat.isDirectory();
      }
      return false;
  } catch (err) {
      return false;
  }
});