# 漫画研究会ホームページ API設計

## 概要

本ドキュメントは、漫画研究会ホームページのAPIスキーマ定義です。

- **APIフレームワーク**: Hono
- **ホスティング**: Cloudflare Workers
- **データベース**: Cloudflare D1
- **画像ストレージ**: Cloudflare Images
- **認証**: Auth.js (Google OAuth2)
- **ベースURL**: `https://api.yamadai-manken-home.pages.dev/v1`

## 認証方式

### JWT認証（ベストプラクティス準拠）
- **Authorization Header**: `Authorization: Bearer <JWT_TOKEN>`
- **JWT公開鍵**: Cloudflare KVに保存
- **アクセストークン有効期限**: 1時間（短期間で安全性向上）
- **リフレッシュトークン有効期限**: 7日間
- **リフレッシュトークンローテーション**: 使用後に新しいトークンを発行（セキュリティ向上）
- **トークン無効化**: Cloudflare KVでブラックリスト管理
  - ログアウト時に`jti`（JWT ID）をKVに保存
  - TTL設定でトークン有効期限切れ時に自動削除
  - 無料枠: 100,000 read/日、1,000 write/日（月間数千PV程度なら十分）
  - 短い有効期限でKV書き込みを最小化

### ロールベース認証
1. **未認証ユーザー**: 公開APIのみアクセス可能
2. **認証済みユーザー**: ログイン後、自分の情報と権限に応じた作品へアクセス可能
3. **管理者** (`is_admin=TRUE`): すべてのAPIにアクセス可能

---

## エンドポイント一覧

### 1. 公開API（認証不要）
| メソッド | エンドポイント | 説明 |
|---------|-------------|------|
| GET | `/health` | ヘルスチェック |
| GET | `/public/works` | 公開作品一覧取得 |
| GET | `/public/works/:workId` | 公開作品詳細取得 |
| GET | `/public/works/:workId/pages` | 公開作品のページ一覧取得 |

### 2. 認証API
| メソッド | エンドポイント | 説明 |
|---------|-------------|------|
| POST | `/auth/login` | Googleログイン |
| POST | `/auth/refresh` | トークンリフレッシュ |
| POST | `/auth/logout` | ログアウト |
| GET | `/auth/me` | 現在のユーザー情報取得 |

### 3. 認証済みユーザーAPI（要認証）
| メソッド | エンドポイント | 説明 |
|---------|-------------|------|
| GET | `/works` | 閲覧可能な作品一覧取得 |
| GET | `/works/:workId` | 作品詳細取得 |
| GET | `/works/:workId/pages` | 作品のページ一覧取得 |
| GET | `/groups` | 自分が所属するグループ一覧取得 |
| GET | `/users/me` | 自分の詳細情報取得 |
| PATCH | `/users/me` | 自分の情報更新 |

### 4. 管理者API（要管理者権限）

#### 作品管理
| メソッド | エンドポイント | 説明 |
|---------|-------------|------|
| POST | `/admin/works` | 作品登録 |
| PATCH | `/admin/works/:workId` | 作品情報更新 |
| DELETE | `/admin/works/:workId` | 作品削除 |
| POST | `/admin/works/:workId/pages` | ページ一括アップロード |
| DELETE | `/admin/works/:workId/pages/:pageId` | ページ削除 |
| PATCH | `/admin/works/:workId/visibility` | 作品公開設定変更 |

#### ユーザー管理
| メソッド | エンドポイント | 説明 |
|---------|-------------|------|
| GET | `/admin/users` | ユーザー一覧取得 |
| GET | `/admin/users/:userId` | ユーザー詳細取得 |
| PATCH | `/admin/users/:userId/role` | ユーザーロール変更 |
| DELETE | `/admin/users/:userId` | ユーザー削除 |
| POST | `/admin/invites` | 招待リンク作成 |
| GET | `/admin/invites` | 招待リンク一覧取得 |
| DELETE | `/admin/invites/:inviteId` | 招待リンク無効化 |

#### グループ管理
| メソッド | エンドポイント | 説明 |
|---------|-------------|------|
| GET | `/admin/groups` | グループ一覧取得 |
| POST | `/admin/groups` | グループ作成 |
| PATCH | `/admin/groups/:groupId` | グループ更新 |
| DELETE | `/admin/groups/:groupId` | グループ削除 |
| POST | `/admin/groups/:groupId/members` | グループにメンバー追加 |
| DELETE | `/admin/groups/:groupId/members/:userId` | グループからメンバー削除 |

#### 権限管理
| メソッド | エンドポイント | 説明 |
|---------|-------------|------|
| GET | `/admin/works/:workId/permissions` | 作品の閲覧権限取得 |
| POST | `/admin/works/:workId/permissions` | 作品に閲覧権限追加 |
| DELETE | `/admin/works/:workId/permissions/:groupId` | 作品の閲覧権限削除 |

#### 統計情報
| メソッド | エンドポイント | 説明 |
|---------|-------------|------|
| GET | `/admin/stats` | システム統計情報取得 |

#### ゴミ箱管理（論理削除の復元・完全削除）
| メソッド | エンドポイント | 説明 |
|---------|-------------|------|
| GET | `/admin/trash/works` | 削除済み作品一覧取得 |
| POST | `/admin/trash/works/:workId/restore` | 作品を復元 |
| DELETE | `/admin/trash/works/:workId` | 作品を完全削除（即座に物理削除） |

