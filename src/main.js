const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Create the main window
let mainWindow;
let popupWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile('src/index.html');
  mainWindow.webContents.openDevTools();
};

const createPopupWindow = () => {
  popupWindow = new BrowserWindow({
    width: 400,
    height: 200,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preloads/popup-preload.js'), // Preload for popup
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  popupWindow.loadFile('src/popup.html');
  popupWindow.hide(); // Hide initially
};

// Handle 'show-popup' Event
ipcMain.on('show-popup', (event, message) => {
  console.log('Showing popup with message:', message); // Debugging
  popupWindow.webContents.send('update-message', message); // Send message to popup
  popupWindow.show(); // Show popup
  setTimeout(() => popupWindow.hide(), 10000); // Hide after 10 seconds
});

app.whenReady().then(() => {
  createWindow();
  createPopupWindow();

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
