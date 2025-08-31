import { useTouchNavigation } from '../hooks/useTouchNavigation';

const pages = [
  { path: '/home', name: 'ホーム' },
  { path: '/about', name: '概要' }
];

export function About() {
  const { 
    handleTouchStart, 
    handleTouchMove, 
    handleTouchEnd, 
    dragOffset, 
    isDragging,
    nextPage,
    prevPage 
  } = useTouchNavigation(pages, '/about');

  return (
    <div 
      className="relative h-full overflow-hidden touch-manipulation"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Current Page */}
      <div 
        className="absolute inset-0 flex items-center justify-center transition-transform duration-200 ease-out"
        style={{
          transform: `translateX(${dragOffset}px)`,
          transition: isDragging ? 'none' : 'transform 200ms ease-out'
        }}
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">概要</h1>
          <p className="mt-4 text-gray-600">左タップ・右スワイプで次へ<br />右タップ・左スワイプで前へ</p>
        </div>
      </div>

      {/* Next Page Preview (右側から左へ) */}
      {nextPage && dragOffset > 0 && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-blue-50"
          style={{
            transform: `translateX(${dragOffset - window.innerWidth}px)`,
            transition: isDragging ? 'none' : 'transform 200ms ease-out'
          }}
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold text-blue-900">{nextPage.name}</h1>
            <p className="mt-4 text-blue-600">次のページ</p>
          </div>
        </div>
      )}

      {/* Previous Page Preview (左側から右へ) */}
      {prevPage && dragOffset < 0 && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-green-50"
          style={{
            transform: `translateX(${dragOffset + window.innerWidth}px)`,
            transition: isDragging ? 'none' : 'transform 200ms ease-out'
          }}
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold text-green-900">{prevPage.name}</h1>
            <p className="mt-4 text-green-600">前のページ</p>
          </div>
        </div>
      )}
    </div>
  );
}