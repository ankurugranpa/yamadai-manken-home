import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import type { PageInfo } from '../types/navigation';

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

export function useTouchNavigation(pages: PageInfo[], currentPath: string) {
  const navigate = useNavigate();
  const touchStartRef = useRef<TouchPoint | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const currentIndex = pages.findIndex(page => page.path === currentPath);
  
  // 日本の漫画スタイル: 右から左に読む
  // 左タップ/右スワイプ = 次のページ（右から左へ進む）
  // 右タップ/左スワイプ = 前のページ（左から右へ戻る）
  const nextPage = currentIndex < pages.length - 1 ? pages[currentIndex + 1] : null;
  const prevPage = currentIndex > 0 ? pages[currentIndex - 1] : null;

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const touchStart = touchStartRef.current;
    if (!touchStart) return;

    const touch = event.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    
    // 水平方向のドラッグかどうか判定
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      event.preventDefault(); // スクロールを防ぐ
      
      const screenWidth = window.innerWidth;
      const maxDragDistance = screenWidth * 0.8; // 最大ドラッグ距離
      
      // ドラッグ制限を適用
      let limitedDeltaX = deltaX;
      
      if (deltaX > 0) {
        // 右スワイプ（次のページ）
        if (!nextPage) {
          limitedDeltaX = Math.min(deltaX, screenWidth * 0.1); // 次ページがない場合は軽い抵抗
        } else {
          limitedDeltaX = Math.min(deltaX, maxDragDistance);
        }
      } else {
        // 左スワイプ（前のページ）
        if (!prevPage) {
          limitedDeltaX = Math.max(deltaX, -screenWidth * 0.1); // 前ページがない場合は軽い抵抗
        } else {
          limitedDeltaX = Math.max(deltaX, -maxDragDistance);
        }
      }
      
      setDragOffset(limitedDeltaX);
      setIsDragging(true);
    }
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const touchEnd = event.changedTouches[0];
    const touchStart = touchStartRef.current;
    
    if (!touchStart) return;

    const deltaX = touchEnd.clientX - touchStart.x;
    const deltaY = touchEnd.clientY - touchStart.y;
    const deltaTime = Date.now() - touchStart.time;
    const screenWidth = window.innerWidth;
    
    // ドラッグ状態をリセット
    setIsDragging(false);
    setDragOffset(0);
    
    // スワイプ判定の条件
    const minSwipeDistance = 50; // 最小スワイプ距離
    const maxSwipeTime = 300; // 最大スワイプ時間（ms）
    const maxVerticalDistance = 100; // 垂直方向の最大許容距離
    const dragThreshold = screenWidth * 0.3; // ドラッグでページ遷移するしきい値
    
    const isHorizontalSwipe = Math.abs(deltaX) > minSwipeDistance && 
                             Math.abs(deltaY) < maxVerticalDistance && 
                             deltaTime < maxSwipeTime;

    const isDragRelease = Math.abs(deltaX) > dragThreshold;

    if (isHorizontalSwipe || isDragRelease) {
      // スワイプまたは十分なドラッグでの処理（日本の漫画スタイル）
      if (deltaX > 0) {
        // 右スワイプ = 次のページ
        if (nextPage) {
          navigate(nextPage.path);
          return;
        }
      } else {
        // 左スワイプ = 前のページ
        if (prevPage) {
          navigate(prevPage.path);
          return;
        }
      }
    } else if (!isDragging || Math.abs(deltaX) < 20) {
      // スワイプでない場合はタップ判定
      const touchX = touchEnd.clientX;
      
      // 画面の左30%タッチで次のページ、右30%タッチで前のページ
      if (touchX < screenWidth * 0.3) {
        // 左側タップ = 次のページ
        if (nextPage) {
          navigate(nextPage.path);
        }
      } else if (touchX > screenWidth * 0.7) {
        // 右側タップ = 前のページ
        if (prevPage) {
          navigate(prevPage.path);
        }
      }
    }
    
    // タッチ開始点をクリア
    touchStartRef.current = null;
  };

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    nextPage,
    prevPage,
    currentIndex,
    dragOffset,
    isDragging
  };
}