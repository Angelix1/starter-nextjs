// Select all the elements in the HTML page
// and assign them to a variable
let player = document.querySelector(".player");

let host = window.location.origin;

let details = document.querySelector(".details");
let now_playing = document.querySelector(".now-playing");
let track_art = document.querySelector(".track-art");
let track_name = document.querySelector(".track-name");
let track_artist = document.querySelector(".track-artist");
let sidepanel = document.querySelector('.sidePanel');

let playpause_btn = document.querySelector(".playpause-track");
let next_btn = document.querySelector(".next-track");
let prev_btn = document.querySelector(".prev-track");

let sliders = document.querySelector('.sliders');
let seek_slider = document.querySelector(".seek_slider");
let volume_slider = document.querySelector(".volume_slider");
let curr_time = document.querySelector(".current-time");
let total_duration = document.querySelector(".total-duration");

// Specify globally used values
let track_index = 0;
let isPlaying = false;
let updateTimer;

// Music Backend
let track_list = [];
let tries = 0;

// Create the audio element for the player
let curr_bg = document.querySelector('.backgroundvid');
let curr_track = document.querySelector('.bgvid_player')

let boxInput = document.getElementById('linkInput')
