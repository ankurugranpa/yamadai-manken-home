import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';

/**
 * ログイン画面コンポーネント
 * Googleログインボタンを表示するモック画面
 */
export function Login() {
  /**
   * Googleログインボタンのクリックハンドラ
   * 
   * TODO: Phase 1-2で実装予定の認証処理
   * 実装内容:
   *   1. Supabase Auth + Google OAuth 2.0 の統合
   *   2. supabase.auth.signInWithOAuth({ provider: 'google' }) の呼び出し
   *   3. 認証成功後に /home へリダイレクト
   *   4. エラーハンドリング（認証失敗、招待制チェック）
   * 関連Issue: 次のPhaseで作成予定
   */
  const handleGoogleLogin = () => {
    console.log('Google Login clicked');
    // 現在はモック実装のため、コンソールログのみ
  };

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

          {/* Googleログインボタン */}
          <div className="space-y-4">
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              size="lg"
              className="w-full h-12 text-base font-medium hover:bg-gray-50 transition-colors"
            >
              <FcGoogle className="mr-3 h-6 w-6" />
              Googleでログイン
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
