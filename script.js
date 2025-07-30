//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  episodeList.forEach((episode) => {
    // Format the episode code (e.g., S02E07)
    const episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(
      episode.number
    ).padStart(2, "0")}`;

    // Create the episode container
    const episodeDiv = document.createElement("div");
    episodeDiv.className = "episode";

    // Populate the episode details
    episodeDiv.innerHTML = `
     
   <div class="episode-header">
      <h2>${episode.name} (${episodeCode})</h2>
      </div>
      <h3>Season ${episode.season}, Episode ${episode.number}</h3>

      <img src="${episode.image?.medium}" alt="${episode.name}" />
      <p>${episode.summary || "No summary available."}</p>
      <a href="${episode.url}" target="_blank">More on TVMaze</a>
    `;

    rootElem.appendChild(episodeDiv);
  });

  // Add source attribution
  const attribution = document.createElement("p");
  attribution.innerHTML =
    'Data originally from <a href="https://tvmaze.com/" target="_blank">TVMaze.com</a>';
  rootElem.appendChild(attribution);
}

window.onload = setup;
