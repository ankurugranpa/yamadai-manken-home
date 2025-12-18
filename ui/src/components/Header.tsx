import { Link } from 'react-router';
import HeaderImg from "../assets/edo-heater-noword.png";
import { useAuthStore } from '../stores/authStore';

export function Header() {
  const { user, isAuthenticated, signOut } = useAuthStore();

  /**
   * ログアウトボタンのクリックハンドラー
   */
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('ログアウトに失敗しました:', error);
    }
  };

  return (
    <header className="relative shadow-md overflow-hidden w-full h-12">
      {/* Background Image */}
      {/* src="/src/assets/edo.jpeg"  */}
      <img 
        src={HeaderImg}
        alt="Header background"
        className="w-full h-auto block"
        style={{ height: '100%', width: '100%', objectFit: 'cover' }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-neutral-700/80"></div>
      
      {/* Content */}
      <div className="absolute inset-0 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="flex justify-between items-center w-full">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold text-neutral-50">
              MATSU NI TSURU
            </Link>
          </div>

          {/* Login/User Info */}
          <div className="flex-shrink-0 flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                {/* ユーザー名表示 */}
                <span className="text-sm text-neutral-200">
                  {user.email}
                </span>
                {/* ログアウトボタン */}
                <button
                  onClick={handleSignOut}
                  className="text-sm font-normal text-neutral-200 hover:text-neutral-50 border border-neutral-200/50 hover:border-neutral-50 px-3 py-1 rounded transition-colors"
                >
                  ログアウト
                </button>
              </>
            ) : (
              /* ログインボタン */
              <Link to="/login" className="text-sm font-normal text-neutral-200 hover:text-neutral-50 border border-neutral-200/50 hover:border-neutral-50 px-3 py-1 rounded transition-colors">
                ログイン
              </Link>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
