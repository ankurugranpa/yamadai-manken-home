import { Header } from '../components/Header'
import { Footer } from '../components/Footer';
import { CarouselRouter } from '../components/CarouselRouter';
import { useLocation } from 'react-router-dom';
import { Home } from '../pages/Home';
import { About } from '../pages/About';
import { About2 } from '../pages/About2';
import { Activity } from '../pages/Activity';
import { Entry } from '../pages/Entry';
import { Qa } from '../pages/Qa';
import { Bookshelf } from '../pages/Bookshelf';
import { Book1 } from '../pages/Book1';
import { Book1Page2 } from '../pages/Book1Page2';
import { Book2 } from '../pages/Book2';
import { Book2Page2 } from '../pages/Book2Page2';



import type { PageInfo, RoutePageInfo } from '../types/navigation';

export function Root() {
    const location = useLocation();
    const currentPath = location.pathname;

    const routePages: RoutePageInfo[] = [
        // { path: '/qa', title: 'Q&A', element: <Qa /> },
        // { path: '/entry', title: '見学・加入', element: <Entry /> },
        // { path: '/activity', title: '活動内容', element: <Activity /> },
        // { path: '/about2', title: '漫研について', element: <About2 /> },
        { path: '/home/bookshelf', title: '本棚', element: <Bookshelf /> },
        { path: '/home/about', title: 'About', element: <About /> },
        { path: '/home', title: '表紙', element: <Home /> }
    ];

    // Book 1 routes - independent navigation
    const book1Routes: RoutePageInfo[] = [
        { path: '/book/1', title: 'サンプル本1-1', element: <Book1 /> },
        { path: '/book/1/page2', title: 'サンプル本1-2', element: <Book1Page2 /> }
    ];

    // Book 2 routes - independent navigation  
    const book2Routes: RoutePageInfo[] = [
        { path: '/book/2', title: 'サンプル本2-1', element: <Book2 /> },
        { path: '/book/2/page2', title: 'サンプル本2-2', element: <Book2Page2 /> }
    ];

    // Determine which routes and pages to show based on current path
    let activeRoutes: RoutePageInfo[];
    let navigationPages: PageInfo[];
    
    if (currentPath.startsWith('/book/1')) {
        activeRoutes = book1Routes;
        navigationPages = book1Routes.map(({ path, title }) => ({ path, title }));
    } else if (currentPath.startsWith('/book/2')) {
        activeRoutes = book2Routes;
        navigationPages = book2Routes.map(({ path, title }) => ({ path, title }));
    } else {
        activeRoutes = routePages;
        navigationPages = routePages.map(({ path, title }) => ({ path, title }));
    }

    const routes = activeRoutes.map(({ path, element }) => ({ path, element }));

    return (
        <div 
            className="flex flex-col" 
            style={{ 
                height: '100dvh',
                touchAction: 'pan-x, pinch-zoom',
                overscrollBehavior: 'none'
            }}
        >
            <Header pages={navigationPages} />
            <main className="flex-1 overflow-hidden"
                style={{ touchAction: 'pan-x pinch-zoom' }}
            >
                <CarouselRouter routes={routes} />
            </main>
            <Footer pages={navigationPages} />
        </div>
    );
}