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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isAlreadyExist(id, tracks) {
  return tracks.some(b => b.videoId == id);
}

function update() {
  return now_playing.textContent = "PLAYING " + (track_index + 1) + " OF " + track_list.length
}


function getRGB(c) {
  return parseInt(c, 16) || c
}

function getsRGB(c) {
  return getRGB(c) / 255 <= 0.03928
    ? getRGB(c) / 255 / 12.92
    : Math.pow((getRGB(c) / 255 + 0.055) / 1.055, 2.4)
}

function getLuminance(hexColor) {
  return (
    0.2126 * getsRGB(hexColor.substr(1, 2)) +
    0.7152 * getsRGB(hexColor.substr(3, 2)) +
    0.0722 * getsRGB(hexColor.substr(-2))
  )
}

function getContrast(f, b) {
  const L1 = getLuminance(f)
  const L2 = getLuminance(b)
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
}

function getTextColor(bgColor) {
  const whiteContrast = getContrast(bgColor, '#ffffff')
  const blackContrast = getContrast(bgColor, '#000000')

  return whiteContrast < blackContrast ? '#ffffff' : '#000000'
}



// Exported
module.exports = {
  sendLink, loadTrack, random_bg_color, resetValues, playpauseTrack, 
  playTrack, pauseTrack, nextTrack, prevTrack, seekTo, setVolume, 
  seekUpdate, resetQue, loadAnother
}

async function sendLink() {
  // console.log(host)
  let F = document.getElementById("linkInput").value;
  let t = [];

  if(!F) return createNotification('Please Input Something', 'error', 5000)
  let RAD = Util.parseId(F);

  boxInput.value = '';

  if(RAD?.type == 'vid' && RAD?.id && track_list.length>0) {
    if(isAlreadyExist(RAD.id, track_list)) {
      return createNotification('Song Already Exist/Added to the Queue', "error", 5000)
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

      let tttt = curr_track?.paused ? curr_track.paused : false;
      
      if (tttt) {
        if(track_index < 1) {
          loadTrack(0);
        }
      }
      
      return createNotification(
        `Added ${AT} Songs${(RT>0) ? `, Removed ${RT} for duplication`: ''}. Total Song Fetched from Playlist is ${TT}`,
        'success', 5000
      );
    }
    
    track_list.push(...jso);
    
    loadTrack(0);
    return;
  }
  
  return createNotification("Cannot Find "+F, "error", 5000);
}

function resetQue() {
  if(track_list.length > 1) {
    track_list = [track_list[track_index]] ?? [];
    track_index = 0;
    update()
    createNotification('Queue Reset!', "success", 5000)
    if(!track_list.length) {
      player.style.display = 'none';
    }
    return track_list;
  } 
  else {
    createNotification('No Queue Available!', "info", 4000)
  }
}

async function loadTrack() {
  if(!track_list.length) return;

  player.style.display = '';

  // Clear the previous seek timer
  clearInterval(updateTimer);
  resetValues();

  if(!track_list[track_index].url) {
    
    let gg = await axios.get(`${host}/api/getVidAudio?id=${track_list[track_index].videoId}`);
    let data = gg.data;
  
    await sleep(2000);

    if(!data.url?.length) {
      return createNotification('Cannot Stream this Track', 'error', 4000)
    }
    
    track_list[track_index] = data;
  }
  
  curr_bg.src = track_list[track_index].url[0];
  
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
  if(!endedListener) {
    curr_track.addEventListener("ended", function() {
      endedListener = true;
      if(track_list.length < track_index) {
        return nextTrack();
      }
    });    
  }
}

function random_bg_color() {
  
  // Construct a color withe the given values
  let bgColor = "#"+ Math.floor(Math.random()*16777215).toString(16);

  // Set the background to the new color
  let text = getTextColor(bgColor)

  details.style.color = text;
  sliders.style.color = text;
  
  document.body.style.background = bgColor;
}

function resetValues() {
  curr_time.textContent = "00:00:00";
  total_duration.textContent = "00:00:00";
  seek_slider.value = 0;
}

function playpauseTrack() {
  // Switch between playing and pausing
  // depending on the current state
  if (curr_track.paused) {
    curr_track.play()
    playpause_btn.innerHTML = '<i class="fa fa-pause-circle fa-5x"></i>';
  } 
  else {
    curr_track.pause();
    playpause_btn.innerHTML = '<i class="fa fa-play-circle fa-5x"></i>';
  }
}

function loadAnother(id, data, num) {
  if(data) {
    if(data.length > 1 && num < data.length) {
      id.src = data[num];
      playTrack();
    }
    else {
      data[num] = null;
      nextTrack()
      createNotification('Access is Forbidden. The track most likely copyrighted.','error', 3000)
    }
  }
  else {
    nextTrack()
  }
}

function playTrack() {
  // Play the loaded track

// for now just stop
curr_track.play().catch(() => {
  sleep(1500).then(() => {
    createNotification('Access is Forbidden. The track most likely copyrighted.','error', 3000);
  })
});

/*
this shit Broken and can cause outtages

  curr_track.play().catch(() => {
    if(tries == 3) {
      tries = 0;
      isPlaying = false;
      createNotification(
        'Cannot play the track, Access is Forbidden. The track most likely copyrighted.',
        'error',
        6000
      )
      
      nextTrack();
      return false;
    } 
    else {
      loadAnother(curr_track, track_list[track_index].url, tries)
    }
  });
  
  tries++;  
  // Replace icon with the pause icon
*/
  playpause_btn.innerHTML = '<i class="fa fa-pause-circle fa-5x"></i>';
}

function pauseTrack() {
  // Pause the loaded track
  curr_track.pause();
  // Replace icon with the play icon
  playpause_btn.innerHTML = '<i class="fa fa-play-circle fa-5x"></i>';
}

function nextTrack() {
  // Go back to the first track if the
  // current one is the last in the track list
  if (track_index < track_list.length - 1) track_index += 1;
  else track_index = 0;

  // Load and play the new track
  loadTrack().then(() => {
    sleep(2000).then(() => {
      playTrack()
    })
  })
  
  // Apply a random background color
  random_bg_color();
}

function prevTrack() {
  // Go back to the last track if the
  // current one is the first in the track list
  if (track_index > 0)
    track_index -= 1;
  else track_index = track_list.length - 1;

  // Load and play the new track
  loadTrack(track_index).then(() => {
    playTrack()
  })
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

    // Display the updated duration
    curr_time.textContent = new Date(curr_track.currentTime*1000).toISOString().substring(11, 19)
    total_duration.textContent = new Date(curr_track.duration*1000).toISOString().substring(11, 19)
  }
}
