-- ============================================================
-- 漫画研究会ホームページ データベース設計
-- Cloudflare D1 スキーマ定義
-- ============================================================
-- マイグレーションバージョン: 0001
-- 作成日: 2025-12-13
-- 更新日: 2025-12-14
-- 説明: 初期テーブル作成（users, user_roles, groups, user_groups, works, work_authors, pages, work_permissions, invitations）
-- 
-- システムの想定規模:
--   - ユーザー数: 30-100人
--   - 作品数: 60-80作品
--   - ページ数: 1,600ページ程度
--   - グループ数: 5-10個
-- 
-- ID生成方式:
--   UUID v7 (時系列ソート可能、推測困難)
--   アプリケーション側で生成
-- 
-- インデックス戦略:
--   超小規模システム, 身内向けの要素が大きいシステム→不要と判断
-- ============================================================

-- ============================================================
-- ユーザーテーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL, -- OAuth認証で取得、NULL不可
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ユーザーロールテーブル（1ユーザー = 1所属ステータス + 管理者フラグ）
-- ============================================================
-- is_adminは管理者権限フラグ（他のロールと重複可能）
-- member_typeは所属ステータス（member, ob_og, guest のいずれか1つ）
-- 重複ルール:
--   ✅ 可能: Admin+Member, Admin+OB_OG, Admin+Guest
--   ❌ 不可: Member+OB_OG, Member+Guest, OB_OG+Guest
CREATE TABLE IF NOT EXISTS user_roles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE, -- 管理者権限（全作品閲覧可能、管理画面アクセス可能）
  member_type TEXT CHECK(member_type IN ('member', 'ob_og', 'guest')) NOT NULL,
  -- member: 現役部員
  -- ob_og: OB/OG（卒業生）
  -- guest: ゲスト（公開作品のみ閲覧可能）
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id) -- 1ユーザーは1つの所属ステータスのみ持つ（is_adminは独立）
);

-- ============================================================
-- グループテーブル
-- ============================================================
-- groupは「所属している集まり」を表す（2024年度生, 編集部, OB/OG会など）
-- 1ユーザーは複数のgroupに所属可能
CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL, -- グループ名（例: 2024年度生, 編集部, OB/OG会）
  description TEXT,
  version INTEGER DEFAULT 1, -- 楽観的ロック用バージョン
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ユーザーグループ所属テーブル（多対多）
-- ============================================================
-- ユーザーとグループの多対多関係を管理
-- 1ユーザーが複数グループに所属できる仕組み
CREATE TABLE IF NOT EXISTS user_groups (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  group_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  UNIQUE(user_id, group_id) -- 同じユーザーが同じグループに重複所属しない
);

-- ============================================================
-- 作品テーブル
-- ============================================================
-- 漫画作品のメタデータを管理
CREATE TABLE IF NOT EXISTS works (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL, -- 作品タイトル
  description TEXT, -- 作品説明
  year INTEGER CHECK(year >= 1000 AND year <= 9999), -- 発行年（4桁の年、NULL=年不明）
  visibility TEXT CHECK(visibility IN ('public', 'private', 'limited')) DEFAULT 'private',
  -- public: 一般公開（誰でも閲覧可能）
  -- private: 非公開（管理者のみ閲覧可能）
  -- limited: 限定公開（特定グループのみ閲覧可能）
  cover_image_id TEXT, -- 表紙画像のCloudflare Images ID
  created_by TEXT NOT NULL, -- アップロードした管理者のユーザーID（users.id）
  version INTEGER DEFAULT 1, -- 楽観的ロック用バージョン
  deleted_at DATETIME, -- 論理削除日時（NULL=有効、値あり=削除済み）
  deleted_by TEXT, -- 削除した管理者のユーザーID
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL
  -- ユーザー削除を禁止（作品が存在する限り削除不可）
);