### 5. 画像API
| メソッド | エンドポイント | 説明 |
|---------|-------------|------|
| GET | `/pages/:pageId/image-url` | ページ画像の署名付きURL取得 |
| POST | `/pages/image-urls` | 複数ページの署名付きURLを一括取得 |

---

## 詳細仕様

### 1. 公開API

#### `GET /health`
ヘルスチェック

**ステータスコード**: `200 OK`

**レスポンス**
```json
{
  "status": "ok",
  "timestamp": "2025-12-14T12:34:56Z"
}
```

#### `GET /public/works`
公開作品一覧取得（visibility='public'の作品のみ）

**ステータスコード**: `200 OK`

**クエリパラメータ**
- `page` (number, optional): ページ番号（デフォルト: 1）
- `limit` (number, optional): 1ページあたりの件数（デフォルト: 20、最大: 100）
- `year` (number, optional): 発行年でフィルタ
- `author` (string, optional): 作者名でフィルタ
- `sort` (string, optional): ソート対象（createdAt/title/year、デフォルト: createdAt）
- `order` (string, optional): ソート順（asc/desc、デフォルト: desc）

**レスポンス**
```json
{
  "works": [
    {
      "id": "01JFABCDEFGH123456789",
      "title": "春の物語",
      "description": "春をテーマにした作品",
      "author": "AO",
      "year": 2024,
      "coverImageId": "cloudflare-images-id-1",
      "pageCount": 24,
      "createdAt": "2024-03-15T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

#### `GET /public/works/:workId`
公開作品詳細取得

**ステータスコード**: `200 OK`

**パスパラメータ**
- `workId` (string): 作品ID

**レスポンス**
```json
{
  "id": "01JFABCDEFGH123456789",
  "title": "春の物語",
  "description": "春をテーマにした作品",
  "author": "AO",
  "year": 2024,
  "visibility": "public",
  "coverImageId": "cloudflare-images-id-1",
  "pageCount": 24,
  "createdAt": "2024-03-15T10:00:00Z",
  "updatedAt": "2024-03-15T10:00:00Z"
}
```

**エラーレスポンス**
```json
{
  "error": "NOT_FOUND",
  "message": "作品が見つかりません"
}
```

#### `GET /public/works/:workId/pages`
公開作品のページ一覧取得

**ステータスコード**: `200 OK`

**パスパラメータ**
- `workId` (string): 作品ID

**レスポンス**
```json
{
  "pages": [
    {
      "id": "01JFPAGE123456789",
      "pageNumber": 0,
      "imageId": "cloudflare-images-id-page0",
      "altText": "表紙",
      "createdAt": "2024-03-15T10:00:00Z"
    },
    {
      "id": "01JFPAGE234567890",
      "pageNumber": 1,
      "imageId": "cloudflare-images-id-page1",
      "altText": "1ページ目",
      "createdAt": "2024-03-15T10:05:00Z"
    }
  ]
}
```

---

### 2. 認証API

#### `POST /auth/login`
Googleログイン

**ステータスコード**: `200 OK`

**リクエストボディ**
```json
{
  "idToken": "google-id-token-from-oauth"
}
```

**レスポンス**
```json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token",
  "expiresIn": 604800,
  "user": {
    "id": "01JFUSER123456789",
    "email": "user@example.com",
    "name": "山田太郎",
    "role": {
      "isAdmin": false,
      "memberType": "member"
    }
  }
}
```

**エラーレスポンス**
```json
{
  "error": "UNAUTHORIZED",
  "message": "招待されていないユーザーです"
}
```

#### `POST /auth/refresh`
トークンリフレッシュ

**ステータスコード**: `200 OK`

**リクエストボディ**
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

**レスポンス**
```json
{
  "accessToken": "new-jwt-access-token",
  "expiresIn": 604800
}
```

#### `POST /auth/logout`
ログアウト（トークン無効化）

**ステータスコード**: `204 No Content`

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
```

**レスポンス**
```json
{
  "message": "ログアウトしました"
}
```

#### `GET /auth/me`
現在のユーザー情報取得

**ステータスコード**: `200 OK`

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
```

**レスポンス**
```json
{
  "id": "01JFUSER123456789",
  "email": "user@example.com",
  "name": "山田太郎",
  "role": {
    "isAdmin": false,
    "memberType": "member"
  },
  "groups": [
    {
      "id": "01JFGROUP123",
      "name": "2024年度生"
    }
  ],
  "createdAt": "2024-01-10T09:00:00Z"
}
```

---

### 3. 認証済みユーザーAPI

#### `GET /works`
閲覧可能な作品一覧取得

ユーザーの権限に応じて閲覧可能な作品を返す：
- 管理者: すべての作品
- 現役部員/OB_OG: public + limited（自分のグループが権限を持つもの）
- ゲスト: publicのみ

**ステータスコード**: `200 OK`

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
```

**クエリパラメータ**
- `page` (number, optional): ページ番号（デフォルト: 1）
- `limit` (number, optional): 1ページあたりの件数（デフォルト: 20、最大: 100）
- `visibility` (string, optional): 公開設定でフィルタ（public/private/limited）
- `year` (number, optional): 発行年でフィルタ
- `author` (string, optional): 作者名でフィルタ
- `sort` (string, optional): ソート対象（createdAt/title/year、デフォルト: createdAt）
- `order` (string, optional): ソート順（asc/desc、デフォルト: desc）

