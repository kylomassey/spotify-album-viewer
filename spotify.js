const fs = require("fs");
const path = require("path");
const fetch = require('node-fetch');

let cache = { token: null, expires: 0 };

const genreMapPath = path.join(__dirname, "parent_subgenres.json");
const unknownGenrePath = path.join(__dirname, "unknown_genres.txt");

let genreMap = {};
try {
  const raw = fs.readFileSync(genreMapPath, "utf8");
  genreMap = JSON.parse(raw);
} catch (err) {
  console.error("Failed to load genre_map.json:", err);
  genreMap = {};
}

if (!fs.existsSync(unknownGenrePath)) {
  fs.writeFileSync(unknownGenrePath, "");
}

function normalizeGenre(g) {
  return g
    .toLowerCase()
    .replace(/-/g, " ")     // hip-hop → hip hop
    .replace(/\s+/g, " ")   // collapse multiple spaces
    .trim();
}

function logUnknownGenre(genre) {
  const norm = normalizeGenre(genre);

  let existing = [];
  try {
    if (fs.existsSync(unknownGenrePath)) {
      existing = fs.readFileSync(unknownGenrePath, "utf8")
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean);
    }
  } catch (err) {
    console.error("Failed to read unknown genres file:", err);
  }

  if (!existing.includes(norm)) {
    try {
      fs.appendFileSync(unknownGenrePath, norm + "\n");
    } catch (err) {
      console.error("Failed to write unknown genre:", err);
    }
  }
}

async function getToken(clientId, clientSecret) {
    // If cached token is still valid, use it
    if (cache.token && cache.expires > Date.now()) return cache.token;

    // Encode credentials in Base64
    const credentials = Buffer.from(clientId + ':' + clientSecret).toString('base64');

    const resp = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
        Authorization: 'Basic ' + credentials,
        'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });

    const data = await resp.json();

    cache.token = data.access_token;
    cache.expires = Date.now() + (data.expires_in - 60) * 1000;

    return cache.token;
}

async function getBandcampNewArrivals() {
    const url = "https://bandcamp.com/api/discover/3/get";
    const body = {
        "filters": {
            "format": "all",
            "sort": "date",
            "search_term": "",
        },
        "page": 0,
        "count": 50
    };
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        throw new Error(`Bandcamp error: ${res.status}`);
    }
    const data = await res.json();
    return data;
}


async function getNewReleases(offset = 0, limit = 100) {
    const resp = await fetch(
        `https://musicbrainz.org/ws/2/release/?query=status:official AND primarytype:album AND format:"Digital Media" AND date:[2025-12-02 TO 2025-12-09]
        &inc=artist-credits&limit=${limit}&offset=${offset}&fmt=json`,
        {
        headers: {
            "User-Agent": "MyAppName/1.0 ( 1jonmoore1997@gmail.com )"
        }
        }
    );

    const data = await resp.json();
    return data;
}

async function getGenres() {
  return Object.keys(genreMap); 
}

async function spotifySearch(clientId, clientSecret, artist, limit = 1) {
  const token = await getToken(clientId, clientSecret);

  const resp = await fetch(
    `https://api.spotify.com/v1/search?q=${artist}&type=artist&limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  const data = await resp.json();
  return data.artists.items;
}

async function getArtistGenres(clientId, clientSecret, artistId) {
  const token = await getToken(clientId, clientSecret);

  const resp = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  const data = await resp.json();
  return data.genres;
}

async function filterAlbumsByGenre(clientId, clientSecret, albums, selectedGenre) {
  const results = [];

  for (const album of albums) {
    const artistId = album.artists[0]?.id;
    if (!artistId) continue;

    const artistGenres = await getArtistGenres(clientId, clientSecret, artistId);

    if (artistMatchesGenre(artistGenres, selectedGenre)) {
      results.push(album);
    }
  }

  return results;
}

function artistMatchesGenre(artistGenres, selectedGenre) {
  const normalizedSelected = normalizeGenre(selectedGenre);

  for (const g of artistGenres) {
    const norm = normalizeGenre(g);

    // 1) Flag unknown genres (not present in ANY parent list)
    const isKnown = Object.values(genreMap).some(list =>
      list.map(normalizeGenre).includes(norm)
    );
    if (!isKnown) {
      logUnknownGenre(norm);
    }

    // 2) Direct mapping: if this artist genre is explicitly in selected parent bucket
    const parentList = genreMap[normalizedSelected];
    if (parentList && parentList.map(normalizeGenre).includes(norm)) {
      return true;
    }

    // 3) Loose matching: subgenre contains parent name (e.g., "southern hip hop" contains "hip hop")
    if (norm.includes(normalizedSelected)) {
      return true;
    }
  }

  return false;
}

function sortAlbumsByDate(albums) {
  return albums.sort((a, b) => {
    return new Date(b.release_date) - new Date(a.release_date);
  });
}

module.exports = {
  getToken,
  getGenres,
  getNewReleases,
  getBandcampNewArrivals,
  spotifySearch,
  getArtistGenres,
  filterAlbumsByGenre,
  sortAlbumsByDate,
};
