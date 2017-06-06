# Github2Slack
GithubでのメンションをSlackでのメンションに変換してポストします。

また、Pull Requestがマージされたときにマージ元のブランチを自動で削除します。

## アカウントの追加/削除方法
### 追加
[config.json](./config.json) のaccounts配下に以下の形式でアカウントを追加してください。
```javascript
{
  "github": "toiroakr",      // GithubのID
  "slack": "higuchi_akira" // SlackのID
}
```

### 削除
[config.json](./config.json) から消したいアカウントを削除してください。

## リポジトリの追加/削除方法
### 追加
#### コード修正
[config.json](./config.json) のrepositories配下に以下の形式でリポジトリを追加してください。
```javascript
{
  "token_id": "token_id",            // SlackのAPI TOKENを指定するLambdaの環境変数名
  "name": "^toiroakr/github2slack$", // 対象のリポジトリ(正規表現)
  "notification": "#notification",   // Pull Request/Issueの作成/クローズ/マージ通知先のSlackチャンネル
  "comment": "#pr_comment",          // Pull Request/Issueコメント通知先のSlackチャンネル
}
```
#### Webhook設定
```
□ Payload URL
API Gatewayで作成したエンドポイント

□ Content type
application/json

□ Which events would you like to trigger this webhook?
Let me select individual events.  
  -> [Issue comment, Issues, Pull requests, Pull request review, Pull request review comment]
```

### 削除
[config.json](./config.json) から消したいリポジトリを削除してください。

## 変更の反映
- zipファイルの作成
```
npm i
zip -r github2slack.zip node_modules/ config.json github-webhook.js id-convert.js index.js lambda.js slack.js
```
作成された `github2slack.zip` を開発用AWSのLambda関数 `github2slack` にアップロード
