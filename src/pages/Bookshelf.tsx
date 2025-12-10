import { useNavigate } from 'react-router-dom';
import { booksMenus } from '../app/routes';

export function Bookshelf() {
  const navigate = useNavigate();

  // data配下のmenu.json一覧（booksMenus）から本棚表示用データを生成
  const books = Object.entries(booksMenus).map(([bookId, pages]) => {
    const coverPage =
      pages.find(p => p.title.includes('表紙')) ||
      pages.find(p => p.file_name === '000.png') ||
      pages[0];

    return {
      id: bookId,
      title: bookId,
      cover: `${import.meta.env.BASE_URL}books/${bookId}/${coverPage?.file_name ?? '000.png'}`
    };
  });

  const handleBookSelect = (bookId: string) => {
    // 最初のページ（page/0 = 027.png）から開始
    navigate(`/book/${bookId}/page/0`);
  };

  return (
    <div className="h-full w-full p-8 overflow-y-auto">
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
                onError={() => {
                  console.error(`Cover image error: ${book.cover}`);
                }}
              />
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 truncate">{book.title}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
