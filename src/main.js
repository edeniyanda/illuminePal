const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Create the main window
let mainWindow;
let popupWindow; // Add popup window reference

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

// Create Popup Window
function createPopupWindow() {
  popupWindow = new BrowserWindow({
    width: 350,
    height: 200,
    frame: false, // Remove title bar
    alwaysOnTop: true, // Ensure popup appears above all windows
    transparent: true, // Transparent background
    skipTaskbar: true, // Don't show in taskbar
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Use preload for IPC
    },
  });

  popupWindow.loadFile('src/popup.html'); // Ensure popup.html exists

  popupWindow.on('closed', () => {
    popupWindow = null; // Clear reference on close
  });
}

// Handle 'show-popup' Event
ipcMain.on('show-popup', (event, message) => {
  if (!popupWindow) {
    createPopupWindow(); // Create popup if not already created
  }

  // Ensure popup window is still valid before accessing it
  if (popupWindow && !popupWindow.isDestroyed()) {
    popupWindow.webContents.send('update-message', message); // Update message
    popupWindow.show(); // Show popup window

    console.log('Showing popup with message:', message);

    // Automatically close popup after 10 seconds
    setTimeout(() => {
      if (popupWindow && !popupWindow.isDestroyed()) {
        popupWindow.hide();
      }
    }, 10000); // 10 seconds
  }
});

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
