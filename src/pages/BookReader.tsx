import { useParams } from 'react-router-dom';

interface BookItem {
  title: string;
  author: string;
  file_name: string;
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
        src={`${import.meta.env.BASE_URL}books/${bookId}/${fileName}`}
        alt={`${bookId} page ${pageNumber}`}
        className="max-w-full max-h-full object-contain"
        onError={() => {
          console.error(`画像読み込みエラー: ${import.meta.env.BASE_URL}books/${bookId}/${fileName}`);
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
        src={`${import.meta.env.BASE_URL}books/${bookId}/${item.file_name}`}
        alt={`${item.title} by ${item.author}`}
        className="max-w-full max-h-full object-contain"
        onError={() => {
          console.error(`画像読み込みエラー: ${import.meta.env.BASE_URL}books/${bookId}/${item.file_name}`);
        }}
      />
    </div>
  );
}