**レスポンス**
```json
{
  "works": [
    {
      "id": "01JFABCDEFGH123456789",
      "title": "春の物語",
      "description": "春をテーマにした作品",
      "author": "AO",
      "year": 2024,
      "visibility": "public",
      "coverImageId": "cloudflare-images-id-1",
      "pageCount": 24,
      "createdAt": "2024-03-15T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 65,
    "page": 1,
    "limit": 20,
    "totalPages": 4
  }
}
```

#### `GET /works/:workId`
作品詳細取得（権限チェックあり）

**ステータスコード**: `200 OK`

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
```

**パスパラメータ**
- `workId` (string): 作品ID

**レスポンス**
```json
{
  "id": "01JFABCDEFGH123456789",
  "title": "春の物語",
  "description": "春をテーマにした作品",
  "author": "AO",
  "year": 2024,
  "visibility": "limited",
  "coverImageId": "cloudflare-images-id-1",
  "pageCount": 24,
  "allowedGroups": [
    {
      "id": "01JFGROUP123",
      "name": "2024年度生"
    }
  ],
  "createdAt": "2024-03-15T10:00:00Z",
  "updatedAt": "2024-03-15T10:00:00Z"
}
```

**エラーレスポンス**
```json
{
  "error": "FORBIDDEN",
  "message": "この作品を閲覧する権限がありません"
}
```

#### `GET /works/:workId/pages`
作品のページ一覧取得（権限チェックあり）

**ステータスコード**: `200 OK`

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
```

**パスパラメータ**
- `workId` (string): 作品ID

**レスポンス**
```json
{
  "pages": [
    {
      "id": "01JFPAGE123456789",
      "pageNumber": 0,
      "imageId": "cloudflare-images-id-page0",
      "fileName": "000.png",
      "altText": "表紙",
      "createdAt": "2024-03-15T10:00:00Z"
    }
  ]
}
```

#### `GET /groups`
自分が所属するグループ一覧取得

**ステータスコード**: `200 OK`

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
```

**レスポンス**
```json
{
  "groups": [
    {
      "id": "01JFGROUP123",
      "name": "2024年度生",
      "description": "2024年度入部メンバー",
      "memberCount": 15,
      "createdAt": "2024-04-01T00:00:00Z"
    }
  ]
}
```

#### `GET /users/me`
自分の詳細情報取得

**ステータスコード**: `200 OK`

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
```

**レスポンス**
```json
{
  "id": "01JFUSER123456789",
  "email": "user@example.com",
  "name": "山田太郎",
  "role": {
    "isAdmin": false,
    "memberType": "member"
  },
  "groups": [
    {
      "id": "01JFGROUP123",
      "name": "2024年度生"
    }
  ],
  "createdAt": "2024-01-10T09:00:00Z",
  "updatedAt": "2024-01-10T09:00:00Z"
}
```

#### `PATCH /users/me`
自分の情報更新（名前のみ変更可能）

**ステータスコード**: `200 OK`

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
```

**リクエストボディ**
```json
{
  "name": "山田太郎"
}
```

**レスポンス**
```json
{
  "id": "01JFUSER123456789",
  "email": "user@example.com",
  "name": "山田太郎",
  "updatedAt": "2024-12-14T12:34:56Z"
}
```

---

### 4. 管理者API

#### 作品管理

##### `POST /admin/works`
作品登録

**ステータスコード**: `201 Created`

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
X-Admin-Required: true
```

**リクエストボディ**
```json
{
  "title": "春の物語",
  "description": "春をテーマにした作品",
  "author": "AO",
  "year": 2024,
  "visibility": "public",
  "coverImageId": "cloudflare-images-id-1"
}
```

**レスポンス**
```json
{
  "id": "01JFABCDEFGH123456789",
  "title": "春の物語",
  "description": "春をテーマにした作品",
  "author": "AO",
  "year": 2024,
  "visibility": "public",
  "coverImageId": "cloudflare-images-id-1",
  "createdBy": "01JFADMIN123456",
  "createdAt": "2024-03-15T10:00:00Z"
}
```

**エラーレスポンス**
```json
{
  "error": "FORBIDDEN",
  "message": "管理者権限が必要です"
}
```

##### `PATCH /admin/works/:workId`
作品情報更新

**ステータスコード**: `200 OK`

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
X-Admin-Required: true
```

**パスパラメータ**
- `workId` (string): 作品ID

**リクエストボディ**（更新したいフィールドのみ）
```json
{
  "title": "春の物語（改訂版）",
  "description": "更新された説明文",
  "visibility": "limited"
}
```

**レスポンス**
```json
{
  "id": "01JFABCDEFGH123456789",
  "title": "春の物語（改訂版）",
  "description": "更新された説明文",
  "author": "AO",
  "year": 2024,
  "visibility": "limited",
  "coverImageId": "cloudflare-images-id-1",
  "updatedAt": "2024-12-14T12:34:56Z"
}
```

##### `DELETE /admin/works/:workId`
作品削除（論理削除：30日後に自動物理削除）

**ステータスコード**: `204 No Content`

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
X-Admin-Required: true
```

**パスパラメータ**
- `workId` (string): 作品ID

**削除方式**:
- **論理削除**: `deleted_at`と`deleted_by`を設定
- **物理削除**: 30日後にWorkers Cronで自動実行
- **即座に完全削除**: `/admin/trash/works/:workId`を使用

