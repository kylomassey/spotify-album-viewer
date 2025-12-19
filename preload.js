const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('spotify', {
  // You will add safe functions here later
  getNewReleases: (limit = 100) => ipcRenderer.invoke('get-new-releases', limit),
  getBandcampNewReleases: () => ipcRenderer.invoke('get-new-bandcamp-arrivals'),
  openAlbum: (url) => ipcRenderer.invoke('open-album', url),
  getGenres: () => ipcRenderer.invoke('get-genres'),
  spotifySearch: () => ipcRenderer.invoke('spotify-search', album),
  filterByGenre: (albums, genre) => ipcRenderer.invoke('filter-by-genre', albums, genre),
  sortByDate: (albums) => ipcRenderer.invoke('sort-by-date', albums),
  startReleases: () => ipcRenderer.invoke('start-releases'),
  continueReleases: () => ipcRenderer.invoke('continue-releases'),
  getFifty: (num) => ipcRenderer.invoke('get-fifty', num)
});