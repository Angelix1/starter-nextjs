import player from './player';
import React, { useState } from 'react';
import ReactiveButton from 'reactive-button';

export default function Stream() {
  const [volumeVal, volChange] = useState(35);
  const [TimeVal, timeChange] = useState(0);
  const [buttonState, setButtonState] = useState({ s: 'idle', dis: false});
  
  return(<>
    <div className="player" style={{ "display": "none" }}>
      <div className="details">
        <div className="now-playing">PLAYING x OF y</div>
        <div className="track-art"></div>
        <div className="track-name">Track Name</div>
        <div className="track-artist">Track Artist</div>
      </div>
   
      <div className="buttons">
        <div className="prev-track" onClick={ () => player.prevTrack()}>
          <i className="fa fa-step-backward fa-2x"></i>
        </div>
        <div className="playpause-track" onClick={ () => player.playpauseTrack()}>
          <i className="fa fa-play-circle fa-5x"></i>
        </div>
        <div className="next-track" onClick={ () => player.nextTrack()}>
          <i className="fa fa-step-forward fa-2x"></i>
        </div>
        <div className="reset-queue" onClick={ () => player.resetQue()}>
          <i class="fa fa-light fa-circle-xmark fa-3x"></i>
        </div>
      </div>
   
      <div className="slider_container">
        <div className="current-time">00:00</div>
        <input type="range" min="1" max="100"
          value={TimeVal} className="seek_slider" onChange={({ target: { value: radius } })=> {
            timeChange(radius)
            player.seekTo()
          }}/>
        <div className="total-duration">00:00</div>
      </div>
   
      <div className="slider_container">
        <i className="fa fa-volume-down"></i>
        <input type="range" min="1" max="100"
          value={volumeVal} className="volume_slider" onChange={({ target: { value: radius } }) => {
            volChange(radius);
            player.setVolume()
          }}/>
        <i className="fa fa-volume-up"></i>
      </div>
    </div>
    <div className="addMusic">
      <div className="center">
        <div className="form__group" style={{ width: "75%" }}>

          <input type="text" className="form__input" id="linkInput" 
            style={{ "textAlign": "center" }} placeholder="" required="" />
          <label htmlFor="name" className="form__label">Youtube Link or Playlist</label>
        </div>
        <br/>
          <ReactiveButton
            type={'submit'}
            buttonState={buttonState.s}
            idleText="Submit"
            size="large"
            loadingText="Loading"
            successText="Added"
            disabled={buttonState.dis}
            rounded
            onClick={ (e) => {
              setButtonState({ s: 'loading', dis: true });
              player.sendLink().then(() => setButtonState({ s: 'idle', dis: false }))
            }}
          />
      </div>
    </div>
  </>)
}
