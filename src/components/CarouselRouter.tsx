import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from './ui/carousel';

interface Route {
  path: string;
  element: React.ReactNode;
}

interface CarouselRouterProps {
  routes: Route[];
}

export function CarouselRouter({ routes }: CarouselRouterProps) {
  const location = useLocation(); // 現在のURL情報（/home, /aboutなど）
  const navigate = useNavigate(); // URLを変更する関数
  const [api, setApi] = useState<CarouselApi>(); // Carouselの制御API
  const [currentIndex, setCurrentIndex] = useState(0); // 現在表示中のスライドインデックス
  
  // URLからスライドのインデックスを計算する関数
  const getCurrentIndex = () => {
    const currentRoute = routes.findIndex(route => route.path === location.pathname);
    return currentRoute >= 0 ? currentRoute : 0;
  };

  // 【パターン1】URL変更 → Carouselアニメーション
  // ブラウザの戻る/進むボタンやURL直接入力で発生
  useEffect(() => {
    if (!api) return; // Carouselがまだ初期化されていない場合は何もしない
    
    const newIndex = getCurrentIndex(); // 新しいURLに対応するスライド番号を取得
    if (newIndex !== currentIndex) { // 現在のスライドと違う場合のみ実行
      setCurrentIndex(newIndex); // state更新
      api.scrollTo(newIndex); // 🎯 ここで滑らかなアニメーションが発生！
    }
  }, [location.pathname, api, currentIndex]); // location.pathname（URL）が変わったときに実行

  // 【パターン2】Carouselスワイプ → URL更新
  // ユーザーが画面をスワイプしたときに発生
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      const selectedIndex = api.selectedScrollSnap(); // スワイプ後のスライド番号を取得
      if (selectedIndex !== currentIndex) { // 現在と違う場合のみ実行
        setCurrentIndex(selectedIndex); // state更新
        const targetPath = routes[selectedIndex]?.path; // スライド番号からURLを取得
        if (targetPath) {
          navigate(targetPath, { replace: true }); // 🌐 URLを更新（ブラウザのアドレスバーが変わる）
        }
      }
    };

    // スライド変更イベントを監視
    api.on('select', onSelect); // Carouselがスライドするたびに onSelect が呼ばれる
    return () => api.off('select', onSelect); // コンポーネント削除時にイベントを削除
  }, [api, currentIndex, navigate, routes]);

  return (
    <div className="h-screen w-screen overflow-hidden">
      <Carousel
        setApi={setApi}
        className="h-full w-full"
        opts={{
          align: 'start',
          loop: false,
          skipSnaps: false,
          dragFree: false,
        }}
      >
        <CarouselContent className="h-full">
          {routes.map((route, index) => (
            <CarouselItem key={route.path} className="h-full w-full flex-shrink-0">
              <div className="h-full w-full p-4 sm:p-6 lg:p-8">
                {route.element}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}