-- ============================================================
-- ページテーブル（1作品に複数ページ）
-- ============================================================
-- 各作品のページ情報を管理
-- 論理削除: deleted_atがNULLの場合は有効、値ありの場合は削除済み
CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY,
  work_id TEXT NOT NULL,
  page_number INTEGER NOT NULL, -- ページ順序（0始まり）
  image_id TEXT, -- Cloudflare Images ID（NULL=アップロード失敗/未完了）
  file_name TEXT, -- 元のファイル名（例: 000.png）（NULL=アップロード失敗/未完了）
  alt_text TEXT, -- 代替テキスト（アクセシビリティ対応）
  deleted_at DATETIME, -- 論理削除日時（NULL=有効、値あり=削除済み）
  deleted_by TEXT, -- 削除した管理者のユーザーID
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE RESTRICT,
  FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(work_id, page_number) -- 同じ作品内でページ番号が重複しない
);

-- ============================================================
-- 作品閲覧権限テーブル（limited公開時に使用）
-- ============================================================
-- visibility='limited'の作品に対して、どのグループが閲覧可能かを管理
CREATE TABLE IF NOT EXISTS work_permissions (
  id TEXT PRIMARY KEY,
  work_id TEXT NOT NULL,
  group_id TEXT NOT NULL, -- 閲覧を許可するグループID
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE,
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  UNIQUE(work_id, group_id) -- 同じ作品に同じグループの権限が重複しない
);

-- ============================================================
-- 作品作者テーブル（多対多）
-- ============================================================
-- 作品と作者名の多対多関係を管理（共同作品対応）
-- 作者名はシステムユーザーとは独立した文字列として管理
CREATE TABLE IF NOT EXISTS work_authors (
  id TEXT PRIMARY KEY,
  work_id TEXT NOT NULL,
  author_name TEXT NOT NULL, -- 作者名（例: "AO", "dd120"）
  display_order INTEGER NOT NULL DEFAULT 0, -- 表示順序（0が最初）
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE,
  UNIQUE(work_id, author_name) -- 同じ作品に同じ作者が重複しない
);

-- ============================================================
-- 招待テーブル
-- ============================================================
-- 新規ユーザーを招待するためのトークンと招待情報を管理
-- 関連Issue: #80
CREATE TABLE IF NOT EXISTS invitations (
  id TEXT PRIMARY KEY,
  token TEXT UNIQUE NOT NULL, -- 招待トークン（URL生成用、ランダムな文字列）
  email TEXT, -- 招待対象のメールアドレス（オプション、NULLの場合は誰でも使用可能）
  member_type TEXT CHECK(member_type IN ('member', 'ob_og', 'guest')) NOT NULL,
  -- member: 現役部員として招待
  -- ob_og: OB/OGとして招待
  -- guest: ゲストとして招待
  invited_by TEXT NOT NULL, -- 招待を作成した管理者のユーザーID
  used_by TEXT, -- この招待を使用したユーザーのID（NULL=未使用）
  used_at DATETIME, -- 招待が使用された日時（NULL=未使用）
  expires_at DATETIME NOT NULL, -- 招待の有効期限
  max_uses INTEGER NOT NULL DEFAULT 1 CHECK(max_uses > 0), -- 最大使用回数
  current_uses INTEGER NOT NULL DEFAULT 0 CHECK(current_uses >= 0 AND current_uses <= max_uses), -- 現在の使用回数
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE RESTRICT,
  -- 招待を作成した管理者の削除を禁止（招待履歴を保持）
  FOREIGN KEY (used_by) REFERENCES users(id) ON DELETE SET NULL
  -- 招待を使用したユーザーが削除された場合はNULLに設定
);

-- ============================================================
-- updated_at 自動更新トリガー
-- ============================================================
-- users テーブル
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
AFTER UPDATE ON users
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- groups テーブル
CREATE TRIGGER IF NOT EXISTS update_groups_timestamp 
AFTER UPDATE ON groups
BEGIN
  UPDATE groups SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- works テーブル
CREATE TRIGGER IF NOT EXISTS update_works_timestamp 
AFTER UPDATE ON works
BEGIN
  UPDATE works SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- invitations テーブル
CREATE TRIGGER IF NOT EXISTS update_invitations_timestamp 
AFTER UPDATE ON invitations
BEGIN
  UPDATE invitations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;