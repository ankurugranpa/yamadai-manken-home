/**
 * 認証状態管理用のZustandストア
 *
 * @description
 * Supabase認証の状態を管理するグローバルストア。
 * ユーザー情報、セッション情報、ローディング状態を保持し、
 * ログイン・ログアウト・セッション初期化などの操作を提供する。
 */

import {create} from 'zustand';
import type {Session, User} from '@supabase/supabase-js';
import {supabase} from '../lib/supabase';

/**
 * 認証ストアの状態インターフェース
 */
interface AuthState {
  /** 現在のユーザー情報 */
  user: User | null;
  /** 現在のセッション情報 */
  session: Session | null;
  /** 認証状態の初期化中かどうか */
  isLoading: boolean;
  /** 認証済みかどうか */
  isAuthenticated: boolean;

  /**
   * ユーザーとセッションを設定する
   * @param session - セッション情報
   */
  setSession: (session: Session | null) => void;

  /**
   * ログアウト処理を実行する
   */
  signOut: () => Promise<void>;
}

/**
 * 認証状態管理用のストア
 *
 * @example
 * ```typescript
 * const { user, isAuthenticated, signOut } = useAuthStore();
 * ```
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,

  setSession: (session) => {
    set({
      session,
      user: session?.user ?? null,
      isAuthenticated: !!session,
      isLoading: false,
    });
  },

  signOut: async () => {
    try {
      const {error} = await supabase.auth.signOut();
      if (error) {
        console.error('ログアウトに失敗しました:', error);
        throw error;
      }
      set({
        user: null,
        session: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('ログアウト処理中にエラーが発生しました:', error);
      throw error;
    }
  },
}));

/**
 * 認証状態を自動的に初期化する
 * ストア作成時に一度だけ実行され、以降は認証状態の変更を監視する
 */
void (async () => {
  try {
    // 既存のセッションを取得
    const {data, error} = await supabase.auth.getSession();

    if (error) {
      console.error('セッションの取得に失敗しました:', error);
      useAuthStore.setState({isLoading: false});
      return;
    }

    useAuthStore.setState({
      session: data.session,
      user: data.session?.user ?? null,
      isAuthenticated: !!data.session,
      isLoading: false,
    });

    // 認証状態の変更を監視
    supabase.auth.onAuthStateChange((_event, session) => {
      useAuthStore.setState({
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session,
        isLoading: false,
      });
    });
  } catch (error) {
    console.error('認証の初期化に失敗しました:', error);
    useAuthStore.setState({isLoading: false});
  }
})();
