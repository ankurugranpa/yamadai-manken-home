import React, { useState } from 'react';
import { Link, useLocation } from 'react-router';
import type { PageInfo } from '../types/navigation';
import { Menu } from './Menu';
import ArrowBackIcon from '../assets/ui/arrow_back_ios_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg';
import ArrowForwardIcon from '../assets/ui/arrow_forward_ios_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg';
import MenuIcon from '../assets/ui/menu_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg';
import { MenuDrawer } from './MenuDrawer'
import '../styles/footer-buttons.css';

interface FooterProps {
  pages: PageInfo[];
}

// Footer ボタンの共通スタイル定数
const FOOTER_BUTTON_STYLES = {
  container: "h-12", // Footer全体の高さ
  button: "footer-button flex flex-col items-center justify-center w-full h-12 py-1 text-white bg-transparent hover:bg-gray-800 active:scale-95 transition-all duration-200 border-0 outline-none focus:outline-none", // アクティブボタンの共通スタイル
  buttonDisabled: "footer-button flex flex-col items-center justify-center w-full h-12 py-1 bg-transparent opacity-30 cursor-not-allowed border-0 outline-none focus:outline-none", // 無効ボタンの共通スタイル
  icon: "h-6 w-6 mb-1 brightness-0 invert opacity-95", // neutral-50相当のアイコン（有効時）
  iconDisabled: "h-6 w-6 mb-1 brightness-0 invert opacity-60", // neutral-200相当のアイコン（無効時）
  iconInverted: "h-6 w-6 mb-1 brightness-0 invert", // 白色反転アイコン（メニュー用）
  text: "text-xs text-neutral-50", // 有効時のテキスト（neutral-50）
  textDisabled: "text-xs text-neutral-200" // 無効時のテキスト（neutral-200）
};

export function Footer({ pages }: FooterProps) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const currentIndex = pages.findIndex(page => page.path === location.pathname);
  const nextPage = currentIndex > 0 ? pages[currentIndex - 1] : null;
  const prevPage = currentIndex < pages.length - 1 ? pages[currentIndex + 1] : null;

  return (
    <>
      <Menu pages={pages} isOpen={isMenuOpen} onClose={toggleMenu} />

      <footer className="text-white flex-shrink-0 bg-neutral-700 z-50">
        <div className={`flex items-center justify-between ${FOOTER_BUTTON_STYLES.container} px-0 w-full`}>
        {/* 進むボタン */}
        <div className="flex-1 flex justify-center">
          {nextPage ? (
            <Link to={nextPage.path} className={FOOTER_BUTTON_STYLES.button}>
              <img src={ArrowBackIcon} alt="進む" className={FOOTER_BUTTON_STYLES.icon} />
              <div className={FOOTER_BUTTON_STYLES.text}>進む</div>
            </Link>
          ) : (
            <button disabled className={FOOTER_BUTTON_STYLES.buttonDisabled}>
              <img src={ArrowBackIcon} alt="進む" className={FOOTER_BUTTON_STYLES.iconDisabled} />
              <div className={FOOTER_BUTTON_STYLES.textDisabled}>進む</div>
            </button>
          )}
        </div>

        {/* メニューボタン */}
        <div className="flex-1 flex justify-center">
          <MenuDrawer 
            pages={pages} 
            triggerButton={
              <button className={FOOTER_BUTTON_STYLES.button}>
                <img src={MenuIcon} alt="メニュー" className={FOOTER_BUTTON_STYLES.iconInverted} />
                <div className={FOOTER_BUTTON_STYLES.text}>メニュー</div>
              </button>
            }
          />
        </div>

        {/* 戻るボタン */}
        <div className="flex-1 flex justify-center">
          {prevPage ? (
            <Link to={prevPage.path} className={FOOTER_BUTTON_STYLES.button}>
              <img src={ArrowForwardIcon} alt="戻る" className={FOOTER_BUTTON_STYLES.icon} />
              <div className={FOOTER_BUTTON_STYLES.text}>戻る</div>
            </Link>
          ) : (
            <button disabled className={FOOTER_BUTTON_STYLES.buttonDisabled}>
              <img src={ArrowForwardIcon} alt="戻る" className={FOOTER_BUTTON_STYLES.iconDisabled} />
              <div className={FOOTER_BUTTON_STYLES.textDisabled}>戻る</div>
            </button>
          )}
        </div>
        </div>
      </footer>
    </>
  );
}
