import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Link, useLocation } from 'react-router';
import type { PageInfo } from '../types/navigation';

interface MenuDrawerProps {
  pages?: PageInfo[];
  triggerButton: React.ReactNode;
}

export function MenuDrawer({ pages = [], triggerButton }: MenuDrawerProps) {
  const location = useLocation();
  const currentPage = pages.find(page => page.path === location.pathname);
  
  return (
    <Drawer>
      <DrawerTrigger asChild>
        {triggerButton}
      </DrawerTrigger>

      <DrawerContent className="bg-white">
        <DrawerHeader>
          <DrawerTitle>メニュー</DrawerTitle>
          <DrawerDescription>
            {currentPage ? `現在のページ: ${currentPage.title}` : 'ページを選択してください'}
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="px-4 pb-4">
          {pages.slice().reverse().map((page, index) => (
            <DrawerClose key={page.path} asChild>
              <Link
                to={page.path}
                className={`flex items-center justify-between p-3 mb-2 rounded-lg transition-colors ${
                  page.path === location.pathname 
                    ? 'bg-blue-100 border-2 border-blue-300' 
                    : 'bg-neutral-100 hover:bg-neutral-200'
                }`}
              >
                <span className="font-medium text-gray-900">{page.title}</span>
                <div className="flex items-center gap-2">
                  {page.path === location.pathname && (
                    <span className="text-xs text-blue-600 bg-blue-200 px-2 py-1 rounded">Now</span>
                  )}
                  {/* <span className="text-sm text-gray-500">#{index + 1}</span> */}
                </div>
              </Link>
            </DrawerClose>
          ))}
        </div>
        
        <DrawerFooter>
          <DrawerClose asChild>
            <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              閉じる
            </button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}