'use strict';

exports.handler = (event, context, callback) => {
  const request = event.Records[0].cf.request;
  // acceptからavifもしくはwebpに対応しているブラウザかどうか見る
  // origin-requestのリクエストヘッダーにはacceptがないのでこのタイミングで見ている
  if (request.headers.accept && request.headers.accept[0] && request.headers.accept[0].value) {
    const accept = request.headers.accept[0].value
    let add_query = ''
    // if (accept.includes('image/avif')) {
    //   add_query = 'avif=1'
    // } else if (accept.includes('image/webp')) {
    //   add_query = 'webp=1'
    // }
    if (accept.includes('image/webp')) {
      add_query = 'webp=1'
    }
    if (add_query) {
      if (request.querystring) {
        request.querystring += '&' + add_query;
      } else {
        request.querystring = add_query;
      }
    }
  }
  
  console.log('uri: ' + request.uri)
  console.log('querystring: ' + request.querystring)
  callback(null, request);
};