import { Header } from '../components/Header'
import { Footer } from '../components/Footer';
import { Outlet, useLocation } from 'react-router';
import { useTouchNavigation } from '../hooks/useTouchNavigation';

import type { PageInfo } from '../types/navigation';

export function Root() {
    const pages: PageInfo[] = [
        { path: '/home', name: 'ホーム' },
        { path: '/about', name: '概要' }
    ];

    const location = useLocation();
    const { 
        handleTouchStart, 
        handleTouchMove, 
        handleTouchEnd, 
        dragOffset, 
        isDragging,
        nextPage,
        prevPage 
    } = useTouchNavigation(pages, location.pathname);

    return (
        <div 
            className="flex flex-col" 
            style={{ 
                height: '100dvh',
                touchAction: 'none',
                overscrollBehavior: 'none',
                position: 'fixed',
                width: '100%',
                top: 0,
                left: 0
            }}
        >
            {/* Header - Fixed height */}
            <Header />
            
            {/* Main content area with touch navigation */}
            <main 
                className="relative flex-1 bg-gray-100 overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                    touchAction: 'none',
                    overscrollBehavior: 'none',
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                {/* Current Page */}
                <div 
                    className="absolute inset-0 p-4 sm:p-6 lg:p-8"
                    style={{
                        transform: `translateX(${dragOffset}px)`,
                        transition: isDragging ? 'none' : 'transform 200ms ease-out'
                    }}
                >
                    <div className="h-full">
                        <Outlet />
                    </div>
                </div>

                {/* Next Page Preview (右側から左へ) */}
                {nextPage && dragOffset > 0 && (
                    <div 
                        className="absolute inset-0 bg-gray-100 p-4 sm:p-6 lg:p-8"
                        style={{
                            transform: `translateX(${dragOffset - window.innerWidth}px)`,
                            transition: isDragging ? 'none' : 'transform 200ms ease-out'
                        }}
                    >
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                                <h1 className="text-3xl font-bold text-gray-900">{nextPage.name}</h1>
                                <p className="mt-4 text-gray-600">次のページ</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Previous Page Preview (左側から右へ) */}
                {prevPage && dragOffset < 0 && (
                    <div 
                        className="absolute inset-0 bg-gray-100 p-4 sm:p-6 lg:p-8"
                        style={{
                            transform: `translateX(${dragOffset + window.innerWidth}px)`,
                            transition: isDragging ? 'none' : 'transform 200ms ease-out'
                        }}
                    >
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                                <h1 className="text-3xl font-bold text-gray-900">{prevPage.name}</h1>
                                <p className="mt-4 text-gray-600">前のページ</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            
            {/* Footer - Fixed at bottom */}
            <Footer pages={pages} />
        </div>
    );
}
