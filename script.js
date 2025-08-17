//You can edit ALL of the code here
let fetchedEpisodes = [];
let fetchShows = [];
const episodeCache = {};

async function setup() {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "<p>Loading Shows, please wait...</p>";

  try {
    const response = await fetch("https://api.tvmaze.com/shows");
    if (!response.ok) {
      throw new Error(`Network issue ${response.status}`);
    }
    const showData = await response.json();
    fetchShows = showData;

    makePageForShows(fetchShows);
  } catch (error) {
    rootElem.innerHTML = `<p style="color:red;">Error loading data: ${error.message}</p>`;
  }
}

// Updated populateShowDropdown to accept a dropdown ID parameter
function populateShowDropdown(showList, dropdownId) {
  const selectShow = document.getElementById(dropdownId);
  if (!selectShow) return;

  showList.sort((a, b) => a.name.localeCompare(b.name));

  selectShow.innerHTML = "";
  const defaultShowOption = document.createElement("option");
  defaultShowOption.value = "";
  defaultShowOption.textContent = "--Select A Show--";
  selectShow.append(defaultShowOption);

  showList.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    selectShow.append(option);
  });

  selectShow.addEventListener("change", function () {
    const selectedShowId = this.value;
    if (selectedShowId) {
      displayFetchedEpisodes(selectedShowId);
    }
  });
}

async function displayFetchedEpisodes(showId) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "<p>Loading episodes, Please wait..</p>";

  if (episodeCache[showId]) {
    fetchedEpisodes = episodeCache[showId];
    makePageForEpisodes(fetchedEpisodes);
    return;
  }
  if (!showId) {
    rootElem.innerHTML = `<p>Please select a show to display its episodes.</p>`;
    makePageForEpisodes([]);
    return;
  }

  try {
    const response = await fetch(
      `https://api.tvmaze.com/shows/${showId}/episodes`
    );
    if (!response.ok) {
      throw new Error(`Network issue ${response.status}`);
    }
    const episodeList = await response.json();
    fetchedEpisodes = episodeList;
    episodeCache[showId] = episodeList;

    makePageForEpisodes(fetchedEpisodes);
  } catch (error) {
    rootElem.innerHTML = `<p style="color:red;">Error loading episodes for show ID ${showId}: ${error.message}</p>`;
  }
}

