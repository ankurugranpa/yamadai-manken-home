import { Header } from '../componets/Header'
import { Footer } from '../componets/Footer';
import { Outlet } from 'react-router';

import type { PageInfo } from '../types/navigation';

export function Root() {
    const pages: PageInfo[] = [
        { path: '/home', name: 'ホーム' },
        { path: '/about', name: '概要' }
    ];

    return (
        <div className="h-screen flex flex-col">
            {/* Header - Fixed height */}
            <Header />
            
            {/* Main content area - Flexible height */}
            <main className="flex-1 bg-gray-100 overflow-auto">
                <div className="h-full p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
            
            {/* Footer - Fixed at bottom */}
            <Footer pages={pages} />
        </div>
    );
}