**レスポンス**
```json
{
  "message": "作品をゴミ箱に移動しました。30日後に完全削除されます",
  "deletedWorkId": "01JFABCDEFGH123456789",
  "deletedAt": "2024-12-14T12:34:56Z",
  "permanentDeleteAt": "2025-01-13T12:34:56Z"
}
```

##### `POST /admin/works/:workId/pages`
ページ一括アップロード

**ステータスコード**: 
- 全成功: `201 Created`
- 一部失敗: `207 Multi-Status`
- 全失敗: `400 Bad Request`

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
X-Admin-Required: true
Content-Type: multipart/form-data
```

**パスパラメータ**
- `workId` (string): 作品ID

**アップロード制限**
- ファイルサイズ: 最大32MB/ファイル
- ファイル形式: JPEG, PNG, WebP
- 最大ファイル数: 100枚/リクエスト

**ロールバック戦略（部分成功許容型）**
1. すべてのページレコードをD1に作成（`image_id` = NULL）
2. 各ファイルをCloudflare Imagesに順次アップロード
3. 成功したら該当ページの`image_id`を更新
4. 失敗したページは`image_id`がNULLのまま残る
5. 管理者が後で失敗したページを再アップロード可能
6. ステータスコード:
   - 全成功: `201 Created`
   - 一部失敗: `207 Multi-Status`
   - 全失敗: `400 Bad Request`

**理由**: 100枚アップロード時、1枚の失敗で全部やり直しは非効率的。部分成功を許容し、失敗分を後で再アップロード可能にする。

**リクエストボディ（multipart/form-data）**
```
files[]: File[] (画像ファイル、最大100枚)
```

**レスポンス（全成功）**
```json
{
  "uploadedPages": [
    {
      "id": "01JFPAGE123456789",
      "pageNumber": 0,
      "imageId": "cloudflare-images-id-page0",
      "fileName": "000.png"
    },
    {
      "id": "01JFPAGE234567890",
      "pageNumber": 1,
      "imageId": "cloudflare-images-id-page1",
      "fileName": "001.png"
    }
  ],
  "totalUploaded": 2,
  "failedUploads": []
}
```

**エラーレスポンス（一部失敗）**
```json
{
  "uploadedPages": [...],
  "totalUploaded": 20,
  "failedUploads": [
    {
      "fileName": "005.png",
      "error": "Image upload failed"
    }
  ]
}
```

##### `DELETE /admin/works/:workId/pages/:pageId`
ページ削除

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
X-Admin-Required: true
```

**パスパラメータ**
- `workId` (string): 作品ID
- `pageId` (string): ページID

**レスポンス**
```json
{
  "message": "ページを削除しました",
  "deletedPageId": "01JFPAGE123456789"
}
```

##### `PATCH /admin/works/:workId/visibility`
作品公開設定変更

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
X-Admin-Required: true
```

**パスパラメータ**
- `workId` (string): 作品ID

**リクエストボディ**
```json
{
  "visibility": "limited",
  "allowedGroupIds": ["01JFGROUP123", "01JFGROUP456"]
}
```

**レスポンス**
```json
{
  "id": "01JFABCDEFGH123456789",
  "visibility": "limited",
  "allowedGroups": [
    {
      "id": "01JFGROUP123",
      "name": "2024年度生"
    },
    {
      "id": "01JFGROUP456",
      "name": "編集部"
    }
  ],
  "updatedAt": "2024-12-14T12:34:56Z"
}
```

#### ユーザー管理

##### `GET /admin/users`
ユーザー一覧取得

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
X-Admin-Required: true
```

**クエリパラメータ**
- `page` (number, optional): ページ番号（デフォルト: 1）
- `limit` (number, optional): 1ページあたりの件数（デフォルト: 20、最大: 100）
- `memberType` (string, optional): 所属ステータスでフィルタ（member/ob_og/guest）
- `isAdmin` (boolean, optional): 管理者のみでフィルタ

**レスポンス**
```json
{
  "users": [
    {
      "id": "01JFUSER123456789",
      "email": "user@example.com",
      "name": "山田太郎",
      "role": {
        "isAdmin": false,
        "memberType": "member"
      },
      "groupCount": 2,
      "createdAt": "2024-01-10T09:00:00Z"
    }
  ],
  "pagination": {
    "total": 35,
    "page": 1,
    "limit": 20,
    "totalPages": 2
  }
}
```

##### `GET /admin/users/:userId`
ユーザー詳細取得

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
X-Admin-Required: true
```

**パスパラメータ**
- `userId` (string): ユーザーID

**レスポンス**
```json
{
  "id": "01JFUSER123456789",
  "email": "user@example.com",
  "name": "山田太郎",
  "role": {
    "isAdmin": false,
    "memberType": "member"
  },
  "groups": [
    {
      "id": "01JFGROUP123",
      "name": "2024年度生"
    },
    {
      "id": "01JFGROUP456",
      "name": "編集部"
    }
  ],
  "createdAt": "2024-01-10T09:00:00Z",
  "updatedAt": "2024-01-10T09:00:00Z"
}
```

##### `PATCH /admin/users/:userId/role`
ユーザーロール変更

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
X-Admin-Required: true
```

**パスパラメータ**
- `userId` (string): ユーザーID

