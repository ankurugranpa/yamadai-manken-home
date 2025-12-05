import { Header } from '../components/Header'
import { Footer } from '../components/Footer';
import { CarouselRouter } from '../components/CarouselRouter';
import { useLocation} from 'react-router-dom';
import type { PageInfo, RoutePageInfo } from '../types/navigation';
import { routePages, booksMenus, generateBookRoutes, getBookMenuPages } from './routes';


export function Root() {
    const location = useLocation();
    const currentPath = location.pathname;

    // Determine which routes and pages to show based on current path
    let activeRoutes: RoutePageInfo[];
    let navigationPages: PageInfo[];
    
    if (currentPath.startsWith('/book/CCV_vol35')) {
        // Generate CCV_vol35 routes using centralized menu data
        const menuData = booksMenus['CCV_vol35'];
        activeRoutes = generateBookRoutes('CCV_vol35', menuData);
        
        // Footerには全ページを渡す（連続したページ遷移のため）
        navigationPages = activeRoutes.map(({ path, title }) => ({ path, title }));
    } else if (currentPath.startsWith('/book/') && !currentPath.startsWith('/book/1') && !currentPath.startsWith('/book/2')) {
        // 他の動的本（将来の拡張用）
        const bookId = currentPath.split('/book/')[1].split('/')[0];
        const menuData = booksMenus[bookId];
        
        if (menuData) {
            activeRoutes = generateBookRoutes(bookId, menuData);
            navigationPages = activeRoutes.map(({ path, title }) => ({ path, title }));
        } else {
            activeRoutes = [{ path: currentPath, title: `本: ${bookId}`, element: <div>本が見つかりません</div> }];
            navigationPages = [{ path: currentPath, title: `本: ${bookId}` }];
        }
    } else {
        activeRoutes = routePages;
        navigationPages = routePages.map(({ path, title }) => ({ path, title }));
    }

    const routes = activeRoutes.map(({ path, element }) => ({ path, element }));

    // メニュー用のページリストを決定
    let menuPages = navigationPages;
    if (currentPath.startsWith('/book/')) {
        const bookId = currentPath.split('/book/')[1].split('/')[0];
        const menuData = booksMenus[bookId];
        
        if (menuData) {
            menuPages = getBookMenuPages(bookId, menuData);
        }
    }

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
                <CarouselRouter routes={routes} />
            </main>
            <Footer pages={navigationPages} menuPages={menuPages} />
        </div>
    );
}