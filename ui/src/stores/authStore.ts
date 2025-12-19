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
  /** 認証エラー情報 */
  authError: { code: string; description: string } | null;

  /**
   * ユーザーとセッションを設定する
   * @param session - セッション情報
   */
  setSession: (session: Session | null) => void;

  /**
   * ログアウト処理を実行する
   */
  signOut: () => Promise<void>;

  /**
   * エラーをクリアする
   */
  clearError: () => void;
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
  authError: null,

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
        authError: null,
      });
    } catch (error) {
      console.error('ログアウト処理中にエラーが発生しました:', error);
      throw error;
    }
  },

  clearError: () => {
    set({ authError: null });
  },
}));

/**
 * 認証状態を自動的に初期化する
 * ストア作成時に一度だけ実行され、以降は認証状態の変更を監視する
 */
void (async () => {
  try {
    // URLからエラーパラメータをチェック
    const url = new URL(window.location.href);
    const errorCode = url.searchParams.get('error_code') || url.hash.match(/error_code=([^&]+)/)?.[1];
    const errorDescription = url.searchParams.get('error_description') || url.hash.match(/error_description=([^&]+)/)?.[1];
    
    if (errorCode) {
      const decodedDescription = errorDescription ? decodeURIComponent(errorDescription.replace(/\+/g, ' ')) : '';
      useAuthStore.setState({
        authError: {
          code: errorCode,
          description: decodedDescription,
        },
      });
      
      // URLからエラーパラメータをクリーンアップ
      url.searchParams.delete('error');
      url.searchParams.delete('error_code');
      url.searchParams.delete('error_description');
      url.hash = '';
      window.history.replaceState({}, '', url.pathname);
    }

    // 認証状態の変更を監視（これを先に設定）
    supabase.auth.onAuthStateChange((_event, session) => {
      if (import.meta.env.DEV) {
        console.log('Auth state changed:', _event, session?.user?.email);
      }
      useAuthStore.setState({
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session,
        isLoading: false,
      });

      // 認証成功後、URLのcodeパラメータをクリーンアップ
      if (_event === 'SIGNED_IN' && session) {
        const url = new URL(window.location.href);
        if (url.searchParams.has('code')) {
          url.searchParams.delete('code');
          window.history.replaceState({}, '', url.toString());
        }
      }
    });

    // 既存のセッションを取得（PKCEコード交換も自動的に実行される）
    const {data, error} = await supabase.auth.getSession();

    if (error) {
      console.error('セッションの取得に失敗しました:', error);
      useAuthStore.setState({isLoading: false});
      return;
    }

    if (import.meta.env.DEV) {
      console.log('Session retrieved:', data.session?.user?.email);
    }
    
    useAuthStore.setState({
      session: data.session,
      user: data.session?.user ?? null,
      isAuthenticated: !!data.session,
      isLoading: false,
    });
  } catch (error) {
    console.error('認証の初期化に失敗しました:', error);
    useAuthStore.setState({isLoading: false});
  }
})();