**リクエストボディ**
```json
{
  "isAdmin": true,
  "memberType": "member"
}
```

**レスポンス**
```json
{
  "id": "01JFUSER123456789",
  "role": {
    "isAdmin": true,
    "memberType": "member"
  },
  "updatedAt": "2024-12-14T12:34:56Z"
}
```

##### `DELETE /admin/users/:userId`
ユーザー削除

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
X-Admin-Required: true
```

**パスパラメータ**
- `userId` (string): ユーザーID

**レスポンス**
```json
{
  "message": "ユーザーを削除しました",
  "deletedUserId": "01JFUSER123456789"
}
```

**エラーレスポンス（作品が紐づいている場合）**
```json
{
  "error": "CONFLICT",
  "message": "このユーザーが作成した作品が存在するため削除できません"
}
```

##### `POST /admin/invites`
招待リンク作成

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
X-Admin-Required: true
```

**リクエストボディ**
```json
{
  "email": "newuser@example.com",
  "memberType": "member",
  "expiresInDays": 7
}
```

**レスポンス**
```json
{
  "id": "01JFINVITE123456",
  "email": "newuser@example.com",
  "inviteToken": "invite-token-abc123xyz",
  "inviteUrl": "https://yamadai-manken-home.pages.dev/signup?token=invite-token-abc123xyz",
  "memberType": "member",
  "expiresAt": "2024-12-21T12:34:56Z",
  "createdAt": "2024-12-14T12:34:56Z"
}
```

##### `GET /admin/invites`
招待リンク一覧取得

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
X-Admin-Required: true
```

**クエリパラメータ**
- `status` (string, optional): ステータスでフィルタ（pending/used/expired）

**レスポンス**
```json
{
  "invites": [
    {
      "id": "01JFINVITE123456",
      "email": "newuser@example.com",
      "inviteUrl": "https://yamadai-manken-home.pages.dev/signup?token=invite-token-abc123xyz",
      "memberType": "member",
      "status": "pending",
      "expiresAt": "2024-12-21T12:34:56Z",
      "createdAt": "2024-12-14T12:34:56Z"
    }
  ]
}
```

##### `DELETE /admin/invites/:inviteId`
招待リンク無効化

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
X-Admin-Required: true
```

**パスパラメータ**
- `inviteId` (string): 招待ID

**レスポンス**
```json
{
  "message": "招待リンクを無効化しました",
  "deletedInviteId": "01JFINVITE123456"
}
```

#### グループ管理

##### `GET /admin/groups`
グループ一覧取得

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
X-Admin-Required: true
```

**レスポンス**
```json
{
  "groups": [
    {
      "id": "01JFGROUP123",
      "name": "2024年度生",
      "description": "2024年度入部メンバー",
      "memberCount": 15,
      "createdAt": "2024-04-01T00:00:00Z"
    }
  ]
}
```

##### `POST /admin/groups`
グループ作成

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
X-Admin-Required: true
```

**リクエストボディ**
```json
{
  "name": "2025年度生",
  "description": "2025年度入部メンバー"
}
```

**レスポンス**
```json
{
  "id": "01JFGROUP789",
  "name": "2025年度生",
  "description": "2025年度入部メンバー",
  "createdAt": "2024-12-14T12:34:56Z"
}
```

##### `PATCH /admin/groups/:groupId`
グループ更新

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
X-Admin-Required: true
```

**パスパラメータ**
- `groupId` (string): グループID

**リクエストボディ**
```json
{
  "name": "2025年度生（改訂）",
  "description": "更新された説明"
}
```

**レスポンス**
```json
{
  "id": "01JFGROUP789",
  "name": "2025年度生（改訂）",
  "description": "更新された説明",
  "updatedAt": "2024-12-14T12:34:56Z"
}
```

##### `DELETE /admin/groups/:groupId`
グループ削除（カスケード削除：メンバー関係、作品権限も削除）

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
X-Admin-Required: true
```

**パスパラメータ**
- `groupId` (string): グループID

**レスポンス**
```json
{
  "message": "グループを削除しました",
  "deletedGroupId": "01JFGROUP789",
  "removedMemberCount": 15
}
```

##### `POST /admin/groups/:groupId/members`
グループにメンバー追加

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
X-Admin-Required: true
```

**パスパラメータ**
- `groupId` (string): グループID

**リクエストボディ**
```json
{
  "userIds": ["01JFUSER123", "01JFUSER456"]
}
```

**レスポンス**
```json
{
  "addedMembers": [
    {
      "userId": "01JFUSER123",
      "groupId": "01JFGROUP789"
    },
    {
      "userId": "01JFUSER456",
      "groupId": "01JFGROUP789"
    }
  ],
  "totalAdded": 2
}
```

##### `DELETE /admin/groups/:groupId/members/:userId`
グループからメンバー削除

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
X-Admin-Required: true
```

**パスパラメータ**
- `groupId` (string): グループID
- `userId` (string): ユーザーID

**レスポンス**
```json
{
  "message": "メンバーをグループから削除しました",
  "userId": "01JFUSER123",
  "groupId": "01JFGROUP789"
}
```

#### 権限管理

