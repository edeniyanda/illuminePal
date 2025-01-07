const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Main and Popup Windows
let mainWindow;
let popupWindow;

// Create Main Window
const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Preload script
      contextIsolation: true, // Enable context isolation
      enableRemoteModule: false,
      nodeIntegration: false // Keep nodeIntegration off for security
    },
  });

  mainWindow.loadFile('src/index.html');
  mainWindow.webContents.openDevTools(); // Optional for debugging
};

// Create Popup Window
const createPopupWindow = () => {
  popupWindow = new BrowserWindow({
    width: 300,
    height: 150,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  popupWindow.loadFile('src/popup.html'); // Ensure popup.html exists
  popupWindow.hide(); // Hide initially
};

// Handle 'show-popup' Event
ipcMain.on('show-popup', (event, message) => {
  popupWindow.webContents.send('update-message', message);
  console.log('Showing popup with message:', message);
  popupWindow.show(); // Show popup
  setTimeout(() => popupWindow.hide(), 10000); // Hide after 10 seconds
});

app.whenReady().then(() => {
  createMainWindow();
  createPopupWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
