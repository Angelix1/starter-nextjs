
import * as Util from '../../lib/util';
import axios from 'axios';
import querystring from 'querystring';
import vm from 'vm';


export default async function getVidAudio(req, res) {
  // console.log(req)
  const { id } = req.query;
  
  if(!id) return res.end("404");
 
  let FinalData = await getAudio(id) ?? {};

  
  return res.end(JSON.stringify(
    FinalData
  ))
}


async function getAudio(videoId) {
  
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
 
  let directStreamUrl = Clean?.streamingData?.adaptiveFormats.filter(g => g.mimeType.split('/')[0] == 'audio');

  if(!directStreamUrl.length) return {};

  let sortedUrl = directStreamUrl.sort((a, b) => b.bitrate - a.bitrate);
  let highestAudio = sortedUrl[0];

  if(!highestAudio) return {};

  if(!highestAudio?.url) {

    let sig = decodeURIComponent(directStreamUrl[0].signatureCipher);
    let res = await axios.get('https://www.youtube.com/');
    let a = res.data.toString();
    var b = a.split('base.js')[0];
    var c = b.split('/s/player/').pop();
    
    var d = 'https://www.youtube.com/s/player/' + c + 'base.js';
    let aa = await axios.get(d)
    let bb = aa.data.toString();

    let o = directStreamUrl[0];
    let REK = await setDownloadURL(o, d)     

    highestAudio = REK;
  }

  FinalData['url'] = highestAudio.url;;
  
  return FinalData;
}


// Thanks to ytdl-core for original code
// Modified a little to be used on this app

async function between (haystack, left, right) {
  let pos;
  if (left instanceof RegExp) {
    const match = haystack.match(left);
    if (!match) { return ''; }
    pos = match.index + match[0].length;
  } else {
    pos = haystack.indexOf(left);
    if (pos === -1) { return ''; }
    pos += left.length;
  }
  haystack = haystack.slice(pos);
  pos = haystack.indexOf(right);
  if (pos === -1) { return ''; }
  haystack = haystack.slice(0, pos);
  return haystack;
};

