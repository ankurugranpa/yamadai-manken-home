import { Header } from '../components/Header'
import { Footer } from '../components/Footer';
import { CarouselRouter } from '../components/CarouselRouter';
import { Home } from '../pages/Home';
import { About } from '../pages/About';



import type { PageInfo, RoutePageInfo } from '../types/navigation';

export function Root() {
    const routePages: RoutePageInfo[] = [
        { path: '/about', title: 'About', element: <About /> },
        { path: '/', title: 'ホーム', element: <Home /> }
    ];

    const routes = routePages.map(({ path, element }) => ({ path, element }));
    const pages = routePages.map(({ path, title }) => ({ path, title }));

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
            <Footer pages={pages} />
        </div>
    );
}