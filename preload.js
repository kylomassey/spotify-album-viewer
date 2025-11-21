const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // You will add safe functions here later
});