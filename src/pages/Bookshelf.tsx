import { useState, useEffect } from 'react';

export function Bookshelf() {
  const [books, setBooks] = useState<{ id: string; title: string; cover: string; }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        // booksフォルダ内の各本のmenu.jsonを読み込む
        // 現在はCCV_vol35のみが存在することを前提
        const bookIds = ['CCV_vol35']; // 今後は動的に取得
        
        const bookData = await Promise.all(
          bookIds.map(async (bookId) => {
            try {
              
              const response = await fetch(`${import.meta.env.BASE_URL}books/${bookId}/menu.json`);
              if (!response.ok) return null;
              const data = await response.json();
              
              // 表紙画像を探す（通常は最初のアイテム）
              const coverItem = data.items.find((item: any) => 
                item.title.includes('表紙') || item.file_name === '000.png'
              ) || data.items[0];
              
              return {
                id: bookId,
                title: data.book_title,
                cover: `/books/${bookId}/${coverItem.file_name}`
              };
            } catch (error) {
              console.error(`Error loading book ${bookId}:`, error);
              return null;
            }
          })
        );
        
        setBooks(bookData.filter(book => book !== null));
      } catch (error) {
        console.error('Error loading books:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, []);

  const handleBookSelect = (bookId: string) => {
    // 最初のページ（page/0 = 027.png）から開始
    if (bookId === 'CCV_vol35') {
      window.location.href = `/book/${bookId}/page/0`;
    } else {
      window.location.href = `/book/${bookId}`;
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full p-8">
      <h1 className="text-3xl font-bold text-center mb-8">本棚</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
        {books.map((book) => (
          <div 
            key={book.id}
            onClick={() => handleBookSelect(book.id)}
            className="cursor-pointer group"
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden group-hover:shadow-lg transition-shadow">
              <img 
                src={book.cover} 
                alt={book.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  console.error(`Cover image error: ${book.cover}`);
                  e.currentTarget.src = '/src/assets/react.svg';
                }}
              />
              <div className="p-4">
                <h3 className="font-semibold text-sm text-center">{book.title}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
