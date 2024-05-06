// Define currentSong as Audio object
let currentSong = new Audio();
let play = document.getElementById("play");
let songs;
let currFolder;
let previous = document.querySelector("#previous");
let next = document.querySelector("#next");

// Function to convert seconds to minutes and seconds
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || !isFinite(seconds)) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");
  return `${formattedMinutes}:${formattedSeconds}`;
}

// Function to fetch songs from a folder
async function getSongs(folder) {
  try {
    currFolder = folder;
    let response = await fetch(`${currFolder}/`);
    let htmlContent = await response.text();
    let div = document.createElement("div");
    div.innerHTML = htmlContent;
    let anchorTags = div.querySelectorAll("a");
    songs = [];
    anchorTags.forEach((element) => {
      if (element.href.endsWith(".mp3")) {
        songs.push(element.href.split(`${currFolder}/`)[1]);
      }
    });
    let songsList = document.querySelector(".songsList ol");
    songsList.innerHTML = "";
    songs.forEach((song) => {
      songsList.innerHTML += `
        <li class="flex m-2 p-2 cursor-pointer border border-gray-600 rounded-md justify-between gap-2 items-center">
          <img class="invert w-5" src="Media/music.svg" alt="music" />
          <div class="info text-sm w-36">
            <div>${decodeURI(
              song.replaceAll("%20", " ").replaceAll("%26", " ")
            )}</div>
          </div>
          <div class="playNow flex items-center gap-2 text-sm">
            <span>Play now</span>
            <img class="invert w-6" src="Media/playBtn.svg" alt="" />
          </div>
        </li>`;
    });
    document.querySelectorAll(".songsList li").forEach((e) => {
      e.addEventListener("click", () => {
        playMusic(e.querySelector(".info div").innerText.trim());
      });
    });
    return songs;
  } catch (error) {
    console.error("Error fetching songs:", error);
    return [];
  }
}

// Function to play music
const playMusic = (track, pause = false) => {
  currentSong.src = `${currFolder}/` + track;
  // console.log(currentSong.src);
  if (!pause) {
    currentSong.play();
    play.src = "Media/pauseBtn.svg";
  }
  document.querySelector(".songInfo").innerHTML = decodeURI(track);
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
};

// Function to display albums
async function displayAlbums() {
  try {
    let response = await fetch(`/songs/`);
    let htmlContent = await response.text();
    let div = document.createElement("div");
    div.innerHTML = htmlContent;
    let anchors = div.querySelectorAll("a");
    let cardContainer = document.querySelector(".cardContainer");
    songs = [];
    anchors.forEach((e) => {
      if (e.href.includes("songs/")) {
        let currFolder = e.href.split("/").pop();
        cardContainer.innerHTML += `  
          <div data-folder="${currFolder}" class="group card w-auto xs:w-auto sm:w-auto md:w-[30vw] lg:w-[30vw] xl:w-[20vw] 2xl:w-[15vw] p-2 rounded-lg hover:bg-[#25252580] cursor-pointer relative">
            <img class="rounded-lg" src="songs/${currFolder}/cover.jpg" alt="image" />
            <div class="play bg-green-500 w-12 h-12 sm:w-16 sm:h-16 md:w-14 md:h-14 lg:w-12 lg:h-12 lg:p-3 sm:p-4 p-3 rounded-full absolute bottom-[70px] right-5 sm:bottom-[80px] md:bottom-[75px] sm:right-12 md:right-6 lg:bottom-[80px] lg:right-4 xl:bottom-[100px] 2xl:right-24 2xl:bottom-[90px] opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out transform translate-y-2 group-hover:translate-y-0 hover:scale-110">
              <img class="w-7 sm:w-8 lg:w-6" src="Media/play.svg" alt="play" />
            </div>
            <h2 class="text-sm sm:text-base p-1">${htmlContent.title}</h2>
            <p class="text-xs sm:text-sm pl-1 text-[#919191]">${htmlContent.description}</p>
          </div>`;
        songs.push(currFolder);
      }
    });
    cardContainer.querySelectorAll(".card").forEach((e) => {
      e.addEventListener("click", async (event) => {
        console.log("Fetching Songs");
        songs = await getSongs(`songs/${event.currentTarget.dataset.folder}`);
        playMusic(songs[0]);
      });
    });
  } catch (error) {
    console.error("Error displaying albums:", error);
  }
}

// Main function
async function main() {
  try {
    // Fetch songs and display albums
    await getSongs("songs/lofi_beats");
    playMusic(songs[0], true);
    await displayAlbums();

    // Event listeners
    play.addEventListener("click", () => {
      if (currentSong.paused) {
        currentSong.play();
        play.src = "Media/pauseBtn.svg";
      } else {
        currentSong.pause();
        play.src = "Media/playBtn.svg";
      }
    });

    // Event listener for timeupdate
    currentSong.addEventListener("timeupdate", () => {
      document.querySelector(
        ".songTime"
      ).innerHTML = `${secondsToMinutesSeconds(
        currentSong.currentTime
      )}/${secondsToMinutesSeconds(currentSong.duration)}`;
      document.querySelector(".circle").style.left =
        (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Event listener for seeking
    document.querySelector(".seekbar").addEventListener("click", (e) => {
      let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
      document.querySelector(".circle").style.left = percent + "%";
      currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
      document.querySelector(".left").style.left = "0";
    });

    // Event listener for close icon
    document.querySelector(".close").addEventListener("click", () => {
      document.querySelector(".left").style.left = "-200%";
    });

    // Event listener for previous button
    previous.addEventListener("click", () => {
      let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
      if (index - 1 >= 0) {
        playMusic(songs[index - 1]);
      }
    });

    // Event listener for next button
    next.addEventListener("click", () => {
      currentSong.pause();
      play.src = "Media/playBtn.svg";

      let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
      if (index + 1 < songs.length) {
        playMusic(songs[index + 1]);
      }
    });

    // Event listener for volume range input
    document.querySelector(".range input").addEventListener("input", (e) => {
      console.log(`Setting volume to ${e.target.value} / 100`);
      currentSong.volume = parseInt(e.target.value) / 100;
    });

    // Event listener for mute/unmute button
    document.querySelector(".volume img").addEventListener("click", (e) => {
      if (e.target.src.includes("volume.svg")) {
        e.target.src = e.target.src.replace("volume.svg", "mute.svg");
        currentSong.volume = 0;
        document.querySelector(".range input").value = 0;
      } else {
        e.target.src = e.target.src.replace("mute.svg", "volume.svg");
        currentSong.volume = 0.1;
        document.querySelector(".range input").value = 10;
      }
    });
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

main();
