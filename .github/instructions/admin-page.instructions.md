# 管理画面 要件定義

## 概要

管理者向けの作品管理・ユーザー管理・権限管理を行うPC向けの管理画面。

## アクセス制御

- **アクセス権限**: `role = 'admin'` のユーザーのみアクセス可能
- **認証**: Auth.js (Google OAuth2) によるログイン必須
- **URL**: `/admin/*`
- **未認証時の挙動**: ログインページへリダイレクト

## 画面設計

### 基本レイアウト

```
┌─────────────────────────────────────────┐
│ Header (ロゴ, ユーザー情報, ログアウト)   │
├─────────────────────────────────────────┤
│ ┌─────────┬───────────────────────────┐ │
│ │         │                           │ │
│ │ Sidebar │   Main Content            │ │
│ │ Menu    │                           │ │
│ │         │                           │ │
│ └─────────┴───────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Sidebar Menu

- 作品管理
  - 作品一覧
  - 作品登録
- ユーザー管理
  - ユーザー一覧
  - 招待リンク作成
- グループ管理
  - グループ一覧
  - グループ作成

## 機能要件

### 1. 作品管理

#### 1.1 作品一覧表示

**目的**: 登録済み作品の確認・管理

**表示項目**:
- 表紙画像 (サムネイル)
- タイトル
- 作者名
- 発行年
- 公開設定 (public/private/limited)
- ページ数
- 登録日時
- 操作ボタン (編集/削除)

**機能**:
- ページネーション (20件/ページ)
- ソート機能 (登録日時、タイトル、作者名)
- フィルター機能 (公開設定、発行年)
- 検索機能 (タイトル、作者名で検索)

**UI要件**:
- テーブル形式またはカード形式
- レスポンシブ対応 (PC向け最適化)

#### 1.2 作品登録

**目的**: 新規作品のアップロード

**入力項目**:
- タイトル (必須)
- 作者名 (必須)
- 説明 (任意)
- 発行年 (必須)
- 公開設定 (必須: public/private/limited)
  - limited選択時: 閲覧可能グループの選択 (複数選択可)
- 表紙画像 (必須)
- ページ画像 (複数枚、必須)

**画像アップロード仕様**:
- **アップロード先**: Cloudflare Images
- **対応形式**: PNG, JPEG, WEBP
- **最大ファイルサイズ**: 10MB/枚
- **アップロード方法**:
  1. ドラッグ&ドロップ
  2. ファイル選択ダイアログ
- **プレビュー機能**: アップロード前にサムネイル表示
- **並び替え機能**: ページ順序をドラッグ&ドロップで変更可能

**処理フロー**:
1. フォーム入力
2. 画像をCloudflare Imagesにアップロード
3. 取得したImage IDとメタデータをD1に保存
4. 成功時: 作品一覧へリダイレクト
5. 失敗時: エラーメッセージ表示

**バリデーション**:
- タイトル: 1-200文字
- 作者名: 1-100文字
- 発行年: 4桁の数値
- 画像: 必須、対応形式チェック、サイズチェック

#### 1.3 作品編集

**目的**: 既存作品の情報更新

**編集可能項目**:
- タイトル
- 作者名
- 説明
- 発行年
- 公開設定
- 閲覧可能グループ (limited時)
- 表紙画像の差し替え
- ページの追加・削除・並び替え

**処理フロー**:
1. 作品情報の取得・表示
2. フォーム入力
3. 画像更新時: Cloudflare Imagesに新しい画像をアップロード
4. D1のメタデータを更新
5. 成功時: 作品一覧へリダイレクト

#### 1.4 作品削除

**目的**: 不要な作品の削除

**処理フロー**:
1. 削除確認ダイアログ表示
2. 確認後、以下を実行:
   - D1から作品データ削除 (CASCADE制約でpages, work_permissionsも自動削除)
   - Cloudflare Imagesから画像削除
3. 成功時: 作品一覧を再読み込み

**安全対策**:
- 削除確認ダイアログ (タイトル入力による確認)
- 削除は論理削除ではなく物理削除 (データ量が少ないため)

### 2. ユーザー管理

#### 2.1 ユーザー一覧表示

**目的**: 登録ユーザーの確認・管理

**表示項目**:
- メールアドレス
- ユーザー名
- 管理者権限 (TRUE/FALSE)
- 所属ステータス (member/ob_og/guest)
- 所属グループ (複数)
- 登録日時
- 操作ボタン (編集/削除)

**機能**:
- ページネーション (20件/ページ)
- ソート機能 (登録日時、ユーザー名)
- フィルター機能 (ロール、グループ)
- 検索機能 (メールアドレス、ユーザー名)

#### 2.2 ユーザー編集

**目的**: ユーザー情報の更新

**編集可能項目**:
- ユーザー名
- 管理者権限 (TRUE/FALSE)
- 所属ステータス (member/ob_og/guest)
- 所属グループ (複数選択可)

**制約**:
- メールアドレスは変更不可
- 1ユーザーは必ず1つの所属ステータス（member/ob_og/guest）を持つ
- 自分自身の管理者権限は変更不可 (管理者権限の誤削除防止)
- 管理者権限と所属ステータスは独立（Admin+Memberなど可能）

#### 2.3 ユーザー削除

**目的**: 退会ユーザーの削除

**処理フロー**:
1. 削除確認ダイアログ表示
2. D1からユーザーデータ削除 (CASCADE制約で関連データも自動削除)
3. 成功時: ユーザー一覧を再読み込み

**制約**:
- 自分自身は削除不可

#### 2.4 招待リンク作成

**目的**: 新規ユーザーの招待

**入力項目**:
- 管理者権限付与 (TRUE/FALSE)
- 所属ステータス (member/ob_og/guest)
- 初期所属グループ (任意、複数選択可)
- 有効期限 (7日間/30日間/無期限)

**処理フロー**:
1. 招待トークンを生成 (UUID)
2. トークンをKVに保存 (TTL設定)
3. 招待URL生成: `https://example.com/signup?token=xxx`
4. URLをクリップボードにコピー

