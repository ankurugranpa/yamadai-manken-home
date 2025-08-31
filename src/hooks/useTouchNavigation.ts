import { useNavigate } from 'react-router';
import type { PageInfo } from '../types/navigation';

export function useTouchNavigation(pages: PageInfo[], currentPath: string) {
  const navigate = useNavigate();

  const currentIndex = pages.findIndex(page => page.path === currentPath);
  
  // 日本の漫画スタイル: 右から左に読む
  // 左タップ = 次のページ（右から左へ進む）
  // 右タップ = 前のページ（左から右へ戻る）
  const nextPage = currentIndex < pages.length - 1 ? pages[currentIndex + 1] : null;
  const prevPage = currentIndex > 0 ? pages[currentIndex - 1] : null;

  const handleTouchNavigation = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.changedTouches[0];
    const screenWidth = window.innerWidth;
    const touchX = touch.clientX;
    
    // 画面の左30%タッチで次のページ、右30%タッチで前のページ
    if (touchX < screenWidth * 0.3) {
      // 左側タップ = 次のページ（日本の漫画スタイル）
      if (nextPage) {
        navigate(nextPage.path);
      }
    } else if (touchX > screenWidth * 0.7) {
      // 右側タップ = 前のページ（日本の漫画スタイル）
      if (prevPage) {
        navigate(prevPage.path);
      }
    }
  };

  return {
    handleTouchNavigation,
    nextPage,
    prevPage,
    currentIndex
  };
}