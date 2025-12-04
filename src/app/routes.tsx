import { Home } from '../pages/Home';
import { About } from '../pages/About';
import { Bookshelf } from '../pages/Bookshelf';
import { BookPage } from '../pages/BookReader';
import type { RoutePageInfo } from '../types/navigation';

// Import menu data for each book
import CCV_vol35_menu from '../data/CCV_vol35/menu.json';

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
export const booksMenus: Record<string, PageData[]> = {
  CCV_vol35: CCV_vol35_menu as PageData[]
};

/**
 * Generate all pages data for a book
 * @param menuPages - Array of menu page data
 * @returns Array of all pages with metadata
 */
function generateAllPagesData(menuPages: PageData[]): PageData[] {
  const allPages: PageData[] = [];
  const maxPageNumber = 27; // CCV_vol35 has pages from 000.png to 027.png
  
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
  const maxPageNumber = 27;

  // Create routes mapping: page/27 = 027.png, page/26 = 026.png, ..., page/0 = 000.png
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
  const maxPageNumber = 27;
  
  return menuPages.map((page) => {
    const pageIndex = allPages.findIndex(p => p.file_name === page.file_name);
    return {
      path: `/book/${bookId}/page/${maxPageNumber - pageIndex}`,
      title: page.title
    };
  });
}
