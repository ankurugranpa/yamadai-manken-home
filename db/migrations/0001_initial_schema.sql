-- ============================================================
-- 漫画研究会ホームページ データベース設計
-- Cloudflare D1 スキーマ定義
-- ============================================================
-- マイグレーションバージョン: 0001
-- 作成日: 2025-12-13
-- 説明: 初期テーブル作成（users, user_roles, groups, user_groups, works, pages, work_permissions）
-- 
-- システムの想定規模:
--   - ユーザー数: 30-100人
--   - 作品数: 60-80作品
--   - ページ数: 1,600ページ程度
--   - グループ数: 5-10個
-- 
-- インデックス戦略:
--   超小規模システムのため、インデックスは作成しない
--   データ量が少なくフルスキャンでも十分高速
--   必要に応じて将来的にKVキャッシュで対応
-- ============================================================

-- ============================================================
-- ユーザーテーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ユーザーロールテーブル（1ユーザー = 1ロール）
-- ============================================================
-- roleはその人の「身分」を表す（admin, member, ob, og, guest）
-- 1ユーザーは必ず1つのroleを持つ
CREATE TABLE IF NOT EXISTS user_roles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  role TEXT CHECK(role IN ('admin', 'member', 'ob', 'og', 'guest')) NOT NULL,
  -- admin: 管理者（全作品閲覧可能）
  -- member: 現役部員
  -- ob: OB
  -- og: OG
  -- guest: ゲスト（公開作品のみ閲覧可能）
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id) -- 1ユーザーは1つのroleのみ持つ制約
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
  author TEXT, -- 作品の作者名（例: "AO", "dd120"）※システムユーザーとは別
  year INTEGER, -- 発行年
  visibility TEXT CHECK(visibility IN ('public', 'private', 'limited')) DEFAULT 'private',
  -- public: 一般公開（誰でも閲覧可能）
  -- private: 非公開（管理者のみ閲覧可能）
  -- limited: 限定公開（特定グループのみ閲覧可能）
  cover_image_id TEXT, -- 表紙画像のCloudflare Images ID
  created_by TEXT NOT NULL, -- アップロードした管理者のユーザーID（users.id）
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ============================================================
-- ページテーブル（1作品に複数ページ）
-- ============================================================
-- 各作品のページ情報を管理
CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY,
  work_id TEXT NOT NULL,
  page_number INTEGER NOT NULL, -- ページ順序（0始まり）
  image_id TEXT NOT NULL, -- Cloudflare Images ID
  file_name TEXT NOT NULL, -- 元のファイル名（例: 000.png）
  alt_text TEXT, -- 代替テキスト（アクセシビリティ対応）
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE,
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
