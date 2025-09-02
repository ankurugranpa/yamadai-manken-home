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
import { Button } from "@/components/ui/button";
import { Link, useLocation } from 'react-router';
import type { PageInfo } from '../types/navigation';

import MenuIcon from '../assets/ui/menu_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg';

interface MenuDrawerProps {
  pages?: PageInfo[];
}

export function MenuDrawer({ pages = [] }: MenuDrawerProps) {
  const location = useLocation();
  const currentPage = pages.find(page => page.path === location.pathname);
  
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost">

          <img src={MenuIcon} alt="メニュー" className="h-6 w-6 mb-1" />
          <div className="text-xs text-gray-300">メニュー</div>
            {/* <div className="text-xs text-gray-300">メニュー</div> */} 
        </Button>
      </DrawerTrigger>

        <DrawerContent className="bg-white">
            <DrawerHeader>
              <DrawerTitle>メニュー</DrawerTitle>
              <DrawerDescription>
                {currentPage ? `現在のページ: ${currentPage.title}` : 'ページを選択してください'}
              </DrawerDescription>
            </DrawerHeader>
            
            <div className="px-4 pb-4">
              {pages.map((page, index) => (
                <DrawerClose key={page.path} asChild>
                  <Link
                    to={page.path}
                    className={`flex items-center justify-between p-3 mb-2 rounded-lg transition-colors ${
                      page.path === location.pathname 
                        ? 'bg-blue-100 border-2 border-blue-300' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <span className={`font-medium ${
                      page.path === location.pathname ? 'text-blue-700' : 'text-gray-900'
                    }`}>{page.title}</span>
                    <div className="flex items-center gap-2">
                      {page.path === location.pathname && (
                        <span className="text-xs text-blue-600 bg-blue-200 px-2 py-1 rounded">現在</span>
                      )}
                      <span className="text-sm text-gray-500">#{index + 1}</span>
                    </div>
                  </Link>
                </DrawerClose>
              ))}
            </div>
            
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">閉じる</Button>
              </DrawerClose>
            </DrawerFooter>
        </DrawerContent>

    </Drawer>
  );
}