##### `GET /admin/works/:workId/permissions`
作品の閲覧権限取得

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
X-Admin-Required: true
```

**パスパラメータ**
- `workId` (string): 作品ID

**レスポンス**
```json
{
  "workId": "01JFABCDEFGH123456789",
  "visibility": "limited",
  "permissions": [
    {
      "id": "01JFPERM123",
      "group": {
        "id": "01JFGROUP123",
        "name": "2024年度生"
      },
      "createdAt": "2024-03-15T10:00:00Z"
    }
  ]
}
```

##### `POST /admin/works/:workId/permissions`
作品に閲覧権限追加

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
X-Admin-Required: true
```

**パスパラメータ**
- `workId` (string): 作品ID

**リクエストボディ**
```json
{
  "groupIds": ["01JFGROUP123", "01JFGROUP456"]
}
```

**レスポンス**
```json
{
  "addedPermissions": [
    {
      "id": "01JFPERM123",
      "workId": "01JFABCDEFGH123456789",
      "groupId": "01JFGROUP123"
    },
    {
      "id": "01JFPERM456",
      "workId": "01JFABCDEFGH123456789",
      "groupId": "01JFGROUP456"
    }
  ]
}
```

##### `DELETE /admin/works/:workId/permissions/:groupId`
作品の閲覧権限削除

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
X-Admin-Required: true
```

**パスパラメータ**
- `workId` (string): 作品ID
- `groupId` (string): グループID

**レスポンス**
```json
{
  "message": "閲覧権限を削除しました",
  "workId": "01JFABCDEFGH123456789",
  "groupId": "01JFGROUP123"
}
```

#### 統計情報

##### `GET /admin/stats`
システム統計情報取得

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
X-Admin-Required: true
```

**レスポンス**
```json
{
  "users": {
    "total": 35,
    "admins": 3,
    "members": 25,
    "obOg": 5,
    "guests": 2
  },
  "works": {
    "total": 65,
    "public": 40,
    "private": 10,
    "limited": 15,
    "totalPages": 1580
  },
  "groups": {
    "total": 8
  },
  "updatedAt": "2024-12-14T12:34:56Z"
}
```

#### ゴミ箱管理

##### `GET /admin/trash/works`
削除済み作品一覧取得

