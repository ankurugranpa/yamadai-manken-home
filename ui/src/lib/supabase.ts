/**
 * Supabaseクライアントの初期化
 *
 * @description
 * Supabase SDKを使用してクライアントを初期化する。
 * 環境変数からURLとAnon Keyを取得し、アプリケーション全体で使用する
 * Supabaseクライアントのシングルトンインスタンスを提供する。
 */

import {createClient} from '@supabase/supabase-js';

// 環境変数からSupabaseの設定を取得
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 環境変数が設定されているか確認
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase URLとAnon Keyが設定されていません。.envファイルを確認してください。'
  );
}

/**
 * Supabaseクライアントのインスタンス
 *
 * このインスタンスはアプリケーション全体で共有される。
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
