// ext Packages
import * as Util from '../../lib/util';
import axios from 'axios';
import miniget from 'miniget';

const between = (haystack, left, right) => {
  let pos;
  pos = haystack.indexOf(left);
  if (pos === -1) { return ''; }
  pos += left.length;
  haystack = haystack.slice(pos);
  pos = haystack.indexOf(right);
  if (pos === -1) { return ''; }
  haystack = haystack.slice(0, pos);
  return haystack;
};
const DEFAULT_CONTEXT = {
  client: {
    utcOffsetMinutes: 0,
    gl: 'US',
    hl: 'en',
    clientName: 'WEB',
    clientVersion: '<important information>',
  },
  user: {},
  request: {},
};


export default async function getVidData(req, res) {
  // console.log(req)
  const { url } = req.query;
  
  if(!url) return res.send(400);

  let id = url;

  res.status(102);
  
  const baseURL = 'https://www.youtube.com/playlist?list=';
  
  let page = await axios.get(baseURL + id).catch((e) => e.response);

  if(page.status != 200) return [];

  const pageData = await page.data;

  let body = pageData?.toString();

  const apiKey = between(body, 'INNERTUBE_API_KEY":"', '"') || 
    between(body, 'innertubeApiKey":"', '"');
  
  const clientVersion = between(body, 'INNERTUBE_CONTEXT_CLIENT_VERSION":"', '"') || 
    between(body, 'innertube_context_client_version":"', '"');

  DEFAULT_CONTEXT.client.clientVersion = clientVersion;
  DEFAULT_CONTEXT.user.enableSafetyMode = false;
  
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
  
  let cc = info[info.length-1];
  const BASE_API_URL = 'https://www.youtube.com/youtubei/v1/search?key=';
  const TKN = cc.continuationItemRenderer.continuationEndpoint.continuationCommand.token


  let minreq = miniget(BASE_API_URL + apiKey, { method: "POST" });
  let rab = { 
    client: {
      utcOffsetMinutes: 0,
      gl: 'US',
      hl: 'en',
      clientName: 'WEB',
      clientVersion: '2.20220914.06.00',
    },
    user: {},
    request: {},
    continuation: TKN
  };

  let rec = JSON.stringify(rab);

  console.log(minreq);
  
  minreq.write( rec );

  
  console.log({
    // cc.continuationItemRenderer,
    'token': TKN,
    "url": BASE_API_URL + apiKey,
    "apiKey": apiKey,
    "ctx": DEFAULT_CONTEXT,
    // "mini": minreq
    
  })


  //
  res.end('200')
}  

