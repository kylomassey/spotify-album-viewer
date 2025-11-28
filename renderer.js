console.log("Renderer loaded");

window.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("albums");

  // call your backend through preload
  const albums = await window.spotify.getNewReleases(30);

  // debug
  console.log("Albums received:", albums);

  // if nothing came back
  if (!albums || albums.length === 0) {
    container.innerHTML = "<p>No albums found</p>";
    return;
  }

  // Add albums to the page
  container.innerHTML = "";

  albums.forEach(album => {
    const div = document.createElement("div");
    div.classList.add("album");
    div.style.cursor = "pointer";

    // Album cover
    const img = document.createElement("img");
    img.src = album.images[0]?.url;   // largest image returned by Spotify
    img.alt = album.name;

    // Album name
    const title = document.createElement("h3");
    title.textContent = album.name;

    // Artist name(s)
    const artist = document.createElement("p");
    artist.textContent = album.artists.map(a => a.name).join(", ");

    // CLICK HANDLER — opens Spotify app/browser
    div.addEventListener("click", () => {
      const spotifyUrl = album.external_urls.spotify;
      window.spotify.openAlbum(spotifyUrl);
    });

    // Add elements to the album card
    div.appendChild(img);
    div.appendChild(title);
    div.appendChild(artist);

    container.appendChild(div);
  });
});
