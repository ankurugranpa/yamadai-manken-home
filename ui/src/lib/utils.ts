import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * パスからbook情報を解析する
 * @param pathname - 解析対象のパス
 * @returns bookId と isBookPage のフラグ
 */
export function parseBookPath(pathname: string): {
  isBookPage: boolean;
  bookId: string | null;
} {
  const bookMatch = pathname.match(/^\/book\/([^/]+)/);
  return {
    isBookPage: !!bookMatch,
    bookId: bookMatch?.[1] ?? null
  };
}
