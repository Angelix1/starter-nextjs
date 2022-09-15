import axios from 'axios';
import * as Util from '../lib/util';

// Not Exported
function removeDupes(tracks) {
  let uniqueChars = [];
  tracks.forEach((c) => {
    let maped = uniqueChars.map(v => v.videoId);
    if (!maped.includes(c.videoId)) {
        uniqueChars.push(c);
    }
  });

  return uniqueChars;
};

function isAlreadyExist(id, tracks) {
  return tracks.some(b => b.videoId == id);
}

function update() {
  return now_playing.textContent = "PLAYING " + (track_index + 1) + " OF " + track_list.length
}


// Exported
module.exports = {
  sendLink, loadTrack, random_bg_color, resetValues, playpauseTrack, 
  playTrack, pauseTrack, nextTrack, prevTrack, seekTo, setVolume, 
  seekUpdate, resetQue
}

async function sendLink() {
  // console.log(host)
  let F = document.getElementById("linkInput").value;
  let t = [];

  if(!F) return alert('Please Input Something')
  let RAD = Util.parseId(F);

  if(RAD?.type == 'vid' && RAD?.id && track_list.length>0) {
    if(isAlreadyExist(RAD.id, track_list)) {
      return alert('Song Already Exist/Added to the Queue')
    }
  }

  let res = await axios.get(`${host}/api/getVidData?url=${encodeURIComponent(F)}`).catch(() => false);
  if(res) {
    let jso = await res.data;

    if(jso.length > 1) {
      let TT = jso.length;
      let RT = 0;
      let AT = 0;

      jso.forEach(x => {
        if(track_list.some(xx => xx.videoId == x.videoId)) {
          return RT++;
        }
        AT++;
      })   
      
      track_list.push(...jso);
      track_list = removeDupes(track_list);
      update();

      if (!isPlaying) {
        if(track_index < 1) {
          loadTrack(0);
        }
      } 

      return alert(`Added ${AT} Songs${
        (RT>0) ? `\nRemoved ${RT} for duplication`: ''
      }\nTotal Song Fetched from Playlist is ${TT}`);
    }
    
    track_list.push(...jso);
    
    loadTrack(0);
    return;
  }
  
  return alert("Cannot Find "+F);
}

function resetQue() {
  track_list = [track_list[track_index]] ?? [];
  update()
  alert('Queue Reset!')
  if(!track_list.length) {
    player.style.display = 'none';
  }
  return track_list;
}

async function loadTrack(track_index) {
  if(!track_list.length) return;

  player.style.display = '';
  
  // Clear the previous seek timer
  clearInterval(updateTimer);
  resetValues();

  let gg = await axios.get(`${host}/api/getVidAudio?id=${track_list[track_index].videoId}`);
  let data = gg.data;

  // alert(data)

  track_list[track_index].url = data.url;
  
  curr_track.src = track_list[track_index].url;
  curr_track.volume = volume_slider.value / 100;
  curr_track.load();

  // Update details of the track
  track_art.style.backgroundImage =
    "url(" + track_list[track_index].image + ")";
  track_name.textContent = track_list[track_index].name;
  track_artist.textContent = track_list[track_index].artist;
  now_playing.textContent =
    "PLAYING " + (track_index + 1) + " OF " + track_list.length;

  // Set an interval of 1000 milliseconds
  // for updating the seek slider
  updateTimer = setInterval(seekUpdate, 1000);

  // Move to the next track if the current finishes playing
  // using the 'ended' event
  curr_track.addEventListener("ended", nextTrack);

  // Apply a random background color
  random_bg_color();
}

function random_bg_color() {
  // Get a random number between 64 to 256
  // (for getting lighter colors)
  let red = Math.floor(Math.random() * 256) + 64;
  let green = Math.floor(Math.random() * 256) + 64;
  let blue = Math.floor(Math.random() * 256) + 64;

  // Construct a color withe the given values
  let bgColor = "rgb(" + red + ", " + green + ", " + blue + ")";

  // Set the background to the new color
  document.body.style.background = bgColor;
}

function resetValues() {
  curr_time.textContent = "00:00";
  total_duration.textContent = "00:00";
  seek_slider.value = 0;
}

function playpauseTrack() {
  // Switch between playing and pausing
  // depending on the current state
  if (!isPlaying) playTrack();
  else pauseTrack();
}

function playTrack() {
  // Play the loaded track
  curr_track.play();
  isPlaying = true;

  // Replace icon with the pause icon
  playpause_btn.innerHTML = '<i class="fa fa-pause-circle fa-5x"></i>';
}

function pauseTrack() {
  // Pause the loaded track
  curr_track.pause();
  isPlaying = false;

  // Replace icon with the play icon
  playpause_btn.innerHTML = '<i class="fa fa-play-circle fa-5x"></i>';
}

function nextTrack() {
  // Go back to the first track if the
  // current one is the last in the track list
  if (track_index < track_list.length - 1)
    track_index += 1;
  else track_index = 0;

  // Load and play the new track
  loadTrack(track_index).then(() => playTrack())
}

function prevTrack() {
  // Go back to the last track if the
  // current one is the first in the track list
  if (track_index > 0)
    track_index -= 1;
  else track_index = track_list.length - 1;

  // Load and play the new track
  loadTrack(track_index);
  playTrack();
}

function seekTo() {
  // Calculate the seek position by the
  // percentage of the seek slider
  // and get the relative duration to the track
  let seekto = curr_track.duration * (seek_slider.value / 100);

  // Set the current track position to the calculated seek position
  curr_track.currentTime = seekto;
}

function setVolume() {
  // Set the volume according to the
  // percentage of the volume slider set
  curr_track.volume = volume_slider.value / 100;
}

function seekUpdate() {
  let seekPosition = 0;

  // Check if the current track duration is a legible number
  if (!isNaN(curr_track.duration)) {
    seekPosition = curr_track.currentTime * (100 / curr_track.duration);
    seek_slider.value = seekPosition;

    // Calculate the time left and the total duration
    let currentMinutes = Math.floor(curr_track.currentTime / 60);
    let currentSeconds = Math.floor(curr_track.currentTime - currentMinutes * 60);
    let durationMinutes = Math.floor(curr_track.duration / 60);
    let durationSeconds = Math.floor(curr_track.duration - durationMinutes * 60);

    // Add a zero to the single digit time values
    if (currentSeconds < 10) { currentSeconds = "0" + currentSeconds; }
    if (durationSeconds < 10) { durationSeconds = "0" + durationSeconds; }
    if (currentMinutes < 10) { currentMinutes = "0" + currentMinutes; }
    if (durationMinutes < 10) { durationMinutes = "0" + durationMinutes; }

    // Display the updated duration
    curr_time.textContent = currentMinutes + ":" + currentSeconds;
    total_duration.textContent = durationMinutes + ":" + durationSeconds;
  }
}
