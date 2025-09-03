import { Header } from '../components/Header'
import { Footer } from '../components/Footer';
import { CarouselRouter } from '../components/CarouselRouter';
import { Home } from '../pages/Home';
import { About } from '../pages/About';



import type { PageInfo } from '../types/navigation';

export function Root() {
    const routes = [
        { path: '/about', element: <About /> },
        { path: '/home', element: <Home /> }
    ];

    const pages: PageInfo[] = [
        { path: '/home', name: 'ホーム' },
        { path: '/about', name: '概要' }
    ];

    return (
        <div 
            className="flex flex-col" 
            style={{ 
                height: '100dvh',
                touchAction: 'pan-x pinch-zoom',
                overscrollBehavior: 'none'
            }}
        >
            {/* Header - Fixed height */}
            <Header />
            
            {/* Carousel-based page navigation */}
            <main className="flex-1 overflow-hidden">
                <CarouselRouter routes={routes} />
            </main>
            
            {/* Footer - Fixed at bottom */}
            <Footer pages={pages} />
        </div>
    );
}