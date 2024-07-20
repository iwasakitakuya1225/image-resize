'use strict';

const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const s3 = new S3Client();
const sharp = require('sharp');
require('dotenv').config();


const bucket = process.env.BUCKET

function getResponseObject(body, format, maxAge = 31536000) {
  // レスポンスのオブジェクトを返す
  const headers = {
    "content-type": [
      {
        key: "Content-Type",
        value: `image/${format}`,
      },
    ],
    "vary": [
      {
        key: "Vary",
        value: "accept",
      }
    ],
    "cache-control": [
      {
        key: "Cache-Control",
        value: `max-age=${maxAge}`
      }
    ],
  }
  return {
    status: "200",
    statusDescription: "OK",
    headers,
    body: body,
    bodyEncoding: "base64",
  };
}

exports.handler = async (event, context, callback) => {

  try {
    const request = event.Records[0].cf.request;
    const querystring = request.querystring;
    const params = new URLSearchParams(querystring);
  
    const isAvif = params.has('avif') && params.get('avif') == '1' ? true : false;
    const isWebp = params.has('webp') && params.get('webp') == '1' ? true : false;
    const quality = params.has('q') ? parseInt(params.get('q')) : 80;
  
    let isWidth = false
    let length = 0
    if (params.has('w')) {
      const params_w = parseInt(params.get('w'))
      if (params_w) {
        isWidth = true
        length = params_w
      }
    } else if (params.has('h')) {
      const params_h = parseInt(params.get('h'))
      if (params_h) {
        isWidth = false
        length = params_h
      }
    }
  
    if (length == 0) {
      return callback(null, request);
    }

    let key = request.uri;
    if (key.charAt(0) == '/') {
      key = key.substring(1)
    }
    console.log(`get image. bucket:${bucket} key:${key}`);
    let result = null
    try {
      result = await s3.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: key
        })
      )
    } catch (e) {
      console.log(`get image error. key:${key}`);
      result = await s3.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: 'static/noimage.png'
        })
      )
    }
    const body = await result.Body.transformToByteArray()
    const sharpBody = sharp(body, {animated: true, pages: -1});
    const metadata = await sharpBody.metadata();
    // 画像をリサイズする
    let format = metadata.format
      
    let originalHeight = metadata.height
    let originalWidth = metadata.width
    if (metadata.orientation && metadata.orientation >= 5) {
      // 画像の縦横がひっくり返ってるので、リサイズする縦横に考慮する
      originalHeight = metadata.width
      originalWidth = metadata.height
    }
  
    if (metadata.pageHeight) {
      originalHeight = metadata.pageHeight
    }
  
    let resizeWidth = 0
    let resizeHeight = 0
    if (isWidth) {
      resizeWidth = originalWidth < length ? originalWidth : length;
      resizeHeight = parseInt(resizeWidth / originalWidth * originalHeight);
    } else {
      resizeHeight = originalHeight < length ? originalHeight : length;
      resizeWidth = parseInt(resizeHeight / originalHeight * originalWidth);
    }
  
    sharpBody.resize(resizeWidth, resizeHeight).rotate()
    if (isAvif) {
      format = 'avif'
      sharpBody.avif({ quality })
    } else if (isWebp) {
      // webp対応しているブラウザの場合はwebpにする
      format = 'webp'
      sharpBody.webp({ quality })
    } else if (format === 'png') {
      quality = 10 - parseInt(quality / 10)
      sharpBody.png({ compressionLevel: quality })
    } else if (['jpeg', 'jpg'].includes(format)) {
      sharpBody.jpeg({ quality })
    } else if (format === 'svg') {
      sharpBody.svg({ quality })
    } else if (format === 'gif') {
      sharpBody.gif({ quality })
    }
    console.log(`resize image. width:${resizeWidth} height:${resizeHeight} format:${format} quality:${quality}`);
    const buffer = await sharpBody.toBuffer();
  
    // リサイズした画像を返す
    console.log(`response image. format:${format}`);
    context.succeed(getResponseObject(buffer.toString("base64"), format));
  } catch (e) {
    console.log(e);
    // console.log(`show empty image.`);
    // const result = await s3.send(
    //   new GetObjectCommand({
    //     Bucket: bucket,
    //     Key: 'static/noimage.png'
    //   })
    // )
    // const body = await result.Body.transformToByteArray()
    // context.succeed(getResponseObject(body.toString('base64'), 'png', 600));

    console.log(`get image error`);
    return callback(null, request);
  }
};