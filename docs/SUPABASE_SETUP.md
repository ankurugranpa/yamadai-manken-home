# Supabase セットアップ手順

## 概要
このプロジェクトでは認証とデータベースに Supabase を使用します。

## 前提条件
- Supabase アカウント（無料プラン）
- Google Cloud Console へのアクセス

## 1. Supabase プロジェクトの作成

1. https://supabase.com/ にアクセスしてログイン
2. "New Project" をクリック
3. プロジェクト情報を入力:
   - Name: `yamadai-manken-home`
   - Database Password: 強力なパスワードを生成して保存
   - Region: `Northeast Asia (Tokyo)`
4. プロジェクトが作成されるまで待機（数分）

## 2. 環境変数の取得

プロジェクト作成後、Settings > API から以下を取得:

- **Project URL**: `https://xxxxx.supabase.co`
- **Anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 3. ローカル環境変数の設定

`ui/.env.local` ファイルを作成:

```bash
VITE_SUPABASE_URL="https://xxxxx.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_CLOUDFLARE_IMAGES_ACCOUNT_HASH="your-account-hash"
```

## 4. Google OAuth の設定

### Google Cloud Console での設定

1. https://console.cloud.google.com/ にアクセス
2. プロジェクトを作成または選択
3. OAuth 同意画面を設定（External）
4. 認証情報 > OAuth クライアント ID を作成
5. リダイレクトURIを追加:
   ```
   https://xxxxx.supabase.co/auth/v1/callback
   ```
6. クライアントIDとシークレットをコピー

### Supabase での設定

1. Supabase Dashboard > Authentication > Providers
2. Google を有効化
3. Google Cloud Console で取得した情報を入力:
   - Client ID
   - Client Secret
4. Save

## 5. データベーススキーマの作成

`db/migrations/` のスキーマを Supabase SQL Editor で実行:

1. Supabase Dashboard > SQL Editor
2. `db/migrations/0001_initial_schema.sql` の内容をコピー
3. 実行（Run）

または Supabase CLI を使用:

```bash
# Supabase CLI のインストール
npm install -g supabase

# ログイン
supabase login

# プロジェクトとリンク
supabase link --project-ref xxxxx

# マイグレーション実行
supabase db push
```

## 6. Row Level Security (RLS) の設定

作品の閲覧権限などを RLS で制御します。詳細は次のフェーズで実装。

## 7. フロントエンドのセットアップ

```bash
# Supabase クライアントライブラリをインストール
cd ui
npm install @supabase/supabase-js
```

## 参考リンク

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
