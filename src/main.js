const { app, BrowserWindow } = require('electron');
const path = require('path');

// Create the main window
let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Ensure preload.js exists
    },
  });

  // Load the HTML file
  mainWindow.loadFile('src/index.html'); // Ensure this file exists

  // Open DevTools (optional, for debugging)
  mainWindow.webContents.openDevTools();
};

// App is ready
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit the app when all windows are closed (except Mac)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
