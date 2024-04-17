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

let playBtn = document.querySelector(".playBtn");
async function main() {
  //get the list of all songs
  let songs = await getSongs();
  console.log(songs);
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

  //play the first song
  var audio = new Audio(songs[0]);
  playBtn.addEventListener("click", () => {
    // audio.play();
  });
  audio.addEventListener("loadeddata", () => {
    console.log(audio.duration, audio.currentSrc, audio.currentTime);
  });
}
main();
