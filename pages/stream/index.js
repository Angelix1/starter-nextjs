import Script from 'next/script';
import Stream from '../../components/stream';
import SidePanel from '../../components/sidePanel';
import Header from '../../components/header';
    


export default function Home() {
  
  return (<>
    <Header title="Music Player" description="Using NextJs for dynamic website" icon="/favicon.ico"/>
    <Script type="text/javascript" src="/stream/script.js"></Script> 
    <Stream />
  
  </>)
}
