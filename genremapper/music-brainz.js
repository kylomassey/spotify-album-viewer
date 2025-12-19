const fs = require("fs");
const path = require("path");
const fetch = require('node-fetch');
const musicBrainzGenrePath = path.join(__dirname, "music_brainz_genres.txt");

const delay = ms => new Promise(res => setTimeout(res, ms))

async function main(){
    fs.writeFileSync(musicBrainzGenrePath, "");

    for(let i = 0; i <2100; i+=100){
        const data = await getGenres(i);
        for (const genre of data.genres){
            fs.appendFileSync(musicBrainzGenrePath, genre.name + "\n");
        }
        await delay(1000);
    }
}

main();

async function getGenres(offset) {
    const resp = await fetch(
        `https://musicbrainz.org/ws/2/genre/all?fmt=json&limit=2097&offset=${offset}`,
        {
        headers: {
            "User-Agent": "MyAppName/1.0 ( 1jonmoore1997@gmail.com )"

        }
        }
    );

    const data = await resp.json();
    console.log(data);
    return data;
}