**招待リンク使用時の動作**:
1. ユーザーが招待URLにアクセス
2. トークンの有効性確認
3. Google OAuth2でログイン
4. ユーザーデータをD1に保存
5. トークンを無効化
6. ホームページへリダイレクト

### 3. グループ管理

#### 3.1 グループ一覧表示

**目的**: グループの確認・管理

**表示項目**:
- グループ名
- 説明
- 所属ユーザー数
- 作成日時
- 操作ボタン (編集/削除)

**機能**:
- ソート機能 (作成日時、グループ名)
- 検索機能 (グループ名)

#### 3.2 グループ作成

**目的**: 新規グループの追加

**入力項目**:
- グループ名 (必須)
- 説明 (任意)

**バリデーション**:
- グループ名: 1-100文字、重複不可

#### 3.3 グループ編集

**目的**: グループ情報の更新

**編集可能項目**:
- グループ名
- 説明
- 所属ユーザー (追加/削除)

#### 3.4 グループ削除

**目的**: 不要なグループの削除

**処理フロー**:
1. 削除確認ダイアログ表示
2. D1からグループデータ削除 (CASCADE制約で関連データも自動削除)
3. 成功時: グループ一覧を再読み込み

**注意**:
- グループを削除すると、そのグループに紐づく閲覧権限も削除される

## API設計

### 作品管理API

```typescript
// 作品一覧取得
GET /api/admin/works
  ?page=1
  &limit=20
  &sort=created_at
  &order=desc
  &visibility=public
  &year=2024
  &search=タイトル

// 作品詳細取得
GET /api/admin/works/:workId

// 作品登録
POST /api/admin/works
  Content-Type: multipart/form-data
  Body: {
    title: string
    author: string
    description?: string
    year: number
    visibility: 'public' | 'private' | 'limited'
    groupIds?: string[] // limited時のみ
    coverImage: File
    pages: File[]
  }

// 作品更新
PATCH /api/admin/works/:workId
  Content-Type: application/json
  Body: {
    title?: string
    author?: string
    description?: string
    year?: number
    visibility?: 'public' | 'private' | 'limited'
    groupIds?: string[]
  }

// 作品削除
DELETE /api/admin/works/:workId
```

### ユーザー管理API