**ステータスコード**: `200 OK`

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
X-Admin-Required: true
```

**クエリパラメータ**
- `page` (number, optional): ページ番号（デフォルト: 1）
- `limit` (number, optional): 1ページあたりの件数（デフォルト: 20、最大: 100）
- `sort` (string, optional): ソート対象（deletedAt/title、デフォルト: deletedAt）
- `order` (string, optional): ソート順（asc/desc、デフォルト: desc）

**レスポンス**
```json
{
  "works": [
    {
      "id": "01JFABCDEFGH123456789",
      "title": "春の物語",
      "author": "AO",
      "year": 2024,
      "deletedAt": "2024-12-14T12:34:56Z",
      "deletedBy": {
        "id": "01JFADMIN123",
        "name": "管理者太郎"
      },
      "permanentDeleteAt": "2025-01-13T12:34:56Z",
      "daysUntilPermanentDelete": 30
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

##### `POST /admin/trash/works/:workId/restore`
削除済み作品を復元

**ステータスコード**: `200 OK`

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
X-Admin-Required: true
```

**パスパラメータ**
- `workId` (string): 作品ID

**レスポンス**
```json
{
  "message": "作品を復元しました",
  "work": {
    "id": "01JFABCDEFGH123456789",
    "title": "春の物語",
    "visibility": "private",
    "restoredAt": "2024-12-15T10:00:00Z"
  }
}
```

##### `DELETE /admin/trash/works/:workId`
作品を完全削除（即座に物理削除）

**ステータスコード**: `204 No Content`

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN>
X-Admin-Required: true
```

**パスパラメータ**
- `workId` (string): 作品ID

**注意**: この操作は取り消せません。Cloudflare Imagesからも即座に削除されます。

---

### 5. 画像API

#### 概要

画像配信は**署名付きURL方式**を採用します。

**Cloudflare Imagesの署名付きURL**は有効期限のみを管理するため、権限チェックはAPI側で実装します。

#### 実装戦略

**フロー**:
1. フロントエンドがAPIに画像URLをリクエスト
2. API側で作品の閲覧権限をチェック
3. 権限があれば署名付きURL（有効期限1時間）を生成して返却
4. フロントエンドはその署名付きURLで画像を直接取得（CDN経由）

**メリット**:
- 権限チェックはAPI側で集中管理
- 画像配信はCDN直接で高速・低コスト
- Workers実行コスト最小化

#### `GET /pages/:pageId/image-url`
ページ画像の署名付きURLを取得

**ステータスコード**: `200 OK`

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN> (private/limited作品の場合必要)
```

**パスパラメータ**
- `pageId` (string): ページID

**レスポンス**
```json
{
  "imageUrl": "https://imagedelivery.net/account-hash/image-id/public?exp=1702560000&sig=abc123xyz",
  "expiresAt": "2024-12-14T13:34:56Z",
  "expiresIn": 3600
}
```

**権限チェック**:
1. 作品のvisibilityを確認
2. public: 誰でもアクセス可能
3. private: 管理者のみ
4. limited: 該当グループに所属しているユーザーのみ

**エラーレスポンス**
```json
{
  "error": "FORBIDDEN",
  "message": "この画像を閲覧する権限がありません"
}
```

#### `POST /pages/image-urls`
複数ページの署名付きURLを一括取得

**ステータスコード**: `200 OK`

**リクエストヘッダー**
```
Authorization: Bearer <JWT_TOKEN> (private/limited作品の場合必要)
```

**リクエストボディ**
```json
{
  "pageIds": ["01JFPAGE123", "01JFPAGE456", "01JFPAGE789"]
}
```

**制限**:
- `pageIds` の最大個数: 50個
```

**レスポンス**
```json
{
  "imageUrls": [
    {
      "pageId": "01JFPAGE123",
      "pageNumber": 0,
      "imageUrl": "https://imagedelivery.net/account-hash/image-id-0/public?exp=1702560000&sig=abc123",
      "expiresAt": "2024-12-14T13:34:56Z"
    },
    {
      "pageId": "01JFPAGE456",
      "pageNumber": 1,
      "imageUrl": "https://imagedelivery.net/account-hash/image-id-1/public?exp=1702560000&sig=def456",
      "expiresAt": "2024-12-14T13:34:56Z"
    }
  ],
  "expiresIn": 3600
}
```

**用途**: ビューワーで複数ページを事前ロードする際に使用

#### 画像バリアント

Cloudflare Imagesのバリアント機能を使用します。

**利用可能なバリアント**:
- `thumbnail`: 200x200px（一覧表示用）
- `medium`: 800x800px（プレビュー用）
- `large`: 1600x1600px（詳細表示用）
- `public`: オリジナルサイズ

**使用例**:
```
https://imagedelivery.net/account-hash/image-id/thumbnail?exp=...&sig=...
https://imagedelivery.net/account-hash/image-id/large?exp=...&sig=...
```

#### 署名付きURL生成ロジック（サーバー側実装）

```typescript
import crypto from 'crypto';

function generateSignedImageUrl(
  imageId: string,
  variant: string = 'public',
  expiresIn: number = 3600
): string {
  const accountHash = env.CF_IMAGES_ACCOUNT_HASH;
  const signingKey = env.CF_IMAGES_SIGNING_KEY;
  
  const expiry = Math.floor(Date.now() / 1000) + expiresIn;
  const baseUrl = `https://imagedelivery.net/${accountHash}/${imageId}/${variant}`;
  
  // 署名を生成
  const dataToSign = `${baseUrl}?exp=${expiry}`;
  const signature = crypto
    .createHmac('sha256', signingKey)
    .update(dataToSign)
    .digest('hex');
  
  return `${baseUrl}?exp=${expiry}&sig=${signature}`;
}
```

---

## エラーレスポンス

### 共通エラーフォーマット
```json
{
  "error": "ERROR_CODE",
  "message": "エラーの説明",
  "details": {
    "field": "エラーが発生したフィールド",
    "reason": "詳細な理由"
  }
}
```

### エラーコード一覧

| HTTPステータス | エラーコード | 説明 |
|---------------|------------|------|
| 400 | BAD_REQUEST | リクエストの形式が不正 |
| 401 | UNAUTHORIZED | 認証が必要 |
| 403 | FORBIDDEN | 権限不足 |
| 404 | NOT_FOUND | リソースが見つからない |
| 409 | CONFLICT | リソースの競合（重複など） |
| 422 | VALIDATION_ERROR | バリデーションエラー |
| 429 | RATE_LIMIT_EXCEEDED | レート制限超過 |
| 500 | INTERNAL_SERVER_ERROR | サーバー内部エラー |
| 503 | SERVICE_UNAVAILABLE | サービス利用不可 |

### エラーレスポンス例

**バリデーションエラー**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "入力値が不正です",
  "details": {
    "field": "year",
    "reason": "年は1000から9999の範囲で指定してください"
  }
}
```

**権限不足**
```json
{
  "error": "FORBIDDEN",
  "message": "この操作を実行する権限がありません"
}
```

**リソース未検出**
```json
{
  "error": "NOT_FOUND",
  "message": "指定された作品が見つかりません",
  "details": {
    "workId": "01JFABCDEFGH123456789"
  }
}
```

---

## レート制限

### 制限値
- **未認証ユーザー**: 100リクエスト/分
- **認証済みユーザー**: 300リクエスト/分
- **管理者**: 1000リクエスト/分

### レート制限ヘッダー
```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 250
X-RateLimit-Reset: 1702550400
```

### レート制限超過時のレスポンス
```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "リクエスト数が制限を超えました。しばらくしてから再試行してください",
  "retryAfter": 60
}
```

---

## CORS設定

### 許可オリジン
- `https://yamadai-manken-home.pages.dev`
- `http://localhost:5173` (開発環境)

### 許可メソッド
- `GET`, `POST`, `PATCH`, `DELETE`, `OPTIONS`

### 許可ヘッダー
- `Authorization`, `Content-Type`, `X-Admin-Required`

---

## バージョニング

### URL方式
- ベースURL: `https://api.yamadai-manken-home.pages.dev/v1`
- 将来的に破壊的変更がある場合は `/v2` を作成

### 非推奨化プロセス
1. 新バージョンリリース
2. 旧バージョンに非推奨ヘッダー追加: `Deprecation: true`
3. 6ヶ月後に旧バージョン削除

---

## セキュリティ

### 必須ヘッダー
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### CSRF対策
- トークンベース認証のため、CSRFトークンは不要
- すべての変更操作にJWT必須

### SQLインジェクション対策
- プリペアドステートメント使用
- 入力値のバリデーション

---

## パフォーマンス最適化

### キャッシュ戦略
- **公開作品**: CDNキャッシュ（1時間）
- **画像**: CDNキャッシュ（24時間）
- **ユーザー情報**: キャッシュなし

### ページネーション
- デフォルト: 20件/ページ
- 最大: 100件/ページ

### 楽観的ロック（更新競合対策・ベストプラクティス）

**問題**: 複数管理者が同時に同じリソースを更新すると、後の更新で先の更新が上書きされる（Lost Update問題）

**対策**: versionカラムによる楽観的ロック（シンプルで実装しやすい）

#### 実装方法

**1. データベーススキーマ**（既に追加済み）:
- `works`テーブル: `version INTEGER DEFAULT 1`
- `groups`テーブル: `version INTEGER DEFAULT 1`

**2. 取得時のレスポンスにversionを含める**:
```json
{
  "id": "01JFABCDEFGH123456789",
  "title": "春の物語",
  "version": 3,
  "updatedAt": "2024-12-14T12:34:56Z"
}
```

**3. 更新時にversionをリクエストに含める**:
```json
{
  "title": "春の物語（改訂版）",
  "version": 3
}
```

**4. SQL更新文でversionをチェック**:
```sql
UPDATE works 
SET title = ?, 
    description = ?, 
    version = version + 1, 
    updated_at = CURRENT_TIMESTAMP
WHERE id = ? AND version = ?
RETURNING *
```

**5. 更新が成功した場合**（1行更新）:
```json
{
  "id": "01JFABCDEFGH123456789",
  "title": "春の物語（改訂版）",
  "version": 4,
  "updatedAt": "2024-12-14T13:00:00Z"
}
```

**6. 更新が失敗した場合**（0行更新 = 競合発生）:

**ステータスコード**: `409 Conflict`

```json
{
  "error": "CONFLICT",
  "message": "他のユーザーによって更新されています。最新の情報を取得して再試行してください",
  "code": "VERSION_CONFLICT"
}
```

#### 適用対象エンドポイント

- ✅ `PATCH /admin/works/:workId`
- ✅ `PATCH /admin/groups/:groupId`
- ✅ `PATCH /admin/works/:workId/visibility`

#### フロントエンド実装例

```typescript
async function updateWork(id: string, data: UpdateWorkData, version: number) {
  try {
    const response = await fetch(`/admin/works/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ...data, version })
    });
    
    if (response.status === 409) {
      // 競合検出: 最新データを再取得してユーザーに通知
      alert('他のユーザーが更新しました。最新データを取得してください');
      const latestData = await fetchWork(id);
      // UIに最新データを反映
      return latestData;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Update failed:', error);
    throw error;
  }
}
```

---

## OpenAPI仕様

### Hono + Zod OpenAPI

本APIは **Hono** と **@hono/zod-openapi** を使用してOpenAPI 3.1仕様を自動生成します。

**導入パッケージ**:
```bash
npm install @hono/zod-openapi zod
```

**実装例**:
```typescript
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

