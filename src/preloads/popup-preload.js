const { contextBridge, ipcRenderer } = require('electron');

// Expose IPC Renderer to popup window
contextBridge.exposeInMainWorld('electronAPI', {
  receive: (channel, callback) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args));
  },
});

// console.log('Popup Preload Script Loaded');
