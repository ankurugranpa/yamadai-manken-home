import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';
import { supabase } from '../lib/supabase';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../stores/authStore';

/**
 * ログイン画面コンポーネント
 * Supabase AuthのGoogle OAuthを使用したログイン機能を提供
 */
export function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  /**
   * Googleログインボタンのクリックハンドラ
   * 
   * Supabase Auth + Google OAuth 2.0 を使用してログイン処理を実行する。
   * 認証成功後はSupabaseのコールバックURLにリダイレクトされ、
   * onAuthStateChangeリスナーが自動的に状態を更新する。
   */
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Supabase AuthのGoogle OAuthログインを実行
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        throw error;
      }

      // OAuth処理が開始されると自動的にリダイレクトされるため、
      // ここでの処理は不要
    } catch (err) {
      console.error('ログインエラー:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'ログインに失敗しました。もう一度お試しください。'
      );
      setIsLoading(false);
    }
  };

  // 既にログイン済みの場合はホームにリダイレクト
  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  return (
    <div className="h-full w-full flex items-center justify-center bg-white">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-200">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              ログイン
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Googleアカウントでログインしてください
            </p>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs md:text-sm text-gray-700">
                ※ ログインには事前に招待コードでの会員登録が必要です。<br />
                登録済みのアカウントのみご利用いただけます。
              </p>
            </div>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Googleログインボタン */}
          <div className="space-y-4">
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              size="lg"
              className="w-full h-12 text-base font-medium hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              <FcGoogle className="mr-3 h-6 w-6" />
              {isLoading ? 'ログイン中...' : 'Googleでログイン'}
            </Button>
          </div>

          {/* フッター情報 */}
          <div className="mt-8 text-center">
            <p className="text-xs md:text-sm text-gray-500">
              ログインすることで、利用規約とプライバシーポリシーに同意したものとみなされます
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
