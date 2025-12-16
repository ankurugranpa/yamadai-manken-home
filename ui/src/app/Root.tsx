import { Header } from '../components/Header'
import { Footer } from '../components/Footer';
import { CarouselRouter } from '../components/CarouselRouter';
import { useLocation} from 'react-router-dom';
import type { PageInfo, RoutePageInfo } from '../types/navigation';
import { routePages, standalonePages, booksMenus, generateBookRoutes, getBookMenuPages } from './routes';
import { parseBookPath } from '../lib/utils';
import type { ReactNode } from 'react';

/**
 * ページタイプの型定義
 */
type PageType = 'carousel' | 'standalone';

/**
 * ページレンダリング戦略の定義
 */
interface RenderStrategy {
  renderMain: (element: ReactNode) => ReactNode;
}

const renderStrategies: Record<PageType, RenderStrategy> = {
  carousel: {
    renderMain: (element) => element
  },
  standalone: {
    renderMain: (element) => (
      <div className="h-full w-full">
        {element}
      </div>
    )
  }
};

/**
 * 現在のパスに基づいてルートとページ情報を取得するヘルパー関数
 */
function getRoutesForCurrentPath(currentPath: string, bookId: string | null): {
    routes: RoutePageInfo[];
    pages: PageInfo[];
} {
    if (!bookId) {
        return {
            routes: routePages,
            pages: routePages.map(({ path, title }) => ({ path, title }))
        };
    }
    
    const menuData = booksMenus[bookId];
    if (!menuData) {
        return {
            routes: [{ path: currentPath, title: `本: ${bookId}`, element: <div>本が見つかりません</div> }],
            pages: [{ path: currentPath, title: `本: ${bookId}` }]
        };
    }
    
    const bookRoutes = generateBookRoutes(bookId, menuData);
    return {
        routes: bookRoutes,
        pages: bookRoutes.map(({ path, title }) => ({ path, title }))
    };
}

export function Root() {
    const location = useLocation();
    const currentPath = location.pathname;

    // Check if current page is a standalone page (not in carousel loop)
    const standalonePage = standalonePages.find(page => page.path === currentPath);
    const isStandalonePage = !!standalonePage;

    // Determine which routes and pages to show based on current path
    const { bookId } = parseBookPath(currentPath);

    const { routes: activeRoutes, pages: navigationPages } = getRoutesForCurrentPath(currentPath, bookId);
    const routes = activeRoutes.map(({ path, element }) => ({ path, element }));

    // メニュー用のページリストを決定
    let menuPages = navigationPages;
    if (bookId) {
        const menuData = booksMenus[bookId];
        if (menuData) {
            menuPages = getBookMenuPages(bookId, menuData);
        }
    }

    // ページタイプの判定とレンダリング戦略の選択
    const pageType: PageType = isStandalonePage ? 'standalone' : 'carousel';
    const strategy = renderStrategies[pageType];
    
    // レンダリング対象の決定
    const mainContent = isStandalonePage 
        ? standalonePage?.element 
        : <CarouselRouter routes={routes} />;

    return (
        <div 
            className="flex flex-col" 
            style={{ 
                height: '100dvh',
                touchAction: 'pan-x, pinch-zoom',
                overscrollBehavior: 'none'
            }}
        >
            <Header />
            <main className="flex-1 overflow-hidden"
                style={{ touchAction: 'pan-x pinch-zoom' }}
            >
                {strategy.renderMain(mainContent)}
            </main>
            <Footer 
                pages={navigationPages} 
                menuPages={menuPages}
            />
        </div>
    );
}
