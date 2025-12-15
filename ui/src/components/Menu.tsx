import { Link } from 'react-router';
import type { PageInfo } from '../types/navigation';

interface MenuProps {
  pages: PageInfo[];
  isOpen: boolean;
  onClose: () => void;
}

export function Menu({ pages, isOpen, onClose }: MenuProps) {
  return (
    <>
      {/* ����� */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* ��ɢ������ */}
      <div 
        className="fixed left-0 right-0 z-50 transition-all duration-300 ease-in-out bg-white border-t border-gray-200 shadow-lg"
        style={{
          bottom: isOpen ? '4rem' : 'calc(-100vh + 4rem)',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          maxHeight: 'calc(100vh - 8rem)' // 画面高さから上下マージンを引く
        }}
      >
        <div className="px-4 py-4 space-y-2 max-h-full overflow-y-auto">
          {pages.map((page) => (
            <Link
              key={page.path}
              to={page.path}
              className="block px-4 py-3 text-gray-900 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
              onClick={onClose}
            >
              {page.title}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}