import React, { useState } from 'react';
import { Link, useLocation } from 'react-router';
import type { PageInfo } from '../types/navigation';
import { Menu } from './Menu';
import ArrowBackIcon from '../assets/ui/arrow_back_ios_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg';
import ArrowForwardIcon from '../assets/ui/arrow_forward_ios_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg';
import MenuIcon from '../assets/ui/menu_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg';
import { MenuDrawer } from './MenuDrawer'

interface FooterProps {
  pages: PageInfo[];
}

export function Footer({ pages }: FooterProps) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const currentIndex = pages.findIndex(page => page.path === location.pathname);
  const prevPage = currentIndex > 0 ? pages[currentIndex - 1] : null;
  const nextPage = currentIndex < pages.length - 1 ? pages[currentIndex + 1] : null;

  return (
    <>
      <Menu pages={pages} isOpen={isMenuOpen} onClose={toggleMenu} />

      <footer className="text-white flex-shrink-0 border-t border-gray-700 z-50">
        <div className="flex items-center justify-between h-16 px-0 w-full">
        {/* 進むボタン */}
        <div className="flex-1 flex justify-center border-r border-gray-700">
          {nextPage ? (
            <Link
              to={nextPage.path}
              className="flex flex-col items-center justify-center w-full h-full py-2 transition-all duration-200 hover:bg-gray-800 active:scale-95"
            >
              <img src={ArrowBackIcon} alt="進む" className="h-6 w-6 mb-1" />
              <div className="text-xs text-gray-300">進む</div>
            </Link>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full py-2 opacity-30">
              <img src={ArrowBackIcon} alt="進む" className="h-6 w-6 mb-1 opacity-50" />
              <div className="text-xs text-gray-600">進む</div>
            </div>
          )}
        </div>

        {/* メニューボタン */}
        <div className="flex-1 flex justify-center border-r border-gray-700">
          <MenuDrawer pages={pages} />
        </div>

        {/* 戻るボタン */}
        <div className="flex-1 flex justify-center">
          {prevPage ? (
            <Link
              to={prevPage.path}
              className="flex flex-col items-center justify-center w-full h-full py-2 transition-all duration-200 hover:bg-gray-800 active:scale-95"
            >
              <img src={ArrowForwardIcon} alt="戻る" className="h-6 w-6 mb-1" />
              <div className="text-xs text-gray-300">戻る</div>
            </Link>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full py-2 opacity-30">
              <img src={ArrowForwardIcon} alt="戻る" className="h-6 w-6 mb-1 opacity-50" />
              <div className="text-xs text-gray-600">戻る</div>
            </div>
          )}
        </div>
        </div>
      </footer>
    </>
  );
}
