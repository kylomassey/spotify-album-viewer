const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('spotify', {
  // You will add safe functions here later
  getNewReleases: (limit = 20) => ipcRenderer.invoke('get-new-releases', limit),
  openAlbum: (url) => ipcRenderer.invoke('open-album', url)
});