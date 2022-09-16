
function togglePlaylist() {
  for (let data of track_list) {
    sidepanel.innerHTML += `<div class="sideTrack"> ${data.name} </div>\n`;
  }
}


export default function SidePanel() {  
  return <div className="sidePanel">
    <button className="sideBarButton" onClick={togglePlaylist}>
    </button>
  </div>;
}