async function cutAfterJS (mixedJson) {
  const ESCAPING_SEQUENZES = [
    // Strings
    { start: '"', end: '"' },
    { start: "'", end: "'" },
    { start: '`', end: '`' },
    // RegeEx
    { start: '/', end: '/', startPrefix: /(^|[[{:;,])\s?$/ },
  ];
  // Define the general open and closing tag
  let open, close;
  if (mixedJson[0] === '[') {
    open = '[';
    close = ']';
  } else if (mixedJson[0] === '{') {
    open = '{';
    close = '}';
  }

  if (!open) {
    throw new Error(`Can't cut unsupported JSON (need to begin with [ or { ) but got: ${mixedJson[0]}`);
  }

  // States if the loop is currently inside an escaped js object
  let isEscapedObject = null;

  // States if the current character is treated as escaped or not
  let isEscaped = false;

  // Current open brackets to be closed
  let counter = 0;

  let i;
  // Go through all characters from the start
  for (i = 0; i < mixedJson.length; i++) {
    // End of current escaped object
    if (!isEscaped && isEscapedObject !== null && mixedJson[i] === isEscapedObject.end) {
      isEscapedObject = null;
      continue;
    // Might be the start of a new escaped object
    } else if (!isEscaped && isEscapedObject === null) {
      for (const escaped of ESCAPING_SEQUENZES) {
        if (mixedJson[i] !== escaped.start) continue;
        // Test startPrefix against last 10 characters
        if (!escaped.startPrefix || mixedJson.substring(i - 10, i).match(escaped.startPrefix)) {
          isEscapedObject = escaped;
          break;
        }
      }
      // Continue if we found a new escaped object
      if (isEscapedObject !== null) {
        continue;
      }
    }

    // Toggle the isEscaped boolean for every backslash
    // Reset for every regular character
    isEscaped = mixedJson[i] === '\\' && !isEscaped;

    if (isEscapedObject !== null) continue;

    if (mixedJson[i] === open) {
      counter++;
    } else if (mixedJson[i] === close) {
      counter--;
    }

    // All brackets have been closed, thus end of JSON is reached
    if (counter === 0) {
      // Return the cut JSON
      return mixedJson.substring(0, i + 1);
    }
  }

  // We ran through the whole string and ended up with an unclosed bracket
  throw Error("Can't cut unsupported JSON (no matching closing bracket found)");
};

/**
* Extract signature deciphering and n parameter transform functions from html5player file.
*
* @param {string} html5playerfile
* @param {Object} options
* @returns {Promise<Array.<string>>}
*/
async function getFunctions(html5playerfile) {
  const res = await axios.get(html5playerfile);
  let body = res.data.toString();
  const functions = await extractFunctions(body);
  if (!functions || !functions.length) {
    throw new Error('Could not extract functions');
  }
  return functions;
};

/**
 * Extracts the actions that should be taken to decipher a signature
 * and tranform the n parameter
 *
 * @param {string} body
 * @returns {Array.<string>}
 */
async function extractFunctions(body) {
  const functions = [];
  const extractManipulations = async caller => {
    const functionName = await between(caller, `a=a.split("");`, `.`);
    if (!functionName) return '';
    const functionStart = `var ${functionName}={`;
    const ndx = body.indexOf(functionStart);
    if (ndx < 0) return '';
    const subBody = body.slice(ndx + functionStart.length - 1);
    return `var ${functionName}=${await cutAfterJS(subBody)}`;
  };
  const extractDecipher = async () => {
    const functionName = await between(body, `a.set("alr","yes");c&&(c=`, `(decodeURIC`);
    if (functionName && functionName.length) {
      const functionStart = `${functionName}=function(a)`;
      const ndx = body.indexOf(functionStart);
      if (ndx >= 0) {
        const subBody = body.slice(ndx + functionStart.length);
        let functionBody = `var ${functionStart}${await cutAfterJS(subBody)}`;
        functionBody = `${await extractManipulations(functionBody)};${functionBody};${functionName}(sig);`;
        functions.push(functionBody);
      }
    }
  };
  const extractNCode = async () => {
    let functionName = await between(body, `&&(b=a.get("n"))&&(b=`, `(b)`);
    if (functionName.includes('[')) functionName = await between(body, `${functionName.split('[')[0]}=[`, `]`);
    if (functionName && functionName.length) {
      const functionStart = `${functionName}=function(a)`;
      const ndx = body.indexOf(functionStart);
      if (ndx >= 0) {
        const subBody = body.slice(ndx + functionStart.length);
        const functionBody = `var ${functionStart}${await cutAfterJS(subBody)};${functionName}(ncode);`;
        functions.push(functionBody);
      }
    }
  };
  // console.log(await extractManipulations(body))
  await extractDecipher();
  await extractNCode();
  return functions;
};

/**
* Apply decipher and n-transform to individual format
*
* @param {Object} format
* @param {vm.Script} decipherScript
* @param {vm.Script} nTransformScript
*/
async function setDownloadURL (format, html5player) {
  let DS = await getFunctions(html5player);
  const decipherScript = DS.length ? new vm.Script(DS[0]) : null;
  const nTransformScript = DS.length > 1 ? new vm.Script(DS[1]) : null;
  
  const decipher = url => {
    const args = querystring.parse(url);
    if (!args.s) return args.url;
    const components = new URL(decodeURIComponent(args.url));
    components.searchParams.set(args.sp ? args.sp : 'signature', 
      decipherScript.runInNewContext({ sig: decodeURIComponent(args.s) })
    );
    return components.toString();
  };
  const ncode = url => {
    const components = new URL(decodeURIComponent(url));
    const n = components.searchParams.get('n');
    if (!n) return url;
    components.searchParams.get('n', nTransformScript.runInNewContext({ ncode: n }))
    return components.toString();
  };
  const cipher = !format.url;
  const url = format.url || format.signatureCipher || format.cipher;   
  format.url = cipher ? ncode(decipher(url)) : ncode(url);
  delete format.signatureCipher;
  delete format.cipher;
  return format;
};

    
