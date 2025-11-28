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
  albums.forEach(album => {
    const div = document.createElement("div");
    div.classList.add("album");

    div.textContent = album.name;

    container.appendChild(div);
  });
});