```typescript
// ユーザー一覧取得
GET /api/admin/users
  ?page=1
  &limit=20
  &isAdmin=true
  &memberType=member
  &groupId=xxx
  &search=メールアドレス

// ユーザー詳細取得
GET /api/admin/users/:userId

// ユーザー更新
PATCH /api/admin/users/:userId
  Body: {
    name?: string
    isAdmin?: boolean
    memberType?: 'member' | 'ob_og' | 'guest'
    groupIds?: string[]
  }

// ユーザー削除
DELETE /api/admin/users/:userId

// 招待リンク作成
POST /api/admin/invitations
  Body: {
    isAdmin: boolean
    memberType: 'member' | 'ob_og' | 'guest'
    groupIds?: string[]
    expiresIn: '7d' | '30d' | 'never'
  }
  Response: {
    token: string
    url: string
    expiresAt: string
  }
```

### グループ管理API

```typescript
// グループ一覧取得
GET /api/admin/groups

// グループ詳細取得
GET /api/admin/groups/:groupId

// グループ作成
POST /api/admin/groups
  Body: {
    name: string
    description?: string
  }

// グループ更新
PATCH /api/admin/groups/:groupId
  Body: {
    name?: string
    description?: string
    userIds?: string[] // 所属ユーザー
  }

// グループ削除
DELETE /api/admin/groups/:groupId
```

## セキュリティ要件

### 認証・認可

- すべての管理APIは`is_admin = TRUE`チェック必須
- JWTトークンによるセッション管理
- トークンの有効期限: 24時間

### ミドルウェア構成

```typescript
// src/middleware/auth.ts
export async function requireAdmin(c: Context, next: Next) {
  const session = await getSession(c);
  
  if (!session || !session.isAdmin) {
    return c.json({ error: 'Forbidden' }, 403);
  }
  
  await next();
}
```

### API適用例

```typescript
// src/routes/admin.ts
import { requireAdmin } from '../middleware/auth';

app.use('/api/admin/*', requireAdmin);

app.get('/api/admin/works', async (c) => {
  // 管理者のみアクセス可能
});
```

## エラーハンドリング

### エラーレスポンス形式

```typescript
{
  error: string,        // エラーメッセージ
  code?: string,        // エラーコード
  details?: object      // 詳細情報
}
```

### 主なエラーケース

- `401 Unauthorized`: 未認証
- `403 Forbidden`: 権限不足
- `400 Bad Request`: バリデーションエラー
- `404 Not Found`: リソースが存在しない
- `500 Internal Server Error`: サーバーエラー

## テスト要件

### 単体テスト

- 各APIエンドポイントの正常系・異常系
- 認証・認可のミドルウェア
- バリデーション処理

### 統合テスト

- 作品登録 → 一覧表示 → 編集 → 削除のフロー
- ユーザー招待 → サインアップのフロー
- 権限による閲覧制御

## 開発順序

### Phase 1: 認証基盤
1. Auth.js設定
2. 管理者チェックミドルウェア
3. ログイン/ログアウト機能

### Phase 2: 作品管理
1. 作品一覧表示
2. 作品登録 (画像アップロード)
3. 作品編集
4. 作品削除

### Phase 3: ユーザー管理
1. ユーザー一覧表示
2. ユーザー編集
3. 招待リンク作成
4. サインアップ機能

### Phase 4: グループ管理
1. グループ一覧表示
2. グループ作成・編集・削除

## UI/UXガイドライン

### デザインシステム

- **カラーパレット**: Tailwind CSS (neutral系)
- **コンポーネント**: shadcn/ui
- **アイコン**: lucide-react

### レスポンシブ対応

- **最小幅**: 1024px (PC向け最適化)
- タブレットでも操作可能だが、スマホは非推奨

### アクセシビリティ

- フォーカスインジケーター
- キーボード操作対応
- スクリーンリーダー対応

## ログ・監査

### 記録対象

- 作品の登録・編集・削除
- ユーザーの作成・編集・削除
- グループの作成・編集・削除
- 招待リンクの発行

### ログ形式

```typescript
{
  timestamp: string,
  userId: string,
  action: string,      // 'create', 'update', 'delete'
  resource: string,    // 'work', 'user', 'group'
  resourceId: string,
  details?: object
}
```

## パフォーマンス要件

- **API応答時間**: 平均 < 200ms
- **画像アップロード**: 最大10枚まで同時アップロード可能
- **一覧表示**: ページネーションで20件/ページ
