# Image-Resize

- クエリパラメータを付けるだけで、S3にある画像ファイルをリサイズします
- wもしくはhを指定するとそのサイズでリサイズされます
- またqでクオリティを指定できます
- クオリティを下げるとファイルサイズを小さくできます(1-100、デフォルト80)

初期設定
```
npm update
npm install -g serverless
```

パラメータストア
- 以下をパラメータストアに設定してください
```
カスタムドメイン名（developmentの場合は未使用）
/image-resize/(development|production)/custom-domain
カスタムドメインのarn（developmentの場合は未使用）
/image-resize/(development|production)/acm-certificate-arn
バケット
/image-resize/(development|production)/bucket
```

デプロイ
```
# ステージング
serverless deploy --stage development --force

# 本番
serverless deploy --stage production --force
```

対応フォーマット
- jpeg(jpg)、png、gif、webp
- それ以外のフォーマットの場合はオリジナルがそのまま返ります


AVIF対応
- AVIFは変換に時間がかかるため、AVIFへの自動変換は行ってません
- ただしクエリパラメータにavif=1をつけるとAVIFに変換することはできます
