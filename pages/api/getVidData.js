// ext Packages
import * as Util from '../../lib/util';
import axios from 'axios';


export default async function getVidData(req, res) {
  // console.log(req)
  const { url } = req.query;
  
  if(!url) return res.end("400");

  let Datas = Util.parseId(url);

  
  let FinalData = await getData(Datas.type, Datas.id) ?? [];
  
  return res.end(JSON.stringify(
    FinalData
  ))
}

// Get Data
async function getData(type, id) {
  let Fin = [];
  if(!id) return Fin;
 
  if(type == 'ps') {
    let vids = await getPlaylistData(id);

    for (let vidId of vids) {
      let y = await getVideoData(vidId);
      Fin.push(y);
    }
  }

  if(type == 'vid') {
    let y = await getVideoData(id);
    Fin.push(y)
  }
  return Fin;
};

async function getPlaylistData(id) {
  const baseURL = 'https://www.youtube.com/playlist?list=';
  let FinalData = {};
  
  let page = await axios.get(baseURL + id).catch((e) => e.response);

  if(page.status != 200) return FinalData;

  const pageData = await page.data;

  let body = pageData?.toString();
  
  let pageInfo = body
    .split('<script' + body
           .split('var ytInitialData = ')[0]
           .split('<script')
           .pop() + 'var ytInitialData = ')[1]
    .split('</script>')[0];
  
  pageInfo = eval('(function() {return ' + pageInfo + '})();');

  let section = pageInfo.contents?.twoColumnBrowseResultsRenderer?.tabs[0].tabRenderer?.content;

  if(!section.sectionListRenderer) return [];
  
  let info = section.sectionListRenderer?.contents[0]
    .itemSectionRenderer.contents[0].playlistVideoListRenderer.contents;

  return info.map(g => g.playlistVideoRenderer?.videoId);    
}

async function getVideoData(videoId) {
  const baseURL = 'https://www.youtube.com/watch?v=';
  
  let FinalData = {};
  
  let page = await axios.get(baseURL + videoId).catch((e) => e.response);

  if(page.status != 200) return FinalData;

  const pageData = await page.data;

  let string = pageData?.toString();
  
  let rawBody = string
    .split('<script' + string
           .split('var ytInitialPlayerResponse = ')[0]
           .split('<script')
           .pop() + 'var ytInitialPlayerResponse = ')[1]
    .split('</script>')[0];
  
  let Clean = eval('(function() {return ' + rawBody + '})();');
  // let URL_REG = rawURL

  if(
    !Clean || 
    !Clean?.streamingData || 
    !Clean?.playabilityStatus
  ) return FinalData;
  
  let videoDetails = Clean.videoDetails;
  let sortedThumb = videoDetails?.thumbnail?.thumbnails?.sort((a,b) => 
    ((b.width - a.width) && (b.height - a.height)));
  let highestThumb = sortedThumb[0].url?.replace(/(?<=(jpg|png)).*/mi, '');

  // console.log(videoDetails)

  let returningData = {
    videoId: videoDetails.videoId,
    name: videoDetails?.title,
    artist: videoDetails?.author,
    image: highestThumb
  }
  FinalData = returningData;
  
  return FinalData;
}  

