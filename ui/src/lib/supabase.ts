/**
 * Supabaseクライアントの初期化
 *
 * @description
 * Supabase SDKを使用してクライアントを初期化する。
 * 環境変数からURLとAnon Keyを取得し、アプリケーション全体で使用する
 * Supabaseクライアントのシングルトンインスタンスを提供する。
 */

import {createClient} from '@supabase/supabase-js';

const env: Record<string, unknown> = import.meta.env as unknown as Record<string, unknown>;

// 環境変数からSupabaseの設定を取得
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

// 環境変数が設定されているか確認
if (typeof supabaseUrl !== 'string' || typeof supabaseAnonKey !== 'string' || !supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase URLとAnon Keyが設定されていません。.envファイルを確認してください。'
  );
}

// URLの形式を検証（基本的なチェック）
try {
  const url = new URL(supabaseUrl);
  if (!url.hostname.includes('supabase')) {
    if (import.meta.env.DEV) {
      console.warn('警告: Supabase URLの形式が通常と異なります');
    }
  }
} catch {
  throw new Error('Supabase URLの形式が不正です');
}

/**
 * Supabaseクライアントのインスタンス
 *
 * このインスタンスはアプリケーション全体で共有される。
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  },
});
