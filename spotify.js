const fetch = require('node-fetch');

let cache = { token: null, expires: 0 };

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

async function getNewReleases(clientId, clientSecret, limit = 20) {
    const token = await getToken(clientId, clientSecret);
    const resp = await fetch(
        `https://api.spotify.com/v1/browse/new-releases?limit=${limit}`,
        {
        headers: {
            Authorization: 'Bearer ' + token
        }
        }
    );

    const data = await resp.json();
    return data.albums.items;
}

module.exports = { getToken, getNewReleases };
