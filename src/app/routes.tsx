import { Home } from '../pages/Home';
import { About } from '../pages/About';
import { Bookshelf } from '../pages/Bookshelf';
import { BookPage } from '../pages/BookReader';
import type { RoutePageInfo } from '../types/navigation';

// Import menu data for each book
// data配下の各bookフォルダからmenu.jsonを自動収集
const menuModules = import.meta.glob('../data/*/menu.json', { eager: true }) as Record<string, { default: PageData[] }>;

// パスからbookIdを抽出し、Recordにまとめる
export const booksMenus: Record<string, PageData[]> = Object.fromEntries(
  Object.entries(menuModules)
    .map(([path, mod]) => {
      const match = path.match(/\.\.\/data\/([^/]+)\/menu\.json$/);
      const bookId = match?.[1];
      return bookId ? [bookId, mod.default] : null;
    })
    .filter((entry): entry is [string, PageData[]] => entry !== null)
);

/**
 * PageData interface representing a single page in a book
 */
interface PageData {
  title: string;
  author: string;
  file_name: string;
}

/**
 * Standard route pages (Home, About, Bookshelf)
 */
export const routePages: RoutePageInfo[] = [
  { path: '/home', title: '表紙', element: <Home /> },
  { path: '/home/about', title: 'About', element: <About /> },
  { path: '/home/bookshelf', title: '本棚', element: <Bookshelf /> }
];

/**
 * Book menus mapping bookId to menu items
 */
// booksMenusは上記globで自動生成済み

/**
 * Calculate the maximum page number from menu data
 * @param menuPages - Array of menu page data
 * @returns The highest page number found
 */
function getMaxPageNumber(menuPages: PageData[]): number {
  return Math.max(
    ...menuPages.map(page => {
      const match = page.file_name.match(/(\d+)\.png$/);
      return match ? parseInt(match[1], 10) : 0;
    })
  );
}

/**
 * Generate all pages data for a book
 * @param menuPages - Array of menu page data
 * @returns Array of all pages with metadata
 */
function generateAllPagesData(menuPages: PageData[]): PageData[] {
  const allPages: PageData[] = [];
  const maxPageNumber = getMaxPageNumber(menuPages);
  
  for (let i = maxPageNumber; i >= 0; i--) {
    const fileName = `${i.toString().padStart(3, '0')}.png`;
    const menuPage = menuPages.find(page => page.file_name === fileName);
    allPages.push({
      title: menuPage ? menuPage.title : `ページ ${i}`,
      author: menuPage ? menuPage.author : "不明",
      file_name: fileName
    });
  }
  
  return allPages;
}

/**
 * Generate all page routes for a book based on menu data
 * @param bookId - The book identifier
 * @param menuPages - Array of menu page data
 * @returns Array of RoutePageInfo for all pages in the book
 */
export function generateBookRoutes(bookId: string, menuPages: PageData[]): RoutePageInfo[] {
  const allPages = generateAllPagesData(menuPages);
  const maxPageNumber = getMaxPageNumber(menuPages);

  // Create routes mapping: page/N = NNN.png (e.g., page/27 = 027.png)
  const routes = allPages.map((page, index) => ({
    path: `/book/${bookId}/page/${maxPageNumber - index}`,
    title: page.title,
    element: <BookPage bookId={bookId} item={page} />
  })).reverse(); // Reverse route order for correct Footer navigation

  return routes;
}

/**
 * Get menu pages with their paths for a specific book
 * @param bookId - The book identifier
 * @param menuPages - Array of menu page data
 * @returns Array of PageInfo with paths for menu items
 */
export function getBookMenuPages(bookId: string, menuPages: PageData[]) {
  const allPages = generateAllPagesData(menuPages);
  const maxPageNumber = getMaxPageNumber(menuPages);
  
  return menuPages.map((page) => {
    const pageIndex = allPages.findIndex(p => p.file_name === page.file_name);
    return {
      path: `/book/${bookId}/page/${maxPageNumber - pageIndex}`,
      title: page.title
    };
  });
}
