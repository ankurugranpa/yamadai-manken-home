import { Header } from '../components/Header'
import { Footer } from '../components/Footer';
import { CarouselRouter } from '../components/CarouselRouter';
import { useLocation, Outlet } from 'react-router-dom';
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
import { BookReader, BookPage } from '../pages/BookReader';



import type { PageInfo, RoutePageInfo } from '../types/navigation';

// CCV_vol35のメニュー用データ（menu.jsonから抽出、表紙から開始）
const CCV_vol35_menu_pages = [
  { "title": "表紙", "author": "じー", "file_name": "000.png" },
  { "title": "目次", "author": "編集担当", "file_name": "003.png" },
  { "title": "高校大学", "author": "AO", "file_name": "004.png" },
  { "title": "ツイ廃漫画", "author": "AO", "file_name": "005.png" },
  { "title": "2コママンガ", "author": "AO", "file_name": "006.png" },
  { "title": "ゲーム", "author": "AO", "file_name": "007.png" },
  { "title": "司令官が宿毛に着任しました", "author": "dd120", "file_name": "009.png" },
  { "title": "水星クソ漫画", "author": "itsuki,", "file_name": "011.png" },
  { "title": "カラーボール/神な客", "author": "のch", "file_name": "013.png" },
  { "title": "夏のふいうち/あるある(?)", "author": "のch", "file_name": "014.png" },
  { "title": "気になる/恥ずかしやつ", "author": "のch", "file_name": "015.png" },
  { "title": "大学生絵日記", "author": "笹かま", "file_name": "017.png" },
  { "title": "カクテルレシピ「ぺこらそー」", "author": "フィスト", "file_name": "020.png" },
  { "title": "らくがき", "author": "のch/り", "file_name": "021.png" },
  { "title": "かわいいかわいいね", "author": "り", "file_name": "022.png" },
  { "title": "髪を結う", "author": "りくと", "file_name": "023.png" },
  { "title": "奥つけ", "author": "編集担当", "file_name": "024.png" },
  { "title": "裏表紙", "author": "dd120", "file_name": "027.png" }
];

// CCV_vol35の全ページデータ（027.png から 000.png まで逆順）
const CCV_vol35_all_pages = [];
for (let i = 27; i >= 0; i--) {
  const fileName = `${i.toString().padStart(3, '0')}.png`;
  const menuPage = CCV_vol35_menu_pages.find(page => page.file_name === fileName);
  CCV_vol35_all_pages.push({
    title: menuPage ? menuPage.title : `ページ ${i}`,
    author: menuPage ? menuPage.author : "不明",
    file_name: fileName
  });
}

const book1Routes: RoutePageInfo[] = [
    { path: '/book/1', title: 'Book 1', element: <Book1 /> },
    { path: '/book/1/page2', title: 'Book 1 Page 2', element: <Book1Page2 /> }
];

const book2Routes: RoutePageInfo[] = [
    { path: '/book/2', title: 'Book 2', element: <Book2 /> },
    { path: '/book/2/page2', title: 'Book 2 Page 2', element: <Book2Page2 /> }
];

export function Root() {
    const location = useLocation();
    const currentPath = location.pathname;
    

    const routePages: RoutePageInfo[] = [
        // { path: '/qa', title: 'Q&A', element: <Qa /> },
        // { path: '/entry', title: '見学・加入', element: <Entry /> },
        // { path: '/activity', title: '活動内容', element: <Activity /> },
        // { path: '/about2', title: '漫研について', element: <About2 /> },
        { path: '/home', title: '表紙', element: <Home /> },
        { path: '/home/about', title: 'About', element: <About /> },
        { path: '/home/bookshelf', title: '本棚', element: <Bookshelf /> }
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
    } else if (currentPath.startsWith('/book/CCV_vol35')) {
        // CCV_vol35のページルートを作成（全ページ表示、メニューはmenu.json）
        // ページ番号を正しくマップする: page/0 = 027.png, page/1 = 026.png, ..., page/27 = 000.png
        // URLのpage番号から正しいファイル名にマップするように修正
        activeRoutes = CCV_vol35_all_pages.map((page, index) => ({
            // URLのページ番号(27-index)を使用して、page/27 = 027.png になるように修正
            path: `/book/CCV_vol35/page/${27 - index}`,
            title: page.title,
            element: <BookPage bookId="CCV_vol35" item={page} />
        })).reverse(); // ルート順序を逆にしてFooterの進む/戻るを正しくする
        
        // Footerの進む・戻るボタンで全ページを1ページずつ遷移するため、全ページをnavigationPagesに含める
        navigationPages = activeRoutes.map(({ path, title }) => ({ path, title }));
    } else if (currentPath.startsWith('/book/') && !currentPath.startsWith('/book/1') && !currentPath.startsWith('/book/2')) {
        // 他の動的本（将来の拡張用）
        const bookId = currentPath.split('/book/')[1];
        activeRoutes = [{ path: currentPath, title: `本: ${bookId}`, element: <div>本が見つかりません</div> }];
        navigationPages = [{ path: currentPath, title: `本: ${bookId}` }];
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