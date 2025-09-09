import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../components/ui/carousel';

interface BookItem {
  title: string;
  author: string;
  file_name: string;
}

interface BookData {
  book_title: string;
  year: string;
  items: BookItem[];
}

interface BookReaderProps {
  bookId?: string;
}

export function BookReader() {
  const { bookId, pageNumber } = useParams<{ bookId: string; pageNumber: string }>();
  
  if (!bookId || !pageNumber) {
    return <div>Book or page not found</div>;
  }

  // ページ番号を3桁ゼロパディング形式に変換
  const paddedPageNumber = pageNumber.padStart(3, '0');
  const fileName = `${paddedPageNumber}.png`;

  return (
    <div className="h-full w-full flex items-center justify-center">
      <img 
        src={`/books/${bookId}/${fileName}`}
        alt={`${bookId} page ${pageNumber}`}
        className="max-w-full max-h-full object-contain"
        onError={(e) => {
          console.error(`画像読み込みエラー: /books/${bookId}/${fileName}`);
          e.currentTarget.src = '/src/assets/react.svg';
        }}
      />
    </div>
  );
}

interface BookPageProps {
  bookId: string;
  item: BookItem;
}

export function BookPage({ bookId, item }: BookPageProps) {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <img 
        src={`/books/${bookId}/${item.file_name}`}
        alt={`${item.title} by ${item.author}`}
        className="max-w-full max-h-full object-contain"
        onError={(e) => {
          console.error(`画像読み込みエラー: /books/${bookId}/${item.file_name}`);
          e.currentTarget.src = '/src/assets/react.svg';
        }}
      />
    </div>
  );
}