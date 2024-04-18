let currentSong = new Audio();
let play = document.getElementById("play");

function secondsToMinutesSeconds(seconds) {
  // Convert floating-point seconds to an integer
  seconds = Math.floor(seconds);

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

async function getSongs() {
  let a = await fetch("http://127.0.0.1:5500/songs/");
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchorTags = div.getElementsByTagName("a");
  let songs = [];
  for (let index = 0; index < anchorTags.length; index++) {
    const element = anchorTags[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split("/songs/")[1]);
    }
  }
  return songs;
}

const playMusic = (track) => {
  // let audio = new Audio("/songs/" + track);
  currentSong.src = "/songs/" + track;
  currentSong.play();
  play.src = "Media/pauseBtn.svg";
  document.querySelector(".songInfo").innerHTML = "track";
  // document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(
  //   currentSong.currentTime
  // )}/${secondsToMinutesSeconds(currentSong.duration)}`;
};

async function main() {
  //get the list of all songs
  let songs = await getSongs();

  //show all the songs in playlist library
  let songsList = document
    .querySelector(".songsList")
    .getElementsByTagName("ol")[0];
  for (const song of songs) {
    songsList.innerHTML += `
    <li
    class="flex mt-2 p-2 cursor-pointer border border-gray-600 rounded-md justify-between gap-2 items-center"
  >
    <img class="invert" src="Media/music.svg" alt="music" />
    <div class="info">
      <div>${song.replaceAll("%20", " ")}</div>
      <div>Song artist</div>
    </div>
    <div class="playNow flex items-center gap-2 ">
      <span >Play now</span>
      <img class="invert" src="Media/playBtn.svg" alt="" />
    </div>
  </li>`;
  }

  //attach event listener to each song
  Array.from(
    document.querySelector(".songsList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

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
    console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )}/${secondsToMinutesSeconds(currentSong.duration)}`;
  });
}

main();