const app = new OpenAPIHono();

// スキーマ定義
const WorkSchema = z.object({
  id: z.string().openapi({ example: '01JFABCDEFGH123456789' }),
  title: z.string().openapi({ example: '春の物語' }),
  author: z.string().openapi({ example: 'AO' }),
  year: z.number().min(1000).max(9999).openapi({ example: 2024 }),
  visibility: z.enum(['public', 'private', 'limited']),
});

// ルート定義
const getPublicWorksRoute = createRoute({
  method: 'get',
  path: '/public/works',
  tags: ['Public'],
  summary: '公開作品一覧取得',
  responses: {
    200: {
      description: '成功',
      content: {
        'application/json': {
          schema: z.object({
            works: z.array(WorkSchema),
            pagination: z.object({
              total: z.number(),
              page: z.number(),
              limit: z.number(),
              totalPages: z.number(),
            }),
          }),
        },
      },
    },
  },
});

app.openapi(getPublicWorksRoute, async (c) => {
  // 実装
  return c.json({ works: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } });
});

// OpenAPI JSON生成
app.doc('/openapi.json', {
  openapi: '3.1.0',
  info: {
    title: '漫画研究会ホームページ API',
    version: 'v1',
  },
});
```

**Swagger UI**:
```typescript
import { swaggerUI } from '@hono/swagger-ui';

app.get('/docs', swaggerUI({ url: '/openapi.json' }));
```

**メリット**:
- ✅ 型安全なバリデーション（Zod）
- ✅ OpenAPI仕様の自動生成
- ✅ Swagger UIで即座にテスト可能
- ✅ フロントエンドの型定義自動生成（openapi-typescript）

**生成されるURL**:
- OpenAPI JSON: `https://api.yamadai-manken-home.pages.dev/openapi.json`
- Swagger UI: `https://api.yamadai-manken-home.pages.dev/docs`

---

## テスト

### モック作成
- すべてのエンドポイントのモックを作成
- 認証周りは必ずテスト

### テストカバレッジ目標
- ユニットテスト: 80%以上
- 統合テスト: 主要フロー100%

---

## 開発ルール

### コーディング規約
- コメントは日本語で記述
- 関数にはdocstringを必ず作成
- 型定義を徹底（TypeScript）
- middleware、usecase、repositoryなど役割を明確に分ける
- URLのハードコードは避ける
- エラー処理とログ出力を徹底

### ドキュメント
- API変更時は必ずこのドキュメントを更新
- 新しいエンドポイント追加時はテストも同時に作成
