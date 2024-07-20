# Image-Resize

クエリパラメータを付けるだけで、S3にある画像ファイルをリサイズします
wもしくはhを指定するとそのサイズでリサイズされます
またqでクオリティを指定できます
クオリティを下げるとサイズを小さくできます(1-100、デフォルト80)

初期設定
```
npm update
npm install -g serverless
npm install --save-dev --save-exact serverless-plugin-scripts
npm install --save-dev --save-exact @silvermine/serverless-plugin-cloudfront-lambda-edge
npm install --save-dev --save-exact serverless-plugin-ifelse
npm install --save-dev --save-exact serverless-aws-function-url-custom-domain
```

デプロイ
```
# ステージング
serverless deploy --stage development --force

# 本番
serverless deploy --stage production --force
```

対応フォーマット
```
jpeg(jpg)、png、gif、webp
それ以外のフォーマットの場合はオリジナルがそのまま返ります
```

AVIF対応
- AVIFは変換に時間がかかるため、AVIFへの自動変換は行ってません
- ただしクエリパラメータにavif=1をつけるとAVIFに変換することはできます
