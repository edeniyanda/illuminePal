const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Global variables for windows
let mainWindow;
let popupWindow; // Add popup window reference
let preInformWindow;
let longBreakWindow;

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

  popupWindow.loadFile('src/html/popup.html'); // Ensure popup.html exists

  popupWindow.on('closed', () => {
    popupWindow = null; // Clear reference on close
  });
}

// Create the Pre-Inform Window
function showPreInformPopup() {
  if (preInformWindow) {
    preInformWindow.focus(); // Focus if already exists
    return;
  }

  preInformWindow = new BrowserWindow({
    width: 400,
    height: 200,
    frame: false,
    alwaysOnTop: true, // Ensure popup appears above all windows
    transparent: true, // Transparent background
    skipTaskbar: true, // Don't show in taskbar
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
    },
  });

  preInformWindow.loadFile('src/html/preInform.html'); // Load Pre-Inform UI
  preInformWindow.on('closed', () => (preInformWindow = null));
}

// Handle Long Break Window
function startLongBreak(durationInMinutes) {
  if (longBreakWindow) {
    longBreakWindow.focus(); // Focus if already exists
    return;
  } 

  longBreakWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    alwaysOnTop: true,
    fullscreen: true, // Fullscreen mode
    resizable: false,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
    },
  });

  longBreakWindow.loadFile('src/html/longBreak.html'); // Load Long Break UI
  longBreakWindow.on('closed', () => (longBreakWindow = null));

  // Send duration to long break window
  longBreakWindow.webContents.once('did-finish-load', () => {
    longBreakWindow.webContents.send('start-long-break-timer', durationInMinutes);
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
    popupWindow.setBounds({ width: 400, height: 200 }); // Adjust dynamically if needed


    console.log('Showing popup with message:', message);

    // Automatically close popup after 10 seconds
    setTimeout(() => {
      if (popupWindow && !popupWindow.isDestroyed()) {
        popupWindow.hide();
      }
    }, 5000); // 7 seconds 
  }
});

// IPC Event for Pre-Inform
ipcMain.on('show-preinform', (event, message) => {
  console.log(`Received show-preinform event ${message}`);
  showPreInformPopup();
 
}); 
 
// IPC Event for Long Break
ipcMain.on('start-long-break', (event, duration) => {
  startLongBreak(duration);
});

// IPC Event for Delaying Long Break
ipcMain.on('delay-long-break', (event, delayMinutes) => {
  console.log(`Delaying long break by ${delayMinutes} minutes`);
  setTimeout(() => {
    showPreInformPopup(); // Re-show pre-inform popup after delay
  }, delayMinutes * 60 * 1000);
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
