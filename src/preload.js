// const { contextBridge, ipcRenderer } = require('electron');

// // Expose a secure API to the renderer process
// contextBridge.exposeInMainWorld('electronAPI', {
//   sendMessage: (channel, data) => {
//     ipcRenderer.send(channel, data); // Send data to main process
//   },
//   onMessage: (channel, callback) => {
//     ipcRenderer.on(channel, (event, args) => callback(args)); // Receive data from main process
//   },
// });


const { contextBridge, ipcRenderer } = require('electron');

// Expose safe APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  receive: (channel, func) =>
    ipcRenderer.on(channel, (event, ...args) => func(...args)),
});
