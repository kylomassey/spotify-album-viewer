const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');

const { getNewReleases, getGenres, spotifySearch, filterAlbumsByGenre, sortAlbumsByDate,getBandcampNewArrivals } = require('./spotify');
const { get } = require('https');
const { release } = require('os');
const { ClientRequest } = require('http');

const CLIENT_ID = '930c492bfac84d938ff3969b6b6beb08';
const CLIENT_SECRET = 'b646b0b0eedd4f7097b36553c78cb5f0';

const albumarr = [];

const releasestream = newReleases();
const delay = ms => new Promise(res => setTimeout(res, ms));

ipcMain.handle('get-new-releases', async (event, limit) => {
  try {
    return await getNewReleases(limit);
  } catch (err) {
    console.error(err);
    return [];
  }
})

ipcMain.handle('get-new-bandcamp-arrivals', async (event) => {
  return getBandcampNewArrivals();
}

)

ipcMain.handle('get-genres', async () => {
  return await getGenres();
});

ipcMain.handle('spotify-search', async (album) => {
  return await spotifySearch(CLIENT_ID, CLIENT_SECRET, album);
});

ipcMain.handle('filter-by-genre', async (event, albums, genre) => {
  return await filterAlbumsByGenre(CLIENT_ID, CLIENT_SECRET, albums, genre);
});

ipcMain.handle('sort-by-date', async (event, albums) => {
  return sortAlbumsByDate(albums);
});


ipcMain.handle('open-album', async (event, url) => {
  try {
    await shell.openExternal(url);
  } catch (err) {
    console.error("Failed to open album:", err);
  }
});

ipcMain.handle('start-releases', async () => {
  return await releasestream.next();
});

ipcMain.handle('continue-releases', async() => {
  releasestream.next();
});

ipcMain.handle('get-fifty', async(event, num) =>{
  //console.log(num);
  num = num * 50;
  if(num > albumarr.length)
    return null;
  else{
    const fifty = albumarr.slice(num,num + 50);
    return fifty;
  }
});

/*async function serialize(array){
  for (const album of array){
    if (typeof album.genre !== 'string')
      album.genre = await album.genre(CLIENT_ID, CLIENT_SECRET, album.title);
  };
  return array
}*/

async function* newReleases(){
  bandcamp = await getBandcampNewArrivals();
  bandcampSift(bandcamp);
  console.log(bandcamp.items.length);
  yield albumarr.slice(0,50);
  let musicbrainz = await getNewReleases();
  let count = musicbrainz.count;
  console.log(count);
  let fetchtime = Date.now() + 1000;
  musicbrainzSift(musicbrainz);

  for (let i = 100; i < count; i+=100){
    const now = Date.now()
    const remain = fetchtime - now;
    if(remain > 0)
      await delay(remain);
    fetchtime = Date.now() + 1000;
    musicbrainz = await getNewReleases(i);
    musicbrainzSift(musicbrainz);
  }
};

function musicbrainzSift(musicbrainz){
  musicbrainz.releases.forEach(release => {
      albumarr.push({title: release.title,
        artist: release["artist-credit"][0].name,
        image: `https://coverartarchive.org/release/${release.id}/front`/*,
        genre: async function genrefind(CLIENT_ID,CLIENT_SECRET, artist = release.artist){
          return await spotifySearch(CLIENT_ID,CLIENT_SECRET,artist);
  }*/})})
}

function bandcampSift(bandcamp){
  bandcamp.items.forEach(release => {
    albumarr.push({title: release.primary_text,
      artist: release.secondary_text,
      image: `https://f4.bcbits.com/img/a${release.art_id}_1.jpg`,
      date: release.publish_date,
      genre: release.genre_text
  })});
}


function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
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
