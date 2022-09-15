import Script from 'next/script';
import Stream from '../../components/stream';
import SidePanel from '../../components/sidePanel';


export default function Home() {
  
  return (<>
    <Script type="text/javascript" src="/stream/script.js"></Script> 
    <Stream />
  
  </>)
}
