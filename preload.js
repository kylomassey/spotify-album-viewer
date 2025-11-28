const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('spotify', {
  // You will add safe functions here later
  getNewReleases: (limit = 20) => {
    return ipcRenderer.invoke('get-new-releases', limit);
  }

});