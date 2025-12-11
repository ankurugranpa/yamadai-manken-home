
# 画像配信API設計メモ（Cloudflare Images前提）

## 概要
- 画像本体は Cloudflare Images に保存・配信。
- メタデータ（work_id, page, title, author, visibility など）とページ順は自前APIで管理。
- 管理UIは `/admin` 配下、Cloudflare Access で保護。公開閲覧APIは認証なしで可。

## 認証/権限
- 自前JWT不要。Cloudflare Access (Googleログイン + 必要なら Service Token) を `/admin/*` に適用。
- 管理系APIだけ Access 配下に置き、公開系 `/works/{id}/pages` は必要に応じて公開。

## データストア
- 検索不要なら Workers KV または D1 に `work_id -> pages[]` を保持。
- 拡張や整合性を重視するなら D1/PostgreSQL へ移行。
- Variants は Cloudflare Images で事前定義（例: thumb / medium / orig）。

## エンドポイント
- 管理系（Access 保護）
  - `POST /admin/api/images/upload-url` : Direct Upload URL を N 枚分まとめて発行。
  - `POST /admin/api/images` : `[{image_id, work_id, page, title, author, variants, visibility}]` をバルク登録。
  - `PUT /admin/api/works/:id/pages` : ページ配列の並び替え/更新をバルク反映。
  - `DELETE /admin/api/images/:id` : Images 削除 + メタ削除。
  - `GET /admin/api/works/:id/pages` : プレビュー用取得（公開APIと同形式）。
- 公開系
  - `GET /works/:id/pages` : `[{page, image_id, variants: {thumb, medium, orig}, title?, author?}]` をページ順で返却。

## アップロードフロー（30〜40枚バッチ）
1. 管理UIが `upload-url` に枚数 n を渡し、n 件の Direct Upload URL を取得。
2. クライアントが並行で各 URL へアップロード（1 URL = 1 枚）。
3. 完了で得た `image_id` をメタ付きで `POST /admin/api/images` にバルク送信。
4. 並び替えがあれば `PUT /admin/api/works/:id/pages` でまとめて更新。

## バッチ実装のポイント
- `upload-url` は `[{id, uploadURL, expiresAt}]` の配列を返す。
- バルク登録は全件成功しなければ部分失敗リストを返す（KV なら失敗キーを返しリトライ、D1 ならトランザクション）。
- 同時アップロード数を制限（目安 5〜8 並列）、429/ネットワークエラーは指数バックオフ。
- Direct Upload URL は短寿命前提（数分）。期限切れは再発行。

## 管理UI
- `/admin` に SPA を配置し Access で保護。
- 機能: アップロードURL発行、バルク登録、ドラッグ&ドロップ並び替え、公開/非公開切替、削除、thumb プレビュー。
- CI/CLI からの呼び出しは Service Token で `CF-Access-Client-Id/Secret` を付与。

## 環境変数例
- `CF_ACCOUNT_ID`, `CF_API_TOKEN`, `CF_IMAGES_ACCOUNT_HASH`
- `DRIVER=mock|cloudflare`
- `KV_WORKS` または `D1_DB`
- `ACCESS_TEAM_DOMAIN`（必要なら Access 検証で使用）

## 拡張メモ
- 検索やタグ付けが必要になったら D1/PostgreSQL へ移行し、インデックスを追加。
- 権限や表示制御を強める場合は公開APIにも Access ポリシーを適用、または署名付き URL を併用。
