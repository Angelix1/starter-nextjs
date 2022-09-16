import Script from 'next/script';
import Stream from '../../components/stream';
import SidePanel from '../../components/sidePanel';
import Header from '../../components/header';
import player from '../../components/player';
import Link from 'next/link';
import Head from 'next/head';

export default function Home() {
  
  return (<>
    <Header title="Music Player" description="Using NextJs for dynamic website" icon="/favicon.ico"/>
    <Script type="text/javascript" src="/stream/script.js"></Script>
    <Script type="text/javascript" src="/notifs.js"></Script>

    <video className='bgvid_player'name="media" muted="">
      <source className="backgroundvid" src="" type="video/mp4"/>
    </video>
    <div className="viewport">
      <div id="toasts">
        <button className="btn" id="reset-queue" onClick={ () => player.resetQue()}>Reset Queue</button>
      </div>
      
      <Stream />
    </div>
  
  </>)
}