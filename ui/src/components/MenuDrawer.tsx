import React, { useState } from 'react';
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
  const [currentMenuPage, setCurrentMenuPage] = useState(0);
  const currentPage = pages.find(page => page.path === location.pathname);
  
  
  
  // 1ページあたりのメニュー項目数
  const itemsPerPage = 5;
  const totalPages = Math.ceil(pages.length / itemsPerPage);
  
  // 現在のページのメニュー項目を取得
  const startIndex = currentMenuPage * itemsPerPage;
  const currentPageItems = pages.slice(startIndex, startIndex + itemsPerPage);
  
  // 動的な高さを計算
  // 各項目の高さ（padding + content） ≈ 60px、ページネーション ≈ 60px
  // 混在する場合は常に最大のitemsPerPageに合わせる
  const actualItemsOnPage = currentPageItems.length;
  const shouldUseMaxHeight = totalPages > 1; // 複数ページがある場合は最大高さを使用
  
  const menuItemHeight = shouldUseMaxHeight 
    ? itemsPerPage * 60 // 複数ページある場合は最大項目数で固定
    : actualItemsOnPage * 60; // 単一ページの場合は実際の項目数
    
  const paginationHeight = totalPages > 1 ? 60 : 0; // ページネーションの高さ
  const dynamicHeight = menuItemHeight + paginationHeight;
  
  const goToPrevPage = () => {
    setCurrentMenuPage(prev => Math.max(0, prev - 1));
  };
  
  const goToNextPage = () => {
    setCurrentMenuPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  // "/"パスの場合は"home"として表示
  const getCurrentPageTitle = () => {
    if (location.pathname === '/') {
      return 'home';
    }
    return currentPage ? currentPage.title : null;
  };
  
  return (
    <Drawer>
      <DrawerTrigger asChild>
        {triggerButton}
      </DrawerTrigger>

      <DrawerContent className="bg-white">
        <DrawerHeader>
          <DrawerTitle>メニュー</DrawerTitle>
          <DrawerDescription>
            {getCurrentPageTitle() ? `現在のページ: ${getCurrentPageTitle()}` : 'ページを選択してください'}
          </DrawerDescription>
        </DrawerHeader>
        
        {/* ページネーション情報 */}
        {totalPages > 1 && (
          <div className="px-4 text-center text-sm text-gray-600">
            {currentMenuPage + 1} / {totalPages} ページ
          </div>
        )}
        
        {/* メニュー項目 */}
        <div 
          className="px-4 pb-4 flex flex-col"
          style={{ height: `${dynamicHeight}px` }}
        >
          <div className="flex-1 space-y-2">
            {pages.length === 0 ? (
              <div className="p-3 text-center text-gray-500">
                メニュー項目がありません
              </div>
            ) : (
              currentPageItems.map((page) => {
                // "/" パスの場合は "/home" として扱う
                const normalizedCurrentPath = location.pathname === '/' ? '/home' : location.pathname;
                const isCurrentPage = page.path === normalizedCurrentPath;
                return (
                  <DrawerClose key={page.path} asChild>
                    <Link
                      to={page.path}
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                        isCurrentPage
                          ? 'bg-blue-100 border-2 border-blue-300' 
                          : 'bg-neutral-100 hover:bg-neutral-200'
                      }`}
                    >
                      <span className="font-medium text-gray-900">{page.title}</span>
                      <div className="flex items-center gap-2">
                        {isCurrentPage && (
                          <span className="text-xs text-blue-600 bg-blue-200 px-2 py-1 rounded">Now</span>
                        )}
                      </div>
                    </Link>
                  </DrawerClose>
                );
              })
            )}
          </div>
          
          {/* ページネーションボタン */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                onClick={goToPrevPage}
                disabled={currentMenuPage === 0}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentMenuPage === 0
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                ←
              </button>
              
              <div className="flex space-x-2">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentMenuPage(index)}
                    className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                      index === currentMenuPage
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <button
                onClick={goToNextPage}
                disabled={currentMenuPage === totalPages - 1}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentMenuPage === totalPages - 1
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                →
              </button>
            </div>
          )}
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