// Updated makePageForEpisodes with fixes:
//  - Changed show dropdown ID to 'select-show-switch'
//  - Populated show dropdown AFTER appending to DOM
//  - Passed dropdown ID to populateShowDropdown
function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const divDropDown = document.createElement("div");
  divDropDown.className = "dropDownContainer";

  const backButton = document.createElement("button");
  backButton.textContent = "← Back to All Shows";
  backButton.className = "back-button";
  backButton.addEventListener("click", () => {
    makePageForShows(fetchShows);
  });
  divDropDown.appendChild(backButton);

  // Search label and input
  const searchLabel = document.createElement("label");
  searchLabel.setAttribute("for", "episode-search-input");
  searchLabel.textContent = "Search Episodes: ";

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.id = "episode-search-input";
  searchInput.placeholder = "Search episodes...";

  // Paragraph display must be declared BEFORE append!
  const paragraphDisplay = document.createElement("p");
  paragraphDisplay.id = "selectedEpisodeInfo";
  paragraphDisplay.textContent = "All Episodes Displayed.";

  // Episode select label and dropdown
  const episodeSelectLabel = document.createElement("label");
  episodeSelectLabel.setAttribute("for", "episode-select");
  episodeSelectLabel.textContent = "Select an Episode: ";

  const episodeSelect = document.createElement("select");
  episodeSelect.id = "episode-select";
  episodeSelect.name = "episode-select";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "--Show All Episodes--";
  episodeSelect.append(defaultOption);

  // Show switch label and dropdown
  const showSelectLabel = document.createElement("label");
  showSelectLabel.setAttribute("for", "select-show-switch");
  showSelectLabel.textContent = "Switch Show: ";

  const showSelect = document.createElement("select");
  showSelect.id = "select-show-switch";
  showSelect.name = "show-switch-select";

  const showOption = document.createElement("option");
  showOption.value = "";
  showOption.textContent = "--Display Shows--";
  showSelect.append(showOption);

  // Append elements in the desired order
  divDropDown.append(searchLabel);
  divDropDown.append(searchInput);
  divDropDown.append(paragraphDisplay);
  divDropDown.append(episodeSelectLabel);
  divDropDown.append(episodeSelect);
  divDropDown.append(showSelectLabel);
  divDropDown.append(showSelect);

  // Append dropdown container to root
  rootElem.append(divDropDown);

  // Populate the show dropdown AFTER it's in the DOM
  populateShowDropdown(fetchShows, "select-show-switch");

  // === Render each episode card ===
  episodeList.forEach((episode) => {
    const episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(
      episode.number
    ).padStart(2, "0")}`;

    // Add option to episode dropdown
    const option = document.createElement("option");
    option.value = episodeCode;
    option.textContent = `${episodeCode} - ${episode.name}`;
    episodeSelect.append(option);

    // Create episode card
    const episodeDiv = document.createElement("div");
    episodeDiv.className = "episode";
    episodeDiv.setAttribute("data-episode-code", episodeCode);

    const cleanSummary = episode.summary
      ? episode.summary.replace(/<[^>]*>?/gm, "") // remove HTML tags
      : "No summary available.";

    episodeDiv.innerHTML = `
      <div class="episode-header">
        <h2>${episode.name} (${episodeCode})</h2>
      </div>
      <h3>Season ${episode.season}, Episode ${episode.number}</h3>
      <img src="${
        episode.image?.medium ||
        "https://via.placeholder.com/210x295?text=No+Image"
      }" alt="${episode.name}" />
      <p class="episode-summary">${ cleanSummary}</p>
      <a href="${episode.url}" target="_blank" rel="noopener">More on TVMaze</a>
    `;

    rootElem.append(episodeDiv);
  });

  // === Handle dropdown episode selection ===
  episodeSelect.addEventListener("change", function () {
    const selectedCode = this.value;

    if (selectedCode === "") {
      paragraphDisplay.textContent = "All Episodes Displayed.";
      document.querySelectorAll(".episode").forEach((div) => {
        div.style.display = "block";
      });
    } else {
      const selectedText = this.options[this.selectedIndex].textContent;
      paragraphDisplay.textContent = `You selected: ${selectedText}`;

      document.querySelectorAll(".episode").forEach((div) => {
        div.style.display = "none";
      });

      const target = document.querySelector(
        `[data-episode-code="${selectedCode}"]`
      );
      if (target) {
        target.style.display = "block";
      }
    }
  });

  // === Handle live episode search ===
  searchInput.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();
    const allEpisodes = document.querySelectorAll(".episode");
    let count = 0;

    allEpisodes.forEach((episodeDiv) => {
      const code = episodeDiv.getAttribute("data-episode-code").toLowerCase();
      const name = episodeDiv.querySelector("h2").textContent.toLowerCase();
      const summary = episodeDiv.querySelector(".episode-summary").textContent.toLowerCase();

      if (
        code.includes(searchTerm) ||
        name.includes(searchTerm) ||
        summary.includes(searchTerm)
      ) {
        episodeDiv.style.display = "block";
        count++;
      } else {
        episodeDiv.style.display = "none";
      }
    });

    paragraphDisplay.textContent = `Displaying ${count}/${episodeList.length} episodes`;
  });
}

function makePageForShows(showsList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  // Create filtering container (top bar)
  const filterContainer = document.createElement("div");
  filterContainer.className = "dropDownContainer";

  // Label for search input
  const filterLabel = document.createElement("label");
  filterLabel.textContent = "Search a Show: ";
  filterLabel.setAttribute("for", "show-search");

  // Search input
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Search shows...";
  searchInput.id = "show-search";

  // Paragraph to show count
  const showCount = document.createElement("p");
  showCount.id = "show-count";
  showCount.style.margin = "0"; // inline with others

  // Label for select dropdown
  const selectLabel = document.createElement("label");
  selectLabel.textContent = "Select a Show: ";
  selectLabel.setAttribute("for", "show-select");

  // Select dropdown
  const selectShow = document.createElement("select");
  selectShow.id = "show-select";
  selectShow.name = "show-select";

  // Default option
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "--Select A Show--";
  selectShow.appendChild(defaultOption);

  // Populate dropdown
  showsList
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((show) => {
      const option = document.createElement("option");
      option.value = show.id;
      option.textContent = show.name;
      selectShow.appendChild(option);
    });

  // Append all UI elements
  filterContainer.appendChild(filterLabel);
  filterContainer.appendChild(searchInput);
  filterContainer.appendChild(showCount);
  filterContainer.appendChild(selectLabel);
  filterContainer.appendChild(selectShow);
  rootElem.appendChild(filterContainer);

  // Shows container
  const showsContainer = document.createElement("div");
  showsContainer.className = "shows-container";
  rootElem.appendChild(showsContainer);

  // Function to render shows
  function renderShows(filteredShows) {
    showsContainer.innerHTML = "";
    showCount.textContent = `Found ${filteredShows.length} / ${showsList.length} shows`;

    filteredShows.forEach((show) => {
      const showCard = document.createElement("div");
      showCard.className = "show-card";

      showCard.innerHTML = `
        <div class="left-column">
          <h2 class="show-title" style="cursor:pointer; color:blue;">${
            show.name
          }</h2>
          <img src="${
            show.image?.medium ||
            "https://via.placeholder.com/210x295?text=No+Image"
          }" alt="${show.name}" />
        </div>
        <div class="show-info">
          <p>${show.summary || "No summary available."}</p>
        </div>
        <div class="show-meta">
          <p><strong>Genres:</strong> ${show.genres.join(", ")}</p>
          <p><strong>Status:</strong> ${show.status}</p>
          <p><strong>Rating:</strong> ${show.rating?.average || "N/A"}</p>
          <p><strong>Runtime:</strong> ${show.runtime} minutes</p>
        </div>
      `;

      // Add click handler to show title
      showCard.querySelector(".show-title").addEventListener("click", () => {
        displayFetchedEpisodes(show.id);
      });

      showsContainer.appendChild(showCard);
    });
  }

  // Initial render
  renderShows(showsList);

  // Search input listener
  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filtered = showsList.filter(
      (show) =>
        show.name.toLowerCase().includes(searchTerm) ||
        show.genres.join(" ").toLowerCase().includes(searchTerm) ||
        (show.summary && show.summary.toLowerCase().includes(searchTerm))
    );
    renderShows(filtered);
  });

  // Dropdown show selector
  selectShow.addEventListener("change", function () {
    const selectedId = this.value;
    if (selectedId) {
      displayFetchedEpisodes(selectedId);
    }
  });
}
window.onload = setup;
