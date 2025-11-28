const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');

const { getNewReleases } = require('./spotify');

const CLIENT_ID = '930c492bfac84d938ff3969b6b6beb08';
const CLIENT_SECRET = 'b646b0b0eedd4f7097b36553c78cb5f0';

ipcMain.handle('get-new-releases', async (event, limit) => {
  try {
    return await getNewReleases(CLIENT_ID, CLIENT_SECRET, limit);
  } catch (err) {
    console.error(err);
    return [];
  }
})

ipcMain.handle('open-album', async (event, url) => {
  try {
    await shell.openExternal(url);
  } catch (err) {
    console.error("Failed to open album:", err);
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(async() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
