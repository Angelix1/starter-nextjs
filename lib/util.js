
module.exports = {
  parseId: function(rawURL) {
    let regex = /[?&]([^=#]+)=([^&#]*)/g;
    let regex2 = /((?<=\.be\/).*)/gi;
    let params = {}, end = {}, match;

    let giveUrl = rawURL.replace(/^.*?(?=url=http)/i, '')
      
    let tests = regex2.test(giveUrl);
    
    while(match = regex.exec(giveUrl)) {
      params[match[1]] = match[2];
    }

    if(params.list) {
      end.type = 'ps';
      end.id = params.list;
    }
    if(!params.list && params.v) {
      end.type = 'vid';
      end.id = params.v;
    }
    if(tests.length) {
      end.type = 'vid';
      end.id = tests[0];
    }
    return end;
  }
};
