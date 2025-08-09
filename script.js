//You can edit ALL of the code here
let fetchedEpisodes = [];
let fetchShows = []
const episodeCache = {}

async function setup() {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "<p>Loading Shows, please wait...</p>";

  try {
    const response =await fetch("https://api.tvmaze.com/shows")
    if(!response.ok) {
      throw new Error(`Network issue ${response.status}`);
    }
    const showData = await response.json()
    fetchShows = showData

    const defaultShowId = '2'
    const episodesResponse = await fetch(`https://api.tvmaze.com/shows/${defaultShowId}/episodes`);
    const defaultEpisodes = await episodesResponse.json()
    
    fetchedEpisodes = defaultEpisodes
    makePageForEpisodes(fetchedEpisodes)

    populateShowDropdown(fetchShows);
  } catch (error){
    rootElem.innerHTML = rootElem.innerHTML = `<p style="color:red;">Error loading data: ${error.message}</p>`;
  }
}

  // This function populates the 'select-show' dropdown with options
  function populateShowDropdown(showList) {
    const selectShow = document.getElementById('select-show');
    showList.sort((a, b) => a.name.localeCompare(b.name));

    // Clear any existing options and add the default
    selectShow.innerHTML = '';
    const defaultShowOption = document.createElement('option');
    defaultShowOption.value = '';
    defaultShowOption.textContent = '--Select A Show--';
    selectShow.append(defaultShowOption);

    // Loop over the shows and add them as options
    showList.forEach((show) => {
      const option = document.createElement('option');
      option.value = show.id;
      option.textContent = show.name;
      selectShow.append(option);
    });

    // Add the event listener to the 'select-show' dropdown
    selectShow.addEventListener('change', function() {
      const selectedShowId = this.value;
      if (selectedShowId) {
        displayFetchedEpisodes(selectedShowId);

      }
    });
  }

  // This function fetches and displays episodes for a given show ID
  async function displayFetchedEpisodes(showId) {
    const rootElem = document.getElementById('root');
    rootElem.innerHTML = '<p>Loading episodes, Please wait..</p>';
    
    if(episodeCache[showId]){
        fetchedEpisodes = episodeCache[showId]
        makePageForEpisodes(fetchedEpisodes)
        return;
    }
    if (!showId) {
      rootElem.innerHTML = `<p>Please select a show to display its episodes.</p>`;
      makePageForEpisodes([]);
      return;
    }
    
    try {
      const response = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
      const episodeList = await  response.json()
      fetchedEpisodes =  episodeList
      makePageForEpisodes(fetchedEpisodes)

    } catch(error) {
      rootElem.innerHTML = `<p style="color:red;">Error loading episodes for show ID ${showId}: ${error.message}</p>`;
    }
  }


function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  const divDropDown = document.createElement("div");
  divDropDown.classList = "dropDownContainer";

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.id = "search-input";
  searchInput.placeholder = "Search Episodes..";
  divDropDown.append(searchInput);

  const label = document.createElement("label");
  label.textContent = "Select An Episode ";
  label.setAttribute("for", "select-movie");

  const selectMovie = document.createElement("select");
  selectMovie.id = "select-movie";

  const label2 = document.createElement("label");
  label2.textContent = "Select A Show ";
  label2.setAttribute("for", "select-show");

  const selectShow = document.createElement("select");
  selectShow.id = "select-show";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "--Show All Episodes--";
  selectMovie.append(defaultOption);

  const showOption = document.createElement("option");
  showOption.value = "";
  showOption.textContent = "--Display Shows--";
  selectShow.append(showOption);

  const paragraphDisplay = document.createElement("p");
  paragraphDisplay.id = "selectedMovie";
  paragraphDisplay.textContent = "All Episodes Displayed.";

  divDropDown.append(label);
  divDropDown.append(selectMovie);
  divDropDown.append(label2)
  divDropDown.append(selectShow);
  divDropDown.append(paragraphDisplay);

  rootElem.append(divDropDown);
  
  populateShowDropdown(fetchShows)
  
  episodeList.forEach((episode) => {
    // Format the episode code (e.g., S02E07)
    const episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(
      episode.number
    ).padStart(2, "0")}`;

    const option = document.createElement("option");
    option.value = episodeCode;
    option.textContent = `${episodeCode} - ${episode.name}`;
    selectMovie.append(option);

    // Create the episode container
    const episodeDiv = document.createElement("div");
    episodeDiv.className = "episode";
    episodeDiv.setAttribute("data-episode-code", episodeCode);

    // Populate the episode details
    episodeDiv.innerHTML = `<div class="episode-header">
      <h2>${episode.name} (${episodeCode})</h2>
      </div>
      <h3>Season ${episode.season}, Episode ${episode.number}</h3>

      <img src="${episode.image?.medium}" alt="${episode.name}" />
      <p>${episode.summary || "No summary available."}</p>
      <a href="${episode.url}" target="_blank">More on TVMaze</a>
    `;
    rootElem.appendChild(episodeDiv);
  });

  // event listener to the show episodes.
  selectMovie.addEventListener("change", function () {
    const selectedMovie = this.value;

    if (selectedMovie === "") {
      paragraphDisplay.textContent = "All Episodes Selected";
      document.querySelectorAll(".episode").forEach((div) => {
        div.style.display = "block";
      });
    } else {
      // Find the text content for the display
      const selectedOptionText = this.options[this.selectedIndex].textContent;
      paragraphDisplay.textContent = `You selected: ${selectedOptionText}`;

      // Hide all episode divs first
      document.querySelectorAll(".episode").forEach((div) => {
        div.style.display = "none";
      });

      // Then show only the selected one
      const target = document.querySelector(
        `[data-episode-code="${selectedMovie}"]`
      );
      if (target) {
        target.style.display = "block";
      }
    }
  });

  // event listener to the search input.
  searchInput.addEventListener("input", function () {
    const searchItem = this.value.toLowerCase();
    const allEpisodes = document.querySelectorAll(".episode");

    let count = 0;
    allEpisodes.forEach((episodeDiv) => {
      const episodeCode = episodeDiv
        .getAttribute("data-episode-code")
        .toLowerCase();
      const episodeName = episodeDiv
        .querySelector("h2")
        .textContent.toLowerCase();

      if (
        episodeCode.includes(searchItem) ||
        episodeName.includes(searchItem)
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

window.onload = setup;
