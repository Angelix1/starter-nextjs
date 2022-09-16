// ext Packages
import * as Util from '../../lib/util';
import axios from 'axios';


export default async function getVidData(req, res) {
  // console.log(req)
  const { url } = req.query;
  
  if(!url) return res.status(404);

  res.status(102);
  
  let Datas = Util.parseId(url);

  let FinalData = await getData(Datas.type, Datas.id) ?? [];
  
  return res.status(200).end(
    JSON.stringify(FinalData, null, 1)
  )
}

// Get Data
async function getData(type, id) {
  let Fin = [];
  if(!id) return Fin;
 
  if(type == 'ps') {
    let vids = await getPlaylistData(id);
    Fin.push(...vids);
  }

  if(type == 'vid') {
    Fin.push({ videoId: id })
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
    .itemSectionRenderer?.contents[0].playlistVideoListRenderer?.contents;

  if(!info) return [];

  let arrayOfIds = info.map(g => g.playlistVideoRenderer?.videoId).filter(a => a);

  if(!arrayOfIds) return [];

  let Obj = arrayOfIds.map(el => {
    return { videoId: el }
    });

  return Obj;
}