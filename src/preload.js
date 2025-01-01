const { contextBridge, ipcRenderer } = require('electron');

// Expose a secure API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (channel, data) => {
    ipcRenderer.send(channel, data); // Send data to main process
  },
  onMessage: (channel, callback) => {
    ipcRenderer.on(channel, (event, args) => callback(args)); // Receive data from main process
  },
});
