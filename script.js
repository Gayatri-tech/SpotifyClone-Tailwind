let currentSong = new Audio();
let play = document.getElementById("play");
let songs;
let currFolder;
let previous = document.querySelector("#previous");
let next = document.querySelector("#next");

function secondsToMinutesSeconds(seconds) {
  // Check if the input is a valid number
  if (isNaN(seconds) || !isFinite(seconds)) {
    return "00:00";
  }
  // Calculate minutes and seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // Format minutes and seconds with leading zeros if necessary
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  // Combine minutes and seconds in the "mm:ss" format
  const formattedTime = `${formattedMinutes}:${formattedSeconds}`;

  return formattedTime;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`${currFolder}/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let anchorTags = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < anchorTags.length; index++) {
    const element = anchorTags[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`${currFolder}/`)[1]);
    }
  }

  //show all the songs in playlist library
  let songsList = document
    .querySelector(".songsList")
    .getElementsByTagName("ol")[0];
  // console.log(songsList);
  songsList.innerHTML = "";
  // console.log(songsList);
  for (const song of songs) {
    songsList.innerHTML += `
    <li
    class="flex m-2  p-2 cursor-pointer border border-gray-600 rounded-md justify-between gap-2 items-center"
  >
    <img class="invert w-5" src="Media/music.svg" alt="music" />
    <div class="info text-sm w-36 ">
      <div>${song.replaceAll("%20", " ").replaceAll("%26", " ")}</div>
    </div>
    <div class="playNow flex items-center gap-2 text-sm ">
      <span >Play now</span>
      <img class="invert w-6" src="Media/playBtn.svg" alt="" />
    </div>
  </li>`;
  }

  //attach event listener to each song
  Array.from(
    document.querySelector(".songsList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs;
}

const playMusic = (track, pause = false) => {
  // let audio = new Audio("/songs/" + track);
  currentSong.src = `${currFolder}/` + track;

  if (!pause) {
    currentSong.play();
    play.src = "Media/pauseBtn.svg";
  }
  document.querySelector(".songInfo").innerHTML = decodeURI(track);
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch(`songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let arr = Array.from(anchors);
  for (let index = 0; index < arr.length; index++) {
    const e = arr[index];

    if (e.href.includes("/songs/")) {
      let currFolder = e.href.split("/").slice(-1)[0];

      // get metadata of folder
      let a = await fetch(`songs/${currFolder}/info.json`);
      let response = await a.json();
      cardContainer.innerHTML += `  <div
      data-folder="${currFolder}"
      class="group card w-auto xs:w-auto sm:w-auto md:w-[30vw] lg:w-[30vw] xl:w-[20vw] 2xl:w-[15vw] p-2 rounded-lg hover:bg-[#25252580] cursor-pointer relative "
    >
      <img class="rounded-lg" src="songs/${currFolder}/cover.jpg" alt="image" />
      <div
        class="play bg-green-500 w-12 h-12 sm:w-16 sm:h-16 md:w-14 md:h-14 lg:w-12 lg:h-12 lg:p-3 sm:p-4 p-3 rounded-full absolute bottom-[70px] right-5 sm:bottom-[80px] md:bottom-[75px] sm:right-12 md:right-6 lg:bottom-[80px] lg:right-4 xl:bottom-[100px] 2xl:right-24 2xl:bottom-[90px] opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out transform translate-y-2 group-hover:translate-y-0 hover:scale-110"
      >
        <img
          class="w-7 sm:w-8 lg:w-6"
          src="Media/play.svg"
          alt="play"
        />
      </div>
      <h2 class="text-sm sm:text-base p-1">${response.title}</h2>
      <p class="text-xs sm:text-sm pl-1 text-[#919191]">
        ${response.description}
      </p>
    </div>`;
    }
  }
  // Load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (event) => {
      console.log("Fetching Songs");
      songs = await getSongs(`songs/${event.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  //get the list of all songs
  await getSongs("songs/lofi_beats");
  playMusic(songs[0], true);

  // Display all the albums on the page
  await displayAlbums();

  //attach event listener to play,next and previous buttons
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "Media/pauseBtn.svg";
    } else {
      currentSong.pause();
      play.src = "Media/playBtn.svg";
    }
  });

  //listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )}/${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // attach an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // attach event listener to hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // attach event listener to close icon
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-200%";
  });

  // attach an event listener to previous button
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  // attach an event listener to next button
  next.addEventListener("click", () => {
    currentSong.pause();
    play.src = "Media/playBtn.svg";

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  //attach event listener to volume button
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log(`Setting volume to ${e.target.value} / 100`);
      currentSong.volume = parseInt(e.target.value) / 100;
      // if (currentSong.volume > 0) {
      //   document.querySelector(".volume>img").src = document
      //     .querySelector(".volume>img")
      //     .src.replace("mute.svg", "volume.svg");
      // }
    });

  // attach an event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}

main();
