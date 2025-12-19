console.log("RENDERER LOADED!");

window.addEventListener("DOMContentLoaded", () => {
  const genreSlider = document.getElementById("genreSlider");
  const albumContainer = document.getElementById("albumContainer");
  const leftArrow = document.getElementById("arrowL");
  const rightArrow = document.getElementById("arrowR");
  let num = 0;

  async function loadGenres() {
    const genres = await window.spotify.getGenres(); // returns keys from genre_map.json

    genres.forEach((g) => {
      const opt = document.createElement("div");
      opt.value = g;
      opt.className = "genre-div";
      opt.innerHTML =`<button value = "${g}" class = "genre-button">${g}</button>`;    // "hip-hop"
      genreSlider.appendChild(opt);
    });
  }

  loadGenres();
  renderAlbums();

  async function renderAlbums(albums = null) {
    let first = false;
    if(albums == null){
      first = true
      albums = await window.spotify.startReleases();
    }
    albumContainer.innerHTML = "";
    console.log(albums);

    if (albums.length === 0) {
      albumContainer.innerHTML = "<p>No albums found.</p>";
      return;
    }

    if(first){
      albums.value.forEach(album => {
        const card = document.createElement("div");
        card.className = "album-card";

        card.innerHTML = `
          <img src="${album.image}" class="album-img" />
          <div class="album-info">
            <h3>${album.title}</h3>
            <p>${album.artist}</p>
          </div>
        `;

        // Click behavior → open Spotify album
        /*card.addEventListener("click", () => {
          const url = album.external_urls?.spotify;
          if (url) window.open(url, "_blank");
        });*/

        albumContainer.appendChild(card);
      });
    first = false;
    }else{
      albums.forEach(album => {
        const card = document.createElement("div");
        card.className = "album-card";

        card.innerHTML = `
          <img src="${album.image}" class="album-img" />
          <div class="album-info">
            <h3>${album.title}</h3>
            <p>${album.artist}</p>
          </div>
        `;

        // Click behavior → open Spotify album
        /*card.addEventListener("click", () => {
          const url = album.external_urls?.spotify;
          if (url) window.open(url, "_blank");
        });*/

        albumContainer.appendChild(card);
      });
    }
    window.spotify.continueReleases()
  }

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("genre-button")) {
        console.log(e.target.value);
        albumContainer.innerHTML = "<p>Loading…</p>";
    }
    else return;
  });

  rightArrow.addEventListener("click", async () => {
    num += 1;
    albums = await window.spotify.getFifty(num);
    if (albums != null){
      albumContainer.innerHTML = "";
      renderAlbums(albums);
    }else{
      num -=1
    }
  });

  leftArrow.addEventListener("click", async () => {
    num -= 1;
    albums = await window.spotify.getFifty(num);
    if (albums != null){
      albumContainer.innerHTML = "";
      renderAlbums(albums);
    }else{
      num += 1
    }
  });

});
