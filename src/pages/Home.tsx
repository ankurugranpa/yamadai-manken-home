import { useTouchNavigation } from '../hooks/useTouchNavigation';

const pages = [
  { path: '/home', name: 'ホーム' },
  { path: '/about', name: '概要' }
];

export function Home() {
  const { handleTouchStart, handleTouchEnd } = useTouchNavigation(pages, '/home');

  return (
    <div 
      className="h-full flex items-center justify-center touch-manipulation"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">ホーム</h1>
        <p className="mt-4 text-gray-600">左タップ・右スワイプで次へ<br />右タップ・左スワイプで前へ</p>
      </div>
    </div>
  );
}